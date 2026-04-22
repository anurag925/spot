export interface Spot {
  id: number;
  name: string;
  story: string;
  lat: number;
  lng: number;
  category: string;
  created_at: string;
}

export interface CreateSpotBody {
  name: string;
  story?: string;
  lat: number;
  lng: number;
  category?: string;
}

export interface SpotsResponse {
  spots: Spot[];
}

export interface SpotResponse {
  spot: Spot;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'hidden gem': '#E76F51',
  'lookout': '#2D5A4B',
  'food': '#F4A261',
  'meetup': '#6B5B95',
  'other': '#8B8680'
};

export const CATEGORY_LABELS: Record<string, string> = {
  'hidden gem': 'Hidden Gem',
  'lookout': 'Lookout',
  'food': 'Food',
  'meetup': 'Meetup',
  'other': 'Other'
};

export const DEFAULT_LOCATION = { lat: 25.475, lng: 91.452 };
export const DEFAULT_ZOOM = 14;

export type Category = keyof typeof CATEGORY_COLORS;