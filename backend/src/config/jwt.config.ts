import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET', 'your-secret-key-change-in-production'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRATION', '7d'),
  },
});
