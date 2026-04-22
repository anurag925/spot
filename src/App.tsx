// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DEFAULT_LOCATION,
  DEFAULT_ZOOM,
} from "./types";

export default function App() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef([]);
  const userLocationMarkerRef = useRef(null);

  const [spots, setSpots] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentSpot, setCurrentSpot] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showSpotCard, setShowSpotCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("hidden gem");
  const [spotName, setSpotName] = useState("");
  const [spotStory, setSpotStory] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [spotCardJustOpened, setSpotCardJustOpened] = useState(false);

  // Initialize map with user location
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const initMap = (centerLat, centerLng, showUserLocation) => {
      const map = L.map(mapRef.current, {
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

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (showUserLocation) {
        const userIcon = L.divIcon({
          html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
          className: "",
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

    const loadMap = (centerLat, centerLng, showUserLocation) => {
      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
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
      const res = await fetch("/api/spots");
      const data = await res.json();
      setSpots(data.spots || []);
    } catch (error) {
      console.error("Failed to load spots:", error);
    }
  };

  const createMarkerIcon = useCallback((color) => {
    const svg = `<svg viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" class="custom-marker">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>`;
    return L.divIcon({
      html: svg,
      className: "",
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -48],
    });
  }, []);

  const createUserLocationIcon = useCallback(() => {
    return L.divIcon({
      html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -10],
    });
  }, []);

  const handleMarkerClick = useCallback((spot) => {
    setSpotCardJustOpened(true);
    setCurrentSpot(spot);
    setShowSpotCard(true);

    setTimeout(() => setSpotCardJustOpened(false), 300);
  }, []);

  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersLayerRef.current.forEach((marker) => map.removeLayer(marker));
    markersLayerRef.current = [];

    const filteredSpots = activeFilter === "all"
      ? spots
      : spots.filter((s) => s.category === activeFilter);

    filteredSpots.forEach((spot) => {
      const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createMarkerIcon(color),
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        handleMarkerClick(spot);
      });

      marker.addTo(map);
      markersLayerRef.current.push(marker);
    });
  }, [spots, activeFilter, createMarkerIcon, handleMarkerClick]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser");
      return;
    }

    const btn = document.getElementById("locate-btn");
    btn?.classList.add("locating");

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

        btn?.classList.remove("locating");
      },
      (error) => {
        btn?.classList.remove("locating");
        let message = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied.";
        }
        showToast(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const panMap = (direction) => {
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
    setSpotName("");
    setSpotStory("");
    setSelectedCategory("hidden gem");
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingLatLng(null);
  };

  const submitSpot = async () => {
    if (!pendingLatLng || !spotName.trim()) return;

    const btn = document.getElementById("submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Dropping...";
    }

    const body = {
      name: spotName.trim(),
      story: spotStory.trim(),
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      category: selectedCategory,
    };

    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

        showToast("Spot added successfully!");
      }
    } catch (error) {
      console.error("Failed to add spot:", error);
    }

    if (btn) {
      btn.textContent = "Drop the Pin";
      btn.disabled = false;
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openDirections = (spot) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(directionsUrl, "_blank", "noopener,noreferrer");
  };

  const filteredSpots = activeFilter === "all"
    ? spots
    : spots.filter((s) => s.category === activeFilter);

  return (
    React.createElement("div", { className: "app" },
      React.createElement("div", { className: "map", ref: mapRef }),

      // Crosshair
      React.createElement("div", { className: `crosshair ${isAddMode ? "active" : ""}` },
        React.createElement("div", { className: "crosshair-tooltip" }, "Drag to position"),
        React.createElement("div", { className: "crosshair-center" })
      ),

      // UI Layer
      React.createElement("div", { className: "ui-layer" },
        // Header
        React.createElement("header", { className: "interactive" },
          React.createElement("div", { className: "logo" },
            React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
              React.createElement("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
              React.createElement("circle", { cx: 12, cy: 10, r: 3 })
            ),
            "spot"
          ),
          React.createElement("div", { className: "header-actions" },
            React.createElement("button", { className: "icon-btn", id: "locate-btn", onClick: locateUser, title: "My Location" },
              React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("polygon", { points: "3 11 22 2 13 21 11 13 3 11" })
              )
            ),
            React.createElement("button", { className: "add-btn", id: "add-btn", onClick: enterAddMode },
              React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5 },
                React.createElement("line", { x1: 12, y1: 5, x2: 12, y2: 19 }),
                React.createElement("line", { x1: 5, y1: 12, x2: 19, y2: 12 })
              ),
              "Add Spot"
            )
          )
        ),

        // Filters
        React.createElement("div", { className: "filters-wrapper interactive" },
          React.createElement("button", {
            className: `filter-pill ${activeFilter === "all" ? "active" : ""}`,
            onClick: () => setActiveFilter("all")
          }, "All"),
          ...Object.entries(CATEGORY_LABELS).map(([key, label]) =>
            React.createElement("button", {
              key,
              className: `filter-pill ${activeFilter === key ? "active" : ""}`,
              onClick: () => setActiveFilter(key)
            },
              React.createElement("div", { className: "dot", style: { background: CATEGORY_COLORS[key] } }),
              `${label}s`
            )
          )
        ),

        // Empty State
        filteredSpots.length === 0 && activeFilter === "all" && React.createElement("div", { className: "empty-state" },
          React.createElement("h3", null, "No spots yet"),
          React.createElement("p", null, "Be the first to mark something special!")
        ),

        React.createElement("div", { style: { flexGrow: 1 } }),

        // Confirm Bar
        React.createElement("div", { className: `confirm-bar interactive ${isAddMode ? "active" : ""}` },
          React.createElement("button", { className: "btn-secondary", onClick: exitAddMode }, "Cancel"),
          React.createElement("button", { className: "btn-primary", onClick: confirmLocation }, "Confirm Location")
        ),

        // D-Pad and Zoom controls side by side
        React.createElement("div", { className: "map-controls-panel interactive" },
          // D-Pad for map panning
          React.createElement("div", { className: "map-dpad" },
            React.createElement("div", { className: "map-dpad-row" },
              React.createElement("button", { className: "map-dpad-btn", onClick: () => panMap('up'), title: "Move Up" },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement("path", { d: "M12 19V5M5 12l7-7 7 7" })
                )
              )
            ),
            React.createElement("div", { className: "map-dpad-row" },
              React.createElement("button", { className: "map-dpad-btn", onClick: () => panMap('left'), title: "Move Left" },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement("path", { d: "M19 12H5M12 19l-7-7 7-7" })
                )
              ),
              React.createElement("div", { className: "map-dpad-center" }),
              React.createElement("button", { className: "map-dpad-btn", onClick: () => panMap('right'), title: "Move Right" },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement("path", { d: "M5 12h14M12 5l7 7-7 7" })
                )
              )
            ),
            React.createElement("div", { className: "map-dpad-row" },
              React.createElement("button", { className: "map-dpad-btn", onClick: () => panMap('down'), title: "Move Down" },
                React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                  React.createElement("path", { d: "M12 5v14M19 12l-7 7-7-7" })
                )
              )
            )
          ),

          // Zoom controls
          React.createElement("div", { className: "map-controls" },
            React.createElement("button", { className: "map-control-btn", onClick: zoomIn, title: "Zoom In" },
              React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement("circle", { cx: 11, cy: 11, r: 8 }),
                React.createElement("path", { d: "M21 21l-4.35-4.35M11 8v6M8 11h6" })
              )
            ),
            React.createElement("div", { className: "map-control-divider" }),
            React.createElement("button", { className: "map-control-btn", onClick: zoomOut, title: "Zoom Out" },
              React.createElement("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement("circle", { cx: 11, cy: 11, r: 8 }),
                React.createElement("path", { d: "M21 21l-4.35-4.35M8 11h6" })
              )
            )
          )
        )
      ),

      // Spot Card
      React.createElement("div", { className: `spot-card interactive ${showSpotCard ? "visible" : ""}` },
        React.createElement("div", { className: "spot-card-handle" }),
        React.createElement("button", { className: "close-card", onClick: () => setShowSpotCard(false) },
          React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
            React.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
            React.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
          )
        ),
        currentSpot && React.createElement(React.Fragment, { key: currentSpot.id },
          React.createElement("div", { className: "spot-card-header" },
            React.createElement("div", { className: "spot-marker-dot", style: { background: CATEGORY_COLORS[currentSpot.category] } }),
            React.createElement("div", null,
              React.createElement("h2", { className: "spot-card-title" }, currentSpot.name),
              React.createElement("span", {
                className: "spot-card-category",
                style: {
                  background: CATEGORY_COLORS[currentSpot.category],
                  color: currentSpot.category === "food" ? "#1A1A1A" : "white"
                }
              }, CATEGORY_LABELS[currentSpot.category])
            ),
          ),
          React.createElement("p", { className: "spot-card-story" },
            currentSpot.story || "No story yet, but it's definitely worth a visit!"
          ),
          React.createElement("p", { className: "spot-card-date" },
            `Added ${new Date(currentSpot.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
          ),
          React.createElement("button", { className: "direction-btn", onClick: () => openDirections(currentSpot), title: "Get Directions" },
            React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
              React.createElement("polygon", { points: "3 11 22 2 13 21 11 13 3 11" })
            )
          )
        )
      ),

      // Add Modal
      React.createElement("div", {
        className: `modal-overlay ${showModal ? "active" : ""}`,
        onClick: (e) => e.target === e.currentTarget && closeModal()
      },
        React.createElement("div", { className: "modal interactive" },
          React.createElement("div", { className: "modal-header" },
            React.createElement("h2", { className: "modal-title" }, "Spot Details"),
            React.createElement("button", { className: "close-card", id: "close-modal", onClick: closeModal },
              React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
                React.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
                React.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
              )
            )
          ),
          React.createElement("div", { className: "modal-body" },
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label" }, "Name your spot"),
              React.createElement("input", {
                type: "text",
                className: "form-input",
                id: "spot-name",
                placeholder: "The Secret Garden, Best Tacos Ever...",
                maxLength: 50,
                value: spotName,
                onChange: (e) => setSpotName(e.target.value)
              })
            ),
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label" }, "What's the story?"),
              React.createElement("textarea", {
                className: "form-textarea",
                id: "spot-story",
                placeholder: "This hidden courtyard has the best coffee...",
                maxLength: 500,
                value: spotStory,
                onChange: (e) => setSpotStory(e.target.value)
              }),
              React.createElement("p", { className: "form-hint" }, "Tell people why this place matters")
            ),
            React.createElement("div", { className: "form-group" },
              React.createElement("label", { className: "form-label" }, "Category"),
              React.createElement("div", { className: "category-selector" },
                ...Object.entries(CATEGORY_LABELS).map(([key, label]) =>
                  React.createElement("button", {
                    key,
                    className: `category-option ${selectedCategory === key ? "selected" : ""}`,
                    onClick: () => setSelectedCategory(key)
                  },
                    React.createElement("div", { className: "dot", style: { background: CATEGORY_COLORS[key] } }),
                    label
                  )
                )
              )
            )
          ),
          React.createElement("div", { className: "modal-footer" },
            React.createElement("button", {
              className: "submit-btn",
              id: "submit-btn",
              disabled: !spotName.trim(),
              onClick: submitSpot
            }, "Drop the Pin")
          )
        )
      ),

      // Toast
      React.createElement("div", { className: `toast ${toastMessage ? "show" : ""}` },
        toastMessage
      )
    )
  );
}