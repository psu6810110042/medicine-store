import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ImageService } from './image.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import type { Request, Response } from 'express';
import { User, UserRole } from '../users/entities/user.entity';

const ALLOWED_FOLDERS = ['products', 'prescription', 'payment-slips'];

@Controller('upload')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly imageService: ImageService,
  ) { }

  @UseGuards(AuthenticatedGuard)
  @Post('image/:folder')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('folder') folder: string,
    @Req() req: Request,
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
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(`Invalid folder. Allowed folders are: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const user = req.user as User;
    const processedBuffer = await this.imageService.processImage(file.buffer);
    const url = await this.storageService.uploadImage(
      processedBuffer,
      file.originalname,
      folder,
      user.id
    );
    return { url };
  }

  @Get('view/:key')
  async viewImage(@Param('key') key: string, @Req() req: Request, @Res() res: Response) {
    if (!key) {
      throw new BadRequestException('Image key is required');
    }

    // URI decode the key since it might be url encoded by the browser/frontend
    const decodedKey = decodeURIComponent(key);

    const keyParts = decodedKey.split('/');
    const folder = keyParts[0];

    // 1. If it's a product image, it's public. Fetch and stream immediately.
    if (folder === 'products') {
      try {
        const { data, contentType } = await this.storageService.getObject(decodedKey);
        if (contentType) res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.send(data);
      } catch (error) {
        throw new NotFoundException('Image not found');
      }
    }

    // 2. For non-public folders, user MUST be authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      throw new ForbiddenException('You must be logged in to view this image');
    }

    const user = req.user as User;

    if (folder === 'payment-slips') {
      // Only admins or the owner can view payment slips
      const ownerId = keyParts[1]; // Expected key: payment-slips/{userId}/{filename}
      if (user.role !== UserRole.ADMIN && user.id !== ownerId) {
        throw new ForbiddenException('You do not have permission to view this payment slip');
      }
    } else if (folder === 'prescription') {
      // Admins, Pharmacists, or the owner can view prescriptions
      const ownerId = keyParts[1];
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.PHARMACIST && user.id !== ownerId) {
        throw new ForbiddenException('You do not have permission to view this prescription');
      }
    } else {
      // Unknown restricted folder
      throw new ForbiddenException('Access denied to this folder');
    }

    // 3. User is authorized! Fetch the object buffer and stream it directly
    try {
      const { data, contentType } = await this.storageService.getObject(decodedKey);

      if (!data || data.length === 0) {
        throw new NotFoundException('File not found');
      }

      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      // Allow browsers to cache the image since permissions were checked
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      return res.send(data);
    } catch (error) {
      throw new NotFoundException('Image not found or no longer exists');
    }
  }
}
