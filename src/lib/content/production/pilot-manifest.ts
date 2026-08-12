import {
  activeCatalogueProgrammeRecords,
  activeCatalogueProgrammes,
} from "@/lib/content/production/catalogue-manifest";
import manifest from "@/lib/content/production/pilot-manifest.json";
import type { PilotContentManifest, PilotProgrammePlacement, PilotProgrammeRecord, PilotRoute } from "@/lib/content/production/types";
import type { Programme } from "@/lib/content/types";
import { resolveProgrammeMedia } from "@/lib/media/resolve-programme-media";

export const pilotContentManifest = manifest as PilotContentManifest;
export const activePilotProgrammeRecords: PilotProgrammeRecord[] = pilotContentManifest.programmes.map((record) => ({
  ...record,
  programme: resolveProgrammeMedia(record.programme),
}));
export const activePilotProgrammes: Programme[] = activePilotProgrammeRecords.map(({ programme }) => programme);
export const activeProductionProgrammeRecords: PilotProgrammeRecord[] = [
  ...activePilotProgrammeRecords,
  ...activeCatalogueProgrammeRecords,
];
export const activeProductionProgrammes: Programme[] = [
  ...activePilotProgrammes,
  ...activeCatalogueProgrammes,
];

export function applyProductionProgrammesToSection(
  route: PilotRoute,
  sectionId: string,
  programmes: Programme[],
): Programme[] {
  const start: Programme[] = [];
  const end: Programme[] = [];

  activeProductionProgrammeRecords.forEach(({ placements, programme }) => {
    const placement = placements.find((entry) => entry.route === route && entry.sectionId === sectionId);

    if (!placement) {
      return;
    }

    (placement.position === "end" ? end : start).push(programme);
  });

  return [...start, ...programmes, ...end];
}

export function getFeaturedProductionProgramme(route: PilotRoute): Programme | null {
  return [...activeCatalogueProgrammeRecords, ...activePilotProgrammeRecords].find(({ placements, programme }) => (
    programme.isFeatured && placements.some((placement: PilotProgrammePlacement) => placement.route === route)
  ))?.programme ?? null;
}
