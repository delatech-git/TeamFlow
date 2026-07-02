import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadAvatar(file: Express.Multer.File): Promise<UploadApiResponse> {
    return this.uploadImage(file, 'teamtide/avatars', 'Avatar upload failed');
  }

  async uploadIdeaCover(file: Express.Multer.File): Promise<UploadApiResponse> {
    return this.uploadImage(
      file,
      'teamtide/idea-covers',
      'Idea cover upload failed',
    );
  }

  private async uploadImage(
    file: Express.Multer.File,
    folder: string,
    errorMessage: string,
  ): Promise<UploadApiResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('Image file buffer is missing');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('CLOUDINARY ERROR:', error);
            reject(new BadRequestException(errorMessage));
            return;
          }

          if (!result) {
            reject(new BadRequestException(errorMessage));
            return;
          }

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}