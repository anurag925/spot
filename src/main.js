const CATEGORY_COLORS = {
  'hidden gem': '#E76F51',
  'lookout': '#2D5A4B',
  'food': '#F4A261',
  'meetup': '#6B5B95',
  'other': '#8B8680'
};

const CATEGORY_LABELS = {
  'hidden gem': 'Hidden Gem',
  'lookout': 'Lookout',
  'food': 'Food',
  'meetup': 'Meetup',
  'other': 'Other'
};

const DEFAULT_LOCATION = { lat: 25.475, lng: 91.452 };
const DEFAULT_ZOOM = 14;

let map;
let spots = [];
let markersLayer = [];
let activeFilter = 'all';
let currentSpot = null;
let userLocationMarker = null;
let userLocation = null;
let pendingLatLng = null;
let selectedCategory = 'hidden gem';
let isAddMode = false;
let spotCardJustOpened = false;

function createMarkerIcon(color) {
  const svg = '<svg viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" class="custom-marker">' +
    '<path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="' + color + '"/>' +
    '<circle cx="18" cy="16" r="6" fill="white" opacity="0.9"/>' +
    '</svg>';
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    html: '<div class="user-marker"><div class="user-marker-pulse"></div><div class="user-marker-dot"></div></div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
  });
}

function init() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        initMap(userLocation.lat, userLocation.lng, true);
      },
      () => initMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false),
      { timeout: 5000 }
    );
  } else {
    initMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, false);
  }
}

async function initMap(centerLat, centerLng, showUserLocation) {
  map = L.map('map', { zoomControl: false }).setView([centerLat, centerLng], DEFAULT_ZOOM);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  if (showUserLocation && userLocation) {
    userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserLocationIcon()
    }).addTo(map);
  }

  await loadSpots();
  setupFilters();
  setupEventListeners();
}

async function loadSpots() {
  const res = await fetch('/api/spots');
  const data = await res.json();
  spots = data.spots || [];
  renderMarkers();
  updateEmptyState();
}

function renderMarkers() {
  if (markersLayer.length > 0) {
    markersLayer.forEach(m => map.removeLayer(m));
    markersLayer = [];
  }

  spots.forEach(spot => {
    if (activeFilter !== 'all' && spot.category !== activeFilter) return;

    const color = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
    const marker = L.marker([spot.lat, spot.lng], {
      icon: createMarkerIcon(color)
    });
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      showSpotCard(spot);
    });
    marker.addTo(map);
    markersLayer.push(marker);
  });
}

function updateEmptyState() {
  const emptyState = document.getElementById('empty-state');
  emptyState.style.display = spots.length === 0 && activeFilter === 'all' ? 'block' : 'none';
}

function setupFilters() {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.category;
      renderMarkers();
      updateEmptyState();
      closeSpotCard();
    });
  });
}

function setupEventListeners() {
  document.getElementById('add-btn').addEventListener('click', enterAddMode);
  document.getElementById('btn-cancel-add').addEventListener('click', exitAddMode);
  document.getElementById('btn-confirm-loc').addEventListener('click', confirmLocation);
  document.getElementById('close-card').addEventListener('click', closeSpotCard);
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('locate-btn').addEventListener('click', locateUser);

  document.querySelectorAll('.category-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedCategory = opt.dataset.category;
    });
  });

  document.getElementById('submit-btn').addEventListener('click', submitSpot);

  // Enable submit button when name has text
  document.getElementById('spot-name').addEventListener('input', () => {
    const btn = document.getElementById('submit-btn');
    btn.disabled = document.getElementById('spot-name').value.trim().length === 0;
  });

  // Close modal on overlay click
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Map click closes spot card (but not when clicking on markers)
  map.on('click', () => {
    if (!isAddMode && !spotCardJustOpened) closeSpotCard();
  });
}

function enterAddMode() {
  isAddMode = true;
  closeSpotCard();
  document.getElementById('crosshair').classList.add('active');
  document.getElementById('confirm-bar').classList.add('active');
  document.getElementById('add-btn').style.display = 'none';
  document.getElementById('locate-btn').style.display = 'none';
}

function exitAddMode() {
  isAddMode = false;
  document.getElementById('crosshair').classList.remove('active');
  document.getElementById('confirm-bar').classList.remove('active');
  document.getElementById('add-btn').style.display = 'flex';
  document.getElementById('locate-btn').style.display = 'flex';
}

function confirmLocation() {
  pendingLatLng = map.getCenter();
  openModal();
  exitAddMode();
}

function showSpotCard(spot) {
  if (isAddMode) return;

  currentSpot = spot;
  const card = document.getElementById('spot-card');
  document.getElementById('card-dot').style.background = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
  document.getElementById('card-title').textContent = spot.name;
  document.getElementById('card-story').textContent = spot.story || 'No story yet, but it\'s definitely worth a visit!';

  const date = new Date(spot.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('card-date').textContent = 'Added ' + date;

  const catEl = document.getElementById('card-category');
  catEl.textContent = CATEGORY_LABELS[spot.category] || 'Other';
  catEl.style.background = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
  catEl.style.color = spot.category === 'food' ? '#1A1A1A' : 'white';

  // Update directions link with current location as origin
  const directionsBtn = document.getElementById('direction-btn');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
  directionsBtn.href = directionsUrl;
  directionsBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  card.classList.add('visible');
  spotCardJustOpened = true;
  setTimeout(() => { spotCardJustOpened = false; }, 300);

  // Pan map slightly to accommodate sheet on mobile
  if (window.innerWidth < 768) {
    map.setView([spot.lat - 0.003, spot.lng], map.getZoom());
  }
}

function closeSpotCard() {
  document.getElementById('spot-card').classList.remove('visible');
  currentSpot = null;
}

function locateUser() {
  const btn = document.getElementById('locate-btn');

  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser');
    return;
  }

  btn.classList.add('locating');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      userLocation = { lat: latitude, lng: longitude };

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.marker([latitude, longitude], {
        icon: createUserLocationIcon()
      }).addTo(map);

      map.flyTo([latitude, longitude], 15, { duration: 1.5 });
      btn.classList.remove('locating');
    },
    (error) => {
      btn.classList.remove('locating');
      let message = 'Unable to retrieve your location';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Location access denied. Please enable location permissions.';
      }
      showToast(message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('spot-name').value = '';
  document.getElementById('spot-story').value = '';
  document.getElementById('submit-btn').disabled = true;
  selectedCategory = 'hidden gem';
  document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
  document.querySelector('.category-option[data-category="hidden gem"]').classList.add('selected');

  setTimeout(() => document.getElementById('spot-name').focus(), 300);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  pendingLatLng = null;
}

async function submitSpot() {
  if (!pendingLatLng || !document.getElementById('spot-name').value.trim()) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Dropping...';

  const lat = pendingLatLng.lat;
  const lng = pendingLatLng.lng;

  const res = await fetch('/api/spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('spot-name').value.trim(),
      story: document.getElementById('spot-story').value.trim(),
      lat: lat,
      lng: lng,
      category: selectedCategory
    })
  });

  if (res.ok) {
    const data = await res.json();
    spots.unshift(data.spot);
    renderMarkers();
    updateEmptyState();
    closeModal();
    map.flyTo([lat, lng], 16);
    showToast('Spot added successfully!');
  }

  btn.textContent = 'Drop the Pin';
  btn.disabled = false;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);