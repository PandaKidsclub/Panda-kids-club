import { formatScanReport, scanCatalogue } from "./content-pipeline.mjs";

const scan = scanCatalogue();
const packages = scan.packages;
const summary = packages.reduce((counts, result) => ({
  ...counts,
  [result.status]: counts[result.status] + 1,
}), { ERROR: 0, INCOMPLETE: 0, READY: 0 });

console.log("Catalogue readiness report");
console.log(`Packages: ${packages.length}`);
console.log(`Ready: ${summary.READY}`);
console.log(`Incomplete: ${summary.INCOMPLETE}`);
console.log(`Errors: ${summary.ERROR}`);

if (packages.length > 0) {
  console.log("");
  formatScanReport(scan).forEach((line) => console.log(line));
}

if (summary.ERROR > 0) {
  process.exitCode = 1;
}
