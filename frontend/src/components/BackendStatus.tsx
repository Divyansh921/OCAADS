import { useEffect, useState } from "react";
import { getHealth } from "../api/client";

export default function BackendStatus() {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"checking" | "connected" | "unavailable">("checking");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    setStatus("checking");

    getHealth(controller.signal)
      .then(() => {
        if (!cancelled) setStatus("connected");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  return (
    <section className="panel" aria-labelledby="backend-heading">
      <h2 id="backend-heading">Backend connection</h2>
      <p role="status">
        {status === "checking" && "Checking the local OCAADS API…"}
        {status === "connected" && "Connected. Orbital SGP4 screening is configured; telemetry and diagnosis are fixtures. This confirms API liveness only."}
        {status === "unavailable" && "The API is unavailable or returned an unexpected response. Start the FastAPI backend on port 8000, then try again."}
      </p>
      <button
        type="button"
        disabled={status === "checking"}
        onClick={() => setAttempt((previous) => previous + 1)}
      >
        Check again
      </button>
    </section>
  );
}
