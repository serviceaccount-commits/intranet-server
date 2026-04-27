# API Reference

The API is structured around RESTful principles. All endpoints are prefixed with `/api/v1`.

## Base Configuration

- **Base URL**: `http://localhost:3000/api/v1` (locally)
- **Content-Type**: `application/json`

## Authentication

Most endpoints require a valid JWT Access Token.

- **Header**: `Cookie: accessToken=<token>` (Handled by browser/client automatically via cookies)
- **Socket.IO**: Token is parsed from the handshake cookies.

Some external endpoints use an API Key:

- **Header**: `x-api-key: <INTERNAL_API_KEY>`

## Endpoints Overview

### Authentication

| Method | Endpoint              | Description                |
| :----- | :-------------------- | :------------------------- |
| `POST` | `/auth/login`         | Login with email/password. |
| `GET`  | `/auth/google`        | Start Google OAuth flow.   |
| `POST` | `/auth/refresh-token` | Refresh access token.      |

### Users & Roles

| Endpoint      | Description             |
| :------------ | :---------------------- |
| `/users`      | User management (CRUD). |
| `/roles`      | Role definitions.       |
| `/reports-to` | User hierarchy.         |

### Knowledge Base

| Endpoint             | Description                                                       |
| :------------------- | :---------------------------------------------------------------- |
| `/articles`          | Internal article management.                                      |
| `/clients`           | Client management for knowledge sharing.                          |
| `/topics`            | Article categories.                                               |
| `/external/articles` | **Public/External** API for fetching articles (Requires API Key). |

### Training (LMS)

| Endpoint         | Description               |
| :--------------- | :------------------------ |
| `/courses`       | Training courses.         |
| `/exams`         | Exams and assessments.    |
| `/questions`     | Question bank management. |
| `/exam-attempts` | User exam results.        |

### System

| Endpoint         | Description                 |
| :--------------- | :-------------------------- |
| `/documents`     | File upload and management. |
| `/announcements` | System announcements.       |

## Error Handling

Standard error response format:

```json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
```
