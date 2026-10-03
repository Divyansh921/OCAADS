# Shared contract artifacts

`openapi.json` is the checked-in API snapshot exported from the Pydantic models and FastAPI routes. It is generated, not hand-edited. The authoritative Python models are in `../backend/app/domain/contracts.py`. Human-readable meanings, units, errors, and open decisions live in [`../../docs/data-contracts.md`](../../docs/data-contracts.md).

The frontend's TypeScript definitions are generated from this snapshot. Update the models/routes, regenerate the snapshot and frontend types, then run the drift checks together. See [`../../docs/development.md`](../../docs/development.md) for commands.

Shared changes need agreement from affected producers and consumers; this is not owned unilaterally by one engine developer. Person 4 coordinates integration. These schemas prove structure only, not scientific correctness.
