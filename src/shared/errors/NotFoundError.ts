import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(resourceName: string, resourceId: string | number | null = null) {
    super(
      `${resourceName} ${resourceId ? `with ID ${resourceId}` : ''} not found.`,
      404,
    );
  }
}
