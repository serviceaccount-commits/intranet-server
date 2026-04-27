export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    // super(message) must be the first call
    super(message);

    // Set the name for better debugging and identification
    this.name = this.constructor.name;

    // Set your custom property
    this.statusCode = statusCode;

    // No other lines are needed!
  }
}
