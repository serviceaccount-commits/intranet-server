export interface JwtUserPayload {
  id: string;
  username: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
