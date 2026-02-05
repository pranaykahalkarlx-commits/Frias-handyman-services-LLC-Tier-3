// ===========================================
// TIER-3 PREMIUM WEBSITE — COMPLETE JAVASCRIPT
// ===========================================

// ---------- CONFIGURATION ----------
const CONFIG = {
  businessName: "Frias handyman services, LLC",
  phone: "+1 (212) 555-0100",
  email: "info@yourbusiness.com",
  openingHours: [{"day":"Monday - Friday","hours":"8:00 AM - 7:00 PM"},{"day":"Saturday","hours":"9:00 AM - 5:00 PM"},{"day":"Sunday","hours":"By Appointment Only"}],
  services: [{"name":"Comprehensive Handyman & Exterior Services","description":"From minor repairs to significant home improvements, Frias handyman services, LLC offers a wide range of reliable services designed to keep your property in pristine condition. Our skilled team handles interior tasks with precision and exterior projects with durability in mind, ensuring professional craftsmanship and peace of mind for every client in Aurora, Colorado.","price":150,"duration":"60 min","staff":["Expert Advisor"],"category":"General"}],
  locations: [{"name":"Main Office","address":"123 Business Ave, Suite 500","city":"New York","state":"NY","zip":"10001","lat":40.7128,"lng":-74.006,"phone":"+1 (212) 555-0100","hours":"Mon-Fri 9AM-6PM"},{"name":"Downtown Branch","address":"456 Commerce Blvd, Floor 3","city":"New York","state":"NY","zip":"10002","lat":40.72,"lng":-73.995,"phone":"+1 (212) 555-0200","hours":"Mon-Sat 8AM-7PM"},{"name":"Brooklyn Hub","address":"789 Innovation Dr, Unit 2B","city":"Brooklyn","state":"NY","zip":"11201","lat":40.695,"lng":-73.99,"phone":"+1 (718) 555-0300","hours":"Mon-Fri 10AM-5PM"}],
  testimonials: [{"text":"Absolutely outstanding service. The team was professional and delivered beyond expectations.","author":"Sarah M.","rating":5},{"text":"Best experience I've had. Will definitely recommend to everyone I know.","author":"James R.","rating":5},{"text":"Very impressed with the quality and attention to detail. Worth every penny.","author":"Emily K.","rating":4},{"text":"Exceptional team and seamless process from booking to completion.","author":"Michael T.","rating":5},{"text":"They truly go above and beyond. Already booked my next appointment!","author":"Lisa Chen","rating":5}],
  stripeKey: ''
};

// ---------- AUTH SYSTEM (localStorage-based mock) ----------
const AUTH = {
  ADMIN_EMAIL: 'admin@yourbusiness.com',
  ADMIN_PASS: 'admin123',

  getUser() {
    try { return JSON.parse(localStorage.getItem('tier3_user')) || null; } catch(e) { return null; }
  },

  login(email, password) {
    // Admin login
    if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASS) {
      const user = { email, role: 'admin', name: 'Admin User', firstname: 'Admin', lastname: 'User' };
      localStorage.setItem('tier3_user', JSON.stringify(user));
      return { success: true, user };
    }
    // Regular user — check stored users
    const users = JSON.parse(localStorage.getItem('tier3_users') || '{}');
    if (users[email] && users[email].password === password) {
      const u = { ...users[email] };
      delete u.password;
      u.role = 'customer';
      localStorage.setItem('tier3_user', JSON.stringify(u));
      return { success: true, user: u };
    }
    return { success: false, error: 'Invalid email or password.' };
  },

  signup(data) {
    if (data.password !== data.confirmPassword) return { success: false, error: 'Passwords do not match.' };
    if (data.password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
    const users = JSON.parse(localStorage.getItem('tier3_users') || '{}');
    if (users[data.email]) return { success: false, error: 'Email already registered.' };
    users[data.email] = {
      email: data.email, firstname: data.firstname, lastname: data.lastname,
      phone: data.phone, password: data.password, role: 'customer',
      joinedDate: new Date().toISOString(),
      bookings: [], totalSpent: 0
    };
    localStorage.setItem('tier3_users', JSON.stringify(users));
    const user = { email: data.email, firstname: data.firstname, lastname: data.lastname, role: 'customer' };
    localStorage.setItem('tier3_user', JSON.stringify(user));
    return { success: true, user };
  },

  logout() {
    localStorage.removeItem('tier3_user');
    window.location.href = 'login.html';
  },

  checkAccess(page) {
    const user = this.getUser();
    if (page === 'admin' && (!user || user.role !== 'admin')) { window.location.href = 'login.html'; return false; }
    if (page === 'portal' && !user) { window.location.href = 'login.html'; return false; }
    return true;
  }
};

