export const getChartColorsArray = (colors: any) => {
  const parsedColors = JSON.parse(colors);
  return parsedColors.map(function (value: any) {
    let newValue = value.replace(" ", "");
    if (newValue.indexOf(",") === -1) {
      let color = getComputedStyle(document.documentElement).getPropertyValue(
        newValue
      );
      if (color) {
        color = color.replace(" ", "");
        return color;
      } else {
        return newValue;
      }
    } else {
      let val = value.split(",");
      if (val.length == 2) {
        let colorCode = getComputedStyle(
          document.documentElement
        ).getPropertyValue(val[0]);

        if (colorCode.includes("#")) {
          colorCode = hexToRGB(colorCode, val[1]);
        } else {
          const rgbColor = colorCode.slice(
            colorCode.indexOf("(") + 1,
            colorCode.indexOf(")")
          );
          colorCode = "rgba(" + rgbColor + "," + val[1] + ")";
        }

        return colorCode;
      } else {
        return newValue;
      }
    }
  });
};

function hexToRGB(hex: string, alpha?: string | number) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}
