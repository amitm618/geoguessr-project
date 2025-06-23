export default async function submitScore({
  token,
  distance_km,
  points,
  guess,
  actual,
  onUnauthorized,
}) {
  try {
    const res = await fetch("http://127.0.0.1:8000/submit-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        distance_km,
        points,
        guess_lat: guess.lat,
        guess_lng: guess.lng,
        actual_lat: actual.lat,
        actual_lng: actual.lng,
      }),
    });

    if (res.status === 401 && onUnauthorized) {
      onUnauthorized();
      return;
    }

    const data = await res.json();
    console.log("Score submitted:", data);
  } catch (err) {
    console.error("Error submitting score:", err);
  }
}
