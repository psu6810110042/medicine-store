import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
    PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';

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

        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                },
            ],
        };

        try {
            await this.s3Client.send(
                new PutBucketPolicyCommand({
                    Bucket: this.bucketName,
                    Policy: JSON.stringify(policy),
                }),
            );
            this.logger.log(`Public read policy applied to bucket "${this.bucketName}".`);
        } catch (policyError) {
            this.logger.error(`Failed to apply bucket policy to "${this.bucketName}":`, policyError);
        }
    }

    async uploadImage(file: Buffer, filename: string): Promise<string> {
        const key = `products/${Date.now()}-${filename}`;

        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file,
                    ContentType: 'image/webp',
                }),
            );

            const publicEndpoint = this.configService.get<string>('S3_PUBLIC_ENDPOINT') || 'http://localhost:9000';
            return `${publicEndpoint}/${this.bucketName}/${key}`;
        } catch (error) {
            this.logger.error(`Failed to upload file "${filename}":`, error);
            throw error;
        }
    }
}
