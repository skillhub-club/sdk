/**
 * SkillHub SDK Types
 *
 * Core type definitions for the SkillHub API
 */
interface PaginationParams {
    limit?: number;
    offset?: number;
}
interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
}
interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
interface ApiErrorResponse {
    error: ApiError;
    request_id: string;
}
type AgentId = "claude" | "codex" | "gemini" | "opencode";
interface Agent {
    id: AgentId;
    name: string;
    shortName: string;
    installPath: string;
    winInstallPath: string;
}
declare const SUPPORTED_AGENTS: Record<AgentId, Agent>;
interface Skill {
    id: string;
    name: string;
    slug: string;
    author: string;
    description: string | null;
    description_zh: string | null;
    category: string | null;
    tags: string[] | null;
    simple_score: number | null;
    simple_rating: "A" | "B" | "C" | "D" | "E" | null;
    composite_score: number | null;
    github_stars: number | null;
    github_forks: number | null;
    last_commit_at: string | null;
    repo_url: string;
    skill_md_raw?: string;
}
interface SkillEvaluation {
    overall_score: number | null;
    overall_rating: "S" | "A" | "B" | "C" | "D" | null;
    instruction_clarity: number | null;
    practicality: number | null;
    output_quality: number | null;
    maintainability: number | null;
    innovation: number | null;
    security: number | null;
    summary: string | null;
    summary_zh?: string | null;
    pros: string[] | null;
    pros_zh?: string[] | null;
    cons: string[] | null;
    cons_zh?: string[] | null;
    target_audience: string | null;
    target_audience_zh?: string | null;
    flow_data?: unknown;
    potential_output?: string | null;
}
interface SkillDetail {
    skill: Skill & {
        readme_raw?: string | null;
        base_repo_url?: string | null;
        skill_path?: string | null;
    };
    evaluation?: SkillEvaluation;
    versions?: SkillVersionSummary[];
    token_stats: {
        skill_md_tokens: number;
        readme_tokens?: number;
        total_tokens: number;
    };
}
interface SkillVersionSummary {
    version_number: number;
    mutation_type: string;
    is_active: boolean;
    created_at: string;
}
type CatalogSortOption = "score" | "stars" | "recent" | "composite";
type CatalogStatusOption = "published" | "all";
interface CatalogQuery extends PaginationParams {
    category?: string;
    tags?: string[];
    min_score?: number;
    min_stars?: number;
    status?: CatalogStatusOption;
    sort?: CatalogSortOption;
    order?: "asc" | "desc";
    include_content?: boolean;
    include_evaluation?: boolean;
}
interface CatalogResponse {
    skills: Skill[];
    pagination: PaginationMeta;
}
type SearchMethod = "embedding" | "fulltext" | "hybrid";
interface SearchRequest {
    query: string;
    limit?: number;
    method?: SearchMethod;
    mmr?: boolean;
    mmr_lambda?: number;
    category?: string;
    min_score?: number;
    exclude_ids?: string[];
    include_content?: boolean;
}
interface SearchResult {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    description_zh: string | null;
    category: string | null;
    simple_score: number | null;
    similarity_score: number;
    match_reason?: string;
    skill_md_raw?: string;
}
interface SearchResponse {
    results: SearchResult[];
    meta: {
        method_used: string;
        query_embedding_tokens?: number;
        search_latency_ms: number;
    };
}
type InstallFormat = "json" | "raw" | "sh" | "ps1";
interface InstallAgentInfo {
    id: string;
    name: string;
    unix_path: string;
    windows_path: string;
}
interface InstallInfo {
    skill: {
        id: string;
        slug: string;
        name: string;
        repo_url: string;
        skill_path?: string | null;
    };
    install: {
        agents: InstallAgentInfo[];
        content: string;
        content_url: string;
    };
    scripts: {
        bash: string;
        powershell: string;
    };
    one_liners: {
        unix: string;
        windows: string;
    };
}
interface Category {
    name: string;
    count: number;
}
interface User {
    id: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    tier: "free" | "pro";
}
interface UserFavorite {
    skill_id: string;
    created_at: string;
}
type SelectorType = "random" | "top_score" | "embedding" | "mmr" | "category_balanced";
interface PackBuildRequest {
    selector: SelectorType;
    selector_config?: {
        query?: string;
        mmr_lambda?: number;
        category_weights?: Record<string, number>;
        score_threshold?: number;
    };
    max_count?: number;
    max_tokens?: number;
    task_type?: string;
    required_tags?: string[];
    avoid_ids?: string[];
    dedup_by_repo?: boolean;
    include_reasons?: boolean;
}
interface PackSkill {
    id: string;
    name: string;
    slug: string;
    version: number;
    selection_reason?: string;
    token_count: number;
}
interface PackBuildResponse {
    pack: {
        id: string;
        skills: PackSkill[];
        total_skills: number;
        total_tokens: number;
    };
    meta: {
        selector_used: string;
        candidates_considered: number;
        candidates_filtered: number;
        build_latency_ms: number;
    };
    warnings?: string[];
}

export { type Agent, type AgentId, type ApiError, type ApiErrorResponse, type CatalogQuery, type CatalogResponse, type CatalogSortOption, type CatalogStatusOption, type Category, type InstallAgentInfo, type InstallFormat, type InstallInfo, type PackBuildRequest, type PackBuildResponse, type PackSkill, type PaginationMeta, type PaginationParams, SUPPORTED_AGENTS, type SearchMethod, type SearchRequest, type SearchResponse, type SearchResult, type SelectorType, type Skill, type SkillDetail, type SkillEvaluation, type SkillVersionSummary, type User, type UserFavorite };
