import manifest from "@/lib/content/production/catalogue-manifest.json";
import type { CatalogueContentManifest, PilotProgrammeRecord } from "@/lib/content/production/types";
import type { Programme } from "@/lib/content/types";
import { resolveProgrammeMedia } from "@/lib/media/resolve-programme-media";

export const catalogueContentManifest = manifest as CatalogueContentManifest;
export const activeCatalogueProgrammeRecords: PilotProgrammeRecord[] = catalogueContentManifest.programmes.map((record) => ({
  ...record,
  programme: resolveProgrammeMedia(record.programme),
}));
export const activeCatalogueProgrammes: Programme[] = activeCatalogueProgrammeRecords.map(({ programme }) => programme);
