# Contributing to Nexora

Thanks for contributing.

## Development Setup

1. Fork the repository and clone your fork.
2. Install dependencies:

```bash
bun install
```

3. Run tests:

```bash
bun test
```

4. Run type checks:

```bash
bunx tsc --noEmit
```

## Branch and Commit Guidelines

- Create a feature branch from `main`.
- Keep commits focused and atomic.
- Use clear commit messages that describe intent.

## Pull Request Guidelines

- Include a short summary of what changed and why.
- Add or update tests for behavior changes.
- Update docs when public API or behavior changes.
- Ensure CI is passing before requesting review.

## Code Style

- Follow existing TypeScript patterns in the repo.
- Keep functions small and focused.
- Prefer clear naming and early returns.
- Avoid introducing `any` in framework internals.

## Reporting Bugs

When opening an issue, please include:

- Expected behavior
- Actual behavior
- Reproduction steps
- Bun and OS versions

## Security

If you find a security issue, please report it privately to repository maintainers instead of opening a public issue.
