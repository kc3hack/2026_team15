# AI Development Rules

This document defines mandatory workflow rules for AI agents working in this repository.

## Branching Rules

1. For every new issue/ticket, create a dedicated branch before editing any files.
2. Do not implement issue work directly on `develop` or `main`.
3. Recommended branch naming:
   - `feat/issue-<number>-<short-topic>`
   - `fix/issue-<number>-<short-topic>`
   - `chore/issue-<number>-<short-topic>`

## iOS Pods Sync Rules

1. If iOS native dependencies or Pod-related files are touched, run:
   - `cd mobile/ios && bundle exec pod install`
2. Before iOS build or PR, verify `mobile/ios/Podfile.lock` and `mobile/ios/Pods/Manifest.lock` are in sync.
3. If they are not in sync, re-run `bundle exec pod install` before continuing.

## Commit and PR Rules

1. Commit messages must start with a type prefix, such as `feat:`, `fix:`, `docs:`, `chore:`.
2. Open a PR from the issue branch to `develop` unless instructed otherwise.
3. Follow `.github/PULL_REQUEST_TEMPLATE.md` when creating a PR.
4. In the PR body, always include the related issue reference (for example: `Closes #27`).
5. Before pushing, run the same mobile checks as CI and confirm they pass locally:
   - `npm run mobile:format:check`
   - `npm run mobile:lint`
   - `npm run mobile:typecheck`
   - `npm run mobile:test`

## Change Safety Rules

1. If unrelated local changes already exist, do not revert them.
2. Stage and commit only files related to the current issue.
3. If a required prerequisite is missing (branch, issue link, or PR template fields), fix it before requesting review.
