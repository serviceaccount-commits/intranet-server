export interface TimeTrackerRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Path under the tracker's /api/v1/service prefix, e.g. '/me/timesheet'. */
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  /** Forwarded as Idempotency-Key (the tracker requires it on creates and timer calls). */
  idempotencyKey?: string;
}

export interface TimeTrackerResponse {
  status: number;
  /** The tracker's JSON body, passed through untouched (problem+json codes included). */
  body?: unknown;
}

export interface ITimeTrackerService {
  /**
   * Calls the Paricus Time Tracker as the given intranet user, matched by
   * work email. The email never comes from the browser.
   */
  forward(userId: string, request: TimeTrackerRequest): Promise<TimeTrackerResponse>;
}
