export default function ConjunctionsSection() {
  return (
    <section id="conjunctions" className="panel" aria-labelledby="conjunctions-heading">
      <span className="badge">Not implemented · Fixture-only API</span>
      <h2 id="conjunctions-heading">Conjunctions</h2>
      <p>Orbital screening and conjunction results are not implemented. No propagation, closest-approach calculation, or ranking runs here.</p>
      <p>The typed client is ready for <code>POST /api/orbital/screen</code>; this section does not call it.</p>
      <p>Future screening priority must not be presented as collision probability.</p>
    </section>
  );
}
