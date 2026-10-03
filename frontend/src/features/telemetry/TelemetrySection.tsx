export default function TelemetrySection() {
  return (
    <section id="telemetry" className="panel" aria-labelledby="telemetry-heading">
      <span className="badge">Not implemented · Fixture-only API</span>
      <h2 id="telemetry-heading">Telemetry / anomalies</h2>
      <p>Telemetry replay and anomaly detection are not implemented. No model, score, or telemetry chart is shown.</p>
      <p>The typed client is ready for <code>POST /api/telemetry/analyze</code>; this section does not call it.</p>
      <p>A missing measurement or an unevaluated fixture is not evidence that a spacecraft is healthy.</p>
    </section>
  );
}
