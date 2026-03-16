# Packaging and Version Checklist

Use this checklist before publishing a new Nexora version.

## Package Metadata

- [ ] Set `name`, `version`, `description`, `license`, and `repository` in `package.json`.
- [ ] Confirm `type`/module format and entry points are correct.
- [ ] Remove `private: true` for public publishing.
- [ ] Add `keywords` and `author` metadata.

## Export Surface

- [ ] Verify top-level exports from `express/index.ts` are intentional and stable.
- [ ] Confirm no internal-only files are exported publicly.
- [ ] Confirm type exports match runtime exports.

## Quality Gates

- [ ] Run `bun test` and confirm all tests pass.
- [ ] Run lint/type checks used by CI.
- [ ] Review changelog/release notes for behavior changes.

## Versioning

- [ ] Select semantic version bump (major/minor/patch).
- [ ] Document breaking changes if any.
- [ ] Tag release in git with matching version.

## Publish

- [ ] Dry-run publish process.
- [ ] Publish package.
- [ ] Verify install and quick-start on a clean sample project.
