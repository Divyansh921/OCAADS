import BackendStatus from "./components/BackendStatus";
import ConjunctionsSection from "./features/conjunctions/ConjunctionsSection";
import DiagnosisSection from "./features/diagnosis/DiagnosisSection";
import TelemetrySection from "./features/telemetry/TelemetrySection";

export default function App() {
  return (
    <main>
      <header>
        <p className="eyebrow">Orbital validation slice · Cached-data replay</p>
        <h1>OCAADS</h1>
        <p>Orbital Collision Avoidance &amp; Anomaly Diagnosis System</p>
        <p>Load the local six-object snapshot and run orbital screening. Telemetry and diagnosis are still reference-only fixtures.</p>
      </header>

      <nav aria-label="Investigation sections">
        <a href="#conjunctions">Conjunctions</a>
        <a href="#telemetry">Telemetry / anomalies</a>
        <a href="#diagnosis">Diagnosis</a>
      </nav>

      <BackendStatus />

      <div className="modules">
        <ConjunctionsSection />
        <TelemetrySection />
        <DiagnosisSection />
      </div>

      <footer>
        <p>Prototype assessment only. A close approach does not prove a collision, and correlation does not prove causation.</p>
        <p>No operational maneuver advice. Satellite selection and the precomputed what-if remain reserved for later work.</p>
      </footer>
    </main>
  );
}
