type RequestLike = {
  url: string;
  headers: Headers;
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function normalizeConfiguredUrl(value: string | undefined) {
  const trimmed = value?.trim().replace(/^["']|["']$/g, "");
  return trimmed ? stripTrailingSlash(trimmed) : undefined;
}

/** Public base URL for the app, e.g. http://172.20.0.20:3000 */
export function getConfiguredAppUrl() {
  return normalizeConfiguredUrl(process.env.APP_URL);
}

export function getRequestOrigin(request: RequestLike) {
  const configured = getConfiguredAppUrl();
  if (configured) return configured;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost?.split(",")[0]?.trim() ?? request.headers.get("host");

  if (host) {
    const protocol =
      forwardedProto?.split(",")[0]?.trim() ??
      new URL(request.url).protocol.replace(":", "");
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}

export function resolveAppUrl(path: string, request: RequestLike) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${getRequestOrigin(request)}/`);
}

export function isSecureRequest(request: RequestLike) {
  const configured = getConfiguredAppUrl();
  if (configured) {
    return configured.startsWith("https://");
  }

  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}
