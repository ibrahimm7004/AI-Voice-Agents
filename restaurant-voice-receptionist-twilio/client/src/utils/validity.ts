export const isValidUrl = (url: string | undefined | null) => {
  if (!url) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};
