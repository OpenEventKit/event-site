const getFontFormat = (format) => {
  let formatString = '';
  switch (format) {
    case 'ttf':
      formatString = "format('truetype')";
      break;
    case 'otf':
      formatString = "format('opentype')";
      break;
    case 'woff':
      formatString = "format('woff')";
      break;
    case 'woff2':
      formatString = "format('woff2')";
      break;
    default:
      formatString = null;
      break;
  }
  return formatString;
}

const getFontSrc = (fontPath) => {
  // get the filename from the file path
  const fileName = fontPath.substring(fontPath.lastIndexOf("/")+1) 
  return `/fonts/${fileName}`;
}

const generateFontFile = (fontData) => {
  // check fields
  if(!fontData?.fontFamily) return null;
  if(!fontData?.regularFont?.fontFile) return null;
  if(!fontData?.regularFont?.fontFormat) return null;
  if(!fontData?.boldFont?.fontFile) return null;
  if(!fontData?.boldFont?.fontFormat) return null;

  const scssFonts = `
  $font-family: "${fontData.fontFamily}";

  :root {
    --font_family: "${fontData.fontFamily}" !important;
  }

  // Adding these new fonts for this theme
  ${fontData.regularFont && fontData.regularFont.fontFile ?
    `@font-face {
        font-family: "${fontData.fontFamily}";
        src: url("${getFontSrc(fontData.regularFont?.fontFile)}") ${getFontFormat(fontData.regularFont?.fontFormat)};
        font-weight: normal;
    }`
    :
    ''
  }

  ${fontData.boldFont && fontData.boldFont.fontFile ?
    `@font-face {
        font-family: "${fontData.fontFamily}";
        src: url("${getFontSrc(fontData.boldFont?.fontFile)}") ${getFontFormat(fontData.boldFont?.fontFormat)};
        font-weight: bold;
    }`
    :
    ''
  }
  
  %font-regular {
    font-family: "${fontData.fontFamily}";
    font-weight: 400;
  }

  %font-semi {
    font-family: "${fontData.fontFamily}";
    font-weight: 600;
  }

  %font-bold {
    font-family: "${fontData.fontFamily}";
    font-weight: 700;
  }
 `;
  return scssFonts;
};

module.exports = {
  generateFontFile
}