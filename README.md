# Amos

A typed Node.js client for the **Amos Pay** API, generated from the OpenAPI spec with [`openapi-typescript`](https://openapi-ts.dev/) and powered by [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch).

> **Docs:** the full Amos API reference lives at [docs.amos.com](https://docs.amos.com/). This package is the typed Node.js binding for that API.

## Installation

```bash
npm install @amos.com/node
```

## Quick start

```ts
import {
  createPayApiClient,
  PAY_API_BASE_URL_PRODUCTION,
  PAY_API_VERSION,
} from "@amos.com/node";

const pay = createPayApiClient({
  baseUrl: PAY_API_BASE_URL_PRODUCTION,
  headers: {
    "X-Api-Key": process.env.AMOS_API_KEY!,
    "X-Api-Version": PAY_API_VERSION,
  },
});

const { data, error } = await pay.POST("/customers", {
  body: { customer: { email: "alex@example.com" } },
});

if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

### Sandbox mode

Swap the base URL constant:

```ts
import {
  createPayApiClient,
  PAY_API_BASE_URL_SANDBOX,
  PAY_API_VERSION,
} from "@amos.com/node";

const pay = createPayApiClient({
  baseUrl: PAY_API_BASE_URL_SANDBOX,
  headers: {
    "X-Api-Key": process.env.AMOS_API_KEY!,
    "X-Api-Version": PAY_API_VERSION,
  },
});
```

### Custom base URL or fetch

`createPayApiClient` accepts any of [`openapi-fetch`'s `ClientOptions`](https://openapi-ts.dev/openapi-fetch/api#create-client), so you can point at a proxy or supply your own `fetch`:

```ts
const pay = createPayApiClient({
  baseUrl: "https://my-proxy.example.com",
  fetch: customFetchImpl,
  headers: {
    "X-Api-Key": process.env.AMOS_API_KEY!,
    "X-Api-Version": PAY_API_VERSION,
    "X-Trace-Id": "abc123",
  },
});
```

### Middleware (e.g. fresh idempotency keys)

```ts
import type { Middleware } from "@amos.com/node";

const idempotencyKey: Middleware = {
  async onRequest({ request }) {
    if (request.method === "POST") {
      request.headers.set("Idempotency-Key", crypto.randomUUID());
    }
    return request;
  },
};

pay.use(idempotencyKey);
```

## API surface

```ts
import {
  createPayApiClient,
  PAY_API_BASE_URL_PRODUCTION,
  PAY_API_BASE_URL_SANDBOX,
  PAY_API_VERSION,
} from "@amos.com/node";
import type { PayApiClient, ClientOptions, Middleware } from "@amos.com/node";
```

- `createPayApiClient(options)` — returns a typed [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch) client. Exposes the full `openapi-fetch` interface: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `HEAD`, `PATCH`, `TRACE`, `use`, `eject`.
- `PAY_API_BASE_URL_PRODUCTION` / `PAY_API_BASE_URL_SANDBOX` — base URLs for the two environments.
- `PAY_API_VERSION` — the wire-level `X-Api-Version` this build targets. Pass it as the `X-Api-Version` header on every request (most easily as a default in `headers`, as shown above).
- `PayApiClient` — the type returned by `createPayApiClient`.
- `ClientOptions`, `Middleware` — re-exported from `openapi-fetch` for convenience.

## Types

All schema types are re-exported from the main entry. For example:

```ts
import type { components, paths, operations } from "@amos.com/node";

type Customer = components["schemas"]["Customer"];
```

## Versioning

We follow **SemVer** for the npm package, with one extra rule: **the major version tracks the wire-level `X-Api-Version` header**.

| npm range            | `X-Api-Version` it targets |
| -------------------- | -------------------------- |
| `@amos.com/node@1.x` | `1`                        |
| `@amos.com/node@2.x` | `2` (hypothetical)         |

So bumping `PAY_API_VERSION` is always a major release, and consumers who pin to `@amos.com/node@^1` know they will never be transparently upgraded onto a new wire contract.

The mental rule for bumps: _"would a program that typechecked against the previous `dist/index.d.ts` still typecheck against the new one?"_ If no, it's a major.

> **Pre-1.0 caveat.** While we're on `0.x`, **breaking changes can land in any `0.x` release.** Strict SemVer (and the API-version-tracks-major rule above) starts the day we cut `1.0.0`. Pin to an exact `0.x.y` if you need stability today.
