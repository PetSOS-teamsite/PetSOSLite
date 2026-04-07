/**
 * Reverse geocoding utility using OpenStreetMap Nominatim
 * Converts GPS coordinates to a human-readable address
 * No API key required. Optimised for Hong Kong addresses.
 */

export interface ReverseGeocodeResult {
  address: string;
  shortAddress: string;
}

/**
 * Format a Nominatim address object into a clean HK-style address string.
 */
function formatHKAddress(addr: Record<string, string>, language: string = 'en'): { full: string; short: string } {
  // Prioritise the most specific HK components
  const building = addr.building || addr.amenity || addr.shop || addr.tourism || '';
  const houseNumber = addr.house_number || '';
  const road = addr.road || addr.pedestrian || addr.footway || '';
  const suburb = addr.suburb || '';
  const quarter = addr.quarter || '';
  const neighbourhood = addr.neighbourhood || '';
  const cityDistrict = addr.city_district || addr.borough || '';
  const district = cityDistrict || quarter || suburb || neighbourhood || '';
  const city = addr.city || addr.town || 'Hong Kong';

  const parts: string[] = [];
  if (building) parts.push(building);
  if (road) parts.push(houseNumber ? `${houseNumber} ${road}` : road);
  if (district) parts.push(district);
  if (city && city !== district) parts.push(city);

  const full = parts.length > 0 ? parts.join(', ') : addr.display_name || 'Hong Kong';

  // Short address: building + road or road + district
  const shortParts: string[] = [];
  if (building) shortParts.push(building);
  else if (road) shortParts.push(houseNumber ? `${houseNumber} ${road}` : road);
  if (district) shortParts.push(district);
  const short = shortParts.length > 0 ? shortParts.join(', ') : full;

  return { full, short };
}

/**
 * Reverse geocode GPS coordinates to a human-readable address.
 * Returns null if the request fails.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  language: string = 'en'
): Promise<ReverseGeocodeResult | null> {
  try {
    const lang = language === 'zh-HK' ? 'zh-HK,zh;q=0.9,en;q=0.5' : 'en-US,en;q=0.9';
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=17&addressdetails=1&accept-language=${encodeURIComponent(lang)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PetSOS/1.0 (petsos.site)',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || !data.address) return null;

    const { full, short } = formatHKAddress(data.address, language);
    return { address: full, shortAddress: short };
  } catch {
    return null;
  }
}
