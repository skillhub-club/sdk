"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SUPPORTED_AGENTS: () => SUPPORTED_AGENTS,
  SkillHubClient: () => SkillHubClient,
  SkillHubError: () => SkillHubError,
  createClient: () => createClient
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var SUPPORTED_AGENTS = {
  claude: {
    id: "claude",
    name: "Claude Code",
    shortName: "Claude",
    installPath: "~/.claude/skills/",
    winInstallPath: "%USERPROFILE%\\.claude\\skills\\"
  },
  codex: {
    id: "codex",
    name: "Codex CLI",
    shortName: "Codex",
    installPath: "~/.codex/skills/",
    winInstallPath: "%USERPROFILE%\\.codex\\skills\\"
  },
  gemini: {
    id: "gemini",
    name: "Gemini CLI",
    shortName: "Gemini",
    installPath: "~/.gemini/skills/",
    winInstallPath: "%USERPROFILE%\\.gemini\\skills\\"
  },
  opencode: {
    id: "opencode",
    name: "OpenCode",
    shortName: "OpenCode",
    installPath: "~/.opencode/skill/",
    winInstallPath: "%USERPROFILE%\\.opencode\\skill\\"
  }
};

// src/client.ts
var SkillHubError = class extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "SkillHubError";
  }
};
var SkillHubClient = class {
  baseUrl;
  token;
  fetchFn;
  defaultTimeout;
  defaultHeaders;
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://skillhub.club/api/v1";
    this.token = options.token;
    this.fetchFn = options.fetch || globalThis.fetch;
    this.defaultTimeout = options.timeout || 3e4;
    this.defaultHeaders = options.headers || {};
  }
  /**
   * Set or update the authentication token
   */
  setToken(token) {
    this.token = token;
  }
  /**
   * Check if client has an authentication token
   */
  isAuthenticated() {
    return !!this.token;
  }
  // ============================================
  // Private Helpers
  // ============================================
  async request(method, endpoint, body, options) {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.defaultTimeout;
    const headers = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...options?.headers
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const signal = options?.signal ? this.combineSignals(options.signal, controller.signal) : controller.signal;
    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : void 0,
        signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
        }
        throw new SkillHubError(
          errorData.error?.message || `Request failed with status ${response.status}`,
          response.status,
          errorData.error?.code,
          errorData.error?.details
        );
      }
      return await response.json();
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
  combineSignals(...signals) {
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
  async search(query, options) {
    const { timeout, headers, signal, ...searchOptions } = options || {};
    const response = await this.request(
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
  async searchWithMeta(request, options) {
    return this.request("POST", "/skills/search", request, options);
  }
  // ============================================
  // Catalog API
  // ============================================
  /**
   * Browse the skill catalog with filters and sorting
   */
  async getCatalog(query, options) {
    const params = new URLSearchParams();
    if (query) {
      if (query.category) params.set("category", query.category);
      if (query.tags?.length) params.set("tags", query.tags.join(","));
      if (query.min_score !== void 0) params.set("min_score", String(query.min_score));
      if (query.min_stars !== void 0) params.set("min_stars", String(query.min_stars));
      if (query.status) params.set("status", query.status);
      if (query.sort) params.set("sort", query.sort);
      if (query.order) params.set("order", query.order);
      if (query.limit !== void 0) params.set("limit", String(query.limit));
      if (query.offset !== void 0) params.set("offset", String(query.offset));
      if (query.include_content) params.set("include_content", "true");
      if (query.include_evaluation) params.set("include_evaluation", "true");
    }
    const queryString = params.toString();
    const endpoint = `/skills/catalog${queryString ? `?${queryString}` : ""}`;
    return this.request("GET", endpoint, void 0, options);
  }
  /**
   * Get popular skills
   */
  async getPopular(limit = 10, options) {
    const response = await this.getCatalog(
      { sort: "composite", limit, status: "published" },
      options
    );
    return response.skills;
  }
  /**
   * Get recently added skills
   */
  async getRecent(limit = 10, options) {
    const response = await this.getCatalog(
      { sort: "recent", limit, status: "published" },
      options
    );
    return response.skills;
  }
  /**
   * Get all categories with skill counts
   */
  async getCategories(options) {
    const response = await this.getCatalog({ limit: 500, status: "published" }, options);
    const categoryMap = /* @__PURE__ */ new Map();
    for (const skill of response.skills) {
      const cat = skill.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }
  // ============================================
  // Skill Detail API
  // ============================================
  /**
   * Get detailed information about a skill
   */
  async getSkill(idOrSlug, options) {
    const { includeContent, ...requestOptions } = options || {};
    const params = new URLSearchParams();
    if (includeContent) {
      params.set("include_content", "true");
    }
    const queryString = params.toString();
    const endpoint = `/skills/${idOrSlug}${queryString ? `?${queryString}` : ""}`;
    return this.request("GET", endpoint, void 0, requestOptions);
  }
  // ============================================
  // Install API
  // ============================================
  /**
   * Get installation information for a skill
   */
  async getInstallInfo(idOrSlug, agents = ["claude"], options) {
    const agentsParam = agents.join(",");
    return this.request(
      "GET",
      `/skills/${idOrSlug}/install?agents=${agentsParam}&format=json`,
      void 0,
      options
    );
  }
  /**
   * Get raw SKILL.md content for a skill
   */
  async getSkillContent(idOrSlug, options) {
    const url = `${this.baseUrl}/skills/${idOrSlug}/install?format=raw`;
    const timeout = options?.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await this.fetchFn(url, {
        headers: this.defaultHeaders,
        signal: options?.signal || controller.signal
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
  async getCurrentUser(options) {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }
    return this.request("GET", "/user/me", void 0, options);
  }
  /**
   * Get user's favorite skills
   * Requires authentication
   */
  async getFavorites(options) {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }
    const response = await this.request(
      "GET",
      "/user/favorites",
      void 0,
      options
    );
    return response.skills;
  }
  /**
   * Add a skill to favorites
   * Requires authentication
   */
  async addFavorite(skillId, options) {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }
    await this.request("POST", `/user/favorites/${skillId}`, void 0, options);
  }
  /**
   * Remove a skill from favorites
   * Requires authentication
   */
  async removeFavorite(skillId, options) {
    if (!this.token) {
      throw new SkillHubError("Authentication required", 401, "UNAUTHORIZED");
    }
    await this.request("DELETE", `/user/favorites/${skillId}`, void 0, options);
  }
};
function createClient(options) {
  return new SkillHubClient(options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SUPPORTED_AGENTS,
  SkillHubClient,
  SkillHubError,
  createClient
});
