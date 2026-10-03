import type { paths } from "../types/api.generated";
import type {
  DiagnosisRequest,
  DiagnosisResult,
  ErrorResponse,
  HealthResponse,
  OrbitalRequest,
  OrbitalResult,
  TelemetryRequest,
  TelemetryResult,
} from "../types/contracts";

/** A non-2xx response, with the structured backend error when it is recognized. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error?: ErrorResponse,
  ) {
    super(error ? `${error.message} (HTTP ${status})` : `API request failed with HTTP ${status}.`);
    this.name = "ApiError";
  }
}

/** A successful HTTP response that cannot be consumed by this client. */
export class ApiResponseError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Small runtime guards for error reporting and the liveness indicator only.
// Generated TypeScript types are NOT runtime schema validation.
function isErrorResponse(value: unknown): value is ErrorResponse {
  return isRecord(value)
    && (value.code === "invalid_request" || value.code === "not_implemented")
    && typeof value.message === "string"
    && Array.isArray(value.issues)
    && value.issues.every((issue: unknown) => isRecord(issue)
      && typeof issue.message === "string"
      && Array.isArray(issue.location)
      && issue.location.every((part: unknown) => typeof part === "string"
        || (typeof part === "number" && Number.isInteger(part))));
}

function isHealthResponse(value: unknown): value is HealthResponse {
  return isRecord(value)
    && value.status === "ok"
    && value.service === "OCAADS"
    && value.stage === "foundation"
    && value.engine_mode === "fixture_only";
}

async function requestJson<T>(path: keyof paths, init: RequestInit): Promise<T> {
  // Fetch/network failures and AbortError intentionally keep their native identity.
  const response = await fetch(path, init);
  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    // Do not turn an aborted request or body-stream failure into a JSON error.
    if (!(error instanceof SyntaxError)) throw error;
    if (!response.ok) throw new ApiError(response.status);
    throw new ApiResponseError(response.status, "The API returned invalid JSON.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, isErrorResponse(payload) ? payload : undefined);
  }

  // Successful scientific payloads are trusted to the backend contract, not
  // validated here. The foundation UI does not request or display these results.
  return payload as T;
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const payload = await requestJson<unknown>("/api/health", {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!isHealthResponse(payload)) {
    throw new ApiResponseError(200, "The backend returned an unexpected health response.");
  }
  return payload;
}

function postJson<T>(path: keyof paths, payload: unknown, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
}

export function screenOrbital(request: OrbitalRequest, signal?: AbortSignal): Promise<OrbitalResult> {
  return postJson<OrbitalResult>("/api/orbital/screen", request, signal);
}

export function analyzeTelemetry(request: TelemetryRequest, signal?: AbortSignal): Promise<TelemetryResult> {
  return postJson<TelemetryResult>("/api/telemetry/analyze", request, signal);
}

export function assessDiagnosis(request: DiagnosisRequest, signal?: AbortSignal): Promise<DiagnosisResult> {
  return postJson<DiagnosisResult>("/api/diagnosis/assess", request, signal);
}
