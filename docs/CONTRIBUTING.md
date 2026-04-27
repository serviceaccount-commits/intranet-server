# Contributing Guide

## 🛠️ Development Setup

1.  **Clone resources**: Ensure you have the git repository cloned.
2.  **Environment**: Create a `.env` file as described in [ENV_VARS.md](ENV_VARS.md).
3.  **Keys**: Generate RSA keys for JWT if not provided:
    ```bash
    openssl genrsa -out private.pem 2048
    openssl rsa -in private.pem -outform PEM -pubout -out public.pem
    ```
4.  **Install**: `npm install`.
5.  **Run**: `npm run dev`.

## 📐 Coding Standards

### Structure

- Follow the **Modular Monolith** pattern.
- Place feature-specific code in `src/modules/<feature>`.
- Use `src/shared` only for truly common utilities.

### Naming Conventions

- **Files**: `kebab-case` (e.g., `user-controller.ts`).
- **Classes**: `PascalCase` (e.g., `UserController`).
- **Interfaces**: `I` prefix + `PascalCase` (e.g., `IUserService`).
- **Variables/Functions**: `camelCase` (e.g., `getUserById`).

### Linting & Formatting

We use `eslint` and `prettier`.

- Run `npm run lint` to check for issues.
- Run `npm run format` to auto-format code.
- Ensure no linting errors exist before committing.

## 🗃️ Git Workflow

1.  **Branching**: Create a feature branch from `main` (or `develop`).
    ```bash
    git checkout -b feature/my-cool-feature
    ```
2.  **Commits**: Write clear, descriptive commit messages.
3.  **Pull Requests**: detailed PR description explaining changes.

## 🔄 Database Migrations

Technically managed by TypeORM.

- **Generate**:
  ```bash
  npm run m:generate --name=MigrationName
  ```
- **Run**:
  ```bash
  npm run m:run
  ```
- **Revert**:
  ```bash
  npm run m:revert
  ```
