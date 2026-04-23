import { useRef, useCallback, useEffect } from 'react';
import type { Marker, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import type { Spot } from '../types';
import { DEFAULT_ZOOM, CATEGORY_COLORS } from '../types';

interface MapInstance {
  map: LeafletMap | null;
  markers: Marker[];
  userMarker: Marker | null;
  pendingLatLng: { lat: number; lng: number } | null;
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
  });

  const loadMapScript = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
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
    const svgDataUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3C/svg%3E`;
    const svgHTML = `
      <div class="marker-pin" style="background-color: ${color};">
        <img class="marker-icon" src="${svgDataUrl}" />
      </div>
    `;
    return window.L.divIcon({
      className: 'custom-marker',
      html: svgHTML,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  const createUserLocationIcon = useCallback(() => {
    return window.L.divIcon({
      html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
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
    // Remove any existing map on this container (from strict mode remount)
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
      container.innerHTML = '';
    }

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

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    if (showUserLocation) {
      const userIcon = createUserLocationIcon();
      const marker = window.L.marker([centerLat, centerLng], {
        icon: userIcon,
      }).addTo(map);
      instanceRef.current.userMarker = marker;
    }

    instanceRef.current.map = map;
  }, [createUserLocationIcon]);

  const loadMap = useCallback(async (
    container: HTMLDivElement,
    centerLat: number,
    centerLng: number,
    showUserLocation: boolean
  ) => {
    // Prevent double initialization (React strict mode)
    if (instanceRef.current.map || (container as any)._leaflet_id) return;

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
    if (!map) return false;

    try {
      const { lat, lng } = await getUserLocation();

      if (instanceRef.current.userMarker) {
        map.removeLayer(instanceRef.current.userMarker);
      }

      const marker = window.L.marker([lat, lng], {
        icon: createUserLocationIcon(),
      }).addTo(map);

      instanceRef.current.userMarker = marker;
      map.flyTo([lat, lng], 15, { duration: 1.5 });
      return true;
    } catch {
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
    if (!map) return;

    // Remove existing markers
    instanceRef.current.markers.forEach((marker) => map.removeLayer(marker));
    instanceRef.current.markers = [];

    const filteredSpots = activeFilter === 'all'
      ? spots
      : spots.filter((s: Spot) => s.category === activeFilter);

    filteredSpots.forEach((spot: Spot) => {
      const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
      const marker = window.L.marker([spot.lat, spot.lng], {
        icon: createMarkerIcon(color),
      });

      marker.on('click', (e: LeafletMouseEvent) => {
        window.L.DomEvent.stopPropagation(e);
        options.onMarkerClick?.(spot);
      });

      marker.addTo(map);
      instanceRef.current.markers.push(marker);
    });
  }, [createMarkerIcon, options]);

  const remove = useCallback(() => {
    if (instanceRef.current.map) {
      instanceRef.current.map.remove();
      instanceRef.current.map = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (instanceRef.current.map) {
        instanceRef.current.map.remove();
      }
    };
  }, []);

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
