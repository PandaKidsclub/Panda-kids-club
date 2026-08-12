import { formatScanReport, scanCatalogue } from "./content-pipeline.mjs";

const scan = scanCatalogue();
formatScanReport(scan).forEach((line) => console.log(line));

if (scan.packages.some((result) => result.status === "ERROR")) {
  process.exitCode = 1;
}
