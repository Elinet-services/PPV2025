import "@testing-library/jest-dom";
import i18n from "./i18n";

// Some UI libs expect matchMedia to exist (jsdom doesn't implement it).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// UI components may rely on IntersectionObserver / ResizeObserver.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!("IntersectionObserver" in window)) {
  // eslint-disable-next-line no-undef
  window.IntersectionObserver = NoopObserver;
}
if (!("IntersectionObserver" in global)) global.IntersectionObserver = window.IntersectionObserver;

if (!("ResizeObserver" in window)) {
  // eslint-disable-next-line no-undef
  window.ResizeObserver = NoopObserver;
}
if (!("ResizeObserver" in global)) global.ResizeObserver = window.ResizeObserver;

beforeEach(() => {
  i18n.changeLanguage("cs");
});
