---
sidebar_position: 1
---

# Contributing Guide

Thank you for contributing to the CitiMaids platform! This guide covers the workflow, conventions, and code standards to follow when making changes.

---

## Prerequisites

Before contributing, make sure you have the full project running locally. See the [Installation Guide](/docs/getting-started/installation).

---

## Branching Strategy

We follow a **feature branch** workflow based on `main`.

```
main                  ← Stable production branch
└── feature/<name>    ← New features and enhancements
└── fix/<name>        ← Bug fixes
└── docs/<name>       ← Documentation updates
└── chore/<name>      ← Dependency updates, config changes
```

### Rules

- **Never commit directly to `main`**
- Branch off from the latest `main`
- Keep branches focused — one feature or fix per branch
- Delete merged branches after PR is closed

### Naming Convention

```bash
# Feature
git checkout -b feature/booking-email-notifications

# Bug fix
git checkout -b fix/payment-status-badge

# Docs
git checkout -b docs/backend-api-reference

# Chore
git checkout -b chore/update-laravel-13
```

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, no logic changes |
| `refactor` | Code restructuring, no feature or bug |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |

### Examples

```bash
git commit -m "feat(booking): add WhatsApp dispatch for outdoor maintenance services"
git commit -m "fix(payment): correctly mark booking as paid after webhook"
git commit -m "docs(api): add payment refund endpoint documentation"
git commit -m "chore(deps): update Laravel to 13.20"
```

---

## Pull Request Process

1. **Push your branch** to GitHub
2. **Open a Pull Request** against `main`
3. Fill in the PR template:
   - What does this PR do?
   - Screenshots (if UI changes)
   - Testing steps
4. **Request review** from at least one team member
5. Fix any review comments
6. **Squash and merge** into `main`

---

## Code Style

### PHP (Laravel API)

- Follow **PSR-12** coding standards
- Use **Laravel Pint** to auto-format:

```bash
cd citimaids-api
./vendor/bin/pint
```

- Controllers should be thin — delegate business logic to service classes or model methods
- Always use typed properties and return types where possible
- Use meaningful variable names over abbreviations

### JavaScript (React Frontend)

- Follow the **ESLint** rules configured in `eslint.config.js`
- Run the linter before committing:

```bash
cd citimaids-frontend
npm run lint
```

- Use **functional components** with hooks exclusively (no class components)
- Use `const` by default; `let` only when reassignment is needed
- Import order: external libraries → internal modules → styles
- Component files should be `PascalCase.jsx`; utilities should be `camelCase.js`

### CSS / TailwindCSS

- Use TailwindCSS utility classes; avoid writing raw CSS unless absolutely necessary
- Custom CSS goes in `src/index.css` using `@layer components`

---

## Testing

### Backend

Run the PHP test suite:

```bash
cd citimaids-api
php artisan test
```

- Write feature tests for new API endpoints
- Test both happy paths and failure cases (401, 422, 404)
- Use Laravel's `actingAs()` for authenticated route tests

### Frontend

Currently the frontend does not have automated tests. When adding tests:
- Use **Vitest** (compatible with Vite)
- Add unit tests for utility functions (`whatsapp.js`, etc.)
- Add component tests for complex UI components

---

## Reporting Issues

If you find a bug or have a feature request, open an issue on GitHub:

1. Check if the issue already exists
2. Use the appropriate issue template (Bug Report / Feature Request)
3. Provide as much context as possible:
   - Steps to reproduce
   - Expected vs actual behaviour
   - Screenshots or error logs

---

## Questions?

Contact the maintainer via the GitHub repo or reach out at `info@citi-maids.com`.
