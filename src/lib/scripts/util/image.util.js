export function parseImageBase64(imageBase64) {
  if (!imageBase64) {
    return null;
  }

  if (imageBase64.startsWith('data:')) {
    return imageBase64;
  }

  return `data:image/png;base64,${decodeURIComponent(imageBase64).replace(/ /g, '+')}`;
}
