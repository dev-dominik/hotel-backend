import type { UploadApiResponse } from 'cloudinary';
import type { CloudinaryClient } from '../providers/cloudinary.provider';
import type { IMediaStorage, UploadResult } from './media-storage.interface';

export class CloudinaryMediaStorage implements IMediaStorage {
  constructor(private readonly cloudinary: CloudinaryClient) {}

  async upload(
    buffer: Buffer,
    _originalName: string,
    _mimetype: string,
    folder: string,
  ): Promise<UploadResult> {
    const result = await this.streamToCloudinary(buffer, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format ?? null,
      bytes: result.bytes ?? null,
      width: result.width ?? null,
      height: result.height ?? null,
    };
  }

  async delete(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }

  private streamToCloudinary(
    buffer: Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(new Error(error?.message ?? 'Cloudinary upload failed'));
          } else {
            resolve(result);
          }
        },
      );
      stream.end(buffer);
    });
  }
}
