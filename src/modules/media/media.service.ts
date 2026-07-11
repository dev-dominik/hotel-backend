import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entity/media.entity';
import {
  MEDIA_STORAGE_PROVIDER,
  type IMediaStorage,
} from './storage/media-storage.interface';
import { MulterFile } from '@/types/multer.type';

const MAX_FILES_PER_REQUEST = 4;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @Inject(MEDIA_STORAGE_PROVIDER)
    private readonly storage: IMediaStorage,
  ) {}

  async uploadFiles(files: MulterFile[], folder = 'general'): Promise<Media[]> {
    if (!files.length) throw new BadRequestException('No files provided');
    if (files.length > MAX_FILES_PER_REQUEST)
      throw new BadRequestException(
        `Maximum ${MAX_FILES_PER_REQUEST} files per request`,
      );

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
        throw new BadRequestException(
          `File "${file.originalname}" has unsupported type. Allowed: jpeg, png, webp, gif`,
        );

      if (file.size > MAX_FILE_SIZE_BYTES)
        throw new BadRequestException(
          `File "${file.originalname}" exceeds the 10 MB size limit`,
        );
    }

    const results = await Promise.all(
      files.map((file) =>
        this.storage.upload(
          file.buffer,
          file.originalname,
          file.mimetype,
          folder,
        ),
      ),
    );

    const entities = this.mediaRepo.create(
      results.map((result) => ({
        url: result.url,
        publicId: result.publicId,
        folder,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      })),
    );

    return this.mediaRepo.save(entities);
  }

  async deleteFile(id: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    await this.storage.delete(media.publicId);
    await this.mediaRepo.remove(media);
  }
}