// ---------- NAV AUTH STATE ----------
function updateNavAuth() {
  const user = AUTH.getUser();
  const loginBtn = document.getElementById('nav-login-btn');
  const portalBtn = document.getElementById('nav-portal-btn');
  const adminBtn = document.getElementById('nav-admin-btn');
  if (!loginBtn) return;
  if (user) {
    loginBtn.style.display = 'none';
    if (user.role === 'customer') { portalBtn.style.display = 'inline-flex'; }
    if (user.role === 'admin') { portalBtn.style.display = 'inline-flex'; adminBtn.style.display = 'inline-flex'; }
  } else {
    loginBtn.style.display = 'inline-flex';
    if (portalBtn) portalBtn.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}

// ---------- MOBILE NAV ----------
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  }));
}

// ---------- SIDEBAR TOGGLE (Dashboard) ----------
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ---------- DASHBOARD SECTION SWITCHING ----------
document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.section;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('section-' + target);
    if (sec) sec.classList.add('active');
    // Load section data
    if (target === 'appointments') loadAppointments();
    else if (target === 'customers') loadCustomers();
    else if (target === 'reviews') loadReviews();
  });
});

// 'View All' links in overview
document.querySelectorAll('.view-all[data-section]').forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.section;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const sideLink = document.querySelector('.sidebar-link[data-section="' + target + '"]');
    if (sideLink) sideLink.classList.add('active');
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('section-' + target);
    if (sec) sec.classList.add('active');
    if (target === 'appointments') loadAppointments();
    else if (target === 'customers') loadCustomers();
  });
});

// ---------- DASHBOARD DATA (Mock) ----------
function generateMockBookings() {
  const names = ['Sarah Mitchell','James Rodriguez','Emily Chen','Michael Thompson','Lisa Park','David Kim','Rachel Green','Tom Harris','Anna White','Chris Brown'];
  const statuses = ['upcoming','upcoming','completed','completed','cancelled','upcoming','completed','upcoming','completed','upcoming'];
  return CONFIG.services.slice(0,6).map((svc, i) => ({
    id: 'BK' + String(1001+i).padStart(4,'0'),
    customer: names[i % names.length],
    email: names[i].split(' ')[0].toLowerCase() + '@email.com',
    phone: '+1 (555) ' + String(100+i).padStart(3,'0') + '-' + String(1000+i*137).slice(0,4),
    service: svc.name,
    staff: svc.staff[0],
    date: new Date(Date.now() + (i-2)*86400000).toLocaleDateString(),
    time: ['9:00 AM','10:30 AM','1:00 PM','2:30 PM','11:00 AM','3:00 PM'][i],
    location: CONFIG.locations[i % CONFIG.locations.length].name,
    status: statuses[i],
    amount: svc.price
  }));
}

function generateMockCustomers() {
  const names = ['Sarah Mitchell','James Rodriguez','Emily Chen','Michael Thompson','Lisa Park','David Kim'];
  return names.map((name, i) => ({
    id: 'CUS' + String(2001+i).padStart(4,'0'),
    name, email: name.split(' ')[0].toLowerCase() + '@email.com',
    phone: '+1 (555) ' + String(200+i).padStart(3,'0') + '-' + String(4000+i*211).slice(0,4),
    bookings: Math.floor(Math.random()*8)+1,
    totalSpent: '$' + (Math.floor(Math.random()*3000)+500).toLocaleString(),
    joined: new Date(Date.now() - Math.floor(Math.random()*365)*86400000).toLocaleDateString()
  }));
}

// ---------- LOAD DASHBOARD SECTIONS ----------
function loadRecentAppointments() {
  const tbody = document.getElementById('recent-appointments-body');
  if (!tbody) return;
  const bookings = generateMockBookings();
  tbody.innerHTML = bookings.slice(0,5).map(b => `
    <tr>
      <td>${b.id}</td>
      <td><strong>${b.customer}</strong></td>
      <td>${b.service}</td>
      <td>${b.date}</td>
      <td><span class="status-badge status-${b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td>
      <td><strong>$${b.amount}</strong></td>
    </tr>`).join('');
}

