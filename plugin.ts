import type { Plugin } from "vite"

export default function lite(): Plugin {
  return {
    name: "lite",
    closeBundle(error) {
      if (error) {
        console.error("[Lite] Error building routes", error)
      }
    },
    watchChange(id, change) {
      console.log("[Lite] Watch change (id, change)")
    },
    handleHotUpdate(ctx) {
      console.log("[Lite] Handle hot update (ctx)")
    },
    configurePreviewServer: {
      handler(server) {
        console.log("[Lite] Configure preview server (server)")
      },
    },
    configureServer: {
      handler(server) {
        console.log("[Lite] Configure server (server)")
      },
    },
    resolveId(source, importer, options) {
      console.log("[Lite] Resolve id (source, importer, options)")

      if (source === "virtual:react-router-routes") {
        return source
      }
    },
    load(id, options) {
      // console.log("[Lite] Load (id, options)", id)
    },
    transform(code, id, options) {
      // console.log("[Lite] Transform (code, id, options)")
    },
    resolveDynamicImport(specifier, importer, options) {
      console.log(
        "[Lite] Resolve dynamic import (specifier, importer, options)",
      )
    },
    moduleParsed(info) {
      console.log("[Lite] Module parsed (info)")
    },
    onLog(level, log) {
      console.log("[Lite] On log (level, log)")
    },
    configResolved(config) {
      console.log("[Lite] Config resolved (config)")
    },
    renderStart: {
      handler(output, input) {
        console.log("[Lite] Render start (output, input)")
      },
    },
    renderChunk(code, chunkInfo) {
      console.log("[Lite] Render chunk (code, chunkInfo)")
    },
    buildStart(options) {
      console.log("[Lite] Build start (options)")
    },
    buildEnd(error) {
      if (error) {
        console.error("[Lite] Error building routes", error)
      } else {
        console.log("[Lite] Build end")
      }
    },
  }
}
