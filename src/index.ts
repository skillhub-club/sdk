/**
 * SkillHub SDK
 *
 * Official SDK for the SkillHub API
 *
 * @example
 * ```typescript
 * import { createClient } from '@anthropic/skillhub-sdk';
 *
 * const client = createClient();
 *
 * // Search for skills
 * const skills = await client.search('pdf processing');
 *
 * // Get skill details
 * const detail = await client.getSkill('pdf-processor', { includeContent: true });
 *
 * // Get install commands
 * const install = await client.getInstallInfo('pdf-processor', ['claude', 'codex']);
 * ```
 */

// Types
export * from "./types.js";

// Client
export {
  SkillHubClient,
  SkillHubError,
  createClient,
  type SkillHubClientOptions,
  type RequestOptions,
} from "./client.js";
