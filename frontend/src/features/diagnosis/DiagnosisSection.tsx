export default function DiagnosisSection() {
  return (
    <section id="diagnosis" className="panel" aria-labelledby="diagnosis-heading">
      <span className="badge">Not implemented · Fixture-only API</span>
      <h2 id="diagnosis-heading">Diagnosis</h2>
      <p>Correlation and diagnosis are not implemented. No cause, confidence, or scientific relationship is inferred.</p>
      <p>The typed client is ready for <code>POST /api/diagnosis/assess</code>; this section does not call it.</p>
      <p>Future explanations must include evidence and uncertainty. Correlation is not causation.</p>
    </section>
  );
}
