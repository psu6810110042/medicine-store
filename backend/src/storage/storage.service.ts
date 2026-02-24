import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
    PutBucketCorsCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService implements OnModuleInit {
    private s3Client: S3Client;
    private bucketName: string;
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || 'medicine-store';

        this.s3Client = new S3Client({
            endpoint: this.configService.get<string>('S3_ENDPOINT') || 'http://rustfs:9000',
            region: this.configService.get<string>('S3_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || 'admin',
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || 'password',
            },
            forcePathStyle: true,
        });
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
            this.logger.log(`Bucket "${this.bucketName}" exists.`);
        } catch (error) {
            this.logger.log(`Bucket "${this.bucketName}" not found. Creating...`);
            try {
                await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
                this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
            } catch (createError) {
                this.logger.error(`Failed to create bucket "${this.bucketName}":`, createError);
            }
        }

        // Set CORS policy to allow browser access
        const corsPolicy = {
            CORSRules: [
                {
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    AllowedOrigins: ['*'],
                    ExposeHeaders: ['ETag', 'x-amz-version-id'],
                    MaxAgeSeconds: 3000,
                },
            ],
        };

        try {
            await this.s3Client.send(
                new PutBucketCorsCommand({
                    Bucket: this.bucketName,
                    CORSConfiguration: corsPolicy,
                }),
            );
            this.logger.log(`CORS policy applied to bucket "${this.bucketName}".`);
        } catch (corsError) {
            this.logger.warn(`Failed to apply CORS policy to "${this.bucketName}":`, corsError);
        }

        // Explicitly NOT adding a PublicRead policy. All non-proxied object access will be denied.
    }

    async uploadImage(file: Buffer, filename: string, folder: string, ownerId?: string): Promise<string> {
        let key = `${folder}/`;
        if (ownerId && folder !== 'products') {
            key += `${ownerId}/`;
        }
        key += `${Date.now()}-${filename}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file,
                    ContentType: 'image/webp',
                }),
            );

            // Return a local proxy URL instead of direct S3 URL to route through the permission gateway
            const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
            return `${backendUrl}/upload/view/${encodeURIComponent(key)}`;
        } catch (error) {
            this.logger.error(`Failed to upload file "${filename}":`, error);
            throw error;
        }
    }

    async getObject(key: string): Promise<{ data: Buffer; contentType?: string }> {
        try {
            const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
            const response = await this.s3Client.send(command);

            const body = response.Body as any;

            const buffer = await (async () => {
                if (!body) return Buffer.alloc(0);
                if (typeof body.read === 'function') {
                    // stream
                    const chunks: Buffer[] = [];
                    for await (const chunk of body) {
                        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    }
                    return Buffer.concat(chunks);
                }

                // Uint8Array or Buffer
                return Buffer.from(body as Uint8Array);
            })();

            return { data: buffer, contentType: response.ContentType };
        } catch (error) {
            this.logger.error(`Failed to get object "${key}":`, error);
            throw error;
        }
    }
}
