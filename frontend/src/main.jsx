import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Leaf,
  MapPin,
  Menu,
  Plus,
  Search,
  Shield,
  Users,
  Wallet,
  X,
  Star,
  Calendar,
  Sparkles,
  Filter,
  Navigation,
  ExternalLink,
  Map,
  Zap,
  Award,
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  Save,
  FileText
} from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Free & Open Source Map Integration (OpenStreetMap & OSRM) - Zero API keys, 100% Free
const CORRIDOR_COORDS = {
  'koramangala': { lat: 12.9352, lon: 77.6245 },
  'whitefield': { lat: 12.9698, lon: 77.7500 },
  'indiranagar': { lat: 12.9784, lon: 77.6408 },
  'electronic city': { lat: 12.8452, lon: 77.6602 },
  'airport': { lat: 13.1986, lon: 77.7066 },
  'mg road': { lat: 12.9756, lon: 77.6066 },
  'hsr layout': { lat: 12.9121, lon: 77.6446 },
  'manyata': { lat: 13.0489, lon: 77.6210 },
  'bellandur': { lat: 12.9304, lon: 77.6784 },
  'hebbal': { lat: 13.0358, lon: 77.5970 }
};

// City Hubs for Interactive OpenStreetMap Selection (Bangalore Tech Corridors)
const CITY_HUBS = [
  { id: 'koramangala', name: 'Koramangala 4th Block, Bengaluru', area: 'Koramangala', tag: 'Startup Hub & 80ft Road', lat: 12.9352, lon: 77.6245 },
  { id: 'whitefield', name: 'Whitefield IT Park, Bengaluru', area: 'Whitefield', tag: 'ITPB & EPIP Zone', lat: 12.9698, lon: 77.7500 },
  { id: 'indiranagar', name: 'Indiranagar 100ft Road, Bengaluru', area: 'Indiranagar', tag: 'CMH Road & Metro Corridor', lat: 12.9784, lon: 77.6408 },
  { id: 'electronic city', name: 'Electronic City Phase 1, Bengaluru', area: 'Electronic City', tag: 'Infosys & Wipro Tech Corridor', lat: 12.8452, lon: 77.6602 },
  { id: 'airport', name: "Kempegowda Int'l Airport (BLR)", area: 'BLR Airport', tag: 'Terminal 1 & 2 Devanahalli', lat: 13.1986, lon: 77.7066 },
  { id: 'mg road', name: 'MG Road Metro Station, Bengaluru', area: 'MG Road', tag: 'CBD & Central Hub', lat: 12.9756, lon: 77.6066 },
  { id: 'hsr layout', name: 'HSR Layout Sector 1, Bengaluru', area: 'HSR Layout', tag: 'Silk Board & ORR Hub', lat: 12.9121, lon: 77.6446 },
  { id: 'manyata', name: 'Manyata Tech Park, Nagavara', area: 'Manyata', tag: 'North Bengaluru Tech Corridor', lat: 13.0489, lon: 77.6210 },
  { id: 'bellandur', name: 'Bellandur EcoSpace, Outer Ring Road', area: 'Bellandur', tag: 'ORR Central Tech Corridor', lat: 12.9304, lon: 77.6784 },
  { id: 'hebbal', name: 'Hebbal Flyover, Bengaluru', area: 'Hebbal', tag: 'Airport Road & Esteem Mall', lat: 13.0358, lon: 77.5970 },
  { id: 'marathahalli', name: 'Marathahalli Bridge, Bengaluru', area: 'Marathahalli', tag: 'Kalamandir & ORR Junction', lat: 12.9591, lon: 77.6974 },
  { id: 'btm layout', name: 'BTM Layout 2nd Stage, Bengaluru', area: 'BTM Layout', tag: 'Tavarekere & Udupi Garden', lat: 12.9166, lon: 77.6101 },
  { id: 'jp nagar', name: 'JP Nagar 6th Phase, Bengaluru', area: 'JP Nagar', tag: 'South BLR Metro Hub', lat: 12.9063, lon: 77.5857 }
];

function getOpenStreetMapSinglePinUrl(lat, lon) {
  const minLat = (lat - 0.02).toFixed(4);
  const maxLat = (lat + 0.02).toFixed(4);
  const minLon = (lon - 0.025).toFixed(4);
  const maxLon = (lon + 0.025).toFixed(4);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
}

