import { SearchRequest, SearchResult, SearchResponse, CatalogQuery, CatalogResponse, Skill, Category, SkillDetail, AgentId, InstallInfo, User } from './types.js';

/**
 * SkillHub SDK Client
 *
 * Universal API client for SkillHub that works in Node.js, browsers, and edge runtimes
 */

interface SkillHubClientOptions {
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
interface RequestOptions {
    /** Override timeout for this request */
    timeout?: number;
    /** Additional headers for this request */
    headers?: Record<string, string>;
    /** AbortSignal for request cancellation */
    signal?: AbortSignal;
}
declare class SkillHubError extends Error {
    readonly status: number;
    readonly code?: string | undefined;
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, status: number, code?: string | undefined, details?: Record<string, unknown> | undefined);
}
declare class SkillHubClient {
    private readonly baseUrl;
    private token?;
    private readonly fetchFn;
    private readonly defaultTimeout;
    private readonly defaultHeaders;
    constructor(options?: SkillHubClientOptions);
    /**
     * Set or update the authentication token
     */
    setToken(token: string | undefined): void;
    /**
     * Check if client has an authentication token
     */
    isAuthenticated(): boolean;
    private request;
    private combineSignals;
    /**
     * Search for skills using natural language
     */
    search(query: string, options?: Omit<SearchRequest, "query"> & RequestOptions): Promise<SearchResult[]>;
    /**
     * Search with full response including metadata
     */
    searchWithMeta(request: SearchRequest, options?: RequestOptions): Promise<SearchResponse>;
    /**
     * Browse the skill catalog with filters and sorting
     */
    getCatalog(query?: CatalogQuery, options?: RequestOptions): Promise<CatalogResponse>;
    /**
     * Get popular skills
     */
    getPopular(limit?: number, options?: RequestOptions): Promise<Skill[]>;
    /**
     * Get recently added skills
     */
    getRecent(limit?: number, options?: RequestOptions): Promise<Skill[]>;
    /**
     * Get all categories with skill counts
     */
    getCategories(options?: RequestOptions): Promise<Category[]>;
    /**
     * Get detailed information about a skill
     */
    getSkill(idOrSlug: string, options?: {
        includeContent?: boolean;
    } & RequestOptions): Promise<SkillDetail>;
    /**
     * Get installation information for a skill
     */
    getInstallInfo(idOrSlug: string, agents?: AgentId[], options?: RequestOptions): Promise<InstallInfo>;
    /**
     * Get raw SKILL.md content for a skill
     */
    getSkillContent(idOrSlug: string, options?: RequestOptions): Promise<string>;
    /**
     * Get current user information
     * Requires authentication
     */
    getCurrentUser(options?: RequestOptions): Promise<User>;
    /**
     * Get user's favorite skills
     * Requires authentication
     */
    getFavorites(options?: RequestOptions): Promise<Skill[]>;
    /**
     * Add a skill to favorites
     * Requires authentication
     */
    addFavorite(skillId: string, options?: RequestOptions): Promise<void>;
    /**
     * Remove a skill from favorites
     * Requires authentication
     */
    removeFavorite(skillId: string, options?: RequestOptions): Promise<void>;
}
/**
 * Create a new SkillHub client
 */
declare function createClient(options?: SkillHubClientOptions): SkillHubClient;

export { type RequestOptions, SkillHubClient, type SkillHubClientOptions, SkillHubError, createClient };
