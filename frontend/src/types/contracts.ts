import type { components } from "./api.generated";

// Convenient names backed by the generated OpenAPI types, not parallel interfaces.
export type HealthResponse = components["schemas"]["HealthResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type ValidationIssue = components["schemas"]["ValidationIssue"];
export type OrbitalRequest = components["schemas"]["OrbitalRequest"];
export type OrbitalResult = components["schemas"]["OrbitalResult"];
export type TelemetryRequest = components["schemas"]["TelemetryRequest"];
export type TelemetryResult = components["schemas"]["TelemetryResult"];
export type DiagnosisRequest = components["schemas"]["DiagnosisRequest"];
export type DiagnosisResult = components["schemas"]["DiagnosisResult"];
export type Conjunction = components["schemas"]["Conjunction"];
export type Anomaly = components["schemas"]["Anomaly"];
export type Diagnosis = components["schemas"]["Diagnosis"];
export type Evidence = components["schemas"]["Evidence"];
export type InputProvenance = components["schemas"]["InputProvenance"];
export type ResultProvenance = components["schemas"]["ResultProvenance"];
export type OrbitalObject = components["schemas"]["OrbitalObject"];
export type TleElements = components["schemas"]["TleElements"];
export type OmmElements = components["schemas"]["OmmElements"];
export type TimeWindow = components["schemas"]["TimeWindow"];
export type Signal = components["schemas"]["Signal"];
export type TelemetrySample = components["schemas"]["TelemetrySample"];
