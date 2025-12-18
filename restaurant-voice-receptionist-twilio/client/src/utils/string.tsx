export const snakeToTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const camelCaseToTitleCase = (str: string): string => {
  return str
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const toSentenceCase = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const stringToParagraphs = (text: string): JSX.Element[] => {
  const paragraphs = text.split("\n");
  return paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>);
};

export const formatDuration = (secondsRaw: number): string => {
  const seconds = Math.abs(secondsRaw);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const formatted = [];
  if (hours > 0) {
    formatted.push(`${hours}h`);
  }
  if (minutes > 0 || hours === 0) {
    formatted.push(`${minutes}m`);
  }

  return formatted.join(" ");
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
