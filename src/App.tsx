// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DEFAULT_LOCATION,
  DEFAULT_ZOOM,
  Spot,
} from './types';
import {
  Header,
  FilterPills,
  MapControls,
  ConfirmBar,
  Crosshair,
  EmptyState,
  SpotCard,
  AddSpotModal,
  Toast,
} from './components';

export default function App() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef([]);
  const userLocationMarkerRef = useRef(null);

  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentSpot, setCurrentSpot] = useState<Spot | null>(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSpotCard, setShowSpotCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('hidden gem');
  const [spotName, setSpotName] = useState('');
  const [spotStory, setSpotStory] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [spotCardJustOpened, setSpotCardJustOpened] = useState(false);

  // Initialize map with user location
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const initMap = (centerLat: number, centerLng: number, showUserLocation: boolean) => {
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        bouncingEnabled: true,
        zoomAnimation: true,
        fadeAnimation: true,
      }).setView([centerLat, centerLng], DEFAULT_ZOOM);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (showUserLocation) {
        const userIcon = L.divIcon({
          html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -10],
        });
        const marker = L.marker([centerLat, centerLng], {
          icon: userIcon,
        }).addTo(map);
        userLocationMarkerRef.current = marker;
      }

      mapInstanceRef.current = map;
    };

    const loadMap = (centerLat: number, centerLng: number, showUserLocation: boolean) => {
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => initMap(centerLat, centerLng, showUserLocation);
        document.head.appendChild(script);
      } else {
        initMap(centerLat, centerLng, showUserLocation);
      }
    };

    // Try to get user's location on first load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          loadMap(latitude, longitude, true);
        },
        () => {
          loadMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false);
        },
        { timeout: 5000 }
      );
    } else {
      loadMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Load spots on mount
  useEffect(() => {
    loadSpots();
  }, []);

  // Render markers when spots or filter change
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderMarkers();
    }
  }, [spots, activeFilter]);

  const loadSpots = async () => {
    try {
      const res = await fetch('/api/spots');
      const data = await res.json();
      setSpots(data.spots || []);
    } catch (error) {
      console.error('Failed to load spots:', error);
    }
  };

  const createMarkerIcon = useCallback((color: string) => {
    const svg = `<svg viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" class="custom-marker">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -48],
    });
  }, []);

  const createUserLocationIcon = useCallback(() => {
    return L.divIcon({
      html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -10],
    });
  }, []);

  const handleMarkerClick = useCallback((spot: Spot) => {
    setSpotCardJustOpened(true);
    setCurrentSpot(spot);
    setShowSpotCard(true);

    setTimeout(() => setSpotCardJustOpened(false), 300);
  }, []);

  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersLayerRef.current.forEach((marker: L.Marker) => map.removeLayer(marker));
    markersLayerRef.current = [];

    const filteredSpots = activeFilter === 'all'
      ? spots
      : spots.filter((s) => s.category === activeFilter);

    filteredSpots.forEach((spot) => {
      const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createMarkerIcon(color),
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        handleMarkerClick(spot);
      });

      marker.addTo(map);
      markersLayerRef.current.push(marker);
    });
  }, [spots, activeFilter, createMarkerIcon, handleMarkerClick]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }

    const btn = document.getElementById('locate-btn');
    btn?.classList.add('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);

        const map = mapInstanceRef.current;
        if (!map) return;

        if (userLocationMarkerRef.current) {
          map.removeLayer(userLocationMarkerRef.current);
        }

        const marker = L.marker([latitude, longitude], {
          icon: createUserLocationIcon(),
        }).addTo(map);

        userLocationMarkerRef.current = marker;
        map.flyTo([latitude, longitude], 15, { duration: 1.5 });

        btn?.classList.remove('locating');
      },
      (error) => {
        btn?.classList.remove('locating');
        let message = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access denied.';
        }
        showToast(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const panMap = (direction: string) => {
    const map = mapInstanceRef.current;
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
  };

  const zoomIn = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomIn();
  };

  const zoomOut = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomOut();
  };

  const enterAddMode = () => {
    setIsAddMode(true);
    setShowSpotCard(false);
    setCurrentSpot(null);
  };

  const exitAddMode = () => {
    setIsAddMode(false);
  };

  const confirmLocation = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setPendingLatLng(map.getCenter());
    setShowModal(true);
    setIsAddMode(false);
    setSpotName('');
    setSpotStory('');
    setSelectedCategory('hidden gem');
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingLatLng(null);
  };

  const submitSpot = async () => {
    if (!pendingLatLng || !spotName.trim()) return;

    const btn = document.getElementById('submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Dropping...';
    }

    const body = {
      name: spotName.trim(),
      story: spotStory.trim(),
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      category: selectedCategory,
    };

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setSpots((prev) => [data.spot, ...prev]);
        closeModal();
        renderMarkers();

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([pendingLatLng.lat, pendingLatLng.lng], 16);
        }

        showToast('Spot added successfully!');
      }
    } catch (error) {
      console.error('Failed to add spot:', error);
    }

    if (btn) {
      btn.textContent = 'Drop the Pin';
      btn.disabled = false;
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openDirections = () => {
    if (!currentSpot) return;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentSpot.lat},${currentSpot.lng}`;
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredSpots = activeFilter === 'all'
    ? spots
    : spots.filter((s) => s.category === activeFilter);

  const handleModalSubmit = (data: { name: string; story: string; category: string }) => {
    setSpotName(data.name);
    setSpotStory(data.story);
    setSelectedCategory(data.category);
    submitSpot();
  };

  return (
    <div className="app">
      <div className="map" ref={mapRef} />

      <Crosshair isActive={isAddMode} />

      <div className="ui-layer">
        <Header onLocate={locateUser} onAddSpot={enterAddMode} />

        <FilterPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {filteredSpots.length === 0 && activeFilter === 'all' && <EmptyState />}

        <div style={{ flexGrow: 1 }} />

        <ConfirmBar
          isActive={isAddMode}
          onCancel={exitAddMode}
          onConfirm={confirmLocation}
        />

        <MapControls
          onPanUp={() => panMap('up')}
          onPanDown={() => panMap('down')}
          onPanLeft={() => panMap('left')}
          onPanRight={() => panMap('right')}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
      </div>

      <SpotCard
        spot={currentSpot}
        isVisible={showSpotCard}
        onClose={() => setShowSpotCard(false)}
        onDirections={openDirections}
      />

      <AddSpotModal
        isVisible={showModal}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        spotName={spotName}
        spotStory={spotStory}
        selectedCategory={selectedCategory}
        onNameChange={setSpotName}
        onStoryChange={setSpotStory}
        onCategoryChange={setSelectedCategory}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
