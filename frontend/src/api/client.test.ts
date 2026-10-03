import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import diagnosisRequestFixture from "../../../data/fixtures/foundation/diagnosis-request.json";
import diagnosisResultFixture from "../../../data/fixtures/foundation/diagnosis-result.json";
import orbitalRequestFixture from "../../../data/fixtures/foundation/orbital-request.json";
import orbitalResultFixture from "../../../data/fixtures/foundation/orbital-result.json";
import telemetryRequestFixture from "../../../data/fixtures/foundation/telemetry-request.json";
import telemetryResultFixture from "../../../data/fixtures/foundation/telemetry-result.json";
import type {
  DiagnosisRequest,
  ErrorResponse,
  HealthResponse,
  OrbitalRequest,
  OrbitalResult,
  TelemetryRequest,
  TelemetryResult,
} from "../types/contracts";
import {
  analyzeTelemetry,
  ApiError,
  ApiResponseError,
  assessDiagnosis,
  getHealth,
  screenOrbital,
} from "./client";

// JSON imports widen enum strings. Check and narrow them without unsafe casts
// or inventing sample measurements; the remaining fields are checked by TS.
function fixtureLiteral<T extends string>(value: string, expected: T): T {
  if (value !== expected) throw new Error(`Expected fixture literal ${expected}, received ${value}.`);
  return expected;
}

const orbitalRequest = {
  ...orbitalRequestFixture,
  provenance: {
    ...orbitalRequestFixture.provenance,
    kind: fixtureLiteral(orbitalRequestFixture.provenance.kind, "fixture"),
  },
} satisfies OrbitalRequest;

const telemetryRequest = {
  ...telemetryRequestFixture,
  provenance: {
    ...telemetryRequestFixture.provenance,
    kind: fixtureLiteral(telemetryRequestFixture.provenance.kind, "fixture"),
  },
} satisfies TelemetryRequest;

const orbitalResult = {
  ...orbitalResultFixture,
  status: fixtureLiteral(orbitalResultFixture.status, "not_computed"),
  provenance: {
    ...orbitalResultFixture.provenance,
    kind: fixtureLiteral(orbitalResultFixture.provenance.kind, "fixture"),
  },
} satisfies OrbitalResult;

const telemetryResult = {
  ...telemetryResultFixture,
  status: fixtureLiteral(telemetryResultFixture.status, "not_computed"),
  provenance: {
    ...telemetryResultFixture.provenance,
    kind: fixtureLiteral(telemetryResultFixture.provenance.kind, "fixture"),
  },
  anomalies: telemetryResultFixture.anomalies.map((anomaly) => ({
    ...anomaly,
    status: fixtureLiteral(anomaly.status, "not_evaluated"),
  })),
} satisfies TelemetryResult;

const diagnosisRequest = {
  ...diagnosisRequestFixture,
  orbital_result: orbitalResult,
  telemetry_result: telemetryResult,
} satisfies DiagnosisRequest;

