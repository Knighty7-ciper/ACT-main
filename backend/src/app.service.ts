import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: 'African Currency Platform API',
      version: '1.0.0',
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
