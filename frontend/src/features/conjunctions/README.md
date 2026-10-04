# Conjunctions — cached orbital validation

`ConjunctionsSection.tsx`, reached through `#conjunctions`, loads the verified local six-object input with `GET /api/orbital/dataset` on demand. The user then runs `POST /api/orbital/screen`. No scientific request runs automatically on page load.

It shows selected names/IDs, source epochs, the historical replay window, loading/error/retry states, ranked candidates or a calculated no-candidate state, and the source/checksum/frame/units/method record. Pending requests are aborted on unmount. A fixture response is rejected as an unexpected calculation result.

The backend owns all scientific computation. Generated types are compile-time bindings, not complete runtime validation. Screening rank is not collision probability; empty calculated output is not proof of safety. Telemetry/diagnosis integration remains separate work.
