export const MEDIA_STORAGE_PROVIDER = Symbol('MEDIA_STORAGE_PROVIDER');

export interface UploadResult {
  url: string;
  publicId: string;
  format: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
}

export interface IMediaStorage {
  upload(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string,
  ): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
}
