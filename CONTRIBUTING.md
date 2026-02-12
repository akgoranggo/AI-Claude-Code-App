# Contributing to Web App Template

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to create a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 9.x or later
- PostgreSQL 16.x (or Docker for local development)
- Git

### Local Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/web-app-template.git
   cd web-app-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the database** (using Docker)

   ```bash
   docker-compose -f docker-compose.dev.yml up db -d
   ```

5. **Push the schema to the database**

   ```bash
   npm run db:push
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our [code style](#code-style) guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Run checks locally**

   ```bash
   npm run lint        # Lint code
   npm run check       # Type check
   npm test            # Run tests
   ```

4. **Commit your changes** following our [commit guidelines](#commit-guidelines)

5. **Push and create a pull request**

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add OAuth2 login support

fix(api): handle null values in organization endpoint

docs: update README with Docker instructions

refactor(storage): extract pagination logic to helper
```

## Pull Request Process

1. **Ensure all checks pass**
   - Lint passes (`npm run lint`)
   - Type check passes (`npm run check`)
   - Tests pass (`npm test`)

2. **Update documentation**
   - Update README if adding new features
   - Add JSDoc comments for public APIs
   - Update CHANGELOG.md

3. **Write a clear PR description**
   - Describe what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes

4. **Request review**
   - Assign relevant reviewers
   - Address feedback promptly

5. **Squash and merge**
   - PRs are typically squash-merged to keep history clean

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer explicit return types for public functions
- Use interfaces for object types, types for unions/intersections

### React

- Use functional components with hooks
- Keep components small and focused
- Use named exports for components
- Co-locate tests with components

### API Design

- Follow REST conventions
- Use proper HTTP status codes
- Validate all inputs with Zod
- Return consistent error responses

### File Organization

```
server/
  routes.ts          # API route definitions
  storage.ts         # Data access layer
  errors.ts          # Error handling utilities
shared/
  schema.ts          # Database schema and types
client/src/
  components/        # Reusable components
  pages/             # Page components
  hooks/             # Custom React hooks
  lib/               # Utility functions
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Writing Tests

- Place tests next to the code they test (`.test.ts` suffix)
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

### Test Categories

- **Unit tests**: Test individual functions/components
- **Integration tests**: Test API endpoints
- **Schema tests**: Validate Zod schemas

### Example Test

```typescript
import { describe, it, expect } from "vitest";
import { parsePageParams } from "./pagination";

describe("parsePageParams", () => {
  it("returns default values for undefined params", () => {
    const result = parsePageParams(undefined, undefined);
    expect(result).toEqual({ limit: 50, offset: 0 });
  });

  it("clamps limit to maximum value", () => {
    const result = parsePageParams("200", "0");
    expect(result.limit).toBe(100);
  });
});
```

## Questions?

If you have questions or need help:

1. Check existing issues and PRs
2. Open a new issue with the question label
3. Join our discussions

Thank you for contributing!
