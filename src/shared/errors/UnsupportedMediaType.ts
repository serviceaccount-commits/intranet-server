import { AppError } from './AppError';

export class UnsupportedMediaTypeError extends AppError {
  constructor(mediaType: string) {
    super(`Unsupported media type: ${mediaType}`, 400);
  }
}
