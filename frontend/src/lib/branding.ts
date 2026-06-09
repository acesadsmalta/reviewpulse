export interface BrandBranding {
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  websiteOnlyUrl: string;
}

export function parseBranding(websiteUrl: string | undefined): BrandBranding {
  const defaults = {
    bgColor: "#0d1527",
    textColor: "#ffffff",
    accentColor: "#d4af37",
    fontFamily: "Outfit",
    websiteOnlyUrl: websiteUrl || "",
  };

  if (!websiteUrl) return defaults;

  try {
    const testUrl = websiteUrl.includes("://") ? websiteUrl : `http://${websiteUrl}`;
    const url = new URL(testUrl);
    const brandParam = url.searchParams.get("brand");
    
    if (brandParam) {
      const parts = brandParam.split(";");
      const colors: any = {};
      let fontFamily = defaults.fontFamily;

      parts.forEach(part => {
        const colonIdx = part.indexOf(":");
        if (colonIdx === -1) return;
        const key = part.substring(0, colonIdx);
        const val = part.substring(colonIdx + 1);
        if (!key || !val) return;

        if (key === "fontFamily") {
          fontFamily = val.replace(/-/g, " ");
        } else {
          colors[key] = val.startsWith("#") ? val : `#${val}`;
        }
      });
      
      return {
        bgColor: colors.bgColor || defaults.bgColor,
        textColor: colors.textColor || defaults.textColor,
        accentColor: colors.accentColor || defaults.accentColor,
        fontFamily,
        websiteOnlyUrl: websiteUrl.split("?")[0],
      };
    }
  } catch (e) {
    // Ignore URL parse exceptions and return defaults
  }

  return {
    ...defaults,
    websiteOnlyUrl: websiteUrl.split("?")[0],
  };
}

export function serializeBranding(
  websiteUrl: string,
  branding: { bgColor: string; textColor: string; accentColor: string; fontFamily: string }
): string {
  const cleanUrl = websiteUrl.split("?")[0];
  const bg = branding.bgColor.replace("#", "");
  const text = branding.textColor.replace("#", "");
  const accent = branding.accentColor.replace("#", "");
  const font = branding.fontFamily.replace(/ /g, "-");
  
  return `${cleanUrl}?brand=bgColor:${bg};textColor:${text};accentColor:${accent};fontFamily:${font}`;
}
