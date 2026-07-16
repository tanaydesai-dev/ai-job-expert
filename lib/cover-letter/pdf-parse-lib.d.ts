// `pdf-parse`'s top-level entry (index.js) runs a debug self-test on import
// under Turbopack's module bundling (`isDebugMode = !module.parent` doesn't
// hold there), so route.ts imports the inner module directly instead. That
// subpath has no shipped types, so re-export the ones from @types/pdf-parse.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
