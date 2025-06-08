export const createLineBetweenPoints = (guessPosition, actualLocation) => {
  if (!guessPosition || !actualLocation) return null;

  return [
    [guessPosition.lat, guessPosition.lng],
    [actualLocation.lat, actualLocation.lng],
  ];
};
