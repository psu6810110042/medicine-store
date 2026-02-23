import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Get,
    Param,
    Res,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ImageService } from './image.service';

@Controller('upload')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly imageService: ImageService,
    ) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const processedBuffer = await this.imageService.processImage(file.buffer);
        const url = await this.storageService.uploadImage(
            processedBuffer,
            file.originalname,
        );
        return { url };
    }

    @Get('file/:key')
    async getFile(@Param('key') keyParam: string, @Res() res: any) {
        try {
            const key = decodeURIComponent(keyParam);
            const { data, contentType } = await this.storageService.getObject(key);

            if (!data || data.length === 0) {
                throw new NotFoundException('File not found');
            }

            if (contentType) {
                res.setHeader('content-type', contentType);
            }
            
            // Add CORS headers for browser access
            res.setHeader('access-control-allow-origin', '*');
            res.setHeader('access-control-allow-methods', 'GET, HEAD, OPTIONS');
            res.setHeader('access-control-allow-headers', 'Content-Type, Authorization');

            res.send(data);
        } catch (error) {
            console.error('Failed to get file:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Failed to retrieve file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
