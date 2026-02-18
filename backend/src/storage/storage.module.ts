import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ImageService } from './image.service';

import { StorageController } from './storage.controller';

@Module({
    controllers: [StorageController],
    providers: [StorageService, ImageService],
    exports: [StorageService, ImageService],
})
export class StorageModule { }
