import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345,
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({
    status: 200,
    description: 'Application information',
    schema: {
      example: {
        name: 'African Currency Platform API',
        version: '1.0.0',
        status: 'running',
      },
    },
  })
  getInfo() {
    return this.appService.getInfo();
  }
}
