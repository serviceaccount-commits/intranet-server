import { ConfigError } from './ConfigError';

export class FileReadingError extends ConfigError {
  constructor(message: string) {
    super(message, 400);
  }
}
