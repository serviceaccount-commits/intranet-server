# Architecture Overview

## 🏗️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Dependency Injection**: InversifyJS
- **Authentication**: Passport.js (JWT, Google OAuth)
- **Real-time**: Socket.IO
- **Logging**: Morgan (in development)

## 📂 Project Structure

The project follows a **Modular Monolith** architecture, responding to the need for separation of concerns while keeping the codebase unified.

```
src/
├── api-layer/          # Main API router combining all module routes
├── modules/            # Feature modules
│   ├── external/       # Modules facing external users/services (e.g., Knowledge Base)
│   └── internal/       # Internal operational modules (e.g., HR, Users)
├── shared/             # Shared code, utilities, config, and database setup
├── app.ts              # Express application configuration
└── server.ts           # Server entry point (HTTP + Socket.IO)
```

### Modules

Modules are self-contained units of functionality. They typically contain:

- `api/`: Routers and Controllers.
- `services/`: Business logic.
- `repositories/`: Data access layer.
- `entities/`: TypeORM entities.
- `interfaces/`: TypeScript interfaces.

### Shared Layer

The `src/shared` directory contains code used across multiple modules, preventing circular dependencies and promoting reuse:

- `config/`: Configuration files (App, Database, Passport).
- `database/`: Data Source initialization and migrations.
- `middlewares/`: Global middlewares.
- `utils/`: Helper functions.

## 🧩 Design Patterns

### Dependency Injection (DI)

We use **InversifyJS** for dependency injection. This allows for loose coupling between classes and makes testing easier.

- Services and Repositories are decorated with `@injectable()`.
- Dependencies are bound in `src/shared/config/inversify.config.ts`.
- Controllers retrieve implementation instances from the DI container.

### Repository Pattern

Data access is abstracted using the Repository pattern. Services interact with Repositories, not directly with the database, allowing for easier mocking and data source switching if needed.

## 🔄 Request Lifecycle

1.  **Request**: Enters via `server.ts` -> `app.ts`.
2.  **Middleware**: Global middlewares (CORS, parsing, logging) are applied.
3.  **Router**: `api-layer/api.router.ts` delegates to specific module routers.
4.  **Controller**: Handles the request, validates input, and calls the Service.
5.  **Service**: Executes business logic, potentially calling Repositories/External APIs.
6.  **Repository**: Interacts with the Database.
7.  **Response**: Data flows back up the chain to the client.

## 🔌 Real-time Communication

Socket.IO is initialized in `server.ts` and shares the HTTP server. It supports authentication via JWT cookies, ensuring only authorized users can connect.