function loadAppointments() {
  const tbody = document.getElementById('appointments-body');
  if (!tbody) return;
  const bookings = generateMockBookings();
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.id}</td>
      <td><strong>${b.customer}</strong><br><span style="font-size:0.68rem;color:var(--text-dim)">${b.email}</span></td>
      <td>${b.service}</td>
      <td>${b.staff}</td>
      <td>${b.date} ${b.time}</td>
      <td>${b.location}</td>
      <td><span class="status-badge status-${b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td>
      <td><strong>$${b.amount}</strong></td>
      <td><button class="btn btn-ghost btn-sm">Edit</button></td>
    </tr>`).join('');
}

function loadCustomers() {
  const tbody = document.getElementById('customers-body');
  if (!tbody) return;
  const customers = generateMockCustomers();
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td>${c.id}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.bookings}</td>
      <td><strong>${c.totalSpent}</strong></td>
      <td>${c.joined}</td>
      <td><button class="btn btn-ghost btn-sm">View</button></td>
    </tr>`).join('');
}

function loadReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  grid.innerHTML = CONFIG.testimonials.map(t => `
    <div class="review-card">
      <div class="review-card-header">
        <span class="review-card-author">${t.author}</span>
        <span class="review-card-stars">★★★★★</span>
      </div>
      <p class="review-card-text">"${t.text}"</p>
      <div class="review-card-meta">Posted recently • Verified customer</div>
    </div>`).join('');
}

// ---------- DONUT CHART (SVG) ----------
function drawDonutChart() {
  const svg = document.getElementById('donut-chart');
  const legend = document.getElementById('donut-legend');
  if (!svg || !legend) return;
  const colors = ['#FF9933','#f59e0b','#10b981','#ef4444','#8b5cf6'];
  const data2 = [{"name":"Comprehensive Handyman & Exterior Services","revenue":15965}];
  const total = data2.reduce((s,d) => s + d.revenue, 0);
  let offset = 0;
  const circumference = 2 * Math.PI * 42;
  svg.innerHTML = '';
  legend.innerHTML = '';
  data2.forEach((item, i) => {
    const pct = item.revenue / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx','60'); circle.setAttribute('cy','60'); circle.setAttribute('r','42');
    circle.setAttribute('fill','none'); circle.setAttribute('stroke', colors[i % colors.length]);
    circle.setAttribute('stroke-width','16');
    circle.setAttribute('stroke-dasharray', dash + ' ' + gap);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('stroke-linecap','butt');
    svg.appendChild(circle);
    offset += dash;
    legend.innerHTML += `<div class="donut-legend-item"><div class="donut-legend-color" style="background:${colors[i%colors.length]}"></div>${item.name} (${Math.round(pct*100)}%)</div>`;
  });
}

// ---------- CUSTOMER PORTAL LOGIC ----------
function initPortal() {
  if (!AUTH.checkAccess('portal')) return;
  const user = AUTH.getUser();
  // Update header
  const avatar = document.getElementById('portal-avatar');
  const username = document.getElementById('portal-username');
  if (avatar) avatar.textContent = (user.firstname||'U')[0] + (user.lastname||'U')[0];
  if (username) username.textContent = (user.firstname||'') + ' ' + (user.lastname||'');

  // Profile
  if (document.getElementById('prof-fname')) {
    document.getElementById('prof-fname').value = user.firstname || '';
    document.getElementById('prof-lname').value = user.lastname || '';
    document.getElementById('prof-email').value = user.email || '';
  }
  document.getElementById('profile-name') && (document.getElementById('profile-name').textContent = (user.firstname||'')+' '+(user.lastname||''));
  document.getElementById('profile-email') && (document.getElementById('profile-email').textContent = user.email||'');

  // Portal sidebar tabs
  document.querySelectorAll('.portal-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.portal-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('profile-message');
      if (msg) { msg.textContent = '✅ Profile updated successfully!'; msg.className = 'form-message success'; setTimeout(() => msg.className = 'form-message', 3000); }
    });
  }

  // Load mock bookings
  loadPortalBookings();
  loadPortalHistory();
  loadPortalReviews();

  // Logout
  document.getElementById('portal-logout')?.addEventListener('click', (e) => { e.preventDefault(); AUTH.logout(); });
}

