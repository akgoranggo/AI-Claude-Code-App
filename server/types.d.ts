/**
 * Type Declarations
 *
 * Express and HTTP type augmentations for the application.
 */

// Extend Express Request type with requestId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export {};