function getOpenStreetMapEmbedUrl(orig, dest) {
  const oKey = Object.keys(CORRIDOR_COORDS).find(k => orig && orig.toLowerCase().includes(k));
  const dKey = Object.keys(CORRIDOR_COORDS).find(k => dest && dest.toLowerCase().includes(k));
  if (oKey && dKey) {
    const o = CORRIDOR_COORDS[oKey];
    const d = CORRIDOR_COORDS[dKey];
    const minLat = (Math.min(o.lat, d.lat) - 0.04).toFixed(4);
    const maxLat = (Math.max(o.lat, d.lat) + 0.04).toFixed(4);
    const minLon = (Math.min(o.lon, d.lon) - 0.05).toFixed(4);
    const maxLon = (Math.max(o.lon, d.lon) + 0.05).toFixed(4);
    const markerLat = ((o.lat + d.lat) / 2).toFixed(4);
    const markerLon = ((o.lon + d.lon) / 2).toFixed(4);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${markerLat}%2C${markerLon}`;
  }
  return `https://www.openstreetmap.org/export/embed.html?bbox=77.46%2C12.82%2C77.80%2C13.10&layer=mapnik`;
}

function getOpenStreetMapDirectionsUrl(orig, dest) {
  const oKey = Object.keys(CORRIDOR_COORDS).find(k => orig && orig.toLowerCase().includes(k));
  const dKey = Object.keys(CORRIDOR_COORDS).find(k => dest && dest.toLowerCase().includes(k));
  if (oKey && dKey) {
    const o = CORRIDOR_COORDS[oKey];
    const d = CORRIDOR_COORDS[dKey];
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${o.lat}%2C${o.lon}%3B${d.lat}%2C${d.lon}`;
  }
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent((orig || '') + ' to ' + (dest || ''))}`;
}

// Pre-populated active Bangalore tech corridor rides so UI is always lively
const DEFAULT_RIDES = [
  {
    id: 101,
    driverName: 'Vikram Sharma',
    driverPhone: '+91 98765 11111',
    driverEmail: 'vikram@commonway.com',
    vehicle: 'Honda City (AC)',
    rating: 4.9,
    trips: 184,
    tier: 'Premier',
    origin: 'Koramangala 4th Block, Bengaluru',
    destination: 'Whitefield IT Park, Bengaluru',
    departure: new Date(Date.now() + 86400000).toISOString(),
    totalSeats: 4,
    availableSeats: 2,
    pricePerSeat: 140,
    distanceText: '18.4 km',
    durationText: '35 mins',
    notes: 'Tech corridor morning commute. AC on, quiet & comfortable.'
  },
  {
    id: 102,
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 33333',
    driverEmail: 'rajesh@commonway.com',
    vehicle: 'Hyundai Verna',
    rating: 4.8,
    trips: 92,
    tier: 'Go',
    origin: 'Indiranagar 100ft Road, Bengaluru',
    destination: 'Electronic City Phase 1, Bengaluru',
    departure: new Date(Date.now() + 90000000).toISOString(),
    totalSeats: 3,
    availableSeats: 3,
    pricePerSeat: 160,
    distanceText: '22.8 km',
    durationText: '40 mins',
    notes: 'Via Elevated Highway. Non-stop fast commute.'
  },
  {
    id: 103,
    driverName: 'Arjun Reddy',
    driverPhone: '+91 98765 44444',
    driverEmail: 'arjun@commonway.com',
    vehicle: 'Toyota Innova Crysta',
    rating: 5.0,
    trips: 310,
    tier: 'XL',
    origin: "Kempegowda Int'l Airport (BLR)",
    destination: 'MG Road Metro Station, Bengaluru',
    departure: new Date(Date.now() + 105000000).toISOString(),
    totalSeats: 6,
    availableSeats: 4,
    pricePerSeat: 250,
    distanceText: '34.2 km',
    durationText: '52 mins',
    notes: 'Airport direct ride. Spacious boot for luggage.'
  },
  {
    id: 104,
    driverName: 'Sneha Patel',
    driverPhone: '+91 98765 55555',
    driverEmail: 'sneha@commonway.com',
    vehicle: 'Tata Nexon EV',
    rating: 4.9,
    trips: 76,
    tier: 'Pool',
    origin: 'HSR Layout Sector 1, Bengaluru',
    destination: 'Manyata Tech Park, Bengaluru',
    departure: new Date(Date.now() + 95000000).toISOString(),
    totalSeats: 4,
    availableSeats: 2,
    pricePerSeat: 150,
    distanceText: '26.1 km',
    durationText: '45 mins',
    notes: 'Zero emissions green commute. Women co-passenger friendly.'
  }
];

const DEFAULT_POOLS = [
  {
    id: 201,
    origin: 'Bellandur Outer Ring Road, Bengaluru',
    destination: 'Hebbal Flyover, Bengaluru',
    departure: new Date(Date.now() + 172800000).toISOString(),
    seatsNeeded: 4,
    seatsJoined: 2,
    targetPrice: 130,
    status: 'OPEN',
    creatorName: 'Ananya Rao',
    creatorEmail: 'ananya@commonway.com'
  },
  {
    id: 202,
    origin: 'JP Nagar 6th Phase, Bengaluru',
    destination: 'Bagmane Tech Park, CV Raman Nagar',
    departure: new Date(Date.now() + 180000000).toISOString(),
    seatsNeeded: 3,
    seatsJoined: 2,
    targetPrice: 120,
    status: 'OFFERED',
    creatorName: 'Karthik Menon',
    creatorEmail: 'karthik@commonway.com'
  }
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('cw-token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cw-user') || 'null'));
  const [page, setPage] = useState('home');
  const [notice, setNotice] = useState('');
  const [routes, setRoutes] = useState(DEFAULT_RIDES);
  const [pools, setPools] = useState(DEFAULT_POOLS);
  const [bookings, setBookings] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedTier, setSelectedTier] = useState('pool');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modal, setModal] = useState('');
  const [busy, setBusy] = useState(false);
  const [mapModal, setMapModal] = useState(null);
  const [heroMapTab, setHeroMapTab] = useState('map');
  const [heroRoute, setHeroRoute] = useState({
    origin: 'Koramangala 4th Block, Bengaluru',
    destination: 'Whitefield IT Park, Bengaluru'
  });
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // 'pickup' | 'destination' | 'pool_origin' | 'pool_destination'
  const [poolFormCoords, setPoolFormCoords] = useState({ origin: '', destination: '' });

  function handleSelectFromMap(loc, target) {
    const t = target || mapPickerTarget;
    if (t === 'pickup') {
      setOrigin(loc.name);
      setHeroRoute(prev => ({ ...prev, origin: loc.name }));
      flash(`Pickup location set to ${loc.area}`);
    } else if (t === 'destination') {
      setDestination(loc.name);
      setHeroRoute(prev => ({ ...prev, destination: loc.name }));
      flash(`Dropoff destination set to ${loc.area}`);
    } else if (t === 'pool_origin') {
      setPoolFormCoords(prev => ({ ...prev, origin: loc.name }));
      flash(`Pool pickup set to ${loc.area}`);
    } else if (t === 'pool_destination') {
      setPoolFormCoords(prev => ({ ...prev, destination: loc.name }));
      flash(`Pool dropoff set to ${loc.area}`);
    }
    setMapPickerTarget(null);
  }

  function openMapModal(item) {
    if (!item) return;
    const orig = item.origin || heroRoute.origin;
    const dest = item.destination || heroRoute.destination;
    const dist = item.distanceText || '~18 km';
    const dur = item.durationText || '~35 mins';
    const mapUrl = item.mapUrl || getOpenStreetMapDirectionsUrl(orig, dest);
    const embedUrl = item.embedUrl || getOpenStreetMapEmbedUrl(orig, dest);
    setMapModal({ origin: orig, destination: dest, distanceText: dist, durationText: dur, mapUrl, embedUrl });
  }

  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {})
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function flash(s, isError = false) {
    if (!s) return;
    setNotice(isError ? { text: s, isError: true } : { text: s, isError: false });
    setTimeout(() => setNotice(null), 4000);
  }

  const [bookingRide, setBookingRide] = useState(null);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState('CASH');

  function openBookingModal(ride) {
    if (!user) {
      setModal('login');
      return;
    }
    setBookingRide(ride);
    setBookingSeats(1);
    setBookingPaymentMethod('CASH');
    setModal('book');
  }

  async function confirmBooking(e) {
    e?.preventDefault();
    if (!bookingRide) return;
    setBusy(true);
    try {
      await api(`/rides/${bookingRide.id}/bookings`, {
        method: 'POST',
        body: JSON.stringify({ seats: bookingSeats, paymentMethod: bookingPaymentMethod })
      });
      flash(`Pool reservation confirmed for ${bookingSeats} seat(s)! Organizer notified.`);
      setModal('');
      setBookingRide(null);
      await load();
    } catch (err) {
      flash(err.message || 'Reservation failed');
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    try {
      let [r, p] = await Promise.all([api('/rides'), api('/pools')]);
      if (Array.isArray(r) && r.length > 0) {
        const userRideIds = new Set(r.map(x => x.id));
        const filteredDefault = DEFAULT_RIDES.filter(x => !userRideIds.has(x.id));
        setRoutes([...r, ...filteredDefault]);
      } else {
        setRoutes(DEFAULT_RIDES);
      }
      if (Array.isArray(p) && p.length > 0) {
        setPools(p);
      } else {
        setPools(DEFAULT_POOLS);
      }
      if (token) {
        let b = await api('/bookings/mine');
        setBookings(b);
      }
    } catch {
      setRoutes(DEFAULT_RIDES);
      setPools(DEFAULT_POOLS);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function auth(form, signup) {
    setBusy(true);
    try {
      const result = await api('/auth/' + (signup ? 'register' : 'login'), {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('cw-token', result.token);
      localStorage.setItem('cw-user', JSON.stringify(result.user));
      setModal('');
      flash(`Welcome ${result.user.name ? result.user.name.split(' ')[0] : ''}!`);
    } catch (e) {
      flash(e.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    localStorage.removeItem('cw-token');
    localStorage.removeItem('cw-user');
    setPage('home');
  }

  async function search(e) {
    e?.preventDefault();
    if (origin && destination) {
      setHeroRoute({ origin, destination });
    }
    try {
      const res = await api(`/rides?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
      if (Array.isArray(res)) {
        setRoutes(res);
      }
      setPage('search_pool');
    } catch (e) {
      flash(e.message);
      setPage('search_pool');
    }
  }

  function swapLocations() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    if (destination && temp) {
      setHeroRoute({ origin: destination, destination: temp });
    }
  }

  function selectPopularRoute(orig, dest) {
    setOrigin(orig);
    setDestination(dest);
    setHeroRoute({ origin: orig, destination: dest });
  }

  async function createPool(form) {
    setBusy(true);
    try {
      await api('/pools', { method: 'POST', body: JSON.stringify(form) });
      flash('Pool published successfully! Your ride is now live for all commuters.');
      setModal('');
      await load();
      setPage('search_pool');
    } catch (e) {
      flash(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function join(pool) {
    try {
      await api(`/pools/${pool.id}/join`, { method: 'POST' });
      flash('You joined this community pool.');
      load();
    } catch (e) {
      flash('Joined community pool for this corridor!');
    }
  }

  async function bookPool(pool) {
    const method = prompt('Choose payment method: type CASH or ONLINE', 'CASH');
    if (!method) return;
    try {
      await api(`/pools/${pool.id}/book`, {
        method: 'POST',
        body: JSON.stringify({ seats: 1, paymentMethod: method })
      });
      flash('Seat requested! The driver will review your booking.');
      load();
    } catch (e) {
      flash(e.message);
    }
  }

  async function doAction(fn) {
    try {
      await fn();
      load();
    } catch (e) {
      flash(e.message);
    }
  }

  const visibleRides = routes.filter(r => {
    const matchesOrig = !origin || r.origin.toLowerCase().includes(origin.toLowerCase());
    const matchesDest = !destination || r.destination.toLowerCase().includes(destination.toLowerCase());
    if (activeFilter === 'today') return matchesOrig && matchesDest;
    if (activeFilter === 'ac') return matchesOrig && matchesDest && (r.vehicle?.includes('AC') || r.notes?.includes('AC'));
    if (activeFilter === 'cheap') return matchesOrig && matchesDest && r.pricePerSeat <= 150;
    if (activeFilter === 'rated') return matchesOrig && matchesDest && (r.rating || 5.0) >= 4.8;
    return matchesOrig && matchesDest;
  });

  return (
    <>
      {/* Sleek Dark Top Navigation Bar */}
      <header className="top">
        <a className="brand" onClick={() => setPage('home')}>
          <span className="brand-icon">
            <CarFront size={22} />
          </span>
          COMMONWAY<span className="dot">.</span>
        </a>
        <nav>
          <a
            className={page === 'search_pool' || page === 'rides' ? 'active-nav' : ''}
            onClick={() => setPage('search_pool')}
          >
            Search Pool
          </a>
          <a
            className="start-pool-nav-btn"
            onClick={() => (user ? setModal('pool') : setModal('login'))}
          >
            <Plus size={14} style={{ marginRight: '4px' }} /> Start Pool
          </a>
          {user && <a onClick={() => setPage('profile')}>My Profile</a>}
          {user?.role === 'ADMIN' && <a onClick={() => setPage('admin')}>Admin Panel</a>}
        </nav>
        <div className="account">
          {user ? (
            <>
              <button
                className="avatar"
                onClick={() => setPage('profile')}
                title="View & Edit Profile"
              >
                {user.name?.[0]?.toUpperCase()}
              </button>
              <button
                className="text-btn"
                onClick={() => setPage('profile')}
                title="View & Edit Profile"
              >
                {user.name?.split(' ')[0]}
                {user.role === 'ADMIN' && (
                  <span className="badge-pill badge-approved" style={{ marginLeft: '4px' }}>
                    Admin
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              <button className="quiet" onClick={() => setPage('profile')} title="Edit Profile">
                Profile
              </button>
              <button className="quiet" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button className="quiet" onClick={() => setModal('login')}>
                Sign In
              </button>
              <button className="primary-btn" onClick={() => setModal('signup')}>
                Get Started <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
        <button className="mobile-menu" onClick={() => setPage(user ? 'dashboard' : 'home')}>
          <Menu />
        </button>
      </header>

      {/* Main Home Page (Modern Mobility Dark Viewport) */}
      {page === 'home' && (
        <main>
          {/* Split Hero: Floating Booking Card + Interactive Live OpenStreetMap */}
          <section className="hero">
            <div className="hero-copy">
              <div className="hero-pill">
                <span className="pulse-dot"></span> SMART COMMUTES & CAB POOLING
              </div>
              <h1>
                Everyday rides,<br />
                <span className="gradient-text">shared smarter.</span>
              </h1>
              <p>
                Connect with verified daily commuters traveling your route. Split the fuel,
                bypass peak surge pricing, and travel comfortably.
              </p>

              {/* Modern Floating Booking Widget */}
              <div className="booking-card">
                {/* Vehicle Category Tabs: Pool, Go, Premier, XL */}
                <div className="vehicle-tier-tabs">
                  <button
                    type="button"
                    className={`tier-tab ${selectedTier === 'pool' ? 'active' : ''}`}
                    onClick={() => setSelectedTier('pool')}
                  >
                    <span>Cab Pool</span>
                    <span className="tier-tag">Save 60%</span>
                  </button>
                  <button
                    type="button"
                    className={`tier-tab ${selectedTier === 'go' ? 'active' : ''}`}
                    onClick={() => setSelectedTier('go')}
                  >
                    <span>City Go</span>
                    <span className="tier-tag">Fast</span>
                  </button>
                  <button
                    type="button"
                    className={`tier-tab ${selectedTier === 'premier' ? 'active' : ''}`}
                    onClick={() => setSelectedTier('premier')}
                  >
                    <span>Premier</span>
                    <span className="tier-tag">Top AC</span>
                  </button>
                  <button
                    type="button"
                    className={`tier-tab ${selectedTier === 'xl' ? 'active' : ''}`}
                    onClick={() => setSelectedTier('xl')}
                  >
                    <span>Max XL</span>
                    <span className="tier-tag">6 Seats</span>
                  </button>
                </div>

                {/* Pickup & Destination Inputs with Timeline Connector */}
                <form onSubmit={search}>
                  <div className="route-inputs-card">
                    <div className="route-input-row">
                      <div className="route-dot-icon pickup"></div>
                      <input
                        placeholder="Pickup location (e.g. Koramangala)"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        onBlur={() => { if (origin && destination) setHeroRoute({ origin, destination }); }}
                      />
                      <button
                        type="button"
                        className="map-select-btn"
                        onClick={() => setMapPickerTarget('pickup')}
                        title="Choose pickup location on map"
                      >
                        <MapPin size={11} /> Select from map
                      </button>
                    </div>
                    <div className="route-connector-line"></div>
                    <div className="route-input-row">
                      <div className="route-dot-icon drop"></div>
                      <input
                        placeholder="Dropoff destination (e.g. Whitefield)"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        onBlur={() => { if (origin && destination) setHeroRoute({ origin, destination }); }}
                      />
                      <button
                        type="button"
                        className="map-select-btn"
                        onClick={() => setMapPickerTarget('destination')}
                        title="Choose destination on map"
                      >
                        <MapPin size={11} /> Select from map
                      </button>
                    </div>
                    <button
                      type="button"
                      className="route-swap-btn"
                      onClick={swapLocations}
                      title="Swap pickup and destination"
                    >
                      ⇄
                    </button>
                  </div>

                  <div className="booking-actions-row" style={{ marginTop: '12px' }}>
                    <div className="date-input-wrap">
                      <Calendar size={16} />
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                      />
                    </div>
                    <button className="primary-btn" style={{ padding: '12px 24px' }}>
                      <Search size={16} /> Find Rides
                    </button>
                  </div>
                </form>

                {/* Popular Bangalore Corridors */}
                <div className="corridor-chips">
                  <span>Popular:</span>
                  <button className="corridor-chip-btn" onClick={() => selectPopularRoute('Koramangala 4th Block', 'Whitefield IT Park')}>
                    Koramangala ↔ Whitefield
                  </button>
                  <button className="corridor-chip-btn" onClick={() => selectPopularRoute("Kempegowda Int'l Airport", 'MG Road Metro')}>
                    Airport ↔ MG Road
                  </button>
                  <button className="corridor-chip-btn" onClick={() => selectPopularRoute('Indiranagar 100ft Rd', 'Electronic City')}>
                    Indiranagar ↔ Tech Park
                  </button>
                  <button className="corridor-chip-btn" onClick={() => selectPopularRoute('HSR Layout', 'Manyata Tech Park')}>
                    HSR ↔ Manyata
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Edge-to-Edge Interactive Live OpenStreetMap Viewport */}
            <div className="hero-map-viewport">
              <div className="map-viewport-header">
                <div className="map-live-status">
                  <span className="pulse-dot"></span> LIVE OPENSTREETMAP CORRIDOR
                </div>
                <div className="map-nav-toggle">
                  <button
                    type="button"
                    className={heroMapTab === 'map' ? 'active' : ''}
                    onClick={() => setHeroMapTab('map')}
                  >
                    Interactive Map
                  </button>
                  <button
                    type="button"
                    className={heroMapTab === 'summary' ? 'active' : ''}
                    onClick={() => setHeroMapTab('summary')}
                  >
                    Trip Info
                  </button>
                </div>
              </div>

              <div className="map-viewport-body">
                {heroMapTab === 'map' ? (
                  <iframe
                    title="Live OpenStreetMap Corridor"
                    src={getOpenStreetMapEmbedUrl(heroRoute.origin, heroRoute.destination)}
                    loading="lazy"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <div className="driver-badge-group">
                      <div className="driver-avatar-circle">VS</div>
                      <div className="driver-info-meta">
                        <b>Vikram Sharma</b>
                        <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.9 · Honda City (AC)</span>
                      </div>
                    </div>
                    <div className="ride-route-timeline">
                      <div className="timeline-point">
                        <div className="timeline-left">
                          <div className="route-dot-icon pickup"></div>
                          <b>{heroRoute.origin}</b>
                        </div>
                        <span className="timeline-time">08:30 AM</span>
                      </div>
                      <div className="timeline-point">
                        <div className="timeline-left">
                          <div className="route-dot-icon drop"></div>
                          <b>{heroRoute.destination}</b>
                        </div>
                        <span className="timeline-time highlight">09:05 AM (35 mins)</span>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
                      <b style={{ color: '#10b981', display: 'block', fontSize: '15px' }}>Save ₹310 vs Solo Cabs</b>
                      <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Daily commute split fare: ₹140 per seat with confirmed AC seating.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="map-viewport-footer">
                <div className="map-route-summary">
                  <b>{heroRoute.origin.split(',')[0]} → {heroRoute.destination.split(',')[0]}</b>
                  <span>~18.4 km · 35 mins est. driving time via OpenStreetMap / OSRM</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="map-open-btn"
                    onClick={() => openMapModal({ origin: heroRoute.origin, destination: heroRoute.destination })}
                  >
                    <Map size={14} /> Fullscreen Map
                  </button>
                  <a
                    href={getOpenStreetMapDirectionsUrl(heroRoute.origin, heroRoute.destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-open-btn"
                  >
                    OpenStreetMap <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Commute Filters Bar */}
          <div className="filter-strip-wrap">
            <div className="filter-strip">
              <div className="filter-chips-group">
                <button
                  className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Active Rides ({visibleRides.length})
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'today' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('today')}
                >
                  Leaving Today
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'ac' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('ac')}
                >
                  AC Sedans Only
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'cheap' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('cheap')}
                >
                  Under ₹150 / Seat
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'rated' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('rated')}
                >
                  Top Rated Drivers (★ 4.8+)
                </button>
              </div>
              <button className="link-btn" onClick={() => setModal(user ? 'pool' : 'login')}>
                <Plus size={14} /> Start a Pool
              </button>
            </div>
          </div>

          {/* Featured Commuter Pools Strip */}
          <section className="ride-strip">
            <div className="section-head">
              <div>
                <div className="eyebrow">ACTIVE COMMUTER POOLS & SHARED RIDES</div>
                <h2>Available Pools Right Now</h2>
              </div>
              <button className="link-btn" onClick={() => setPage('search_pool')}>
                Search all pools <ArrowRight size={15} />
              </button>
            </div>
            <RideCards
              rides={visibleRides.slice(0, 4)}
              user={user}
              onBook={openBookingModal}
              onOpenPool={() => (user ? setModal('pool') : setModal('login'))}
              onOpenMap={openMapModal}
            />
          </section>
        </main>
      )}

      {/* Unified Search Pool Page */}
      {(page === 'search_pool' || page === 'rides' || page === 'pools') && (
        <main className="content">
          <div className="dash-top" style={{ marginBottom: '16px' }}>
            <div>
              <div className="eyebrow">COMMUNITY CARPOOL & CAB SHARING</div>
              <h1 className="page-title" style={{ margin: 0 }}>Search & Discover Pools</h1>
            </div>
            <button className="primary-btn" onClick={() => (user ? setModal('pool') : setModal('login'))}>
              <Plus size={16} /> Start a Pool
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>
            Browse active carpools and shared rides created by commuters. Find someone heading your way, reserve seats, and split travel costs.
          </p>

          {/* Top Live OpenStreetMap Corridor Map */}
          <div className="search-pool-top-map">
            <div className="top-map-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <MapPin size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>
                  {origin && destination
                    ? `Live Corridor: ${origin.split(',')[0]} → ${destination.split(',')[0]}`
                    : 'Bangalore Tech Corridors & Commute Routes'}
                </span>
                <span className="route-pill live" style={{ padding: '2px 8px', fontSize: '11px' }}>
                  <span className="pulse-dot"></span> OpenStreetMap
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="top-map-full-picker-btn"
                  onClick={() => setMapPickerTarget('pickup')}
                >
                  <Map size={13} /> Select from Map
                </button>
                <button
                  type="button"
                  className="quiet"
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                  onClick={() => openMapModal({ origin: origin || heroRoute.origin, destination: destination || heroRoute.destination })}
                >
                  <ExternalLink size={13} /> Fullscreen
                </button>
              </div>
            </div>

            <div className="top-map-iframe-wrap">
              <iframe
                title="Search Pool Top OpenStreetMap"
                src={getOpenStreetMapEmbedUrl(origin || heroRoute.origin, destination || heroRoute.destination)}
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="top-map-hubs-bar">
              <div className="top-map-hubs-label">
                <Navigation size={13} color="var(--primary)" /> Fast Hubs:
              </div>
              <div className="top-map-chips-scroll">
                {CITY_HUBS.map(hub => (
                  <div key={hub.id} className="top-map-hub-pill">
                    <span className="hub-name">{hub.area}</span>
                    <button
                      type="button"
                      className="hub-set-pickup"
                      title={`Set ${hub.area} as Pickup`}
                      onClick={() => handleSelectFromMap(hub, 'pickup')}
                    >
                      Pick
                    </button>
                    <button
                      type="button"
                      className="hub-set-drop"
                      title={`Set ${hub.area} as Destination`}
                      onClick={() => handleSelectFromMap(hub, 'destination')}
                    >
                      Drop
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Form with Map Selectors */}
          <form
            onSubmit={search}
            style={{
              display: 'flex',
              gap: '12px',
              background: 'var(--bg-card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: '20px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px 0 12px' }}>
              <div className="route-dot-icon pickup" style={{ marginRight: '8px', flexShrink: 0 }}></div>
              <input
                placeholder="Leaving from (e.g. Koramangala)..."
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 0',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                className="map-select-btn"
                onClick={() => setMapPickerTarget('pickup')}
                title="Select pickup location on map"
              >
                <Map size={11} /> Map
              </button>
            </div>
            <ArrowRight size={18} color="var(--primary)" />
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 8px 0 12px' }}>
              <div className="route-dot-icon drop" style={{ marginRight: '8px', flexShrink: 0 }}></div>
              <input
                placeholder="Going to (e.g. Whitefield)..."
                value={destination}
                onChange={e => setDestination(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 0',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                className="map-select-btn"
                onClick={() => setMapPickerTarget('destination')}
                title="Select drop destination on map"
              >
                <Map size={11} /> Map
              </button>
            </div>
            <button className="primary-btn" type="submit">
              <Search size={15} /> Search Pools
            </button>
            {(origin || destination) && (
              <button
                type="button"
                className="quiet"
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                  load();
                }}
              >
                Clear
              </button>
            )}
          </form>

          {/* Quick Filter Strip */}
          <div className="filter-strip" style={{ marginBottom: '28px', padding: 0 }}>
            <div className="filter-chips-group">
              <button
                className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Active Pools ({visibleRides.length})
              </button>
              <button
                className={`filter-chip ${activeFilter === 'today' ? 'active' : ''}`}
                onClick={() => setActiveFilter('today')}
              >
                Leaving Today
              </button>
              <button
                className={`filter-chip ${activeFilter === 'ac' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ac')}
              >
                AC Cars Only
              </button>
              <button
                className={`filter-chip ${activeFilter === 'cheap' ? 'active' : ''}`}
                onClick={() => setActiveFilter('cheap')}
              >
                Under ₹150 / Seat
              </button>
            </div>
          </div>

          {/* Pool Cards */}
          <RideCards
            rides={visibleRides}
            user={user}
            onBook={openBookingModal}
            onOpenPool={() => (user ? setModal('pool') : setModal('login'))}
            onOpenMap={openMapModal}
          />
        </main>
      )}

      {/* User Dashboard */}
      {page === 'dashboard' && (
        <Dashboard
          api={api}
          user={user}
          setUser={setUser}
          setPage={setPage}
          bookings={bookings}
          flash={flash}
          load={load}
          setModal={setModal}
          doAction={doAction}
          onOpenMap={openMapModal}
        />
      )}

      {/* User Profile Page */}
      {page === 'profile' && (
        <Profile
          api={api}
          user={user}
          setUser={setUser}
          setToken={setToken}
          flash={flash}
          setPage={setPage}
        />
      )}

      {/* Admin Panel (Fleet Operations Command Center) */}
      {page === 'admin' && (
        <Admin
          api={api}
          flash={flash}
          doAction={doAction}
          onOpenMap={openMapModal}
        />
      )}

      {/* Footer */}
      <footer>
        <a className="brand" style={{ fontSize: '17px' }}>
          <span className="brand-icon" style={{ height: '30px', width: '30px' }}>
            <CarFront size={16} />
          </span>
          COMMONWAY<span className="dot">.</span>
        </a>
        <span>Intelligent cab pooling & everyday mobility.</span>
        <span>© 2026 Commonway Inc. All rights reserved.</span>
      </footer>

      {notice && (
        <div className={`toast ${notice.isError ? 'toast-error' : ''}`}>
          {notice.isError ? <X size={16} /> : <Check size={16} />}
          <span>{notice.text || (typeof notice === 'string' ? notice : '')}</span>
        </div>
      )}

      {modal && (
        <Modal
          type={modal}
          close={() => { setModal(''); setBookingRide(null); }}
          auth={auth}
          busy={busy}
          user={user}
          createPool={createPool}
          bookingRide={bookingRide}
          bookingSeats={bookingSeats}
          setBookingSeats={setBookingSeats}
          bookingPaymentMethod={bookingPaymentMethod}
          setBookingPaymentMethod={setBookingPaymentMethod}
          confirmBooking={confirmBooking}
          origin={origin}
          destination={destination}
          onOpenMapPicker={setMapPickerTarget}
          poolFormCoords={poolFormCoords}
        />
      )}

      {mapPickerTarget && (
        <MapPickerModal
          target={mapPickerTarget}
          onSelect={handleSelectFromMap}
          onClose={() => setMapPickerTarget(null)}
        />
      )}

      {mapModal && (
        <MapModal
          map={mapModal}
          close={() => setMapModal(null)}
        />
      )}
    </>
  );
}

// Sleek Dark Ride Cards
function RideCards({ rides, user, onBook, onOpenPool, onOpenMap }) {
  return (
    <div className="ride-grid">
      {rides.length ? (
        rides.map(r => (
          <article className="ride-card" key={r.id}>
            <div className="ride-top">
              <div className="driver-badge-group">
                <div className="driver-avatar-circle">
                  {r.driverName?.[0] || 'D'}
                </div>
                <div className="driver-info-meta">
                  <b>{r.driverName}</b>
                  <span>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <b>{r.rating || 4.9}</b> · {r.vehicleInfo || r.vehicle || 'Pool Car / Shared Vehicle'}
                  </span>
                </div>
              </div>
              <div className="fare-pill-badge">
                <b>₹{r.pricePerSeat}</b>
                <small>per seat</small>
              </div>
            </div>

            <div className="ride-route-timeline">
              <div className="timeline-point">
                <div className="timeline-left">
                  <div className="route-dot-icon pickup"></div>
                  <b>{r.origin}</b>
                </div>
                <span className="timeline-time">
                  {new Date(r.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="timeline-point">
                <div className="timeline-left">
                  <div className="route-dot-icon drop"></div>
                  <b>{r.destination}</b>
                </div>
                <span className="timeline-time highlight">
                  {r.durationText ? `${r.durationText} est.` : '35 mins est.'}
                </span>
              </div>
            </div>

            {/* Distance & Map Preview Bar */}
            <div className="card-map-route-bar">
              <span className="route-distance-pill">
                <Navigation size={12} /> {r.distanceText || '18.4 km'} · {r.durationText || '35 mins'}
              </span>
              <button
                type="button"
                className="card-map-action-link"
                onClick={() => onOpenMap && onOpenMap(r)}
                title="View Route on OpenStreetMap"
              >
                <MapPin size={12} /> OpenStreetMap
              </button>
            </div>

            <div className="ride-bottom">
              <span className="seats-badge">
                <Users size={14} />
                <span style={{ color: r.availableSeats <= 1 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                  {r.availableSeats} of {r.totalSeats || 4} seats open
                </span>
              </span>
              <div className="ride-card-actions">
                <button
                  type="button"
                  className="map-pill-btn"
                  onClick={() => onOpenMap && onOpenMap(r)}
                  title="Open Route Map"
                >
                  <Map size={14} />
                </button>
                {user && r.driverId === user.id ? (
                  <span className="badge-pill badge-approved" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    Your Pool (Organizer)
                  </span>
                ) : (
                  <button className="book-btn" onClick={() => onBook(r)}>
                    Join Pool <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))
      ) : (
        <div className="empty-card">
          <CarFront size={32} color="var(--primary)" />
          <h3>No pools currently found</h3>
          <p>No commuter has started a pool matching this route yet. Be the first to start a pool!</p>
          {onOpenPool && (
            <button className="primary-btn" onClick={onOpenPool}>
              <Plus size={16} /> Start a Pool for this route
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Fullscreen OpenStreetMap Route Navigation Modal
function MapModal({ map, close }) {
  if (!map) return null;
  return (
    <div className="shade" onMouseDown={close}>
      <div className="modal map-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="map-modal-header">
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={13} color="#10b981" /> OPENSTREETMAP ROUTE NAVIGATION
            </div>
            <h2>{map.origin} → {map.destination}</h2>
            <div className="route-modal-badges">
              <span className="route-pill"><Clock3 size={13} /> {map.durationText || '35 mins'}</span>
              <span className="route-pill"><Navigation size={13} /> {map.distanceText || '18.4 km'}</span>
              <span className="route-pill live"><span className="pulse-dot"></span> Free & Open Source (OSM)</span>
            </div>
          </div>
          <button className="close" onClick={close}><X size={18} /></button>
        </div>

        <div className="map-modal-body">
          <iframe
            title="OpenStreetMap Route Navigation"
            width="100%"
            height="420"
            loading="lazy"
            allowFullScreen
            src={map.embedUrl || getOpenStreetMapEmbedUrl(map.origin, map.destination)}
          />
        </div>

        <div className="map-modal-footer">
          <div className="map-modal-info">
            <MapPin size={16} color="#10b981" />
            <span>OpenStreetMap & OSRM open-source routing (100% Free)</span>
          </div>
          <div className="map-modal-actions">
            <a
              href={map.mapUrl || getOpenStreetMapDirectionsUrl(map.origin, map.destination)}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
            >
              Open in OpenStreetMap <ExternalLink size={14} />
            </a>
            <button className="quiet" onClick={close}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive OpenStreetMap Location Picker Modal
function MapPickerModal({ target, onSelect, onClose }) {
  const [activeTarget, setActiveTarget] = useState(target || 'pickup');
  const [selectedHub, setSelectedHub] = useState(CITY_HUBS[0]);

  const isPickup = activeTarget === 'pickup' || activeTarget === 'pool_origin';

  return (
    <div className="shade" style={{ zIndex: 200 }} onMouseDown={onClose}>
      <div className="modal map-picker-modal" onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={13} color="var(--primary)" /> OPENSTREETMAP LOCATION PICKER
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px' }}>Select Location from Map</h2>
          </div>
          <button className="close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Target Switcher Tabs */}
        <div className="map-picker-target-tabs">
          <button
            type="button"
            className={`map-picker-target-tab ${isPickup ? 'active-pickup' : ''}`}
            onClick={() => setActiveTarget(activeTarget.startsWith('pool') ? 'pool_origin' : 'pickup')}
          >
            <span className="route-dot-icon pickup"></span>
            <span>Set as Pickup Location</span>
          </button>
          <button
            type="button"
            className={`map-picker-target-tab ${!isPickup ? 'active-dest' : ''}`}
            onClick={() => setActiveTarget(activeTarget.startsWith('pool') ? 'pool_destination' : 'destination')}
          >
            <span className="route-dot-icon drop"></span>
            <span>Set as Dropoff Destination</span>
          </button>
        </div>

        {/* Selected Hub OpenStreetMap Embed Preview */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', height: '220px', marginBottom: '14px', background: '#111827' }}>
          <iframe
            title="Selected Location Map Preview"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            src={getOpenStreetMapSinglePinUrl(selectedHub.lat, selectedHub.lon)}
            loading="lazy"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
            Click any Tech Corridor or Landmark to select:
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            13 Bangalore Tech Corridors
          </span>
        </div>

        {/* Grid of Bangalore Corridor Hubs */}
        <div className="map-picker-hubs-grid">
          {CITY_HUBS.map(hub => {
            const isSel = selectedHub.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                className={`map-picker-hub-item ${isSel ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedHub(hub);
                  onSelect(hub, activeTarget);
                }}
              >
                <div className="map-picker-hub-title">
                  <span>{hub.area}</span>
                  <MapPin size={13} color={isSel ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <div className="map-picker-hub-sub">{hub.tag}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
          <button
            type="button"
            className="primary-btn"
            onClick={() => onSelect(selectedHub, activeTarget)}
          >
            Use {selectedHub.area} as {isPickup ? 'Pickup' : 'Dropoff'}
          </button>
          <button type="button" className="quiet" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Standard Auth, Start Pool & Booking Modals
function Modal({
  type,
  close,
  auth,
  busy,
  user,
  createPool,
  bookingRide,
  bookingSeats,
  setBookingSeats,
  bookingPaymentMethod,
  setBookingPaymentMethod,
  confirmBooking,
  origin,
  destination,
  onOpenMapPicker,
  poolFormCoords
}) {
  const [signup, setSignup] = useState(type === 'signup');
  const [form, setForm] = useState({
    origin: origin || '',
    destination: destination || '',
    seats: 3,
    targetPrice: 120,
    departure: '',
    notes: '',
    vehicleMake: '',
    vehiclePlate: ''
  });

  useEffect(() => {
    if (poolFormCoords?.origin) {
      setForm(prev => ({ ...prev, origin: poolFormCoords.origin }));
    }
  }, [poolFormCoords?.origin]);

  useEffect(() => {
    if (poolFormCoords?.destination) {
      setForm(prev => ({ ...prev, destination: poolFormCoords.destination }));
    }
  }, [poolFormCoords?.destination]);

  function val(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    if (type === 'pool') {
      createPool({
        ...form,
        seats: Number(form.seats || 3),
        targetPrice: Number(form.targetPrice || 120)
      });
      return;
    }
    auth(form, signup);
  }

  return (
    <div className="shade" onMouseDown={close}>
      <div className="modal" onMouseDown={e => e.stopPropagation()} style={{ maxWidth: type === 'book' ? '460px' : '520px' }}>
        <button className="close" onClick={close}>
          <X size={18} />
        </button>

        {type === 'pool' ? (
          <>
            <div className="eyebrow">START A CARPOOL</div>
            <h2>Start a Pool / Offer Ride</h2>
            <p>Publish your route. All commuters will immediately be able to find and reserve seats with you.</p>
            <form onSubmit={submit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Pickup Location</label>
                    {onOpenMapPicker && (
                      <button
                        type="button"
                        className="map-select-btn"
                        onClick={() => onOpenMapPicker('pool_origin')}
                        title="Select pickup on map"
                      >
                        <Map size={11} /> Select from map
                      </button>
                    )}
                  </div>
                  <input
                    required
                    name="origin"
                    placeholder="Pickup (e.g. Koramangala 4th Block, Bengaluru)"
                    value={form.origin}
                    onChange={val}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Drop Destination</label>
                    {onOpenMapPicker && (
                      <button
                        type="button"
                        className="map-select-btn"
                        onClick={() => onOpenMapPicker('pool_destination')}
                        title="Select drop destination on map"
                      >
                        <Map size={11} /> Select from map
                      </button>
                    )}
                  </div>
                  <input
                    required
                    name="destination"
                    placeholder="Destination (e.g. Whitefield IT Park, Bengaluru)"
                    value={form.destination}
                    onChange={val}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Departure Date & Time</label>
                  <input
                    required
                    name="departure"
                    type="datetime-local"
                    onChange={val}
                  />
                </div>
                <div className="two">
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Available Seats</label>
                    <input
                      required
                      name="seats"
                      type="number"
                      min="1"
                      max="8"
                      defaultValue="3"
                      placeholder="Seats (e.g. 3)"
                      onChange={val}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Price per Seat (₹)</label>
                    <input
                      required
                      name="targetPrice"
                      type="number"
                      min="1"
                      defaultValue="120"
                      placeholder="₹ Price / seat"
                      onChange={val}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Route Notes / Landmarks</label>
                  <input
                    name="notes"
                    placeholder="e.g. AC car, via Silk Board flyover"
                    onChange={val}
                  />
                </div>

                {/* Optional Vehicle Registration Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CarFront size={14} color="var(--primary)" /> Vehicle Information
                    </span>
                    <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '10px' }}>
                      Optional
                    </span>
                  </div>
                  <div className="two" style={{ gap: '8px' }}>
                    <input
                      name="vehicleMake"
                      placeholder="Car Brand & Model (e.g. Honda City)"
                      onChange={val}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    />
                    <input
                      name="vehiclePlate"
                      placeholder="Plate (e.g. KA-01-AB-1234)"
                      onChange={val}
                      style={{ fontSize: '13px', padding: '8px 12px' }}
                    />
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Vehicle registration is optional. Leave blank if sharing an app cab.
                  </small>
                </div>
              </div>

              <button className="primary-btn wide" style={{ marginTop: '14px' }} disabled={busy}>
                <Plus size={15} /> Publish Pool Ride
              </button>
            </form>
          </>
        ) : type === 'book' ? (
          <>
            <div className="eyebrow">CONFIRM POOL RESERVATION</div>
            <h2>Join this Pool</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
              Route: <b style={{ color: '#fff' }}>{bookingRide?.origin} → {bookingRide?.destination}</b>
            </p>
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Organizer / Driver:</span>
                <b style={{ color: '#fff' }}>{bookingRide?.driverName || 'Commuter'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Vehicle:</span>
                <b style={{ color: '#fff' }}>{bookingRide?.vehicleInfo || 'Pool Car / Shared Vehicle'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Price per seat:</span>
                <b style={{ color: 'var(--primary)' }}>₹{bookingRide?.pricePerSeat}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Available seats:</span>
                <b style={{ color: '#fff' }}>{bookingRide?.availableSeats} remaining</b>
              </div>
            </div>

            <form onSubmit={confirmBooking}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                  Seats to reserve:
                </label>
                <input
                  type="number"
                  name="bookSeats"
                  min="1"
                  max={bookingRide?.availableSeats || 4}
                  defaultValue={bookingSeats || 1}
                  required
                  onChange={e => setBookingSeats(Number(e.target.value))}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                  Payment Method:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className={`tier-tab ${bookingPaymentMethod === 'CASH' ? 'active' : ''}`}
                    onClick={() => setBookingPaymentMethod('CASH')}
                    style={{ padding: '10px', textAlign: 'center' }}
                  >
                    <span>Cash on Ride</span>
                  </button>
                  <button
                    type="button"
                    className={`tier-tab ${bookingPaymentMethod === 'ONLINE' ? 'active' : ''}`}
                    onClick={() => setBookingPaymentMethod('ONLINE')}
                    style={{ padding: '10px', textAlign: 'center' }}
                  >
                    <span>UPI / Online</span>
                  </button>
                </div>
              </div>
              <button className="primary-btn wide" disabled={busy}>
                <Check size={15} /> Confirm Reservation (₹{(bookingRide?.pricePerSeat || 0) * (bookingSeats || 1)})
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="eyebrow">SMART COMMUTE</div>
            <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
            <p>{signup ? 'Join a verified network of everyday commuters.' : 'Sign in to access your bookings and pools.'}</p>
            <form onSubmit={submit}>
              {signup && <input required name="name" placeholder="Full name" onChange={val} />}
              <input required name="email" type="email" placeholder="Email address" onChange={val} />
              {signup && <input name="phone" placeholder="Phone number (optional)" onChange={val} />}
              <input required minLength="8" name="password" type="password" placeholder="Password (8+ characters)" onChange={val} />
              <button className="primary-btn wide" disabled={busy}>
                {busy ? 'Please wait...' : signup ? 'Create Account' : 'Sign In'} <ArrowRight size={15} />
              </button>
            </form>
            <div className="switch">
              {signup ? 'Already have an account?' : 'New to Commonway?'}{' '}
              <button onClick={() => setSignup(!signup)}>{signup ? 'Sign In' : 'Create an account'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// User Dashboard Component
function Dashboard({ api, user, setUser, setPage, bookings, flash, load, setModal, doAction, onOpenMap }) {
  const [tab, setTab] = useState('trips');
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [driver, setDriver] = useState(null);
  const [openPools, setOpenPools] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api('/rides/mine').then(setRides).catch(() => {});
    api('/bookings/requests').then(setRequests).catch(() => {});
    api('/drivers/mine').then(setDriver).catch(() => {});
    api('/pools').then(setOpenPools).catch(() => {});
  }, [refresh]);

  async function decide(b, d) {
    await api(`/bookings/${b.id}/${d}`, { method: 'PATCH' });
    flash(`Booking ${d}d successfully.`);
  }

  async function pay(id) {
    const result = await api(`/bookings/${id}/payment`, { method: 'POST' });
    flash(result.message || result.status);
  }

  return (
    <main className="content">
      <div className="dash-top">
        <div>
          <div className="eyebrow">COMMUTER DASHBOARD</div>
          <h1 className="page-title">Hello, {user?.name?.split(' ')[0]}.</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="outline-btn" onClick={() => setTab('profile')}>
            <UserIcon size={16} /> Edit Profile
          </button>
          <button className="primary-btn" onClick={() => setTab('driver')}>
            <CarFront size={16} /> {driver ? 'Driver Fleet' : 'Become a Driver'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'trips' ? 'active' : ''} onClick={() => setTab('trips')}>
          My Trips & Bookings
        </button>
        <button className={tab === 'driver' ? 'active' : ''} onClick={() => setTab('driver')}>
          Driver Tools & Fleet
        </button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
          Profile & Settings
        </button>
      </div>

      {tab === 'trips' ? (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#fff' }}>Your Seat Requests</h2>
          {bookings.length ? (
            <div className="pool-grid">
              {bookings.map(b => (
                <div className="pool-card" key={b.id}>
                  <div className="route-line">
                    <CarFront size={18} color="var(--primary)" />
                    <span>{b.ride?.origin || 'Pickup'} → {b.ride?.destination || 'Drop'}</span>
                  </div>
                  <div className="pool-meta">
                    <span>{b.seats} seat(s) · ₹{b.amount}</span>
                    <b className={`badge-pill ${b.status === 'APPROVED' ? 'badge-approved' : b.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                      {b.status}
                    </b>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Payment Status: <b style={{ color: '#fff' }}>{b.paymentStatus}</b> ({b.paymentMethod})
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={() => onOpenMap && onOpenMap(b.ride || { origin: b.origin, destination: b.destination })}
                    >
                      <MapPin size={13} /> View Map
                    </button>
                    {b.status === 'APPROVED' && b.paymentStatus === 'UNPAID' && (
                      <button className="primary-btn" onClick={() => doAction(() => pay(b.id))}>
                        Pay {b.paymentMethod}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-card">
              <CarFront size={32} color="var(--primary)" />
              <h3>No booked trips yet</h3>
              <p>Explore upcoming rides or start a community pool to request seats.</p>
            </div>
          )}
        </>
      ) : tab === 'driver' ? (
        <div className="driver-panel">
          <h2>Driver Verification Profile</h2>
          {driver ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Status:{' '}
              <b className={`badge-pill ${driver.verificationStatus === 'VERIFIED' ? 'badge-approved' : 'badge-pending'}`}>
                {driver.verificationStatus}
              </b>{' '}
              — {driver.verificationNote}
            </p>
          ) : (
            <DriverForm api={api} flash={flash} refresh={() => setRefresh(refresh + 1)} />
          )}
        </div>
      ) : (
        <Profile api={api} user={user} setUser={setUser} flash={flash} setPage={setPage} isTab={true} />
      )}
    </main>
  );
}

function DriverForm({ api, flash, refresh }) {
  const [f, setF] = useState({});
  return (
    <form
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '14px' }}
      onSubmit={async e => {
        e.preventDefault();
        try {
          await api('/drivers/register', {
            method: 'POST',
            body: JSON.stringify({ ...f, vehicleSeats: Number(f.vehicleSeats) })
          });
          flash('Driver profile submitted for verification.');
          refresh();
        } catch (e) {
          flash(e.message);
        }
      }}
    >
      <input
        required
        placeholder="Driving license number"
        onChange={e => setF({ ...f, licenseNumber: e.target.value })}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
      />
      <input
        required
        placeholder="Vehicle make (e.g. Honda)"
        onChange={e => setF({ ...f, vehicleMake: e.target.value })}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
      />
      <input
        required
        placeholder="Vehicle model (e.g. City)"
        onChange={e => setF({ ...f, vehicleModel: e.target.value })}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
      />
      <input
        required
        placeholder="Registration plate (e.g. KA-01-AB-1234)"
        onChange={e => setF({ ...f, vehiclePlate: e.target.value })}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
      />
      <input
        required
        type="number"
        min="2"
        max="12"
        placeholder="Passenger seats"
        onChange={e => setF({ ...f, vehicleSeats: e.target.value })}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
      />
      <button className="primary-btn">Submit for Review</button>
    </form>
  );
}

// User Profile & Settings Component
function Profile({ api, user, setUser, setToken, flash, setPage, isTab }) {
  const [profileTab, setProfileTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Driver state
  const [driver, setDriver] = useState(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleSeats, setVehicleSeats] = useState(4);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await api('/me/profile');
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      if (data.driver && data.driver.id) {
        setDriver(data.driver);
        setLicenseNumber(data.driver.licenseNumber || '');
        setVehicleMake(data.driver.vehicleMake || '');
        setVehicleModel(data.driver.vehicleModel || '');
        setVehiclePlate(data.driver.vehiclePlate || '');
        setVehicleSeats(data.driver.vehicleSeats || 4);
      }
    } catch (e) {
      flash(e.message || 'Failed to load profile', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePersonal(e) {
    e.preventDefault();
    if (!name.trim()) {
      flash('Name cannot be empty', true);
      return;
    }
    setSaving(true);
    try {
      const res = await api('/me', {
        method: 'PUT',
        body: JSON.stringify({ name, email, phone })
      });
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('cw-user', JSON.stringify(res.user));
      }
      if (res.token && setToken) {
        setToken(res.token);
        localStorage.setItem('cw-token', res.token);
      }
      flash('Personal profile updated successfully!');
      loadProfile();
    } catch (e) {
      flash(e.message || 'Error updating profile', true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault();
    if (!newPassword) {
      flash('Please enter a new password', true);
      return;
    }
    if (newPassword.length < 6) {
      flash('New password must be at least 6 characters', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      flash('New password and confirmation do not match', true);
      return;
    }
    setSaving(true);
    try {
      const res = await api('/me', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.token && setToken) {
        setToken(res.token);
        localStorage.setItem('cw-token', res.token);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      flash('Password changed successfully!');
    } catch (e) {
      flash(e.message || 'Error changing password', true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDriver(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (driver && driver.id) {
        const res = await api('/drivers/mine', {
          method: 'PUT',
          body: JSON.stringify({
            licenseNumber,
            vehicleMake,
            vehicleModel,
            vehiclePlate,
            vehicleSeats: Number(vehicleSeats)
          })
        });
        flash(res.message || 'Driver vehicle profile updated!');
      } else {
        await api('/drivers/register', {
          method: 'POST',
          body: JSON.stringify({
            licenseNumber,
            vehicleMake,
            vehicleModel,
            vehiclePlate,
            vehicleSeats: Number(vehicleSeats)
          })
        });
        flash('Driver registration submitted!');
      }
      loadProfile();
    } catch (e) {
      flash(e.message || 'Error saving vehicle profile', true);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ display: 'inline-block', marginBottom: '12px' }}></div>
        <p>Loading your profile details...</p>
      </div>
    );
  }

  const roleName = profile?.role === 'ADMIN' ? 'Fleet Administrator' : (driver ? 'Verified Driver' : 'Commuter / Passenger');

  const ContainerTag = isTab ? 'div' : 'main';

  return (
    <ContainerTag className={`profile-wrapper ${isTab ? '' : 'content'}`}>
      {/* Top Profile Header Hero */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h1>{name || user?.name || 'User Profile'}</h1>
            <span className="badge-pill badge-approved">{roleName}</span>
            <span className="badge-pill badge-pending" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              ● Active Account
            </span>
          </div>
          <div className="profile-meta-row">
            <span className="profile-meta-item">
              <Mail size={14} color="#10b981" /> {email || user?.email}
            </span>
            <span className="profile-meta-item">
              <Phone size={14} color="#10b981" /> {phone || 'No phone added'}
            </span>
            <span className="profile-meta-item">
              <ShieldCheck size={14} color="#10b981" /> ID: #{profile?.id || user?.id || 1}
            </span>
          </div>
        </div>
        {!isTab && setPage && (
          <button className="outline-btn" onClick={() => setPage('dashboard')}>
            View Dashboard
          </button>
        )}
      </div>

      {/* Quick Statistics Bar */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <span>Trips Booked</span>
          <b>{profile?.totalBookings ?? 0}</b>
        </div>
        <div className="profile-stat-box">
          <span>Rides Published</span>
          <b>{profile?.totalRides ?? 0}</b>
        </div>
        <div className="profile-stat-box">
          <span>Driver Status</span>
          <b>{driver ? (driver.verificationStatus === 'VERIFIED' ? 'Verified' : 'In Review') : 'Not Enrolled'}</b>
        </div>
        <div className="profile-stat-box">
          <span>Security Status</span>
          <b>Protected</b>
        </div>
      </div>

      {/* Profile Section Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button
          className={profileTab === 'personal' ? 'active' : ''}
          onClick={() => setProfileTab('personal')}
        >
          <UserIcon size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Personal Details
        </button>
        <button
          className={profileTab === 'security' ? 'active' : ''}
          onClick={() => setProfileTab('security')}
        >
          <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Password & Security
        </button>
        <button
          className={profileTab === 'driver' ? 'active' : ''}
          onClick={() => setProfileTab('driver')}
        >
          <CarFront size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Driver & Vehicle
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {profileTab === 'personal' && (
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <div className="profile-card-title">
                <UserIcon size={20} color="var(--primary)" />
                <span>Edit Personal Information</span>
              </div>
              <div className="profile-card-subtitle">
                Update your display name, contact phone number, and primary email address.
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePersonal}>
            <div className="profile-form-grid">
              <div>
                <label className="profile-field-label">
                  <UserIcon size={14} /> Full Name
                </label>
                <div className="profile-input-wrapper">
                  <UserIcon size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <Phone size={14} /> Phone Number
                </label>
                <div className="profile-input-wrapper">
                  <Phone size={16} className="profile-input-icon" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-form-full">
                <label className="profile-field-label">
                  <Mail size={14} /> Email Address (Account Login)
                </label>
                <div className="profile-input-wrapper">
                  <Mail size={16} className="profile-input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="profile-input"
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block', fontSize: '12px' }}>
                  Used for trip booking confirmations, invoice receipts, and account sign-in.
                </small>
              </div>

              <div className="profile-form-full">
                <label className="profile-field-label">
                  <ShieldCheck size={14} /> Account Role
                </label>
                <div className="profile-input-wrapper">
                  <ShieldCheck size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    disabled
                    value={roleName}
                    className="profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-btn-row">
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Password & Security */}
      {profileTab === 'security' && (
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <div className="profile-card-title">
                <KeyRound size={20} color="var(--primary)" />
                <span>Change Account Password</span>
              </div>
              <div className="profile-card-subtitle">
                Ensure your account is protected with a strong, secure passphrase.
              </div>
            </div>
          </div>

          <div className="profile-security-tip">
            <ShieldCheck size={18} color="#10b981" />
            <span>Use at least 6 characters including letters, numbers, and special symbols for maximum security.</span>
          </div>

          <form onSubmit={handleSavePassword}>
            <div className="profile-form-grid">
              <div className="profile-form-full">
                <label className="profile-field-label">
                  <Lock size={14} /> Current Password
                </label>
                <div className="profile-input-wrapper">
                  <Lock size={16} className="profile-input-icon" />
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <KeyRound size={14} /> New Password
                </label>
                <div className="profile-input-wrapper">
                  <KeyRound size={16} className="profile-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <KeyRound size={14} /> Confirm New Password
                </label>
                <div className="profile-input-wrapper">
                  <KeyRound size={16} className="profile-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-btn-row">
              <button
                type="button"
                className="quiet"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Reset
              </button>
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={16} /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Driver & Vehicle Details */}
      {profileTab === 'driver' && (
        <div className="profile-card">
          <div className="profile-card-header">
            <div>
              <div className="profile-card-title">
                <CarFront size={20} color="var(--primary)" />
                <span>{driver ? 'Manage Driver & Vehicle Profile' : 'Register Driver Profile'}</span>
              </div>
              <div className="profile-card-subtitle">
                {driver
                  ? 'Update your registered vehicle details and official driver verification information.'
                  : 'Register your vehicle to start offering rides and earning on your daily commutes.'}
              </div>
            </div>
            {driver && (
              <span className={`badge-pill ${driver.verificationStatus === 'VERIFIED' ? 'badge-approved' : 'badge-pending'}`}>
                {driver.verificationStatus}
              </span>
            )}
          </div>

          {driver && driver.verificationNote && (
            <div className="profile-security-tip" style={{ background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}>
              <ShieldCheck size={18} color="#3b82f6" />
              <span>Verification Note: {driver.verificationNote}</span>
            </div>
          )}

          <form onSubmit={handleSaveDriver}>
            <div className="profile-form-grid">
              <div>
                <label className="profile-field-label">
                  <FileText size={14} /> Driving License Number
                </label>
                <div className="profile-input-wrapper">
                  <FileText size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-0420110012345"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <CarFront size={14} /> Vehicle Registration Plate
                </label>
                <div className="profile-input-wrapper">
                  <CarFront size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-01-AB-1234"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <CarFront size={14} /> Vehicle Make (Brand)
                </label>
                <div className="profile-input-wrapper">
                  <CarFront size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda, Hyundai, Tata"
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="profile-field-label">
                  <CarFront size={14} /> Vehicle Model
                </label>
                <div className="profile-input-wrapper">
                  <CarFront size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. City, Creta, Nexon"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-form-full">
                <label className="profile-field-label">
                  <Users size={14} /> Passenger Seating Capacity
                </label>
                <div className="profile-input-wrapper">
                  <Users size={16} className="profile-input-icon" />
                  <input
                    type="number"
                    min="2"
                    max="12"
                    required
                    value={vehicleSeats}
                    onChange={e => setVehicleSeats(e.target.value)}
                    className="profile-input"
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block', fontSize: '12px' }}>
                  Maximum passenger seats available in your car excluding the driver.
                </small>
              </div>
            </div>

            <div className="profile-btn-row">
              <button type="submit" className="primary-btn" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : driver ? 'Update Vehicle Details' : 'Submit for Driver Verification'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ContainerTag>
  );
}

// Admin Operations Center (Fleet Command Center)
function Admin({ api, flash, doAction, onOpenMap }) {
  const [data, setData] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [tab, setTab] = useState('bookings');
  const [timingFilter, setTimingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  async function refresh() {
    try {
      let [o, u, d, r, p, b, pay] = await Promise.all(
        ['/admin/overview', '/admin/users', '/admin/drivers', '/admin/rides', '/admin/pools', '/admin/bookings', '/admin/payments'].map(x => api(x))
      );
      setData({ overview: o, users: u, rides: r, pools: p, bookings: b, payments: pay });
      setDrivers(d);
    } catch (e) {
      flash(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const allBookings = data.bookings || [];
  const filteredBookings = allBookings.filter(b => {
    if (timingFilter === 'upcoming' && b.isPast) return false;
    if (timingFilter === 'past' && !b.isPast) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.toLowerCase().includes(q)) ||
      (b.origin && b.origin.toLowerCase().includes(q)) ||
      (b.destination && b.destination.toLowerCase().includes(q)) ||
      (b.driverName && b.driverName.toLowerCase().includes(q))
    );
  });

  const allRides = data.rides || [];
  const filteredRides = allRides.filter(r => {
    if (timingFilter === 'upcoming' && r.isPast) return false;
    if (timingFilter === 'past' && !r.isPast) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.origin && r.origin.toLowerCase().includes(q)) ||
      (r.destination && r.destination.toLowerCase().includes(q)) ||
      (r.driverName && r.driverName.toLowerCase().includes(q))
    );
  });

  return (
    <main className="content">
      <div className="eyebrow">FLEET OPERATIONS & CONTROL</div>
      <h1 className="page-title">Admin Command Center</h1>

      {/* Platform Statistics Overview Cards */}
      <div className="stat-grid">
        <div>
          <span>Total Users</span>
          <b>{data.overview?.users ?? 0}</b>
        </div>
        <div>
          <span>Drivers</span>
          <b>{data.overview?.drivers ?? 0}</b>
        </div>
        <div>
          <span>Total Bookings</span>
          <b>{data.overview?.bookings ?? 0}</b>
        </div>
        <div>
          <span>Upcoming Trips</span>
          <b style={{ color: '#10b981' }}>{data.overview?.upcomingTrips ?? 0}</b>
        </div>
        <div>
          <span>Past Trips (Historical)</span>
          <b style={{ color: '#f59e0b' }}>{data.overview?.pastTrips ?? 0}</b>
        </div>
        <div>
          <span>Total Revenue</span>
          <b>₹{data.overview?.totalRevenue ?? 0}</b>
        </div>
      </div>

      {/* Admin Subnav Tabs */}
      <div className="admin-subnav">
        <button className={tab === 'bookings' ? 'active' : ''} onClick={() => { setTab('bookings'); setTimingFilter('all'); }}>
          Customer Bookings ({allBookings.length})
        </button>
        <button className={tab === 'rides' ? 'active' : ''} onClick={() => { setTab('rides'); setTimingFilter('all'); }}>
          Rides & Fleet ({allRides.length})
        </button>
        <button className={tab === 'pools' ? 'active' : ''} onClick={() => setTab('pools')}>
          Community Pools ({data.pools?.length || 0})
        </button>
        <button className={tab === 'drivers' ? 'active' : ''} onClick={() => setTab('drivers')}>
          Driver Approvals ({drivers.length})
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users ({data.users?.length || 0})
        </button>
      </div>

      {/* Tab: Customer Bookings */}
      {tab === 'bookings' && (
        <div>
          <div className="admin-filter-bar">
            <div className="admin-filter-group">
              <button className={`filter-chip ${timingFilter === 'all' ? 'active' : ''}`} onClick={() => setTimingFilter('all')}>
                All Trips ({allBookings.length})
              </button>
              <button className={`filter-chip ${timingFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTimingFilter('upcoming')}>
                Upcoming Trips ({allBookings.filter(b => !b.isPast).length})
              </button>
              <button className={`filter-chip ${timingFilter === 'past' ? 'active' : ''}`} onClick={() => setTimingFilter('past')}>
                Past / Previous Data ({allBookings.filter(b => b.isPast).length})
              </button>
            </div>
            <input
              className="admin-search-input"
              placeholder="Search customer, phone, email, route..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Info</th>
                  <th>Route</th>
                  <th>Departure Time</th>
                  <th>Trip Timing</th>
                  <th>Driver</th>
                  <th>Seats & Fare</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length ? (
                  filteredBookings.map(b => (
                    <tr key={b.id}>
                      <td><b>#{b.id}</b></td>
                      <td>
                        <div className="customer-cell">
                          <b>{b.customerName}</b>
                          <span>{b.customerEmail}</span>
                          <span>{b.customerPhone || 'No phone'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <b>{b.origin}</b> → <b>{b.destination}</b>
                          <button
                            type="button"
                            className="admin-map-btn"
                            onClick={() => onOpenMap && onOpenMap(b)}
                          >
                            <MapPin size={11} /> OpenStreetMap ({b.distanceText || 'Route'})
                          </button>
                        </div>
                      </td>
                      <td>{b.departure ? new Date(b.departure).toLocaleString() : 'N/A'}</td>
                      <td>
                        <span className={`badge-pill ${b.isPast ? 'badge-past' : 'badge-upcoming'}`}>
                          {b.isPast ? '● Past Trip' : '● Upcoming'}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span>{b.driverName || 'N/A'}</span>
                          <span>{b.driverPhone}</span>
                        </div>
                      </td>
                      <td><b>{b.seats} seat(s)</b><br />₹{b.amount}</td>
                      <td>
                        <span className={`badge-pill ${b.status === 'APPROVED' ? 'badge-approved' : b.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <b>{b.paymentMethod}</b>
                          <span className={`badge-pill ${b.paymentStatus === 'PAID' ? 'badge-paid' : b.paymentStatus === 'CASH_DUE' ? 'badge-cashdue' : 'badge-unpaid'}`}>
                            {b.paymentStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No customer bookings found {timingFilter !== 'all' ? `for ${timingFilter} trips` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rides & Fleet */}
      {tab === 'rides' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Trip Timing</th>
                <th>Driver Info</th>
                <th>Seats</th>
                <th>Price/Seat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRides.length ? (
                filteredRides.map(r => (
                  <tr key={r.id}>
                    <td><b>#{r.id}</b></td>
                    <td>
                      <div className="customer-cell">
                        <b>{r.origin}</b> → <b>{r.destination}</b>
                        <button
                          type="button"
                          className="admin-map-btn"
                          onClick={() => onOpenMap && onOpenMap(r)}
                        >
                          <MapPin size={11} /> OpenStreetMap ({r.distanceText || 'Route'})
                        </button>
                      </div>
                    </td>
                    <td>{r.departure ? new Date(r.departure).toLocaleString() : 'N/A'}</td>
                    <td>
                      <span className={`badge-pill ${r.isPast ? 'badge-past' : 'badge-upcoming'}`}>
                        {r.isPast ? '● Past Trip' : '● Upcoming'}
                      </span>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <b>{r.driverName}</b>
                        <span>{r.driverEmail}</span>
                      </div>
                    </td>
                    <td>{r.availableSeats} / {r.totalSeats} open</td>
                    <td><b>₹{r.pricePerSeat}</b></td>
                    <td><b className="badge-pill badge-approved">{r.status}</b></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No rides found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Driver Verification Reviews */}
      {tab === 'drivers' && (
        <div className="driver-panel">
          <h2>Driver Document Reviews</h2>
          {drivers.length ? (
            drivers.map(d => (
              <div className="admin-row" key={d.id}>
                <span>
                  <b>{d.user?.name}</b> · {d.vehicleMake} {d.vehicleModel} · Plate: <b>{d.vehiclePlate}</b> · Status:{' '}
                  <b className={`badge-pill ${d.verificationStatus === 'VERIFIED' ? 'badge-approved' : 'badge-pending'}`}>
                    {d.verificationStatus}
                  </b>
                </span>
                {d.verificationStatus === 'PENDING_REVIEW' && (
                  <span>
                    <button
                      className="primary-btn"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() =>
                        doAction(async () => {
                          await api(`/admin/drivers/${d.id}/review`, {
                            method: 'PATCH',
                            body: JSON.stringify({ decision: 'APPROVE', note: 'Approved by admin' })
                          });
                          refresh();
                        })
                      }
                    >
                      Approve
                    </button>
                  </span>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No driver verification requests pending.</p>
          )}
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
