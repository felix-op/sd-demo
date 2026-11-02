const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ProblemDetails {
  status?: number;
  title?: string;
  detail?: string;
  details?: string;
  instance?: string;
}

export class ApiError extends Error {
  status: number;
  path: string;
  problem?: ProblemDetails;

  constructor(status: number, path: string, message: string, problem?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.problem = problem;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function requestFn<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let problem: ProblemDetails | undefined;
    let message = res.statusText || `Error ${res.status}`;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && ("title" in parsed || "detail" in parsed || "details" in parsed)) {
          problem = parsed as ProblemDetails;
          message = problem.detail || problem.details || problem.title || message;
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }

    throw new ApiError(res.status, path, message, problem);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Si el backend respondió con el estándar RFC 7807 devuelve `title status` + `detail`
 * (los callers lo muestran como "title status: detail"). Si no, cae a un mensaje genérico.
 */
export function getErrorInfo(error: unknown): { title: string; detail?: string } {
  if (error instanceof ApiError) {
    const { problem } = error;
    if (problem?.title) {
      const status = problem.status ?? error.status;
      return {
        title: `${problem.title} ${status}`,
        detail: problem.detail ?? problem.details,
      };
    }
    return {
      title: `Error ${error.status}`,
      detail: problem?.detail ?? problem?.details ?? error.message,
    };
  }
  if (error instanceof Error) {
    return { title: "Ocurrió un error inesperado", detail: error.message };
  }
  return { title: "Ocurrió un error inesperado" };
}

export function toQueryString(params: object = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
