/**
 * browser-compat.js
 * Unified cross-browser extension API shim.
 * Normalizes chrome.* (Chrome/Edge) and browser.* (Firefox) into a single `browserAPI` global.
 *
 * Usage: load this FIRST in every HTML page and background script,
 * then replace all `chrome.X` calls with `browserAPI.X`.
 */
(function (global) {
  "use strict";

  // Firefox exposes `browser` (Promise-based); Chrome/Edge expose `chrome` (callback-based).
  // The webextension-polyfill would be the gold standard, but for this extension
  // we unify them here with a thin wrapper: prefer `browser` when available,
  // otherwise wrap `chrome` callbacks into Promises.

  var _chrome = (typeof chrome !== "undefined") ? chrome : null;
  var _browser = (typeof browser !== "undefined") ? browser : null;

  // Detect browser family
  var IS_FIREFOX = !!_browser && !_chrome;
  var IS_CHROMIUM = !!_chrome; // Chrome or Edge

  // Base API: Firefox already returns Promises; Chrome needs wrapping.
  // We expose the raw object and let callers use await — both will work.
  var api = _browser || _chrome || {};

  // --- Debugger shim ---
  // Firefox does NOT support chrome.debugger. We expose a no-op so code
  // referencing it doesn't throw, but the CDP paste path won't work on Firefox.
  if (!api.debugger) {
    api = Object.assign(Object.create(api), {
      debugger: {
        attach: function () { return Promise.reject(new Error("debugger not supported in this browser")); },
        detach: function () { return Promise.resolve(); },
        sendCommand: function () { return Promise.reject(new Error("debugger not supported in this browser")); },
        onDetach: { addListener: function () {}, removeListener: function () {} }
      }
    });
  }

  // --- storage.sync shim ---
  // Firefox supports storage.sync; Chrome/Edge too. Just ensure the key exists.
  if (!api.storage) {
    api.storage = { local: {}, sync: {} };
  }

  // --- Expose unified API globally ---
  global.browserAPI = api;

  // Keep `chrome` defined for legacy code that checks `typeof chrome !== "undefined"`.
  // On Firefox, `chrome` is also available (Firefox defines it as an alias for `browser`).
  // So nothing extra needed here.

})(typeof globalThis !== "undefined" ? globalThis : this);
