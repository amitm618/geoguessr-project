import { loadBackendAddress } from "./loadBackendAddress";

const fetchStreetView = async ({ setLatLng, setImageUrl, setLoading }) => {
  if (setLoading) setLoading(true);
  try {
    const baseUrl = await loadBackendAddress();

    const locationRes = await fetch(`${baseUrl}/random-location`);
    const locationData = await locationRes.json();
    setLatLng(locationData);

    const imageRes = await fetch(
      `${baseUrl}/streetview?lat=${locationData.lat}&lng=${locationData.lng}`
    );
    const imageData = await imageRes.json();
    setImageUrl(imageData.image_url);
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export default fetchStreetView;
