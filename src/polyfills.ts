/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js';  // ✅ Required by Angular

/***************************************************************************************************
 * Global polyfills to prevent "global is not defined" error
 */
(window as any).global = window;
(window as any).crypto = window.crypto;
(window as any).process = { env: {} };
