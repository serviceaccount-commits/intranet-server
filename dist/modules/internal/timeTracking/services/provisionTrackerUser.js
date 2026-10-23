"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionTrackerUser = provisionTrackerUser;
const appConfig_1 = __importDefault(require("../../../../shared/config/appConfig"));
const logger_1 = require("../../../../shared/utils/logger");
const SERVICE_USERS_PATH = '/api/v1/service/users';
/**
 * Mirrors a newly created intranet user into the Time Tracker (shared account by
 * work email), so the time-tracking module works for them from day one.
 *
 * Best-effort by design: the tracker endpoint is idempotent (an existing email
 * returns the existing user), and a tracker outage must never block creating an
 * intranet user, so failures are logged and swallowed.
 */
async function provisionTrackerUser(workEmail, firstName, lastName) {
    const { apiUrl, apiKey } = appConfig_1.default.timeTracker;
    if (!apiUrl || !apiKey)
        return;
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
            logger_1.logger.error(`Time tracker user provisioning for ${email} returned ${response.status}: ${body.slice(0, 500)}`);
        }
    }
    catch (error) {
        logger_1.logger.error(`Time tracker user provisioning for ${email} failed:`, error);
    }
}
//# sourceMappingURL=provisionTrackerUser.js.map