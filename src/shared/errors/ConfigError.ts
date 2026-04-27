export class ConfigError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ConfigError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
