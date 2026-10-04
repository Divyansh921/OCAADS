# Frontend orbital validation UI

React 18 + TypeScript + Vite. The frontend exposes the first cached TLE/SGP4 validation slice. Telemetry and diagnosis remain unfinished placeholders.

The page provides navigation to conjunctions, telemetry/anomalies, and diagnosis. Health is the only automatic request, with a five-second timeout and retry. **Load local snapshot** requests `GET /api/orbital/dataset`; **Run orbital screening** posts that verified input to `/api/orbital/screen`. It displays selected IDs/epochs, the replay window, calculated candidates or an explicit no-candidate state, errors/retry, and the provenance/method record. Pending requests are aborted on unmount; no engine runs automatically.

Calculations stay in the backend. The UI is a historical engineering replay, not a live prediction. Satellite selection and the precomputed what-if remain reserved.

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
| `getOrbitalDataset(signal?)` | `GET /api/orbital/dataset` | `OrbitalRequest` |
| `screenOrbital(request, signal?)` | `POST /api/orbital/screen` | `OrbitalRequest` → `OrbitalResult` |
| `analyzeTelemetry(request, signal?)` | `POST /api/telemetry/analyze` | `TelemetryRequest` → `TelemetryResult` |
| `assessDiagnosis(request, signal?)` | `POST /api/diagnosis/assess` | `DiagnosisRequest` → `DiagnosisResult` |

All signals are optional `AbortSignal` values. POST methods send JSON. The conjunction section calls the dataset/screening methods on demand; telemetry/diagnosis sections do not invoke their adapters.

- Health requires `status: "ok"`, `service: "OCAADS"`, `stage: "foundation"`, and `engine_mode: "orbital_calculated_telemetry_fixture"`. This confirms liveness/configuration, not dataset readiness.
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

`npm test` runs Vitest once in Node. Client tests cover the five routes, JSON POST bodies, cancellation, structured failures, invalid JSON, and health contract mismatches. They reuse [`foundation fixtures`](../data/fixtures/foundation/) as mocked wire payloads; they do not validate physics or browser interaction. Fixtures are test imports, not bundled data.

`build` also runs typechecking. There are no browser/component tests or frontend linter configured. Passing client tests and a build do **not** prove browser interaction, a live backend connection, or an end-to-end investigation workflow.

## Relevant files

- `src/main.tsx`, `src/App.tsx`: entry point and minimal shell.
- `src/components/BackendStatus.tsx`: health connection indicator and retry.
- `src/features/conjunctions/`: cached orbital loading/screening and result/metadata display.
- `src/features/{telemetry,diagnosis}/`: placeholder sections.
- `src/api/client.ts`, `src/api/client.test.ts`: typed HTTP boundary and focused tests.
- `src/styles.css`: basic responsive styling and keyboard focus indicators.
- `public/`: public static assets only; never secrets.
- `vite.config.ts`: React plugin and unchanged-prefix development proxy.
