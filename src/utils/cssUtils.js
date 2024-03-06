const getFontFormat = (format) => {
  const formatMap = {
    "ttf": "format(\"truetype\")",
    "otf": "format(\"opentype\")",
    "woff": "format(\"woff\")",
    "woff2": "format(\"woff2\")",
  };
  return formatMap[format] || "";
};

const getFontSrc = (fontPath) => fontPath.replace(/^\/static/, "");

const generateFontFace = (fontFamily, fontData, fontWeight) => {
  if (!fontFamily || !fontData || !fontData.fontFile || !fontData.fontFormat) return "";

  const { fontFile, fontFormat } = fontData;
  return `@font-face {
  font-family: "${fontFamily}";
  src: url("${getFontSrc(fontFile)}") ${getFontFormat(fontFormat)};
  font-weight: ${fontWeight};
}`;
};

const generateFontFile = (fontsData) => {
  if (!fontsData || !fontsData.fontFamily || !fontsData.regularFont || !fontsData.boldFont) return null;

  const { fontFamily, regularFont, boldFont } = fontsData;

  if (!regularFont.fontFile || !regularFont.fontFormat) return null;
  if (!boldFont.fontFile || !boldFont.fontFormat) return null;

  const regularFontFace = generateFontFace(fontFamily, regularFont, "normal");
  const boldFontFace = generateFontFace(fontFamily, boldFont, "bold");

  return `$font-family: "${fontFamily}";

:root {
  --font_family: "${fontFamily}" !important;
}

${regularFontFace}
${boldFontFace}
  
%font-regular {
  font-family: var(--font_family);
  font-weight: 400;
}

%font-semi {
  font-family: var(--font_family);
  font-weight: 600;
}

%font-bold {
  font-family: var(--font_family);
  font-weight: 700;
}`;
};

module.exports = {
  generateFontFile
};
