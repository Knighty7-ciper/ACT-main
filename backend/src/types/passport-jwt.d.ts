declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface ExtractJwt {
    fromHeader(header_name: string): any;
    fromBodyField(field_name: string): any;
    fromUrlQueryParameter(param_name: string): any;
    fromAuthHeaderAsBearerToken(): any;
    fromAuthHeaderWithScheme(auth_scheme: string): any;
    fromExtractors(extractors: any[]): any;
    jwtFromRequest(req: any): string | null;
    extractJwtFromAuthHeaderAsBearerToken(): (req: any) => string | null;
  }

  export interface JwtPayload {
    sub?: string;
    username?: string;
    email?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
  }

  export interface StrategyOptions {
    jwtFromRequest: any;
    secretOrKey: string | Buffer;
    secretOrKeyProvider?: any;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export interface StrategyOptionsWithRequest extends StrategyOptions {
    passReqToCallback: boolean;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: (payload: JwtPayload, done: (err: any, user?: any, info?: any) => void) => void);
    constructor(options: StrategyOptionsWithRequest, verify: (req: any, payload: JwtPayload, done: (err: any, user?: any, info?: any) => void) => void);
    authenticate(req: any, options?: any): void;
  }
}