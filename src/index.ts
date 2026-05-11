import createClient, {
  type ClientOptions,
  type Middleware,
} from "openapi-fetch";
import type { paths } from "../openapi/schema";

export * from "../openapi/schema";

export const PAY_API_BASE_URL_PRODUCTION = "https://pay.subfi.com";
export const PAY_API_BASE_URL_SANDBOX = "https://pay-sandbox.subfi.com";
export const PAY_API_VERSION = "1";

/**
 * Create a typed `openapi-fetch` client for the SubFi Pay API.
 *
 * The returned client exposes `GET`, `POST`, `PUT`, `DELETE`, etc., each
 * fully typed against the OpenAPI spec — paths, path/query/header params,
 * request bodies, and response bodies are all checked at compile time.
 *
 * Provide credentials and the required `X-Api-Version` header either as
 * default `headers` here or via `params.header` on each call. Use
 * `client.use(middleware)` to add per-request behavior such as fresh
 * idempotency keys.
 *
 * @example
 * ```ts
 * import {
 *   createPayApiClient,
 *   PAY_API_BASE_URL_SANDBOX,
 *   PAY_API_VERSION,
 * } from "@subfico/pay-js-sdk/api";
 *
 * const pay = createPayApiClient({
 *   baseUrl: PAY_API_BASE_URL_SANDBOX,
 *   headers: {
 *     "X-Api-Key": process.env.SUBFI_API_KEY!,
 *     "X-Api-Version": PAY_API_VERSION,
 *   },
 * });
 *
 * const { data, error } = await pay.POST("/customers", {
 *   params: { header: { "X-Api-Version": PAY_API_VERSION } },
 *   body: { customer: { email: "alex@example.com" } },
 * });
 * ```
 */
export function createPayApiClient(options: ClientOptions) {
  return createClient<paths>(options);
}

/** A configured SubFi Pay API client returned by {@link createPayApiClient}. */
export type PayApiClient = ReturnType<typeof createPayApiClient>;

export type { ClientOptions, Middleware };
