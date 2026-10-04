/**
 * Generated from coding/contracts/openapi.json by openapi-typescript.
 * Do not edit by hand. Run npm run generate:api from coding/frontend.
 * These types do not validate API payloads at runtime.
 */

export interface paths {
    "/api/diagnosis/assess": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Connect fixture evidence (no diagnosis) */
        post: operations["assessDiagnosis"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/orbital/dataset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Load verified local six-object TLE input */
        get: operations["getOrbitalDataset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/orbital/screen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Screen TLE inputs with SGP4; not collision probability */
        post: operations["screenOrbital"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/telemetry/analyze": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Connect a telemetry fixture (no ML) */
        post: operations["analyzeTelemetry"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** Anomaly */
        Anomaly: {
            /** Id */
            id: string;
            /** Satellite Id */
            satellite_id: string;
            /** Score */
            score: number | null;
            /** Signals */
            signals: string[];
            /**
             * Status
             * @enum {string}
             */
            status: "not_evaluated" | "anomaly" | "normal";
            /**
             * Timestamp
             * Format: date-time
             */
            timestamp: string;
        };
        /** Conjunction */
        Conjunction: {
            /** Comparison Id */
            comparison_id: string;
            /** Id */
            id: string;
            /** Miss Distance Km */
            miss_distance_km: number | null;
            /** Screening Rank */
            screening_rank: number | null;
            /** Target Id */
            target_id: string;
            /** Tca */
            tca: string | null;
        };
        /** Diagnosis */
        Diagnosis: {
            /** Anomaly Id */
            anomaly_id: string;
            /** Evidence */
            evidence: components["schemas"]["Evidence"][];
            /** Explanation */
            explanation: string;
            /** Id */
            id: string;
            /** Possible Cause */
            possible_cause: string | null;
            /** Related Conjunction Ids */
            related_conjunction_ids: string[];
            /**
             * Status
             * @enum {string}
             */
            status: "not_assessed" | "insufficient_evidence" | "hypothesis";
        };
        /** DiagnosisRequest */
        DiagnosisRequest: {
            orbital_result: components["schemas"]["OrbitalResult"];
            /** Request Id */
            request_id: string;
            /** Satellite Id */
            satellite_id: string;
            telemetry_result: components["schemas"]["TelemetryResult"];
        };
        /** DiagnosisResult */
        DiagnosisResult: {
            /** Diagnoses */
            diagnoses: components["schemas"]["Diagnosis"][];
            /** Notice */
            notice: string;
            provenance: components["schemas"]["ResultProvenance"];
            /** Request Id */
            request_id: string;
            /** Satellite Id */
            satellite_id: string;
            /**
             * Status
             * @enum {string}
             */
            status: "not_computed" | "completed";
        };
        /** ErrorResponse */
        ErrorResponse: {
            /**
             * Code
             * @enum {string}
             */
            code: "invalid_request" | "not_implemented";
            /** Issues */
            issues: components["schemas"]["ValidationIssue"][];
            /** Message */
            message: string;
        };
        /** Evidence */
        Evidence: {
            /** Description */
            description: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "input_reference" | "rule";
            /** Reference Id */
            reference_id: string;
            /**
             * Reference Type
             * @enum {string}
             */
            reference_type: "anomaly" | "conjunction";
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Engine Mode
             * @default orbital_calculated_telemetry_fixture
             * @constant
             */
            engine_mode: "orbital_calculated_telemetry_fixture";
            /**
             * Service
             * @default OCAADS
             * @constant
             */
            service: "OCAADS";
            /**
             * Stage
             * @default foundation
             * @constant
             */
            stage: "foundation";
            /**
             * Status
             * @default ok
             * @constant
             */
            status: "ok";
        };
        /** InputProvenance */
        InputProvenance: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "fixture" | "supplied";
            /** Source */
            source: string;
        };
        /**
         * OmmElements
         * @description Uninterpreted flat OMM fields; required orbital fields remain Person 1's work.
         */
        OmmElements: {
            /** Fields */
            fields: {
                [key: string]: string | number;
            };
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            format: "omm";
        };
        /**
         * OrbitalCalculationMetadata
         * @description Reproduction settings for a completed orbital screening result.
         */
        OrbitalCalculationMetadata: {
            /**
             * Frame
             * @constant
             */
            frame: "TEME";
            /**
             * Gravity Model
             * @constant
             */
            gravity_model: "WGS72";
            /**
             * Position Unit
             * @constant
             */
            position_unit: "km";
            /**
             * Propagator
             * @constant
             */
            propagator: "sgp4";
            /** Propagator Version */
            propagator_version: string;
            /** Sample Interval Seconds */
            sample_interval_seconds: number;
            /** Screening Threshold Km */
            screening_threshold_km: number;
            /**
             * Snapshot Recorded At
             * Format: date-time
             */
            snapshot_recorded_at: string;
            /** Snapshot Retrieved At */
            snapshot_retrieved_at: string | null;
            /** Snapshot Sha256 */
            snapshot_sha256: string;
            /** Source Endpoint */
            source_endpoint: string;
            /** Tca Refinement Seconds */
            tca_refinement_seconds: number;
            /**
             * Velocity Unit
             * @constant
             */
            velocity_unit: "km/s";
            window: components["schemas"]["TimeWindow"];
        };
        /** OrbitalObject */
        OrbitalObject: {
            /** Display Name */
            display_name?: string | null;
            /** Elements */
            elements: (components["schemas"]["TleElements"] | components["schemas"]["OmmElements"]) | null;
            /** Epoch */
            epoch: string | null;
            /** Object Id */
            object_id: string;
        };
        /** OrbitalRequest */
        OrbitalRequest: {
            /** Comparisons */
            comparisons: components["schemas"]["OrbitalObject"][];
            provenance: components["schemas"]["InputProvenance"];
            /** Request Id */
            request_id: string;
            target: components["schemas"]["OrbitalObject"];
            window: components["schemas"]["TimeWindow"];
        };
        /** OrbitalResult */
        OrbitalResult: {
            /** Conjunctions */
            conjunctions: components["schemas"]["Conjunction"][];
            metadata: components["schemas"]["OrbitalCalculationMetadata"] | null;
            /** Notice */
            notice: string;
            provenance: components["schemas"]["ResultProvenance"];
            /** Request Id */
            request_id: string;
            /** Satellite Id */
            satellite_id: string;
            /**
             * Screening Status
             * @enum {string}
             */
            screening_status: "not_computed" | "no_conjunction" | "candidates_found";
            /**
             * Status
             * @enum {string}
             */
            status: "not_computed" | "completed";
        };
        /** ResultProvenance */
        ResultProvenance: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "fixture" | "calculated" | "model_generated" | "rule_generated";
            /** Source */
            source: string;
        };
        /** Signal */
        Signal: {
            /** Name */
            name: string;
            /** Unit */
            unit: string;
        };
        /** TelemetryRequest */
        TelemetryRequest: {
            provenance: components["schemas"]["InputProvenance"];
            /** Request Id */
            request_id: string;
            /** Samples */
            samples: components["schemas"]["TelemetrySample"][];
            /** Satellite Id */
            satellite_id: string;
            /** Signals */
            signals: components["schemas"]["Signal"][];
        };
        /** TelemetryResult */
        TelemetryResult: {
            /** Anomalies */
            anomalies: components["schemas"]["Anomaly"][];
            /** Notice */
            notice: string;
            provenance: components["schemas"]["ResultProvenance"];
            /** Request Id */
            request_id: string;
            /** Satellite Id */
            satellite_id: string;
            /**
             * Status
             * @enum {string}
             */
            status: "not_computed" | "completed";
        };
        /** TelemetrySample */
        TelemetrySample: {
            /**
             * Timestamp
             * Format: date-time
             */
            timestamp: string;
            /** Values */
            values: {
                [key: string]: number | null;
            };
        };
        /** TimeWindow */
        TimeWindow: {
            /**
             * End
             * Format: date-time
             */
            end: string;
            /**
             * Start
             * Format: date-time
             */
            start: string;
        };
        /**
         * TleElements
         * @description Raw lines only; validation does NOT establish a valid TLE or checksum.
         */
        TleElements: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            format: "tle";
            /** Line1 */
            line1: string;
            /** Line2 */
            line2: string;
        };
        /** ValidationIssue */
        ValidationIssue: {
            /** Location */
            location: (string | number)[];
            /** Message */
            message: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    assessDiagnosis: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DiagnosisRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiagnosisResult"];
                };
            };
            /** @description Invalid request or inconsistent references. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Real engines are not implemented. */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    getOrbitalDataset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrbitalRequest"];
                };
            };
            /** @description Invalid request or inconsistent references. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Real engines are not implemented. */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    screenOrbital: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrbitalRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrbitalResult"];
                };
            };
            /** @description Invalid request or inconsistent references. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Real engines are not implemented. */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    analyzeTelemetry: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TelemetryRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TelemetryResult"];
                };
            };
            /** @description Invalid request or inconsistent references. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Real engines are not implemented. */
            501: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
