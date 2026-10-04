import { useEffect, useRef, useState } from "react";
import { getOrbitalDataset, screenOrbital } from "../../api/client";
import type { OrbitalRequest, OrbitalResult } from "../../types/contracts";

export default function ConjunctionsSection() {
  const [dataset, setDataset] = useState<OrbitalRequest | null>(null);
  const [result, setResult] = useState<OrbitalResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "screening">("idle");
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, []);

  async function run(action: "load" | "screen") {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setError(null);
    setResult(null);
    setPhase(action === "load" ? "loading" : "screening");
    if (action === "load") setDataset(null);

    try {
      if (action === "load") {
        const request = await getOrbitalDataset(controller.signal);
        if (request.provenance.kind !== "supplied" || request.comparisons.length !== 5) {
          throw new Error("The API did not return the expected six-object orbital dataset.");
        }
        if (!controller.signal.aborted) setDataset(request);
      } else if (dataset) {
        const calculated = await screenOrbital(dataset, controller.signal);
        if (calculated.status !== "completed" || !calculated.metadata
            || calculated.screening_status === "not_computed") {
          throw new Error("The API did not return a completed orbital calculation.");
        }
        if (!controller.signal.aborted) setResult(calculated);
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure instanceof Error ? failure.message : "The orbital request failed.");
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setPhase("idle");
      }
    }
  }

  const busy = phase !== "idle";
  const metadata = result?.metadata;
  const objectName = (id: string) => {
    const object = dataset && [dataset.target, ...dataset.comparisons].find((item) => item.object_id === id);
    return object?.display_name ? `${object.display_name} (${id})` : id;
  };

  return (
    <section id="conjunctions" className="panel orbital-panel" aria-labelledby="conjunctions-heading" aria-busy={busy}>
      <span className="badge">TLE / SGP4 · One target + five comparisons</span>
      <h2 id="conjunctions-heading">Conjunctions</h2>
      <p>Replay a seven-day window from the target&apos;s TLE epoch using the verified local snapshot. This is a historical engineering calculation, not a live prediction.</p>
      <div className="actions">
        <button type="button" disabled={busy} onClick={() => void run("load")}>
          {phase === "loading" ? "Loading snapshot…" : dataset ? "Reload local snapshot" : "Load local snapshot"}
        </button>
        <button type="button" disabled={busy || !dataset} onClick={() => void run("screen")}>
          {phase === "screening" ? "Screening…" : "Run orbital screening"}
        </button>
      </div>
      <p role="status" aria-live="polite">
        {phase === "loading" && "Validating cached TLE records and checksum…"}
        {phase === "screening" && "Propagating six objects and refining their closest approaches…"}
        {!busy && !dataset && !error && "Load a snapshot to inspect the inputs before running screening."}
        {!busy && dataset && !result && !error && "Snapshot loaded. Ready to run screening."}
        {!busy && result && result.notice}
      </p>
      {error && <p role="alert" className="error">{error}</p>}

      {dataset && (
        <div className="orbital-inputs">
          <h3>Selected inputs</h3>
          <p><strong>Target:</strong> {objectName(dataset.target.object_id)}</p>
          <p><strong>Target epoch (UTC):</strong> <code>{dataset.target.epoch}</code></p>
          <p><strong>Replay window (UTC):</strong> <code>{dataset.window.start}</code> → <code>{dataset.window.end}</code></p>
          <ul>{dataset.comparisons.map((object) => (
            <li key={object.object_id}>{objectName(object.object_id)} · <code>{object.epoch}</code></li>
          ))}</ul>
        </div>
      )}

      {result && metadata && (
        <div className="orbital-results">
          <h3>{result.screening_status === "no_conjunction" ? "No screening candidates found" : "Screening candidates"}</h3>
          {result.screening_status === "no_conjunction" ? (
            <p>No estimated closest approach passed the <strong>&lt; {metadata.screening_threshold_km} km</strong> proxy. This does not prove collision is impossible.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <caption>Ranked by increasing estimated miss distance; rank is not collision probability.</caption>
                <thead><tr><th scope="col">Rank</th><th scope="col">Comparison object</th><th scope="col">TCA (UTC)</th><th scope="col">Miss distance (km)</th></tr></thead>
                <tbody>{result.conjunctions.map((conjunction) => (
                  <tr key={conjunction.id}>
                    <td>{conjunction.screening_rank ?? "—"}</td>
                    <td>{objectName(conjunction.comparison_id)}</td>
                    <td><code>{conjunction.tca ?? "—"}</code></td>
                    <td>{conjunction.miss_distance_km?.toFixed(3) ?? "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <h3>Calculation record</h3>
          <dl className="metadata">
            <dt>Propagation</dt><dd>{metadata.propagator.toUpperCase()} {metadata.propagator_version} · {metadata.gravity_model} · {metadata.frame}</dd>
            <dt>Units</dt><dd>{metadata.position_unit} / {metadata.velocity_unit}</dd>
            <dt>Method</dt><dd>{metadata.sample_interval_seconds}-second samples · {metadata.tca_refinement_seconds}-second refinement bracket · &lt; {metadata.screening_threshold_km} km proxy</dd>
            <dt>Window (UTC)</dt><dd><code>{metadata.window.start}</code> → <code>{metadata.window.end}</code></dd>
            <dt>Source</dt><dd><code>{metadata.source_endpoint}</code></dd>
            <dt>Retrieved (UTC)</dt><dd>{metadata.snapshot_retrieved_at ?? "UNKNOWN — original capture time was not recorded"}</dd>
            <dt>Saved (UTC)</dt><dd><code>{metadata.snapshot_recorded_at}</code></dd>
            <dt>SHA-256</dt><dd><code>{metadata.snapshot_sha256}</code></dd>
          </dl>
          <p>TLE age and the sampled search limit accuracy; a narrow or separate minimum may be missed. Screening priority is not collision probability.</p>
        </div>
      )}
    </section>
  );
}
