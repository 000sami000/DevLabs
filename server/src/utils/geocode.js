const NodeCache = require('node-cache');
const geocodeCache = new NodeCache({ stdTTL: 86400 }); // 1 day

async function geocodeLocation(locationString) {
  if (!locationString) return { lat: null, lon: null };
  const cached = geocodeCache.get(locationString);
  if (cached) return cached;

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', locationString);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('addressdetails', '0');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'JobScraperApp/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const result = { lat: parseFloat(lat), lon: parseFloat(lon) };
      geocodeCache.set(locationString, result);
      return result;
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
  return { lat: null, lon: null };
}

module.exports = geocodeLocation;