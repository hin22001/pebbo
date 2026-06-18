import * as head from "./index.list";

export function sanitizeModules(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  // Unwrap Webpack/Next.js Module (require() result) so Server→Client gets plain data.
  // Always unwrap when .default exists so every require() result becomes a string or plain object.
  if (
    Object.prototype.hasOwnProperty.call(obj, "default") &&
    obj.default !== undefined
  ) {
    return sanitizeModules(obj.default);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeModules);
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeModules(obj[key]);
    }
  }
  return sanitized;
}

export function getDataHead(params) {
  try {
    // =========================================
    // ======== Initialize First Params ========
    // =========================================

    const headName = params?.name;
    const addLabels = params?.addLabels;

    // =========================================
    // ============== Get Data Head ============
    // =========================================

    let result = head[headName];

    // =====================================================
    // ============== Add Global Label (Optional) ==========
    // =====================================================

    if (addLabels) {
      const Labels = require("@/app/data/locale")?.default?.getLabel();

      result = {
        ...(result || {}),
        label: {
          ...(result?.label || {}),
          ...(Labels || {}),
        },
      };
    }

    // ==================================
    // ========= Return Result ==========
    // ==================================

    return sanitizeModules(result);
  } catch (err) {}
}

export * from "./index.list";
