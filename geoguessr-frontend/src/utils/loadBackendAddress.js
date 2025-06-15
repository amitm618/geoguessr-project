let cachedAddress = null;

export const loadBackendAddress = async () => {
  if (cachedAddress) return cachedAddress;

  const res = await fetch("/backend-address.txt");
  const text = await res.text();
  const match = text.match(/^BACKEND_ADDRESS\s*=\s*(.+)$/m);

  if (!match) {
    throw new Error("Could not parse BACKEND_ADDRESS");
  }

  cachedAddress = match[1].trim();
  return cachedAddress;
};