function loadPortalBookings() {
  const container = document.getElementById('portal-bookings');
  if (!container) return;
  const bookings = generateMockBookings().filter(b => b.status !== 'cancelled');
  container.innerHTML = bookings.map(b => `
    <div class="portal-booking-card">
      <div class="pbc-info">
        <h4>${b.service}</h4>
        <p>📅 ${b.date} at ${b.time} • 👤 ${b.staff} • 📍 ${b.location}</p>
      </div>
      <span class="status-badge status-${b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span>
      <div class="pbc-actions">
        <button class="btn btn-ghost btn-sm">Details</button>
        ${b.status === 'upcoming' ? '<button class="btn btn-ghost btn-sm">Cancel</button>' : ''}
      </div>
    </div>`).join('');
}

function loadPortalHistory() {
  const tbody = document.getElementById('history-body');
  if (!tbody) return;
  const bookings = generateMockBookings();
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.id}</td>
      <td>${b.service}</td>
      <td>${b.staff}</td>
      <td>${b.date}</td>
      <td><span class="status-badge status-${b.status}">${b.status.charAt(0).toUpperCase()+b.status.slice(1)}</span></td>
      <td><strong>$${b.amount}</strong></td>
      <td>${b.status === 'completed' ? '<button class="btn btn-ghost btn-sm">Leave Review</button>' : '—'}</td>
    </tr>`).join('');
}

function loadPortalReviews() {
  const grid = document.getElementById('portal-reviews');
  if (!grid) return;
  grid.innerHTML = CONFIG.testimonials.slice(0,2).map(t => `
    <div class="review-card">
      <div class="review-card-header">
        <span class="review-card-author">You</span>
        <span class="review-card-stars">★★★★★</span>
      </div>
      <p class="review-card-text">"${t.text}"</p>
      <div class="review-card-meta">Posted recently</div>
    </div>`).join('');
}

// ---------- ADMIN INIT ----------
function initAdmin() {
  if (!AUTH.checkAccess('admin')) return;
  loadRecentAppointments();
  drawDonutChart();
  document.getElementById('admin-logout')?.addEventListener('click', (e) => { e.preventDefault(); AUTH.logout(); });
}

// ---------- AUTH FORMS ----------
function initAuthPage() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.tab;
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(target + '-panel')?.classList.add('active');
    });
  });

  // Switch links
  document.querySelectorAll('.switch-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.target;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.auth-tab[data-tab="' + target + '"]')?.classList.add('active');
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(target + '-panel')?.classList.add('active');
    });
  });

  // Password strength
  document.querySelector('#signupForm input[name=password]')?.addEventListener('input', function() {
    const v = this.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const bar = document.querySelector('.pwd-strength-bar') || (() => {
      const b = document.createElement('div'); b.className = 'pwd-strength-bar';
      document.querySelector('.password-strength').appendChild(b); return b;
    })();
    bar.style.width = (score * 25) + '%';
    bar.style.background = ['','#ef4444','#f59e0b','#3b82f6','#10b981'][score];
  });

  // Login
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const msg = document.getElementById('login-message');
    const result = AUTH.login(email, password);
    if (result.success) {
      msg.textContent = '✅ Signing you in...'; msg.className = 'form-message success';
      setTimeout(() => { window.location.href = result.user.role === 'admin' ? 'admin-dashboard.html' : 'customer-portal.html'; }, 1200);
    } else {
      msg.textContent = '❌ ' + result.error; msg.className = 'form-message error';
    }
  });

  // Signup
  document.getElementById('signupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = document.getElementById('signup-message');
    const result = AUTH.signup({
      firstname: fd.get('firstname'), lastname: fd.get('lastname'),
      email: fd.get('email'), phone: fd.get('phone'),
      password: fd.get('password'), confirmPassword: fd.get('confirmPassword')
    });
    if (result.success) {
      msg.textContent = '✅ Account created! Redirecting...'; msg.className = 'form-message success';
      setTimeout(() => { window.location.href = 'customer-portal.html'; }, 1200);
    } else {
      msg.textContent = '❌ ' + result.error; msg.className = 'form-message error';
    }
  });
}

// ---------- CONTACT FORM ----------
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('contactFormMessage');
    msg.textContent = '✅ Thank you! We\'ll get back to you within 24 hours.';
    msg.className = 'form-message success';
    contactForm.reset();
    // Trigger email notification webhook (replace URL)
    console.log('Contact form submitted — trigger n8n webhook here');
    setTimeout(() => { msg.className = 'form-message'; }, 5000);
  });
}

// ---------- MAP ----------
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  const lat = parseFloat(mapEl.dataset.lat);
  const lng = parseFloat(mapEl.dataset.lng);
  const name = mapEl.dataset.business;
  if (typeof google !== 'undefined' && google.maps) {
    try {
      const map = new google.maps.Map(mapEl, { center: {lat,lng}, zoom: 15 });
      new google.maps.Marker({ position: {lat,lng}, map, title: name });
    } catch(e) { showMapFallback(mapEl, lat, lng); }
  } else { showMapFallback(mapEl, lat, lng); }
}

function showMapFallback(el, lat, lng) {
  el.innerHTML = '<div class="map-fallback"><div class="map-icon">📍</div><p>Interactive map unavailable</p><a href="https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng + '" target="_blank" class="btn btn-outline btn-sm" style="margin-top:0.8rem;">Open in Google Maps</a></div>';
}

// Locations page map
function initLocationsMap() {
  const el = document.getElementById('locations-map');
  if (!el) return;
  const locs = CONFIG.locations;
  if (typeof google !== 'undefined' && google.maps) {
    try {
      const map = new google.maps.Map(el, { center: {lat: locs[0].lat, lng: locs[0].lng}, zoom: 13 });
      locs.forEach((loc, i) => {
        new google.maps.Marker({ position: {lat: loc.lat, lng: loc.lng}, map, title: loc.name });
      });
    } catch(e) { el.innerHTML = '<div class="map-fallback"><div class="map-icon">📍</div><p>View locations on Google Maps</p></div>'; }
  } else {
    el.innerHTML = '<div class="map-fallback"><div class="map-icon">📍</div><p>Google Maps requires an API key</p><br>' +
      locs.map(l => '<a href="https://www.google.com/maps/search/?api=1&query=' + l.lat + ',' + l.lng + '" target="_blank" class="btn btn-outline btn-sm" style="margin:0.2rem">' + l.name + '</a>').join('') + '</div>';
  }
}

function selectLocation(index) {
  document.querySelectorAll('.location-card').forEach((c, i) => c.classList.toggle('active', i === index));
}

if (document.getElementById('map')) { window.initMap = initMap; setTimeout(initMap, 200); }
if (document.getElementById('locations-map')) { window.initLocationsMap = initLocationsMap; setTimeout(initLocationsMap, 200); }

// ---------- CHATBOT ----------
const chatTrigger = document.getElementById('chatbot-trigger');
const chatWindow = document.getElementById('chatbot-window');
const chatClose = document.getElementById('chatbot-close');
const chatSend = document.getElementById('chatbot-send');
const chatInput = document.getElementById('chatbot-input-field');
const chatMessages = document.getElementById('chatbot-messages');
let chatLeadCaptured = false;

chatTrigger?.addEventListener('click', () => {
  chatWindow.classList.toggle('open');
  // Remove badge on open
  const badge = chatTrigger.querySelector('.chatbot-trigger-badge');
  if (badge) badge.style.display = 'none';
});
chatClose?.addEventListener('click', () => chatWindow.classList.remove('open'));
chatSend?.addEventListener('click', chatSend_fn);
chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') chatSend_fn(); });

document.querySelectorAll('.quick-reply').forEach(btn => {
  btn.addEventListener('click', function() {
    addChatMessage(this.dataset.message, 'user');
    this.closest('.chatbot-quick-replies')?.remove();
    handleChatBot(this.dataset.message);
  });
});

function chatSend_fn() {
  const val = chatInput?.value.trim();
  if (!val) return;
  addChatMessage(val, 'user');
  chatInput.value = '';
  handleChatBot(val);
}

function addChatMessage(text, sender) {
  const div = document.createElement('div');
  div.className = 'chatbot-message ' + sender;
  div.innerHTML = '<div class="chatbot-msg-content"><p>' + text.replace(/</g,'&lt;').replace(/\n/g,'<br>') + '</p></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chatbot-message bot chatbot-typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="chatbot-typing-dots"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

function handleChatBot(msg) {
  showTyping();
  setTimeout(() => {
    hideTyping();
    const lower = msg.toLowerCase();
    let response = '';

    if (lower.includes('emergency') || lower.includes('urgent')) {
      response = '🚨 For emergencies, we have 24/7 priority scheduling!\n\nPlease call us immediately at +1 (212) 555-0100 or click below to book an emergency slot.';
      addChatMessage(response, 'bot');
      // Add emergency booking link
      const div = document.createElement('div');
      div.className = 'chatbot-message bot';
      div.innerHTML = '<div class="chatbot-msg-content"><a href="booking.html?type=emergency" class="btn btn-emergency btn-sm" style="margin-top:0.5rem;">🚨 Emergency Book</a></div>';
      chatMessages.appendChild(div);
    }
    else if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule')) {
      response = '📅 Great! Let\'s get you booked.\n\nYou can choose from:\n• Premium Consulting\n• Business Strategy\n• Team Workshop\n• And more!\n\nClick below to start booking:';
      addChatMessage(response, 'bot');
      const div = document.createElement('div');
      div.className = 'chatbot-message bot';
      div.innerHTML = '<div class="chatbot-msg-content"><a href="booking.html" class="btn btn-primary btn-sm" style="margin-top:0.4rem;">📅 Book Now</a></div>';
      chatMessages.appendChild(div);
    }
    else if (lower.includes('service') || lower.includes('offer') || lower.includes('what do')) {
      const svcList = CONFIG.services.slice(0,4).map(s => '• ' + s.name + ' — $' + s.price).join('\n');
      response = '📋 Here are our popular services:\n\n' + svcList + '\n\nWould you like details on any of these?';
      addChatMessage(response, 'bot');
    }
    else if (lower.includes('hour') || lower.includes('open') || lower.includes('when')) {
      const hrs = CONFIG.openingHours.map(h => h.day + ': ' + h.hours).join('\n');
      response = '🕐 Our operating hours:\n\n' + hrs;
      addChatMessage(response, 'bot');
    }
    else if (lower.includes('location') || lower.includes('where') || lower.includes('office') || lower.includes('address')) {
      const locs = CONFIG.locations.map(l => '📍 ' + l.name + '\n   ' + l.address + ', ' + l.city).join('\n\n');
      response = 'We have ' + CONFIG.locations.length + ' locations:\n\n' + locs;
      addChatMessage(response, 'bot');
    }
    else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      response = '💰 Our pricing starts from $150. Prices vary by service and duration.\n\nWould you like me to show you a specific service price?';
      addChatMessage(response, 'bot');
    }
    else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call')) {
      response = '📞 Call: +1 (212) 555-0100\n✉️ Email: info@yourbusiness.com\n💬 WhatsApp: Chat with us anytime';
      addChatMessage(response, 'bot');
    }
    else {
      // Lead capture attempt
      if (!chatLeadCaptured && (lower.includes('email') || lower.includes('@') || lower.includes('name') || lower.includes('help'))) {
        response = 'I\'d love to help you further! Could you share your email so one of our team members can reach out personally?';
        chatLeadCaptured = true;
      } else {
        response = 'I can help you with:\n\n📅 Book an appointment\n📋 View services\n🕐 Check hours\n📍 Find locations\n🚨 Emergency booking\n💰 Pricing info\n\nWhat would you like to know?';
      }
      addChatMessage(response, 'bot');
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
}

// ---------- BOOKING SYSTEM ----------
let bookingStep = 1;
let bookingData = {};
let stripe, cardElements;

// Detect emergency mode
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('type') === 'emergency') {
  const badge = document.getElementById('emergency-badge');
  if (badge) badge.style.display = 'inline-block';
}
// Pre-select service from URL
const urlService = urlParams.get('service');

// Booking filter tabs
document.querySelectorAll('#booking-filter-tabs .filter-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('#booking-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.booking-service-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
    });
  });
});

// Service filter tabs (services page)
document.querySelectorAll('.filter-tabs:not(#booking-filter-tabs) .filter-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.filter-tabs:not(#booking-filter-tabs) .filter-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.service-detail-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', function() {
    const item = this.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Service selection
document.querySelectorAll('.booking-service-card').forEach(card => {
  card.addEventListener('click', function() {
    document.querySelectorAll('.booking-service-card').forEach(c => c.classList.remove('selected'));
    this.classList.add('selected');
    bookingData.service = this.dataset.service;
    bookingData.price = parseFloat(this.dataset.price);
    bookingData.duration = this.dataset.duration;
    bookingData.availableStaff = JSON.parse(this.dataset.staff);
    goToStep(2);
  });
  card.querySelector('.btn-select')?.addEventListener('click', (e) => { e.stopPropagation(); card.click(); });
});

// Pre-select service from URL
if (urlService) {
  const matchCard = document.querySelector('.booking-service-card[data-service="' + CSS.escape(urlService) + '"]');
  if (matchCard) setTimeout(() => matchCard.click(), 300);
}

// Staff selection
function renderStaffOptions() {
  const container = document.getElementById('staff-options');
  if (!container || !bookingData.availableStaff) return;
  container.innerHTML = bookingData.availableStaff.map(s => {
    const initials = s.split(' ').map(n => n[0]||'').join('');
    return `<div class="staff-option" data-staff="${s}">
      <div class="mini-avatar" style="width:36px;height:36px;font-size:0.72rem">${initials}</div>
      <div class="staff-option-info"><strong>${s}</strong><span>Available</span></div>
    </div>`;
  }).join('');
  container.querySelectorAll('.staff-option').forEach(opt => {
    opt.addEventListener('click', function() {
      container.querySelectorAll('.staff-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      bookingData.staff = this.dataset.staff;
    });
  });
}

// Calendar
let calMonth = new Date();
function renderCalendar() {
  const cal = document.getElementById('calendar');
  const monthYear = document.getElementById('calendar-month-year');
  if (!cal) return;
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  monthYear.textContent = calMonth.toLocaleDateString('en-US', { month:'long', year:'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    html += `<div class="cal-day ${isPast?'past':''} ${isToday?'today':''}" data-date="${date.toISOString()}">${d}</div>`;
  }
  cal.innerHTML = html;
  cal.querySelectorAll('.cal-day:not(.past)').forEach(day => {
    day.addEventListener('click', function() {
      cal.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      this.classList.add('selected');
      bookingData.date = this.dataset.date;
      renderTimeSlots();
      document.getElementById('next-btn-2')?.removeAttribute('disabled');
    });
  });
}

function renderTimeSlots() {
  const container = document.getElementById('time-slots');
  if (!container) return;
  const times = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
  container.innerHTML = times.map(t => `<div class="time-slot" data-time="${t}">${t}</div>`).join('');
  container.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
      container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
      bookingData.time = this.dataset.time;
    });
  });
}

document.getElementById('prev-month')?.addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth()-1); renderCalendar(); });
document.getElementById('next-month')?.addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth()+1); renderCalendar(); });

// Step navigation
function goToStep(step) {
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active','completed');
    if (i + 1 < step) s.classList.add('completed');
    if (i + 1 === step) s.classList.add('active');
  });
  const target = document.getElementById('step-' + step);
  if (target) target.classList.add('active');
  bookingStep = step;
  if (step === 2) { renderStaffOptions(); renderCalendar(); }
  if (step === 4) { updatePaymentSummary(); initStripe(); }
}

function nextStep() {
  if (bookingStep === 2) {
    if (!bookingData.date || !bookingData.time) { alert('Please select a date and time.'); return; }
    if (!bookingData.staff) { alert('Please select an expert.'); return; }
  }
  if (bookingStep === 3) {
    const fname = document.getElementById('cust-fname')?.value;
    const email = document.getElementById('cust-email')?.value;
    if (!fname || !email) { alert('Please fill in your details.'); return; }
    bookingData.firstname = fname;
    bookingData.lastname = document.getElementById('cust-lname')?.value;
    bookingData.email = email;
    bookingData.phone = document.getElementById('cust-phone')?.value;
    bookingData.location = document.getElementById('cust-location')?.value;
    bookingData.notes = document.getElementById('cust-notes')?.value;
  }
  if (bookingStep < 5) goToStep(bookingStep + 1);
}

function prevStep() {
  if (bookingStep > 1) goToStep(bookingStep - 1);
}

// Payment toggle
document.querySelectorAll('.toggle-option').forEach(opt => {
  opt.addEventListener('click', function() {
    document.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
    this.classList.add('active');
    this.querySelector('input[type=radio]').checked = true;
    bookingData.payType = this.dataset.pay;
    updatePaymentSummary();
  });
});

function updatePaymentSummary() {
  const price = bookingData.price || 0;
  const isDeposit = bookingData.payType === 'deposit';
  const amount = isDeposit ? price * 0.5 : price;
  document.getElementById('sum-service') && (document.getElementById('sum-service').textContent = bookingData.service || '—');
  document.getElementById('sum-staff') && (document.getElementById('sum-staff').textContent = bookingData.staff || '—');
  document.getElementById('sum-date') && (document.getElementById('sum-date').textContent = bookingData.date ? new Date(bookingData.date).toLocaleDateString() : '—');
  document.getElementById('sum-time') && (document.getElementById('sum-time').textContent = bookingData.time || '—');
  document.getElementById('sum-location') && (document.getElementById('sum-location').textContent = bookingData.location || '—');
  document.getElementById('sum-total') && (document.getElementById('sum-total').textContent = '$' + price);
  document.getElementById('sum-amount') && (document.getElementById('sum-amount').textContent = '$' + amount);
  document.getElementById('pay-label') && (document.getElementById('pay-label').textContent = isDeposit ? 'Deposit (50%)' : 'Full Payment');
  document.getElementById('pay-btn') && (document.getElementById('pay-btn').textContent = 'Pay $' + amount + ' & Continue');
  bookingData.amountDue = amount;
}

function initStripe() {
  if (stripe || !CONFIG.stripeKey) return;
  try {
    stripe = Stripe(CONFIG.stripeKey);
    const elements = stripe.elements();
    const cardEl = elements.create('card', { style: { base: { color: '#f1f5f9', iconColor: '#6366f1', '::placeholder': { color: '#64748b' } }, invalid: { color: '#ef4444' } } });
    cardEl.mount('#card-element');
    cardEl.on('change', (e) => { document.getElementById('card-errors').textContent = e.error ? e.error.message : ''; });
    cardElements = cardEl;
  } catch(e) { console.log('Stripe not initialized — key required'); }
}

async function processPayment() {
  if (!stripe || !cardElements) {
    // Demo mode — no real Stripe
    goToStep(5);
    populateConfirmation();
    return;
  }
  const btn = document.getElementById('pay-btn');
  btn.disabled = true; btn.textContent = 'Processing...';
  try {
    const { token, error } = await stripe.createToken(cardElements);
    if (error) { document.getElementById('card-errors').textContent = error.message; btn.disabled = false; btn.textContent = 'Pay $' + bookingData.amountDue + ' & Continue'; return; }
    bookingData.paymentToken = token.id;
    // Send to backend/n8n webhook here
    console.log('Payment token:', token.id, 'Booking:', bookingData);
    goToStep(5);
    populateConfirmation();
  } catch(e) { btn.disabled = false; btn.textContent = 'Pay $' + (bookingData.amountDue||0) + ' & Continue'; }
}

function populateConfirmation() {
  const ref = 'BK' + Date.now().toString().slice(-6);
  document.getElementById('confirm-ref') && (document.getElementById('confirm-ref').textContent = ref);
  document.getElementById('confirm-svc') && (document.getElementById('confirm-svc').textContent = bookingData.service || '—');
  document.getElementById('confirm-staff') && (document.getElementById('confirm-staff').textContent = bookingData.staff || '—');
  document.getElementById('confirm-dt') && (document.getElementById('confirm-dt').textContent = (bookingData.date ? new Date(bookingData.date).toLocaleDateString() : '') + ' ' + (bookingData.time || ''));
  document.getElementById('confirm-amt') && (document.getElementById('confirm-amt').textContent = '$' + (bookingData.amountDue || 0));
  document.getElementById('confirm-email') && (document.getElementById('confirm-email').textContent = bookingData.email || '—');
  // Trigger email notification (n8n webhook)
  console.log('Booking confirmed — trigger email/SMS notification via n8n');
}

// ---------- PWA ----------
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('pwa-prompt')?.classList.add('show');
});
document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
  if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; console.log('PWA install:', outcome); deferredPrompt = null; }
  document.getElementById('pwa-prompt')?.classList.remove('show');
});
document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => { document.getElementById('pwa-prompt')?.classList.remove('show'); });

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(r => console.log('SW registered')).catch(e => console.log('SW failed', e));
}

// ---------- SCROLL ANIMATIONS ----------
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .staff-card, .testimonial-card, .contact-method, .value-card, .about-usp-card, .kpi-card').forEach(el => {
  el.classList.add('anim-target');
  animObserver.observe(el);
});

// ---------- PAGE INIT ----------
updateNavAuth();

// Detect current page and run init
const currentPage = window.location.pathname.split('/').pop();
if (currentPage === 'login.html') initAuthPage();
if (currentPage === 'admin-dashboard.html') initAdmin();
if (currentPage === 'customer-portal.html') initPortal();

console.log('✅ TIER-3 Premium Website loaded successfully!');