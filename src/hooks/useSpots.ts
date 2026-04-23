import { useState, useCallback } from 'react';
import type { Spot, CreateSpotBody } from '../types';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSpots = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/spots');
      const data = await res.json();
      setSpots(data.spots || []);
    } catch (error) {
      console.error('Failed to load spots:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSpot = useCallback(async (body: CreateSpotBody): Promise<Spot | null> => {
    const res = await fetch('/api/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setSpots((prev) => [data.spot, ...prev]);
      return data.spot;
    }
    return null;
  }, []);

  return { spots, loadSpots, createSpot, isLoading };
}
