import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../admin/guards/admin.guard';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { MediaService } from './media.service';
import {
  UploadMediaRequest,
  UploadMediaResponse,
} from './dto/upload-media.dto';
import { DeleteMediaResponse } from './dto/delete-media.dto';
import type { Media } from './entity/media.entity';
import { MulterFile } from '@/types/multer.type';

@ApiTags('media')
@UseGuards(AdminGuard, AppThrottlerGuard)
@Throttle({ auth: { limit: 30, ttl: 60_000 } })
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 4))
  @ApiOperation({ summary: 'Upload up to 4 images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMediaRequest })
  @ApiResponse({ status: 201, type: [UploadMediaResponse] })
  uploadFiles(
    @UploadedFiles() files: MulterFile[],
    @Body('folder') folder?: string,
  ): Promise<Media[]> {
    return this.mediaService.uploadFiles(files ?? [], folder);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an uploaded image by media ID' })
  @ApiResponse({ status: 204, type: DeleteMediaResponse })
  deleteFile(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mediaService.deleteFile(id);
  }
}
