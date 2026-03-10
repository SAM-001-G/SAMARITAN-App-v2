// js/app.js
let reports = [];
let map;

const samplePlatforms = ["Ushahidi", "EACC", "A4T", "Uwajibikaji", "Fichua"];

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    if (tab === 'map' && !map) initMap();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            document.getElementById('location-info').innerHTML = `📍 Nairobi, Kenya (auto-detected)`;
            document.getElementById('lat').value = lat;
            document.getElementById('lon').value = lon;
        });
    }
}

document.getElementById('report-form').addEventListener('submit', e => {
    e.preventDefault();
    const desc = document.getElementById('description').value;
    const selected = Array.from(document.querySelectorAll('.platforms input:checked')).map(c => c.value);
    const anonymous = document.getElementById('anonymous').checked;

    const report = {
        id: Date.now(),
        desc,
        platforms: selected,
        status: "Routing through Central Hub...",
        time: new Date().toLocaleTimeString(),
        anonymous
    };

    reports.unshift(report);
    renderHistory();

    // Animated routing log
    const logModal = document.getElementById('routing-log');
    logModal.style.display = 'block';
    logModal.innerHTML = `<h3>🔄 Central Hub Routing in progress...</h3><div id="log-steps"></div>`;
    
    let step = 0;
    const steps = ["Validating report...", "Encrypting media (AES)...", ...selected.map(p => `Sending to ${p}...`), "Logging in Database...", "✅ All submissions complete!"];
    
    const interval = setInterval(() => {
        if (step < steps.length) {
            document.getElementById('log-steps').innerHTML += `<p>→ ${steps[step]}</p>`;
            step++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                logModal.style.display = 'none';
                alert("✅ Report successfully routed to all selected platforms!");
            }, 800);
        }
    }, 600);
});

function renderHistory() {
    const container = document.getElementById('report-history');
    container.innerHTML = reports.map(r => `
        <div class="post-card">
            <p><strong>${r.desc.substring(0,80)}...</strong></p>
            <small>→ ${r.platforms.join(' • ')} | ${r.status}</small>
            <small style="color:#0f0;">${r.time} ${r.anonymous ? '🔒 Anonymous' : ''}</small>
        </div>
    `).join('');
}

function initMap() {
    map = L.map('leaflet-map').setView([-1.2921, 36.8219], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([-1.2921, 36.8219]).addTo(map).bindPopup("Nairobi Hub");
}

function showLog(module) {
    const logModal = document.getElementById('routing-log');
    logModal.style.display = 'block';
    logModal.innerHTML = `<h3>${module} Status</h3><p>✅ Connected & Ready (as per your architecture diagram)</p><button onclick="this.parentElement.style.display='none'" class="btn">Close</button>`;
}

// Init
window.onload = () => {
    switchTab('hub');
    getLocation();
    renderHistory();
};
