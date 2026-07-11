import { ApiProperty } from '@nestjs/swagger';

export class DeleteMediaResponse {
  @ApiProperty({ example: 'Media deleted successfully' })
  message!: string;
}
