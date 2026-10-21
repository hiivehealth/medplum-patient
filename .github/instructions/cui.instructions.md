---
description: "Use when changing the patient app's CUI policy integration, policy state, banner, or related tests."
applyTo: "src/features/cui/**,src/components/CuiBanner/**,src/__tests__/CuiAppShell.test.tsx"
---
# Patient CUI Policy Integration

- The patient app consumes the authenticated server-derived decision from `/api/cui-banner`; it must not read the protected configuration extension directly.
- Preserve request authentication, `cache: 'no-store'`, response validation, project identity matching, and fail-closed behavior. A missing, malformed, or unavailable policy must not become permission or silently disable policy handling.
- Keep policy state in memory only. Prevent a prior project's decision from appearing after identity changes; only retain a last-known decision for the same authenticated identity during a refresh failure.
- The banner is a display signal, not an authorization boundary. Enforce access on the server.
- Keep the service implementation outside this repository unless the task explicitly includes its owning repo. Coordinate contract changes across both sides and verify the server-derived project identity.
- Follow the existing tests in `src/features/cui/__tests__/` and `src/__tests__/CuiAppShell.test.tsx`. UI mocks do not establish server authorization.
- Do not log tokens, patient data, policy payloads, or sensitive diagnostics. Do not run live authorization checks or mutate configuration without explicit authorization and a disposable synthetic environment.
