# @anthropic/skillhub-sdk

Official SDK for the [SkillHub](https://skillhub.ing) API - Discover, search, and install AI agent skills.

## Installation

```bash
npm install @skillhub/sdk
# or
yarn add @skillhub/sdk
# or
pnpm add @skillhub/sdk
```

## Quick Start

```typescript
import { createClient } from '@skillhub/sdk';

const client = createClient();

// Search for skills
const skills = await client.search('pdf processing');
console.log(skills);

// Get skill details
const detail = await client.getSkill('pdf-processor', { includeContent: true });
console.log(detail.skill.name, detail.evaluation?.summary);

// Get install commands
const install = await client.getInstallInfo('pdf-processor', ['claude']);
console.log(install.one_liners.unix);
```

## API Reference

### Creating a Client

```typescript
import { createClient } from '@skillhub/sdk';

// Basic usage
const client = createClient();

// With options
const client = createClient({
  baseUrl: 'https://skillhub.ing/api/v1', // Custom API URL
  token: 'sk_...', // Authentication token
  timeout: 30000, // Request timeout in ms
  headers: {}, // Custom headers
});
```

### Search Skills

```typescript
// Simple search
const results = await client.search('code review');

// With options
const results = await client.search('code review', {
  limit: 10,
  method: 'hybrid', // 'embedding' | 'fulltext' | 'hybrid'
  category: 'Development',
  min_score: 70,
  mmr: true, // Enable diversity
  mmr_lambda: 0.7,
});

// Full response with metadata
const response = await client.searchWithMeta({
  query: 'code review',
  limit: 10,
});
console.log(response.meta.search_latency_ms);
```

### Browse Catalog

```typescript
// Get catalog with filters
const { skills, pagination } = await client.getCatalog({
  category: 'Development',
  sort: 'composite', // 'score' | 'stars' | 'recent' | 'composite'
  limit: 20,
  offset: 0,
});

// Shortcuts
const popular = await client.getPopular(10);
const recent = await client.getRecent(10);
const categories = await client.getCategories();
```

### Skill Details

```typescript
// Get by slug or ID
const detail = await client.getSkill('pdf-processor');

// Include full SKILL.md content
const detail = await client.getSkill('pdf-processor', {
  includeContent: true,
});

// Access evaluation
console.log(detail.evaluation?.pros);
console.log(detail.evaluation?.cons);
console.log(detail.token_stats.total_tokens);
```

### Installation

```typescript
// Get install info for multiple agents
const install = await client.getInstallInfo('pdf-processor', ['claude', 'codex']);

// One-liner commands
console.log(install.one_liners.unix);    // curl ... | bash
console.log(install.one_liners.windows); // irm ... | iex

// Script URLs
console.log(install.scripts.bash);
console.log(install.scripts.powershell);

// Raw content
const skillMd = await client.getSkillContent('pdf-processor');
```

### User API (Authenticated)

```typescript
const client = createClient({ token: 'sk_...' });

// Get current user
const user = await client.getCurrentUser();

// Favorites
const favorites = await client.getFavorites();
await client.addFavorite('skill-id');
await client.removeFavorite('skill-id');
```

## Types

All types are exported and can be imported separately:

```typescript
import type {
  Skill,
  SkillDetail,
  SkillEvaluation,
  SearchResult,
  SearchResponse,
  CatalogResponse,
  InstallInfo,
  Category,
  AgentId,
  User,
} from '@skillhub/sdk';

// Or import just types
import type { Skill } from '@skillhub/sdk/types';
```

### Supported Agents

```typescript
import { SUPPORTED_AGENTS } from '@skillhub/sdk';

// Available agents: claude, codex, gemini, opencode
console.log(SUPPORTED_AGENTS.claude.installPath); // ~/.claude/skills/
```

## Error Handling

```typescript
import { SkillHubError } from '@skillhub/sdk';

try {
  const skill = await client.getSkill('non-existent');
} catch (error) {
  if (error instanceof SkillHubError) {
    console.log(error.status);  // 404
    console.log(error.code);    // 'NOT_FOUND'
    console.log(error.message); // 'Skill not found'
  }
}
```

## Advanced Usage

### Request Cancellation

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const skills = await client.search('test', {
    signal: controller.signal,
  });
} catch (error) {
  if (error instanceof SkillHubError && error.code === 'TIMEOUT') {
    console.log('Request was cancelled');
  }
}
```

### Custom Fetch

```typescript
import { createClient } from '@skillhub/sdk';

// Use custom fetch (e.g., for testing)
const client = createClient({
  fetch: myCustomFetch,
});
```

## License

MIT
