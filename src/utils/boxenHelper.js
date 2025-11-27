let boxenCache = null;

/**
 * Loads boxen dynamically and caches it for subsequent calls
 * This function can be mocked in tests
 * @returns {Promise<Function>} The boxen function
 */
async function loadBoxen() {
  if (boxenCache) {
    return boxenCache;
  }

  try {
    const boxenModule = await import("boxen");
    boxenCache = boxenModule.default || boxenModule;
    return boxenCache;
  } catch (error) {
    // Fallback for test environments where dynamic imports might fail
    // This should not happen in production, but provides a safety net
    throw new Error(`Failed to load boxen: ${error.message}`);
  }
}

module.exports = { loadBoxen };

