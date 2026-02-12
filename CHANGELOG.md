# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Health check endpoints (`/api/health`, `/api/health/ready`, `/api/health/live`)
- Graceful shutdown handling for SIGTERM/SIGINT signals
- Structured logging with pino (JSON in production, pretty in development)
- Request ID tracking via `x-request-id` header
- Standardized error response format with error codes
- Pre-commit hooks with Husky and lint-staged
- Prettier configuration for consistent code formatting
- EditorConfig for cross-IDE consistency
- Node.js version specification (`.nvmrc`)
- MIT LICENSE file
- React error boundaries for graceful error handling
- Loading skeleton components for better UX
- Soft delete pattern (deletedAt column) in schema
- Audit log table for tracking entity changes
- Docker configuration (Dockerfile, docker-compose)
- GitHub Actions CI workflow (lint, typecheck, test, build)
- CONTRIBUTING.md with development guidelines
- This CHANGELOG file

### Changed

- Updated logging to use structured pino logger
- Standardized API error responses across all endpoints
- Enhanced request logging with correlation IDs

### Security

- Added non-root user in Docker container
- Added health checks in Docker configuration

## [1.0.0] - 2024-01-01

### Added

- Initial release of Web App Template
- Full-stack TypeScript monorepo structure
- React 18 frontend with Vite
- Express backend with Drizzle ORM
- PostgreSQL database support
- Azure Databricks Lakebase integration
- Authentication with Passport.js
- 50+ shadcn/ui components
- TanStack Query for server state
- Zod validation schemas
- Multi-tenant schema support
- Development seed scripts
- Comprehensive documentation

[Unreleased]: https://github.com/vetpartners/base-web-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/vetpartners/base-web-app/releases/tag/v1.0.0
