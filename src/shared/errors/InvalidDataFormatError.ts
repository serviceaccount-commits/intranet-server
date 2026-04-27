import { AppError } from './AppError';

export class InvalidDataFormatError extends AppError {
  constructor(resourceName: string) {
    super(`Invalid ${resourceName} format.`, 400);
  }
}
