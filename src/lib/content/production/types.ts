import type { Programme } from "@/lib/content/types";

export type PilotRoute = "home" | "stories" | "learn" | "heroes" | "specials" | "monthly-updates";

export interface PilotProgrammePlacement {
  route: PilotRoute;
  sectionId: string;
  position?: "start" | "end";
}

export interface PilotProgrammeRecord {
  programme: Programme;
  placements: PilotProgrammePlacement[];
}

export interface PilotAssetInventoryEntry {
  candidateId: string;
  stagingDirectory: string;
  discoveredAssets: string[];
  missingForActivation: string[];
}

export interface PilotContentManifest {
  version: 1;
  status: "blocked" | "active";
  programmes: PilotProgrammeRecord[];
  inventory: PilotAssetInventoryEntry[];
}

export interface CatalogueContentManifest {
  version: 1;
  status: "active";
  programmes: PilotProgrammeRecord[];
}
