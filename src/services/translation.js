const GOOGLE_TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";
const SUPPORTED_LANGUAGES = new Set(["cs", "en", "de", "fr"]);
const MAX_PARALLEL_TRANSLATIONS = 2;

const translationCache = new Map();
const inFlightTranslations = new Map();
const waitingQueue = [];
let activeTranslations = 0;

const acquireTranslationSlot = () =>
  new Promise((resolve) => {
    if (activeTranslations < MAX_PARALLEL_TRANSLATIONS) {
      activeTranslations += 1;
      resolve();
      return;
    }

    waitingQueue.push(resolve);
  });

const releaseTranslationSlot = () => {
  activeTranslations = Math.max(0, activeTranslations - 1);

  if (waitingQueue.length > 0) {
    activeTranslations += 1;
    const nextResolve = waitingQueue.shift();
    if (nextResolve) {
      nextResolve();
    }
  }
};

export const normalizeLanguage = (language) => {
  const normalized = (language || "cs").toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : "en";
};

const parseTranslationResponse = (payload) => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error("Unexpected translation response format.");
  }

  return payload[0]
    .map((item) => (Array.isArray(item) ? item[0] : ""))
    .filter(Boolean)
    .join("");
};

export const translateText = async (text, targetLanguage, sourceLanguage = "auto") => {
  if (!text || !text.trim()) {
    return text;
  }

  const normalizedTarget = normalizeLanguage(targetLanguage);
  const cacheKey = `${sourceLanguage}|${normalizedTarget}|${text}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  if (inFlightTranslations.has(cacheKey)) {
    return inFlightTranslations.get(cacheKey);
  }

  const translationPromise = (async () => {
    await acquireTranslationSlot();
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: sourceLanguage,
        tl: normalizedTarget,
        dt: "t",
        q: text,
      });

      const response = await fetch(`${GOOGLE_TRANSLATE_API}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Translation request failed (${response.status}).`);
      }

      const payload = await response.json();
      const translatedText = parseTranslationResponse(payload);
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } finally {
      releaseTranslationSlot();
    }
  })();

  inFlightTranslations.set(cacheKey, translationPromise);

  try {
    return await translationPromise;
  } finally {
    inFlightTranslations.delete(cacheKey);
  }
};

export const translateHtml = async (html, targetLanguage, sourceLanguage = "auto") => {
  if (!html) {
    return html;
  }

  if (typeof DOMParser === "undefined" || typeof NodeFilter === "undefined") {
    return translateText(html, targetLanguage, sourceLanguage);
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = documentNode.body.firstElementChild;
  if (!container) {
    return html;
  }

  const walker = documentNode.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const value = currentNode.nodeValue || "";
    if (value.trim().length > 0) {
      textNodes.push(currentNode);
    }
    currentNode = walker.nextNode();
  }

  const translatedValues = await Promise.all(
    textNodes.map((node) => translateText(node.nodeValue || "", targetLanguage, sourceLanguage))
  );

  textNodes.forEach((node, index) => {
    node.nodeValue = translatedValues[index];
  });

  return container.innerHTML;
};
