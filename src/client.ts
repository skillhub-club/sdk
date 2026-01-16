/**
 * SkillHub SDK Client
 *
 * Universal API client for SkillHub that works in Node.js, browsers, and edge runtimes
 */

import type {
  Skill,
  SkillDetail,
  SearchRequest,
  SearchResult,
  SearchResponse,
  CatalogQuery,
  CatalogResponse,
  Category,
  InstallInfo,
  AgentId,
  User,
  PaginationMeta,
} from "./types.js";

export interface SkillHubClientOptions {
  /** API base URL (default: https://skillhub.club/api/v1) */
  baseUrl?: string;
  /** API token for authenticated requests */
  token?: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
}

export interface RequestOptions {
  /** Override timeout for this request */
  timeout?: number;
  /** Additional headers for this request */
  headers?: Record<string, string>;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

export class SkillHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "SkillHubError";
  }
}

export class SkillHubClient {
  private readonly baseUrl: string;
  private token?: string;
  private readonly fetchFn: typeof fetch;
  private readonly defaultTimeout: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: SkillHubClientOptions = {}) {
    this.baseUrl = options.baseUrl || "https://skillhub.club/api/v1";
    this.token = options.token;
    this.fetchFn = options.fetch || globalThis.fetch;
    this.defaultTimeout = options.timeout || 30000;
    this.defaultHeaders = options.headers || {};
  }

  /**
   * Set or update the authentication token
   */
  setToken(token: string | undefined): void {
    this.token = token;
  }

  /**
   * Check if client has an authentication token
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.defaultTimeout;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...options?.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Create timeout abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine with user-provided signal if any
    const signal = options?.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: { error?: { code?: string; message?: string; details?: Record<string, unknown> } } = {};
        try {
          errorData = (await response.json()) as typeof errorData;
        } catch {
          // Ignore JSON parse errors
        }

        throw new SkillHubError(
          errorData.error?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData.error?.code,
          errorData.error?.details
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof SkillHubError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new SkillHubError("Request timeout", 408, "TIMEOUT");
        }
        throw new SkillHubError(error.message, 0, "NETWORK_ERROR");
      }

      throw new SkillHubError("Unknown error", 0, "UNKNOWN");
    }
  }

  private combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        return controller.signal;
      }
      signal.addEventListener("abort", () => controller.abort());
    }

    return controller.signal;
  }

  // ============================================
  // Search API
  // ============================================

  /**
   * Search for skills using natural language
   */
  async search(
    query: string,
    options?: Omit<SearchRequest, "query"> & RequestOptions
  ): Promise<SearchResult[]> {
    const { timeout, headers, signal, ...searchOptions } = options || {};

    const response = await this.request<SearchResponse>(
      "POST",
      "/skills/search",
      { query, ...searchOptions },
      { timeout, headers, signal }
    );

    return response.results;
  }

  /**
   * Search with full response including metadata
   */
  async searchWithMeta(
    request: SearchRequest,
    options?: RequestOptions
  ): Promise<SearchResponse> {
    return this.request<SearchResponse>("POST", "/skills/search", request, options);
  }

  // ============================================
  // Catalog API
  // ============================================

  /**
   * Browse the skill catalog with filters and sorting
   */
  async getCatalog(
    query?: CatalogQuery,
    options?: RequestOptions
  ): Promise<CatalogResponse> {
    const params = new URLSearchParams();

    if (query) {
      if (query.category) params.set("category", query.category);
      if (query.tags?.length) params.set("tags", query.tags.join(","));
      if (query.min_score !== undefined) params.set("min_score", String(query.min_score));
      if (query.min_stars !== undefined) params.set("min_stars", String(query.min_stars));
      if (query.status) params.set("status", query.status);
      if (query.sort) params.set("sort", query.sort);
      if (query.order) params.set("order", query.order);
      if (query.limit !== undefined) params.set("limit", String(query.limit));
      if (query.offset !== undefined) params.set("offset", String(query.offset));
      if (query.include_content) params.set("include_content", "true");
      if (query.include_evaluation) params.set("include_evaluation", "true");
    }

    const queryString = params.toString();
    const endpoint = `/skills/catalog${queryString ? `?${queryString}` : ""}`;

    return this.request<CatalogResponse>("GET", endpoint, undefined, options);
  }

  /**
   * Get popular skills
   */
  async getPopular(limit = 10, options?: RequestOptions): Promise<Skill[]> {
    const response = await this.getCatalog(
      { sort: "composite", limit, status: "published" },
      options
    );
    return response.skills;
  }

  /**
   * Get recently added skills
   */
  async getRecent(limit = 10, options?: RequestOptions): Promise<Skill[]> {
    const response = await this.getCatalog(
      { sort: "recent", limit, status: "published" },
      options
    );
    return response.skills;
  }

  /**
   * Get all categories with skill counts
   */
  async getCategories(options?: RequestOptions): Promise<Category[]> {
    const response = await this.getCatalog({ limit: 500, status: "published" }, options);

    const categoryMap = new Map<string, number>();
    for (const skill of response.skills) {
      const cat = skill.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ============================================
  // Skill Detail API
  // ============================================

  /**
   * Get detailed information about a skill
   */
  async getSkill(
    idOrSlug: string,
    options?: { includeContent?: boolean } & RequestOptions
  ): Promise<SkillDetail> {
    const { includeContent, ...requestOptions } = options || {};
    const params = new URLSearchParams();

    if (includeContent) {
      params.set("include_content", "true");
    }

    const queryString = params.toString();
    const endpoint = `/skills/${idOrSlug}${queryString ? `?${queryString}` : ""}`;

    return this.request<SkillDetail>("GET", endpoint, undefined, requestOptions);
  }

  // ============================================
  // Install API
  // ============================================

  /**
   * Get installation information for a skill
   */
  async getInstallInfo(
    idOrSlug: string,
    agents: AgentId[] = ["claude"],
    options?: RequestOptions
  ): Promise<InstallInfo> {
    const agentsParam = agents.join(",");
    return this.request<InstallInfo>(
      "GET",
      `/skills/${idOrSlug}/install?agents=${agentsParam}&format=json`,
      undefined,
      options
    );
  }

  /**
   * Get raw SKILL.md content for a skill
   */
  async getSkillContent(idOrSlug: string, options?: RequestOptions): Promise<string> {
    const url = `${this.baseUrl}/skills/${idOrSlug}/install?format=raw`;
    const timeout = options?.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.fetchFn(url, {
        headers: this.defaultHeaders,
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new SkillHubError(`Failed to fetch skill content`, response.status);
      }

      return response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof SkillHubError) throw error;
      throw new SkillHubError(
        error instanceof Error ? error.message : "Unknown error",
        0,
        "NETWORK_ERROR"
      );
    }
  }

  // ============================================
  // User API (Authenticated)
  // ============================================

  /**
   * Get current user information
   * Requires authentication
   */
  async getCurrentUser(options?: RequestOptions): Promise<User> {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }

    return this.request<User>("GET", "/user/me", undefined, options);
  }

  /**
   * Get user's favorite skills
   * Requires authentication
   */
  async getFavorites(options?: RequestOptions): Promise<Skill[]> {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }

    const response = await this.request<{ skills: Skill[] }>(
      "GET",
      "/user/favorites",
      undefined,
      options
    );

    return response.skills;
  }

  /**
   * Add a skill to favorites
   * Requires authentication
   */
  async addFavorite(skillId: string, options?: RequestOptions): Promise<void> {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }

    await this.request("POST", `/user/favorites/${skillId}`, undefined, options);
  }

  /**
   * Remove a skill from favorites
   * Requires authentication
   */
  async removeFavorite(skillId: string, options?: RequestOptions): Promise<void> {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }

    await this.request("DELETE", `/user/favorites/${skillId}`, undefined, options);
  }
}

/**
 * Create a new SkillHub client
 */
export function createClient(options?: SkillHubClientOptions): SkillHubClient {
  return new SkillHubClient(options);
}
