'use strict';
/**
 * Pin the Node process UI locale to en-US — regression scripts only; product code never uses this.
 *
 * Why: Node ≥21 ships `navigator`, whose `language` comes from the ICU default locale. Dev machines
 * and CI can disagree. This fork defaults UI to English with a PT toggle; pin en-US so chrome
 * assertions are deterministic.
 *
 * Call once before any `require('react-test-renderer')` / built artifacts.
 */
function pinLocaleEn() {
  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: { languages: ['en-US'], language: 'en-US' },
      configurable: true,
      writable: true,
    });
    return true;
  } catch (e) {
    return false;
  }
}

/** @deprecated alias — old scripts called pinLocaleZh; keep name so require sites keep working. */
function pinLocaleZh() {
  return pinLocaleEn();
}

module.exports = { pinLocaleEn, pinLocaleZh };
