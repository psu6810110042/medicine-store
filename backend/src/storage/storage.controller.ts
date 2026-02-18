import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
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
}
