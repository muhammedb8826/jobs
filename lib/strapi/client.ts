const DEFAULT_STRAPI_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const baseUrl = ( DEFAULT_STRAPI_URL ?? "").replace(/\/$/, "");
const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

type Primitive = string | number | boolean;
type QueryValueRecord = { [key: string]: QueryValue | undefined };
type QueryValue = Primitive | Primitive[] | QueryValueRecord;

type StrapiFetchOptions = RequestInit & {
  params?: Record<string, QueryValue | undefined>;
  /**
   * Append /api automatically when true (default).
   */
  useApiPrefix?: boolean;
};

export function getStrapiURL(path = "") {
  return `${baseUrl}${path}`;
}

export async function strapiFetch<TResponse>(
  path: string,
  { params, headers, useApiPrefix = true, ...init }: StrapiFetchOptions = {}
): Promise<TResponse> {
  // Gracefully handle missing base URL during build/runtime
  if (!baseUrl) {
    console.warn(
      "NEXT_PUBLIC_API_BASE_URL is not set. Returning empty response. Please configure your Strapi URL in environment variables."
    );
    // Return a structure that matches typical Strapi responses
    return { data: null, meta: {} } as TResponse;
  }

  try {
    const url = new URL(
      `${useApiPrefix ? "/api" : ""}/${path}`.replace(/\/{2,}/g, "/"),
      baseUrl
    );

    if (params) {
      const searchParams = toSearchParams(params);
      if (searchParams) {
        url.search = searchParams;
      }
    }

    const mergedHeaders = new Headers(headers);
    mergedHeaders.set("Content-Type", "application/json");
    if (apiToken) {
      mergedHeaders.set("Authorization", `Bearer ${apiToken}`);
    }

    const response = await fetch(url.toString(), {
      ...init,
      headers: mergedHeaders,
      // keep Next.js cache options if provided
    });

    if (!response.ok) {
      const errorBody = await safeReadJson(response);
      throw new Error(
        `Strapi request failed: ${response.status} ${response.statusText}${
          errorBody ? ` - ${JSON.stringify(errorBody)}` : ""
        }`
      );
    }

    return response.json();
  } catch (error) {
    // Log error but return empty response structure to allow build/runtime to continue
    console.warn(`Failed to fetch from Strapi (${path}):`, error);
    return { data: null, meta: {} } as TResponse;
  }
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toSearchParams(params: Record<string, QueryValue | undefined>) {
  const searchParams = new URLSearchParams();

  const appendValue = (key: string, value: QueryValue | undefined) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => appendValue(`${key}[${index}]`, item));
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) => {
        appendValue(`${key}[${childKey}]`, childValue);
      });
      return;
    }
    searchParams.append(key, String(value));
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    appendValue(key, value);
  });

  return searchParams.toString();
}

