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

let map, modalMap, modalMarker;
let spots = [];
let markersLayer = [];
let selectedCategory = 'other';
let activeFilter = 'all';

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

function init() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => initMap(position.coords.latitude, position.coords.longitude),
      () => initMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng),
      { timeout: 5000 }
    );
  } else {
    initMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
  }
}

async function initMap(centerLat, centerLng) {
  map = L.map('map').setView([centerLat, centerLng], DEFAULT_ZOOM);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

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
    marker.on('click', () => showSpotCard(spot));
    marker.addTo(map);
    markersLayer.push(marker);
  });
}

function updateEmptyState() {
  const emptyState = document.getElementById('empty-state');
  emptyState.style.display = spots.length === 0 ? 'block' : 'none';
}

function setupFilters() {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.category;
      renderMarkers();
    });
  });
}

function setupEventListeners() {
  document.getElementById('add-btn').addEventListener('click', openModal);
  document.getElementById('close-card').addEventListener('click', closeSpotCard);
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', handleOverlayClick);
  document.getElementById('spot-name').addEventListener('input', updateSubmitBtn);

  document.querySelectorAll('.category-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedCategory = opt.dataset.category;
      if (modalMarker) {
        modalMarker.setIcon(createMarkerIcon(CATEGORY_COLORS[selectedCategory]));
      }
    });
  });

  document.getElementById('submit-btn').addEventListener('click', submitSpot);
}

function showSpotCard(spot) {
  const card = document.getElementById('spot-card');
  document.getElementById('card-dot').style.background = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
  document.getElementById('card-title').textContent = spot.name;
  document.getElementById('card-story').textContent = spot.story || 'No story yet, but it\'s definitely worth a visit!';
  document.getElementById('card-date').textContent = new Date(spot.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const catEl = document.getElementById('card-category');
  catEl.textContent = CATEGORY_LABELS[spot.category] || 'Other';
  catEl.style.background = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.other;
  catEl.style.color = spot.category === 'food' ? '#1A1A1A' : 'white';

  card.classList.add('visible');
}

function closeSpotCard() {
  document.getElementById('spot-card').classList.remove('visible');
}

function openModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('visible');

  if (!modalMap) {
    // Initialize map after modal becomes visible (300ms transition)
    setTimeout(() => {
      const mapCenter = map.getCenter();
      modalMap = L.map('modal-map', { clearOutline: false }).setView(
        [mapCenter.lat, mapCenter.lng],
        map.getZoom()
      );
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19
      }).addTo(modalMap);

      modalMap.on('click', (e) => {
        if (modalMarker) modalMap.removeLayer(modalMarker);
        modalMarker = L.marker(e.latlng, {
          icon: createMarkerIcon(CATEGORY_COLORS[selectedCategory]),
          draggable: true
        }).addTo(modalMap);
        modalMarker.on('dragend', updateSubmitBtn);
        updateSubmitBtn();
      });
    }, 350);
  } else {
    setTimeout(() => modalMap.invalidateSize(), 100);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible');
  if (modalMap) {
    modalMap.remove();
    modalMap = null;
    modalMarker = null;
  }
  document.getElementById('spot-name').value = '';
  document.getElementById('spot-story').value = '';
  document.getElementById('submit-btn').disabled = true;
  // Reset category selection
  selectedCategory = 'other';
  document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
  document.querySelector('.category-option[data-category="other"]')?.classList.add('selected');
}

function handleOverlayClick(e) {
  if (e.target === e.currentTarget) closeModal();
}

function updateSubmitBtn() {
  const nameInput = document.getElementById('spot-name');
  const btn = document.getElementById('submit-btn');
  if (!btn || !nameInput) return;
  
  const hasMarker = modalMarker && modalMap && modalMap.hasLayer(modalMarker);
  const hasName = nameInput.value.trim().length > 0;
  btn.disabled = !hasMarker || !hasName;
}

async function submitSpot() {
  if (!modalMarker || !document.getElementById('spot-name').value.trim()) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Dropping...';

  const latlng = modalMarker.getLatLng();
  const res = await fetch('/api/spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('spot-name').value.trim(),
      story: document.getElementById('spot-story').value.trim(),
      lat: latlng.lat,
      lng: latlng.lng,
      category: selectedCategory
    })
  });

  if (res.ok) {
    const data = await res.json();
    spots.unshift(data.spot);
    renderMarkers();
    updateEmptyState();
    closeModal();
    map.setView([latlng.lat, latlng.lng], 15);
  }

  btn.textContent = 'Drop the Pin';
  btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', init);