const health = {
  status: "ok",
  service: "OCAADS",
  stage: "foundation",
  engine_mode: "fixture_only",
} satisfies HealthResponse;

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("foundation API client", () => {
  it("gets health using the unchanged /api prefix and forwards cancellation", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce(Response.json(health));

    await expect(getHealth(controller.signal)).resolves.toEqual(health);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/health", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  });

  const postCases = [
    {
      path: "/api/orbital/screen",
      request: orbitalRequest,
      original: orbitalRequestFixture,
      result: orbitalResultFixture,
      call: (signal?: AbortSignal) => screenOrbital(orbitalRequest, signal),
    },
    {
      path: "/api/telemetry/analyze",
      request: telemetryRequest,
      original: telemetryRequestFixture,
      result: telemetryResultFixture,
      call: (signal?: AbortSignal) => analyzeTelemetry(telemetryRequest, signal),
    },
    {
      path: "/api/diagnosis/assess",
      request: diagnosisRequest,
      original: diagnosisRequestFixture,
      result: diagnosisResultFixture,
      call: (signal?: AbortSignal) => assessDiagnosis(diagnosisRequest, signal),
    },
  ];

  it.each(postCases)("posts JSON to $path and returns its fixture result unchanged", async (testCase) => {
    const controller = new AbortController();
    fetchMock.mockResolvedValueOnce(Response.json(testCase.result));

    expect(testCase.request).toEqual(testCase.original);
    await expect(testCase.call(controller.signal)).resolves.toEqual(testCase.result);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(testCase.path, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(testCase.request),
      signal: controller.signal,
    });
  });

  it("allows calls without an AbortSignal", async () => {
    fetchMock.mockResolvedValueOnce(Response.json(health));
    fetchMock.mockResolvedValueOnce(Response.json(orbitalResultFixture));

    await expect(getHealth()).resolves.toEqual(health);
    await expect(screenOrbital(orbitalRequest)).resolves.toEqual(orbitalResultFixture);
  });

  it.each([
    {
      status: 422,
      body: {
        code: "invalid_request",
        message: "Request validation failed.",
        issues: [{ location: ["body", "comparisons", 0, "object_id"], message: "Invalid identifier." }],
      } satisfies ErrorResponse,
    },
    {
      status: 501,
      body: {
        code: "not_implemented",
        message: "Real engines are not implemented.",
        issues: [],
      } satisfies ErrorResponse,
    },
  ])("preserves the structured ErrorResponse for HTTP $status", async ({ status, body }) => {
    fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
    const result = screenOrbital(orbitalRequest);

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({
      status,
      error: body,
      message: `${body.message} (HTTP ${status})`,
    });
  });

  it("retains the HTTP status when an upstream error is HTML instead of JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>Bad gateway</html>", { status: 502 }));

    await expect(getHealth()).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      error: undefined,
      message: "API request failed with HTTP 502.",
    });
  });

  it.each([
    null,
    { detail: "Unexpected server error" },
    { code: "unknown", message: "Unexpected error", issues: [] },
    { code: "invalid_request", message: "Invalid", issues: [null] },
    { code: "invalid_request", message: "Invalid", issues: [{ location: [false], message: "Invalid" }] },
  ])("does not trust malformed error envelopes: %j", async (body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body, { status: 422 }));

    await expect(getHealth()).rejects.toMatchObject({ name: "ApiError", status: 422, error: undefined });
  });

  it("reports invalid JSON on a successful response", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not JSON", { status: 200 }));
    const result = analyzeTelemetry(telemetryRequest);

    await expect(result).rejects.toBeInstanceOf(ApiResponseError);
    await expect(result).rejects.toMatchObject({ status: 200, message: "The API returned invalid JSON." });
  });

  it.each([
    null,
    [],
    { ...health, stage: "scaffold" },
    { status: "ok", service: "OCAADS", stage: "foundation" },
    { ...health, engine_mode: "real" },
    { ...health, service: "Other service" },
    { ...health, status: "unavailable" },
  ])("rejects unexpected health JSON instead of claiming connectivity: %j", async (body) => {
    fetchMock.mockResolvedValueOnce(Response.json(body));

    await expect(getHealth()).rejects.toMatchObject({
      name: "ApiResponseError",
      message: "The backend returned an unexpected health response.",
    });
  });

  it("preserves network failures rather than treating them as HTTP errors", async () => {
    const failure = new TypeError("Failed to fetch");
    fetchMock.mockRejectedValueOnce(failure);

    await expect(getHealth()).rejects.toBe(failure);
  });

  it("preserves an aborted fetch and passes its signal", async () => {
    const controller = new AbortController();
    controller.abort();
    const failure = new DOMException("Request aborted", "AbortError");
    fetchMock.mockRejectedValueOnce(failure);

    await expect(assessDiagnosis(diagnosisRequest, controller.signal)).rejects.toBe(failure);
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });

  it.each([
    new DOMException("Body read aborted", "AbortError"),
    new TypeError("Body stream failed"),
  ])("preserves body-read failures rather than misreporting invalid JSON: %s", async (failure) => {
    const response = Response.json(health);
    vi.spyOn(response, "json").mockRejectedValueOnce(failure);
    fetchMock.mockResolvedValueOnce(response);

    await expect(getHealth()).rejects.toBe(failure);
  });
});
