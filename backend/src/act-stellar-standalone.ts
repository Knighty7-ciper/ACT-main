import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.setGlobalPrefix('api');
  
  await app.listen(3001);
  logger.log('ACT Stellar Server running on port 3001');
  logger.log('Available endpoints:');
  logger.log('  - GET  /api/act-stellar/network-status');
  logger.log('  - POST /api/act-stellar/wallet/create');
  logger.log('  - GET  /api/act-stellar/stats');
  logger.log('  - GET  /api/act-stellar/balance/:publicKey');
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});