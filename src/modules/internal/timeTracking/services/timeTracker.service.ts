import { inject, injectable } from 'inversify';
import appConfig from '../../../../shared/config/appConfig';
import { TYPES } from '../../../../shared/config/containerTypes';
import { logger } from '../../../../shared/utils/logger';
import { IUserService } from '../../users/interfaces/users/user.service.interface';
import {
  ITimeTrackerService,
  TimeTrackerRequest,
  TimeTrackerResponse,
} from '../interfaces/timeTracker.service.interface';

const SERVICE_PREFIX = '/api/v1/service';

@injectable()
export class TimeTrackerService implements ITimeTrackerService {
  constructor(
    @inject(TYPES.IUserService)
    private userService: IUserService,
  ) {}

  async forward(
    userId: string,
    request: TimeTrackerRequest,
  ): Promise<TimeTrackerResponse> {
    const { apiUrl, apiKey } = appConfig.timeTracker;
    if (!apiUrl || !apiKey) {
      return {
        status: 503,
        body: {
          code: 'TIME_TRACKER_NOT_CONFIGURED',
          message: 'The time tracker integration is not configured.',
        },
      };
    }

    // The acting identity is always the signed-in intranet user's work email,
    // resolved server-side. The tracker stores emails case-insensitively; the
    // intranet does not, so normalize here.
    const user = await this.userService.getUserById(userId);
    const email = user.work_email.trim().toLowerCase();

    const url = new URL(apiUrl + SERVICE_PREFIX + request.path);
    for (const [key, value] of Object.entries(request.query ?? {})) {
      url.searchParams.set(key, value);
    }

    const headers: Record<string, string> = {
      'X-API-Key': apiKey,
      'X-User-Email': email,
    };
    if (request.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (request.idempotencyKey) {
      headers['Idempotency-Key'] = request.idempotencyKey;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: request.method,
        headers,
        body:
          request.body !== undefined ? JSON.stringify(request.body) : undefined,
      });
    } catch (error) {
      logger.error('Time tracker request failed:', error);
      return {
        status: 502,
        body: {
          code: 'TIME_TRACKER_UNAVAILABLE',
          message: 'The time tracker could not be reached.',
        },
      };
    }

    if (response.status === 204) {
      return { status: 204 };
    }
    const body = await response.json().catch(() => ({
      code: 'TIME_TRACKER_ERROR',
      message: 'The time tracker returned an unexpected response.',
    }));
    return { status: response.status, body };
  }
}
