import { AppError } from './AppError';

export class BusinessValidationError extends AppError {
  public errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string>) {
    super(message, 400);
    this.name = 'BusinessValidationError';
    this.errors = errors;
  }
}
