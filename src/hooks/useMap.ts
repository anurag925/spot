import { useRef, useCallback, useEffect } from 'react';
import type { Marker, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import type { Spot } from '../types';
import { DEFAULT_ZOOM, CATEGORY_COLORS } from '../types';

interface MapInstance {
  map: LeafletMap | null;
  markers: Marker[];
  userMarker: Marker | null;
  pendingLatLng: { lat: number; lng: number } | null;
  isInitializing: boolean;
}

interface UseMapOptions {
  onMarkerClick?: (spot: Spot) => void;
}

export function useMap(options: UseMapOptions = {}) {
  const instanceRef = useRef<MapInstance>({
    map: null,
    markers: [],
    userMarker: null,
    pendingLatLng: null,
    isInitializing: false,
  });

  const loadMapScript = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }, []);

  const createMarkerIcon = useCallback((color: string) => {
    if (!window.L) return null;
    // Use a simple marker with only text/size, no external resources
    return window.L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const createUserLocationIcon = useCallback(() => {
    if (!window.L) return null;
    const svgHTML = `<div style="width:40px;height:40px;position:relative;"><div style="width:40px;height:40px;border-radius:50%;background:rgba(0,123,255,0.3);position:absolute;animation:pulse 2s infinite;"></div><div style="width:16px;height:16px;border-radius:50%;background:#007BFF;border:3px solid white;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div></div>`;
    return window.L.divIcon({
      html: svgHTML,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -10],
    });
  }, []);

  const initMap = useCallback((
    container: HTMLDivElement,
    centerLat: number,
    centerLng: number,
    showUserLocation: boolean
  ) => {
    if (!window.L) return;

    // Clean up existing map if any
    if (instanceRef.current.map) {
      instanceRef.current.map.remove();
      instanceRef.current.map = null;
    }

    // Check if container already has a Leaflet instance
    const existingId = (container as any)._leaflet_id;
    if (existingId) {
      container.innerHTML = '';
      delete (container as any)._leaflet_id;
    }

    try {
      const map = window.L.map(container, {
        zoomControl: false,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        zoomAnimation: true,
        fadeAnimation: true,
      }).setView([centerLat, centerLng], DEFAULT_ZOOM);

      // Mark as loaded
      (map as any)._loaded = true;

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      if (showUserLocation) {
        const userIcon = createUserLocationIcon();
        if (userIcon) {
          const marker = window.L.marker([centerLat, centerLng], {
            icon: userIcon,
          }).addTo(map);
          instanceRef.current.userMarker = marker;
        }
      }

      instanceRef.current.map = map;
      instanceRef.current.isInitializing = false;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      instanceRef.current.isInitializing = false;
    }
  }, [createUserLocationIcon]);

  const loadMap = useCallback(async (
    container: HTMLDivElement,
    centerLat: number,
    centerLng: number,
    showUserLocation: boolean
  ) => {
    if (instanceRef.current.isInitializing) return;
    if (instanceRef.current.map) return;

    instanceRef.current.isInitializing = true;
    await loadMapScript();
    initMap(container, centerLat, centerLng, showUserLocation);
  }, [loadMapScript, initMap]);

  const getUserLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
        reject,
        { timeout: 5000 }
      );
    });
  }, []);

  const locateUser = useCallback(async (): Promise<boolean> => {
    const map = instanceRef.current.map;

    // Wait for map to be ready (up to 2 seconds)
    if (!map) {
      let waited = 0;
      while (!map && waited < 2000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waited += 100;
      }
    }

    if (!map) {
      console.warn('locateUser: map not ready after waiting');
      return false;
    }

    try {
      const { lat, lng } = await getUserLocation();

      if (instanceRef.current.userMarker) {
        map.removeLayer(instanceRef.current.userMarker);
      }

      const userIcon = createUserLocationIcon();
      if (!userIcon) return false;

      const marker = window.L.marker([lat, lng], {
        icon: userIcon,
      }).addTo(map);

      instanceRef.current.userMarker = marker;
      map.flyTo([lat, lng], 15, { duration: 1.5 });
      return true;
    } catch (error) {
      console.error('locateUser failed:', error);
      return false;
    }
  }, [getUserLocation, createUserLocationIcon]);

  const panMap = useCallback((direction: string) => {
    const map = instanceRef.current.map;
    if (!map) return;

    const offset = 0.002;
    const center = map.getCenter();
    const zoom = map.getZoom();

    switch (direction) {
      case 'up':
        map.setView([center.lat + offset, center.lng], zoom);
        break;
      case 'down':
        map.setView([center.lat - offset, center.lng], zoom);
        break;
      case 'left':
        map.setView([center.lat, center.lng - offset], zoom);
        break;
      case 'right':
        map.setView([center.lat, center.lng + offset], zoom);
        break;
    }
  }, []);

  const zoomIn = useCallback(() => {
    instanceRef.current.map?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    instanceRef.current.map?.zoomOut();
  }, []);

  const flyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    instanceRef.current.map?.flyTo([lat, lng], zoom);
  }, []);

  const getCenter = useCallback(() => {
    const map = instanceRef.current.map;
    if (!map) return null;
    const center = map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }, []);

  const setPendingLatLng = useCallback((lat: number, lng: number) => {
    instanceRef.current.pendingLatLng = { lat, lng };
  }, []);

  const renderMarkers = useCallback((spots: Spot[], activeFilter: string) => {
    const map = instanceRef.current.map;
    if (!map || !window.L || (map as any)._loaded === false) return;

    // Wait for map to be fully ready
    if (!(map as any)._tiles || map.getZoom() === undefined) {
      setTimeout(() => renderMarkers(spots, activeFilter), 100);
      return;
    }

    // Remove existing markers
    instanceRef.current.markers.forEach((marker) => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Marker might already be removed
      }
    });
    instanceRef.current.markers = [];

    const filteredSpots = activeFilter === 'all'
      ? spots
      : spots.filter((s: Spot) => s.category === activeFilter);

    filteredSpots.forEach((spot: Spot) => {
      const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
      const icon = createMarkerIcon(color);
      if (!icon) return;

      const marker = window.L.marker([spot.lat, spot.lng], { icon });

      marker.on('click', (e: LeafletMouseEvent) => {
        window.L.DomEvent.stopPropagation(e);
        options.onMarkerClick?.(spot);
      });

      try {
        marker.addTo(map);
        instanceRef.current.markers.push(marker);
      } catch (error) {
        console.error('Failed to add marker:', error);
      }
    });
  }, [createMarkerIcon, options]);

  const remove = useCallback(() => {
    if (instanceRef.current.map) {
      try {
        instanceRef.current.map.remove();
      } catch (e) {
        // Map might already be removed
      }
      instanceRef.current.map = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      remove();
    };
  }, [remove]);

  return {
    loadMap,
    renderMarkers,
    locateUser,
    panMap,
    zoomIn,
    zoomOut,
    flyTo,
    remove,
    getUserLocation,
    getCenter,
    setPendingLatLng,
    get pendingLatLng() {
      return instanceRef.current.pendingLatLng;
    },
  };
}
