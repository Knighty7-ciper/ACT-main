// TypeScript declaration for stellar-sdk to fix import issues
declare module '@stellar/stellar-sdk' {
  export * from 'stellar-sdk';
}

declare module 'stellar-sdk' {
  // Re-export all types and functions from the installed stellar-sdk
  export * from './lib/index';
}
