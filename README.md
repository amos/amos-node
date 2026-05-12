# Amos

A typed Node.js client for the **Amos Pay** API, generated from the public OpenAPI spec with [`openapi-typescript`](https://openapi-ts.dev/) and powered by [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch).

> **Docs:** the full Amos API reference lives at [docs.amos.com](https://docs.amos.com/). This package is the typed Node.js binding for that API.

## Installation

```bash
npm install amos
```

## Quick start

```ts
import Amos from "amos";

const amos = new Amos(process.env.AMOS_API_KEY!);

const { data, error } = await amos.POST("/customers", {
  body: { customer: { email: "alex@example.com" } },
});

if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

### Sandbox mode

```ts
const amos = new Amos(process.env.AMOS_API_KEY!, { sandbox: true });
```

### Custom base URL or fetch

```ts
const amos = new Amos(process.env.AMOS_API_KEY!, {
  baseUrl: "https://my-proxy.example.com",
  fetch: customFetchImpl,
  headers: { "X-Trace-Id": "abc123" },
});
```

### Middleware (e.g. fresh idempotency keys)

```ts
import type { Middleware } from "amos";

const idempotencyKey: Middleware = {
  async onRequest({ request }) {
    if (request.method === "POST") {
      request.headers.set("Idempotency-Key", crypto.randomUUID());
    }
    return request;
  },
};

amos.use(idempotencyKey);
```

## API surface

`new Amos(apiKey, options?)` returns an instance that:

- Sends `X-Api-Key` and `X-Api-Version` on every request.
- Exposes the full [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch) interface directly: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `HEAD`, `PATCH`, `TRACE`, `use`, `eject`.
- Also exposes the underlying client as `amos.client` for advanced use.

### Constructor options

| Option          | Type                     | Default                  | Description                                                          |
| --------------- | ------------------------ | ------------------------ | -------------------------------------------------------------------- |
| `apiVersion`    | `string`                 | `"1"`                    | Sent as the `X-Api-Version` header.                                  |
| `sandbox`       | `boolean`                | `false`                  | If `true`, uses the sandbox base URL. Ignored when `baseUrl` is set. |
| `baseUrl`       | `string`                 | production / sandbox URL | Override the base URL entirely.                                      |
| `headers`       | `Record<string, string>` | `{}`                     | Additional default headers merged into every request.                |
| `fetch`         | `typeof fetch`           | global `fetch`           | Custom `fetch` implementation.                                       |
| `clientOptions` | `Partial<ClientOptions>` | `{}`                     | Escape hatch for any other `openapi-fetch` client options.           |

## Types

All schema types are re-exported from the main entry. For example:

```ts
import type { components, paths, operations } from "amos";

type Customer = components["schemas"]["Customer"];
```

## Versioning

We follow **SemVer** for the npm package, with one extra rule: **the major version tracks the wire-level `X-Api-Version` header**.

| npm range  | `X-Api-Version` it targets |
| ---------- | -------------------------- |
| `amos@1.x` | `1`                        |
| `amos@2.x` | `2` (hypothetical)         |

So bumping `DEFAULT_API_VERSION` in `src/index.ts` is always a major release, and consumers who pin to `amos@^1` know they will never be transparently upgraded onto a new wire contract.

> **Pre-1.0 caveat.** While we're on `0.x`, **breaking changes can land in any `0.x` release.** Strict SemVer (and the API-version-tracks-major rule above) starts the day we cut `1.0.0`. Pin to an exact `0.x.y` if you need stability today.

### How spec changes map to bumps

The package is essentially "OpenAPI-derived types + a thin runtime wrapper", so we classify changes by their TypeScript-visible impact:

| Change in the spec or runtime                                                                                | Bump  |
| ------------------------------------------------------------------------------------------------------------ | ----- |
| Removing/renaming a path, operation, schema, or response enum value                                          | major |
| Narrowing a type, making a request field required, changing a parameter from optional to required            | major |
| Changing the `Amos` constructor surface in a breaking way, or bumping `DEFAULT_API_VERSION`                  | major |
| Adding endpoints, schemas, optional request fields, request enum values, or new runtime exports              | minor |
| Spec descriptions/examples/tags only, internal refactors with no public type change, dependency-only updates | patch |

The mental rule: _"would a program that typechecked against the previous `dist/index.d.ts` still typecheck against the new one?"_ If no, it's a major.

### Spec source of truth, not `info.version`

The npm version in `package.json` is **decoupled** from the `info.version` field of the upstream OpenAPI spec. They drift independently on purpose: a docs-only spec edit shouldn't ship an SDK release, and an SDK-only fix shouldn't wait for a spec change.

What we _do_ track per release is the upstream commit SHA, in two places:

- [`openapi/source.json`](./openapi/source.json) — the spec commit this package was last released against.
- `CHANGELOG.md` — every release entry references the upstream `amos/openapi` commit(s) that produced it (auto-populated by the regeneration workflow, see below).

## Release process

Releases are managed with [Changesets](https://github.com/changesets/changesets). The flow has two paths.

### Path A: regenerated from the OpenAPI spec (the common case)

1. The [`Regenerate from OpenAPI`](./.github/workflows/regenerate.yml) workflow runs on `workflow_dispatch`, or when the OpenAPI source repo fires a `repository_dispatch` event of type `public-openapi-spec-updated` (dispatched by the upstream sync workflow whenever the public spec changes on its `main`).
2. It checks out the spec repo at the dispatched commit, diffs that spec against the SHA recorded in [`openapi/source.json`](./openapi/source.json) using [`oasdiff`](https://github.com/oasdiff/oasdiff), and classifies the change as `major` / `minor` / `patch`.
3. If anything changed, it regenerates `openapi/schema.ts` (via `npm run build`), updates `openapi/source.json`, writes a `.changeset/regen-<sha>.md` file with the recommended bump and the upstream commit log, and opens a PR.
4. A maintainer reviews the PR — **adjust the bump in the changeset file if `oasdiff` misclassified anything** (e.g., a response-only enum addition that breaks exhaustive switches in your consumers should be promoted to `major`) — and merges.
5. The [`Release`](./.github/workflows/release.yml) workflow then opens or updates a "Version Packages" PR. Merging that PR publishes to npm and tags the commit.

### Path B: hand-authored change (runtime fix, refactor, dep bump)

1. Make your change on a branch.
2. Run `npx changeset` and answer the prompts to describe the bump.
3. Open a PR. Reviewers will see the changeset file alongside the diff.
4. Merging triggers the same `Release` workflow as above.

### Required CI secrets

| Secret               | Used by          | Purpose                                                                       |
| -------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `NPM_TOKEN`          | `release.yml`    | Publishing to npm. Use an automation token from the `amos` org/account.       |
| `OPENAPI_REPO_TOKEN` | `regenerate.yml` | Fine-grained PAT with `Contents: Read` on `amos/openapi`. Spec is private. |

The default `GITHUB_TOKEN` handles everything else. Make sure **Settings -> Actions -> General -> Workflow permissions -> "Allow GitHub Actions to create and approve pull requests"** is enabled so the regenerate workflow can open PRs.

## Regenerating locally

If you want to preview a regeneration without going through CI:

```bash
npm run generate
```

This pulls the sibling `../openapi` checkout and rewrites `openapi/schema.ts`. It does **not** touch `openapi/source.json` or write a changeset — only the workflow does that, so the recorded SHA always matches a released version.

## Development

```bash
npm install
npm run build
```

Add a changeset alongside any user-visible change:

```bash
npx changeset
```
