import { AppError } from './AppError';

export class UnauthenticatedError extends AppError {
  constructor(message: string = 'User not authenticatd') {
    super(message, 401);
  }
}
