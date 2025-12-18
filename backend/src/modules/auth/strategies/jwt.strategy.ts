import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any): Promise<{ userId: string; email: string; role: string }> {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
