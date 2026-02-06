import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { unlinkSync } from 'fs';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string = 'general',
  ): Promise<{ secure_url: string; public_id: string }> {
    try {
      const appName = this.configService.get('APP_NAME') || 'job-search-app';

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${appName}/${path}`,
          resource_type: 'auto', // Handles images, videos, raw files
        },
      );

      // Delete local file after upload
      this.deleteLocalFile(file.path);

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      // Delete local file on error
      this.deleteLocalFile(file.path);
      throw error;
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
    path: string = 'general',
  ): Promise<Array<{ secure_url: string; public_id: string }>> {
    const uploadPromises = files.map((file) => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }

  async destroyFile(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  async deleteResources(
    publicIds: string[],
    options: {
      type?: 'upload' | 'private' | 'authenticated';
      resource_type?: 'image' | 'video' | 'raw';
    } = {},
  ): Promise<any> {
    try {
      const defaultOptions = {
        type: 'upload',
        resource_type: 'image',
        ...options,
      };

      return await cloudinary.api.delete_resources(publicIds, defaultOptions);
    } catch (error) {
      console.error('Error deleting resources from Cloudinary:', error);
      throw error;
    }
  }

  async deleteFolderByPrefix(prefix: string): Promise<any> {
    try {
      const appName = this.configService.get('APP_NAME') || 'job-search-app';
      return await cloudinary.api.delete_resources_by_prefix(
        `${appName}/${prefix}`,
      );
    } catch (error) {
      console.error('Error deleting folder from Cloudinary:', error);
      throw error;
    }
  }

  private deleteLocalFile(filePath: string): void {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }
}
