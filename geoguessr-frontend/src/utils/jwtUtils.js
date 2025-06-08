// utils/jwtUtils.js
export function isTokenExpired(token) {
  if (!token) return true;

  const payload = token.split(".")[1];
  try {
    const decoded = JSON.parse(atob(payload));
    const expiry = decoded.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  } catch (e) {
    console.error("Failed to parse token:", e);
    return true;
  }
}
