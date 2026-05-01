"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const appConfig_1 = __importDefault(require("./appConfig"));
const inversify_config_1 = require("./inversify.config");
const containerTypes_1 = require("./containerTypes");
const PassportError_1 = require("../errors/PassportError");
const userRepository = inversify_config_1.container.get(containerTypes_1.TYPES.IUserRepository);
const configurePassport = async () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: appConfig_1.default.googleOAuth.cliendID,
        clientSecret: appConfig_1.default.googleOAuth.clientSecret,
        callbackURL: appConfig_1.default.googleOAuth.callbackURL,
        scope: ['profile', 'email'],
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            if (!profile || !profile.emails || profile.emails.length === 0) {
                throw new PassportError_1.PassportEror('Could not process user profile.');
            }
            const email = profile.emails[0]?.value;
            if (!email) {
                throw new PassportError_1.PassportEror('Could not process user profile.');
            }
            console.log('profile is:', profile);
            const user = await userRepository.findUserByEmail(email);
            if (!user) {
                console.log('no userr');
                return done(null, false, {
                    message: 'Could not process user profile.',
                });
            }
            const jwtUserPayload = {
                id: user.user_id,
                username: user.first_name,
                permissions: user.role.permissions.map((p) => p.permission_id),
            };
            return done(null, jwtUserPayload);
        }
        catch (error) {
            console.error('Google strategy verification error: ', error);
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = userRepository.findUserById(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    console.log('Passport configured successfully.');
};
exports.configurePassport = configurePassport;
//# sourceMappingURL=passport.config.js.map