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

// src/types.ts
var types_exports = {};
__export(types_exports, {
  SUPPORTED_AGENTS: () => SUPPORTED_AGENTS
});
module.exports = __toCommonJS(types_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SUPPORTED_AGENTS
});
