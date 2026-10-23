import appConfig from '../../../../shared/config/appConfig';
import { logger } from '../../../../shared/utils/logger';

const SERVICE_USERS_PATH = '/api/v1/service/users';

/**
 * Mirrors a newly created intranet user into the Time Tracker (shared account by
 * work email), so the time-tracking module works for them from day one.
 *
 * Best-effort by design: the tracker endpoint is idempotent (an existing email
 * returns the existing user), and a tracker outage must never block creating an
 * intranet user, so failures are logged and swallowed.
 */
export async function provisionTrackerUser(
  workEmail: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  const { apiUrl, apiKey } = appConfig.timeTracker;
  if (!apiUrl || !apiKey) return;

  const email = workEmail.trim().toLowerCase();
  try {
    const response = await fetch(apiUrl + SERVICE_USERS_PATH, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }),
    });
    if (response.status !== 200 && response.status !== 201) {
      const body = await response.text().catch(() => '');
      logger.error(
        `Time tracker user provisioning for ${email} returned ${response.status}: ${body.slice(0, 500)}`,
      );
    }
  } catch (error) {
    logger.error(`Time tracker user provisioning for ${email} failed:`, error);
  }
}
