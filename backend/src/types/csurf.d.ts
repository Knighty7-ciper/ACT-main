declare module 'csurf' {
  interface CSRFOptions {
    cookie?: {
      key?: string;
      path?: string;
      httpOnly?: boolean;
      sameSite?: 'strict' | 'lax' | 'none' | boolean;
      secure?: boolean;
    };
    ignoreMethods?: string[];
    value?: (req: any) => string;
  }

  function csrf(options?: CSRFOptions): (req: any, res: any, next: any) => void;
  
  export = csrf;
}