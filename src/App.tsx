import { useState, useEffect, useRef, useCallback } from 'react';
import type { Spot } from './types';
import { DEFAULT_LOCATION } from './types';
import { useToast, useSpots, useMap } from './hooks';
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
  const mapRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentSpot, setCurrentSpot] = useState<Spot | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSpotCard, setShowSpotCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('hidden gem');
  const [spotName, setSpotName] = useState('');
  const [spotStory, setSpotStory] = useState('');

  // Hooks
  const { spots, loadSpots, createSpot } = useSpots();
  const { message: toastMessage, showToast } = useToast();

  const handleMarkerClick = useCallback((spot: Spot) => {
    setCurrentSpot(spot);
    setShowSpotCard(true);
  }, []);

  const map = useMap({ onMarkerClick: handleMarkerClick });

  // Initialize map on mount
  useEffect(() => {
    if (!mapRef.current) return;

    const init = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.loadMap(mapRef.current!, latitude, longitude, true);
          },
          () => {
            map.loadMap(mapRef.current!, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false);
          },
          { timeout: 5000 }
        );
      } else {
        map.loadMap(mapRef.current!, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false);
      }
    };

    init();
  }, [map]);

  // Load spots on mount
  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  // Render markers when spots or filter change
  useEffect(() => {
    map.renderMarkers(spots, activeFilter);
  }, [spots, activeFilter, map]);

  const enterAddMode = () => {
    setIsAddMode(true);
    setShowSpotCard(false);
    setCurrentSpot(null);
  };

  const exitAddMode = () => {
    setIsAddMode(false);
  };

  const confirmLocation = () => {
    const center = map.getCenter?.();
    if (center) {
      map.setPendingLatLng(center.lat, center.lng);
      setShowModal(true);
      setIsAddMode(false);
      setSpotName('');
      setSpotStory('');
      setSelectedCategory('hidden gem');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    map.setPendingLatLng(0, 0);
  };

  const submitSpot = async () => {
    const pending = map.pendingLatLng;
    if (!pending || !spotName.trim()) return;

    const btn = document.getElementById('submit-btn') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Dropping...';
    }

    const spot = await createSpot({
      name: spotName.trim(),
      story: spotStory.trim(),
      lat: pending.lat,
      lng: pending.lng,
      category: selectedCategory,
    });

    if (btn) {
      btn.textContent = 'Drop the Pin';
      btn.disabled = false;
    }

    if (spot) {
      setShowModal(false);
      map.setPendingLatLng(0, 0);
      map.renderMarkers(spots, activeFilter);
      map.flyTo(spot.lat, spot.lng, 16);
      showToast('Spot added successfully!');
    }
  };

  const locateUser = async () => {
    const btn = document.getElementById('locate-btn');
    btn?.classList.add('locating');

    const success = await map.locateUser();

    btn?.classList.remove('locating');

    if (!success) {
      showToast('Unable to retrieve your location');
    }
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
          onPanUp={() => map.panMap('up')}
          onPanDown={() => map.panMap('down')}
          onPanLeft={() => map.panMap('left')}
          onPanRight={() => map.panMap('right')}
          onZoomIn={map.zoomIn}
          onZoomOut={map.zoomOut}
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
