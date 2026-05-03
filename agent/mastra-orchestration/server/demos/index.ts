import type { Demo } from "../types.js";
import { workflow } from "./01-workflow.js";
import { supervisorDemo } from "./02-supervisor.js";
import { handoffDemo } from "./03-handoff.js";
import { councilDemo } from "./04-council.js";
import { hybridDemo } from "./05-hybrid.js";

export const demos: Record<string, Demo> = {
  "01-workflow": workflow,
  "02-supervisor": supervisorDemo,
  "03-handoff": handoffDemo,
  "04-council": councilDemo,
  "05-hybrid": hybridDemo,
};
