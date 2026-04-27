# Environment Variables Reference

The application relies on several environment variables for configuration. These should be defined in a `.env` file in the project root.

## Server Configuration

| Variable                      | Description                                     | Default                           |
| :---------------------------- | :---------------------------------------------- | :-------------------------------- |
| `NODE_ENV`                    | Environment mode (`development`, `production`). | `development`                     |
| `PORT`                        | Port the server listens on.                     | `3000`                            |
| `FRONTEND_URL`                | URL of the frontend application (for CORS).     | `http://localhost:5173`           |
| `BACKEND_URL`                 | Base URL of the backend API.                    | `http://localhost:3000`           |
| `INTERNAL_API_KEY`            | Key for internal API calls.                     | _Required_                        |
| `COOKIE_SECRET`               | Secret used to sign cookies.                    | `default_cookie_secret_change_me` |
| `SEARCH_SIMILARITY_THRESHOLD` | Threshold for vector search similarity.         | `0.67`                            |

## Database (PostgreSQL)

| Variable            | Description            | Default     |
| :------------------ | :--------------------- | :---------- |
| `DATABASE_HOST`     | Database host address. | `localhost` |
| `DATABASE_PORT`     | Database port.         | `5432`      |
| `DATABASE_USERNAME` | Database username.     | _Required_  |
| `DATABASE_PASSWORD` | Database password.     | _Required_  |
| `DATABASE_NAME`     | Name of the database.  | _Required_  |

## Authentication (JWT)

The application uses RS256 for JWT signing, requiring a private/public key pair.

| Variable                            | Description                                        | Default       |
| :---------------------------------- | :------------------------------------------------- | :------------ |
| `JWT_PRIVATE_KEY_PATH`              | Path to the private key file (PEM).                | _Required_    |
| `JWT_PUBLIC_KEY_PATH`               | Path to the public key file (PEM).                 | _Required_    |
| `JWT_ACCESS_TOKEN_EXPIRATION`       | Expiration time for access tokens.                 | `1200` (20m)  |
| `JWT_REFRESH_TOKEN_EXPIRATION`      | Expiration time for refresh tokens.                | `86400` (24h) |
| `JWT_ISSUER`                        | JWT Issuer claim.                                  | `Paricus`     |
| `JWT_AUDIENCE`                      | JWT Audience claim.                                | `IntranetApp` |
| `JWT_VERIFY_EMAIL_PRIVATE_KEY_PATH` | Path to private key for email verification tokens. | _Required_    |
| `JWT_VERIFY_EMAIL_AUDIENCE`         | Audience for email verification tokens.            | `IntranetApp` |
| `JWT_VERIFY_EMAIL_EXPIRATION`       | Expiration for email verification tokens.          | `86400`       |

## Google OAuth

| Variable                     | Description                  |
| :--------------------------- | :--------------------------- |
| `GOOGLE_OAUTH_CLIENT_ID`     | Google Client ID.            |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google Client Secret.        |
| `GOOGLE_OAUTH_CALLBACK_URL`  | Callback URL for OAuth flow. |

## External Services

| Variable            | Description                          |
| :------------------ | :----------------------------------- |
| `GEMINI_AI_API_KEY` | API Key for Gemini AI integration.   |
| `S3_BUCKET_NAME`    | AWS S3 bucket name for file storage. |
| `AWS_REGION`        | AWS Region for S3.                   |

## Example `.env`

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=intranet_db

JWT_PRIVATE_KEY_PATH=./private.pem
JWT_PUBLIC_KEY_PATH=./public.pem
# ... other vars
```
