# Frontend foundation

React 18 + TypeScript + Vite. This is a **fixture-only development foundation**, not a finished dashboard or an operational spacecraft tool.

The page provides anchor navigation to conjunctions, telemetry/anomalies, and diagnosis. Each section explicitly says **Not implemented** and makes no request. The only automatic request is `GET /api/health`, with loading, connected, unavailable, five-second timeout, and retry states. React's development Strict Mode may start and cancel an extra health request; no engine endpoint is called automatically.

Satellite selection and the precomputed what-if folders remain reserved. There are no charts, scientific calculations, displayed fixture results, or maneuver recommendations.

## Run locally

Use Node **20.19+ on the 20.x line, or 22.12+** and npm. From this folder:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`; run the backend separately as described in [`../../docs/development.md`](../../docs/development.md). Stop the dev server with **Ctrl+C**.

Vite forwards `/api/*` to `http://127.0.0.1:8000` **without stripping `/api`**. `.env.example` documents the optional `VITE_API_PROXY_TARGET` override; the default requires no environment file. Never place secrets in `VITE_*` values.

The proxy is development-only. A production host must forward `/api/*` unchanged to the backend. `npm run preview` serves the static bundle; it does not supply that reverse proxy.

## Generated contracts

[`../contracts/openapi.json`](../contracts/openapi.json) is the source of truth. Do not hand-copy backend interfaces or edit `src/types/api.generated.ts`.

```bash
npm run generate:api  # regenerate the checked-in TypeScript file
npm run check:api     # regenerate in memory and compare; writes nothing
```

`scripts/generate-api.mjs` uses the locally installed `openapi-typescript` programmatic API. `check:api` exits nonzero if the checked-in file is missing or differs from generation. When the backend snapshot changes, regenerate and review the type changes with the backend owner; do not change the snapshot from frontend tooling.

- `src/types/api.generated.ts`: generated schemas, paths, and operations.
- `src/types/contracts.ts`: convenient aliases such as `OrbitalRequest`, `TelemetryResult`, `DiagnosisRequest`, and `ErrorResponse`.
- `src/types/health.ts`: compatibility re-export of the generated health alias.

**TypeScript types do not validate JSON at runtime.** The client checks JSON syntax, the basic structured-error shape, and the expected health fields. Successful orbital, telemetry, and diagnosis payloads are trusted to the backend contract, not runtime-validated here. Dates, identifiers, units, and cross-record consistency still require backend validation.

## Typed client for Person 4 / integration

`src/api/client.ts` exports:

| Function | Route | Contract |
| --- | --- | --- |
| `getHealth(signal?)` | `GET /api/health` | `HealthResponse` |
| `screenOrbital(request, signal?)` | `POST /api/orbital/screen` | `OrbitalRequest` → `OrbitalResult` |
| `analyzeTelemetry(request, signal?)` | `POST /api/telemetry/analyze` | `TelemetryRequest` → `TelemetryResult` |
| `assessDiagnosis(request, signal?)` | `POST /api/diagnosis/assess` | `DiagnosisRequest` → `DiagnosisResult` |

All signals are optional `AbortSignal` values. POST methods send JSON. These methods are available for future integration; the placeholder sections do not call them.

- Health requires `status: "ok"`, `service: "OCAADS"`, `stage: "foundation"`, and `engine_mode: "fixture_only"`. This confirms liveness, not scientific readiness.
- Non-2xx responses throw `ApiError` with `.status`. When the response matches the basic `ErrorResponse` shape, `.error` contains `{ code, message, issues }`; this preserves the documented 422 `invalid_request` and 501 `not_implemented` errors.
- Non-JSON/malformed error bodies still produce `ApiError` with the HTTP status and no `.error` envelope. Raw HTML is not exposed as an application error message.
- Invalid JSON on a successful response, or unexpected health JSON, throws `ApiResponseError`.
- Native network/body-stream failures and cancellation errors are propagated unchanged. Consumers can distinguish `AbortError` from HTTP failures.

Fixture-only responses are wiring examples, not scientific results. `not_computed`, null measurements/distances/scores, and empty lists must not be interpreted as a safe or healthy spacecraft. No collision probability or causal diagnosis is implemented.

## Checks

From this folder:

```bash
npm run check:api
npm test
npm run typecheck
npm run build
```

`npm test` runs Vitest once in Node (no server, browser, or live API needed). `src/api/client.test.ts` covers the four routes, JSON POST bodies, signal forwarding, 422/501 envelopes, malformed errors, non-JSON responses, health mismatch, network failures, and cancellation. It reuses the existing [`foundation fixtures`](../data/fixtures/foundation/) as mocked wire payloads, with generated-type-checked request examples; it does not invent satellite data or verify scientific behavior. The fixtures are imported by tests only, not the app bundle.

`build` also runs typechecking. There are no browser/component tests or frontend linter configured. Passing client tests and a build do **not** prove browser interaction, a live backend connection, or an end-to-end investigation workflow.

## Relevant files

- `src/main.tsx`, `src/App.tsx`: entry point and minimal shell.
- `src/components/BackendStatus.tsx`: health connection indicator and retry.
- `src/features/{conjunctions,telemetry,diagnosis}/`: small placeholder sections.
- `src/api/client.ts`, `src/api/client.test.ts`: typed HTTP boundary and focused tests.
- `src/styles.css`: basic responsive styling and keyboard focus indicators.
- `public/`: public static assets only; never secrets.
- `vite.config.ts`: React plugin and unchanged-prefix development proxy.
