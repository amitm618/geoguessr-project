const fetchStreetView = async ({ setLatLng, setImageUrl, setLoading }) => {
  if (setLoading) setLoading(true); // Optional
  try {
    const locationRes = await fetch("http://localhost:8000/random-location");
    const locationData = await locationRes.json();
    setLatLng(locationData);

    const imageRes = await fetch(
      `http://localhost:8000/streetview?lat=${locationData.lat}&lng=${locationData.lng}`
    );
    const imageData = await imageRes.json();
    setImageUrl(imageData.image_url);
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    if (setLoading) setLoading(false); // Optional
  }
};

export default fetchStreetView;
