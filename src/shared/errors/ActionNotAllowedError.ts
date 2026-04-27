import { AppError } from './AppError';

export class ActionNotAllowedError extends AppError {
  constructor(
    message: string = 'Not enough permissions to perform this action.',
  ) {
    super(message, 403);
  }
}
