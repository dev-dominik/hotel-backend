import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class StatusController {
  constructor() {}

  @Get()
  status() {
    return 'Status: OK - The application is running smoothly.';
  }
}
