import { ConfigError } from './ConfigError';

export class EnvironmentError extends ConfigError {
  constructor(message: string) {
    super(message, 400);
  }
}
