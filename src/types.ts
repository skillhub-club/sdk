/**
 * SkillHub SDK Types
 *
 * Core type definitions for the SkillHub API
 */

// ============================================
// Common Types
// ============================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiError;
  request_id: string;
}

// ============================================
// Agent Types
// ============================================

export type AgentId = "claude" | "codex" | "gemini" | "opencode";

export interface Agent {
  id: AgentId;
  name: string;
  shortName: string;
  installPath: string;
  winInstallPath: string;
}

export const SUPPORTED_AGENTS: Record<AgentId, Agent> = {
  claude: {
    id: "claude",
    name: "Claude Code",
    shortName: "Claude",
    installPath: "~/.claude/skills/",
    winInstallPath: "%USERPROFILE%\\.claude\\skills\\",
  },
  codex: {
    id: "codex",
    name: "Codex CLI",
    shortName: "Codex",
    installPath: "~/.codex/skills/",
    winInstallPath: "%USERPROFILE%\\.codex\\skills\\",
  },
  gemini: {
    id: "gemini",
    name: "Gemini CLI",
    shortName: "Gemini",
    installPath: "~/.gemini/skills/",
    winInstallPath: "%USERPROFILE%\\.gemini\\skills\\",
  },
  opencode: {
    id: "opencode",
    name: "OpenCode",
    shortName: "OpenCode",
    installPath: "~/.opencode/skill/",
    winInstallPath: "%USERPROFILE%\\.opencode\\skill\\",
  },
};

// ============================================
// Skill Types
// ============================================

export interface Skill {
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

export interface SkillEvaluation {
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

export interface SkillDetail {
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

export interface SkillVersionSummary {
  version_number: number;
  mutation_type: string;
  is_active: boolean;
  created_at: string;
}

// ============================================
// Catalog API Types
// ============================================

export type CatalogSortOption = "score" | "stars" | "recent" | "composite";
export type CatalogStatusOption = "published" | "all";

export interface CatalogQuery extends PaginationParams {
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

export interface CatalogResponse {
  skills: Skill[];
  pagination: PaginationMeta;
}

// ============================================
// Search API Types
// ============================================

export type SearchMethod = "embedding" | "fulltext" | "hybrid";

export interface SearchRequest {
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

export interface SearchResult {
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

export interface SearchResponse {
  results: SearchResult[];
  meta: {
    method_used: string;
    query_embedding_tokens?: number;
    search_latency_ms: number;
  };
}

// ============================================
// Install API Types
// ============================================

export type InstallFormat = "json" | "raw" | "sh" | "ps1";

export interface InstallAgentInfo {
  id: string;
  name: string;
  unix_path: string;
  windows_path: string;
}

export interface InstallInfo {
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

// ============================================
// Category Types
// ============================================

export interface Category {
  name: string;
  count: number;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  tier: "free" | "pro";
}

export interface UserFavorite {
  skill_id: string;
  created_at: string;
}

// ============================================
// Pack Builder Types (Advanced)
// ============================================

export type SelectorType =
  | "random"
  | "top_score"
  | "embedding"
  | "mmr"
  | "category_balanced";

export interface PackBuildRequest {
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

export interface PackSkill {
  id: string;
  name: string;
  slug: string;
  version: number;
  selection_reason?: string;
  token_count: number;
}

export interface PackBuildResponse {
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
