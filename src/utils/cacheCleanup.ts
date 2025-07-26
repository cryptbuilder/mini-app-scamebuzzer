export async function cleanupSafeUrlCache() {
    const safe_urls = JSON.parse(localStorage.getItem("safe_urls") || "{}");
    const now = Date.now();
    const updatedCache: any = {};
  
    for (const [url, data] of Object.entries(safe_urls)) {
      if (now - (data as any).timestamp < 24 * 60 * 60 * 1000) { // 24 hours
        updatedCache[url] = data;
      }
    }
  
    localStorage.setItem("safe_urls", JSON.stringify(updatedCache));
  }
  