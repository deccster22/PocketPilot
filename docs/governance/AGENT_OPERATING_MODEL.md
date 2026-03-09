Title: Agent Operating Model
Version: v0.1
Source: docs/incoming/Agent Operating Model v0.1.pdf
Last Updated: 2026-03-09

# Agent Operating Model v0.1

(deployment + outputs)

- Agents are used for: compilation of prompt packs, provider semantics validation, copywriting packs, education drafts, accessibility audit, test plan, release hygiene, beta support SOP.
- Agents are not used for: inventing new features, changing architecture, or relaxing honesty rules.
- Every agent output must land as a file in repo (or docs folder) with explicit filename and definition-of-done.

## Top tasks and when to deploy

- A1 Prompt-Pack Compiler: before each milestone pack; outputs PROMPT_PACK_M1..M5 files.
- A2 Provider Semantics Validation (Swyftx): before M1; rerun pre-beta.
- A3 Copywriting Pack: before M2; rerun pre-beta.
- A4 Education Library Drafting: after M2 UI exists.
- A5 Accessibility Audit: after M2, rerun after M3.
- A7 Test Plan + Edge Case Catalog: after M1; rerun before M4.
- A9 Beta Support SOP: before DIAG++ / beta start.

## 5) Tech stack, local setup, and the 'gotchas' we already hit

- Stack: Expo + React Native + TypeScript, Jest, ESLint/Prettier.
- Windows PowerShell gotcha: npm.ps1 blocked until ExecutionPolicy set to RemoteSigned (CurrentUser).
- Git gotcha: you must set git user.name and user.email before commits.
- GitHub gotcha: never commit node_modules; ensure .gitignore exists early.
- Jest gotcha: ESM packages like expo-haptics may require mocking in unit tests (we solved this in Phase 0).

## Appendix A: Suggested repo guardrails (CI-lite)

- verify workflow runs: npm ci, npm run verify.
- Branch protection (if used): require verify check to pass; avoid mandatory approvals for solo repo.
- Keep main protected, but don't block yourself from quick fixes during early R&D.
