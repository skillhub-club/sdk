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

export {
  SUPPORTED_AGENTS
};
