export const setAttributes = (key: string, value: string) => {
  document.documentElement.setAttribute(key, value);
};

export const setSiteFontFamilyByTheme = (layoutTheme: string) => {
  const fontLink = document.getElementById("fontsLink");

  if (fontLink) {
    switch (layoutTheme) {
      case "material":
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        );
        break;
      case "creative":
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap"
        );
        break;
      case "interaction":
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap"
        );
        break;
      case "minimal":
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap"
        );
        break;
      case "modern":
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Gantari:wght@300;400;500;600;700&display=swap"
        );
        break;
      default:
        fontLink.setAttribute(
          "href",
          "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        );
        break;
    }
  }
};
