import { AppError } from './AppError';

export class PassportEror extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
