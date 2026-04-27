# Module Documentation

The application is divided into **Internal** and **External** modules.

## 🏢 Internal Modules

Internal modules are designed for administrative and operational tasks within the organization.

### 🔐 Auth (`src/modules/internal/auth`)

Handles authentication and authorization.

- **Strategies**: JWT (Access/Refresh tokens), Google OAuth.
- **Features**: Login, Logout, Token Refresh, Email Verification.
- **Middleware**: Provides `authenticateJWT` and `verifyApiKey`.

### 👥 Users (`src/modules/internal/users`)

Manages user accounts, roles, and hierarchy.

- **Users**: Employee profiles and account settings.
- **Roles**: RBAC (Role-Based Access Control) definitions.
- **Reports To**: Management hierarchy structure.
- **Assignments**: Task or project assignments.

### 📄 Documents (`src/modules/internal/documents`)

Manages internal documents and files.

- Likely integrates with S3 for storage.
- Handles document metadata and permissions.

## 🌍 External Modules

External modules often service end-users or other systems (like the Knowledge Base widget).

### 📚 Knowledge Base (`src/modules/external/knowledgeBase`)

A CMS for the company's knowledge base.

- **Articles**: content entries with versioning or locking support.
- **Clients**: Multi-tenant support (articles can be shared with specific clients).
- **Topics & Tags**: categorization of articles.
- **External API**: `v1/external/articles` allows external systems to fetch articles using an API Key.

### 📢 Announcements (`src/modules/external/announcements`)

Company-wide announcements system.

- Publishing news and updates to employees.

### 🎓 Training (`src/modules/external/training`)

A Learning Management System (LMS) module.

- **Courses**: Structured learning paths.
- **Classes**: Instances of courses.
- **Exams & Questions**: Assessment engine.
- **User Exam Attempts**: Tracking user progress and scores.

### 👔 Human Resources (`src/modules/external/humanResources`)

HR-related utilities.

- **Staff Directory**: Ordering and organization of staff directory listings (`sd-order`).
