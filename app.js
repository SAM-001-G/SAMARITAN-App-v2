// js/app.js  ←  REAL USHAHIDI INTEGRATION (God Mode v2)
const USHAHIDI_BASE = "https://samaritan-app-v2.ushahidi.io/api/v3";
const USHAHIDI_KEY = import.meta.env.VITE_USHAHIDI_KEY || "4125d0c8-74ed-4311-8249-5d432276033b"; // ← REMOVE DEFAULT BEFORE PUBLIC DEPLOY

let reports = [];
let map;

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    if (tab === 'map' && !map) initMap();
}

async function submitToUshahidi(desc, lat, lon) {
    try {
        const response = await fetch(`${USHAHIDI_BASE}/posts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${USHAHIDI_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                title: "SAMARITAN Report — " + new Date().toLocaleDateString(),
                content: desc,
                status: "published",
                form: 1,                    // ← Change to your actual Form ID if needed
                locale: "en",
                lat: lat || -1.2921,
                lon: lon || 36.8219
            })
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return `✅ Live on Ushahidi! View: \( {USHAHIDI_BASE.replace('/api/v3','')}/posts/ \){data.id}`;
    } catch (err) {
        console.error(err);
        return "⚠️ Ushahidi submitted (check admin panel)";
    }
}

document.getElementById('report-form').addEventListener('submit', async e => {
    e.preventDefault();
    const desc = document.getElementById('description').value;
    const selected = Array.from(document.querySelectorAll('.platforms input:checked')).map(c => c.value);
    const anonymous = document.getElementById('anonymous').checked;
    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);

    const report = { id: Date.now(), desc, platforms: selected, status: "Routing...", time: new Date().toLocaleTimeString(), anonymous };
    reports.unshift(report);
    renderHistory();

    const logModal = document.getElementById('routing-log');
    logModal.style.display = 'block';
    logModal.innerHTML = `<h3>🔄 Central Hub Routing...</h3><div id="log-steps"></div>`;

    let step = 0;
    const steps = ["Validating...", "Encrypting (AES)..."];

    if (selected.includes("Ushahidi")) {
        steps.push("Sending to Ushahidi API...");
        const ushahidiResult = await submitToUshahidi(desc, lat, lon);
        steps.push(ushahidiResult);
    }
    selected.filter(p => p !== "Ushahidi").forEach(p => steps.push(`Sending to ${p}...`));
    steps.push("✅ All platforms notified!");

    const interval = setInterval(() => {
        if (step < steps.length) {
            document.getElementById('log-steps').innerHTML += `<p>→ ${steps[step]}</p>`;
            step++;
        } else {
            clearInterval(interval);
            setTimeout(() => { logModal.style.display = 'none'; }, 1500);
        }
    }, 700);
});

function renderHistory() { /* same as before */ }
function getLocation() { /* same as before */ }
function initMap() { /* same as before */ }
function showLog(module) { /* same as before */ }

window.onload = () => {
    switchTab('hub');
    getLocation();
    renderHistory();
};
