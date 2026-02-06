describe("translation service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = jest.fn();
    globalThis.fetch = global.fetch;
    if (typeof window !== "undefined") {
      window.fetch = global.fetch;
    }
  });

  test("translateText caches responses for repeated input", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [[["Translated", "Original"]]],
    });

    const { translateText } = require("../translation");

    const first = await translateText("Original", "en");
    const second = await translateText("Original", "en");

    expect(first).toBe("Translated");
    expect(second).toBe("Translated");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("translateText deduplicates in-flight request for the same cache key", async () => {
    let resolveFetch;
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = () =>
            resolve({
              ok: true,
              json: async () => [[["Translated once", "Original"]]],
            });
        })
    );

    const { translateText } = require("../translation");

    const p1 = translateText("Original", "en");
    const p2 = translateText("Original", "en");

    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    resolveFetch();

    const [first, second] = await Promise.all([p1, p2]);
    expect(first).toBe("Translated once");
    expect(second).toBe("Translated once");
  });

  test("translateText limits concurrent fetches to two", async () => {
    const resolvers = [];
    let active = 0;
    let maxActive = 0;

    fetch.mockImplementation((url) => {
      const parsed = new URL(url);
      const sourceText = parsed.searchParams.get("q");

      return new Promise((resolve) => {
        active += 1;
        maxActive = Math.max(maxActive, active);

        resolvers.push(() => {
          active -= 1;
          resolve({
            ok: true,
            json: async () => [[[`tr:${sourceText}`, sourceText]]],
          });
        });
      });
    });

    const { translateText } = require("../translation");

    const p1 = translateText("one", "en");
    const p2 = translateText("two", "en");
    const p3 = translateText("three", "en");

    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(2);

    resolvers.shift()();
    await p1;
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(3);

    while (resolvers.length > 0) {
      resolvers.shift()();
    }

    const result = await Promise.all([p1, p2, p3]);
    expect(result).toEqual(["tr:one", "tr:two", "tr:three"]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  test("translateHtml keeps markup and translates text nodes", async () => {
    fetch.mockImplementation((url) => {
      const parsed = new URL(url);
      const sourceText = parsed.searchParams.get("q");

      return Promise.resolve({
        ok: true,
        json: async () => [[[sourceText.toUpperCase(), sourceText]]],
      });
    });

    const { translateHtml } = require("../translation");

    const translated = await translateHtml("<p>Hello <strong>world</strong></p>", "en");
    expect(translated).toBe("<p>HELLO <strong>WORLD</strong></p>");
  });
});
