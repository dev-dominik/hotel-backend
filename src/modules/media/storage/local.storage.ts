import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { IMediaStorage, UploadResult } from './media-storage.interface';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export class LocalMediaStorage implements IMediaStorage {
  constructor(
    private readonly uploadDir: string,
    private readonly baseUrl: string,
  ) {}

  async upload(
    buffer: Buffer,
    _originalName: string,
    mimetype: string,
    folder: string,
  ): Promise<UploadResult> {
    const ext = MIME_TO_EXT[mimetype] ?? 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const relPath = `${folder}/${filename}`;
    const absPath = path.join(this.uploadDir, relPath);

    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, buffer);

    return {
      url: `${this.baseUrl}/uploads/${relPath}`,
      publicId: relPath,
      format: ext,
      bytes: buffer.length,
      width: null,
      height: null,
    };
  }

  async delete(publicId: string): Promise<void> {
    const absPath = path.join(this.uploadDir, publicId);
    await fs.unlink(absPath).catch(() => undefined);
  }
}
