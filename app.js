// Initialize Lucide icons
lucide.createIcons();

// --- Mouse Glow Effect ---
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// --- State Variables ---
let isSystemActive = false;
let aqiInterval;

// --- DOM Elements ---
const aqiDisplay = document.getElementById('aqi-display');
const aqiUnit = document.getElementById('aqi-unit');
const aqiBar = document.getElementById('aqi-bar');
const dustDisplay = document.getElementById('dust-display');
const simulateBtn = document.getElementById('simulateBtn');
const systemStatusIndicator = document.getElementById('system-status-indicator');
const statusDot = systemStatusIndicator.querySelector('.pulse-dot');
const statusText = systemStatusIndicator.querySelector('.status-text');
const aqiCard = aqiDisplay.closest('.metric-card');
const chartOverlay = document.getElementById('chart-overlay-success');

// --- Real-time AQI Simulator ---
function updateAQI(targetAqi, immediate = false) {
    const startValue = parseInt(aqiDisplay.innerText) || 285;
    const duration = immediate ? 500 : 1000;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * (targetAqi - startValue) + startValue);
        
        aqiDisplay.innerText = currentValue;
        
        // Update bar width
        const maxAqi = 500;
        const percentage = Math.min((currentValue / maxAqi) * 100, 100);
        aqiBar.style.width = `${percentage}%`;

        // Update styling based on thresholds
        if (currentValue < 100) {
            aqiDisplay.className = 'metric-value text-success';
            aqiUnit.innerText = 'Satisfactory';
            aqiBar.className = 'progress-bar-fill aqi-fill-success';
            aqiCard.classList.remove('alert-state');
            aqiCard.style.borderColor = 'rgba(0, 255, 102, 0.3)';
            aqiCard.style.boxShadow = '0 0 20px rgba(0, 255, 102, 0.1)';
        } else if (currentValue < 200) {
            aqiDisplay.className = 'metric-value text-warning';
            aqiUnit.innerText = 'Moderate';
            aqiBar.style.background = 'var(--warning-neon)';
            aqiCard.classList.remove('alert-state');
            aqiCard.style.borderColor = 'rgba(255, 230, 0, 0.3)';
            aqiCard.style.boxShadow = 'none';
        } else {
            aqiDisplay.className = 'metric-value text-danger';
            aqiUnit.innerText = 'Poor';
            aqiBar.className = 'progress-bar-fill aqi-fill-danger';
            aqiCard.classList.add('alert-state');
            aqiCard.style.borderColor = '';
            aqiCard.style.boxShadow = '';
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function runSimulationCycle() {
    if (isSystemActive) {
        // Tarp system is active, dust is contained, AQI drops to ambient background levels (~85)
        const baseAqi = 85;
        const variation = Math.floor(Math.random() * 15) - 5;
        updateAQI(baseAqi + variation);
    } else {
        // Normal high pollution state (~285)
        const baseAqi = 285;
        const variation = Math.floor(Math.random() * 40) - 15;
        updateAQI(baseAqi + variation);
    }
}

// Start simulation loop
runSimulationCycle();
aqiInterval = setInterval(runSimulationCycle, 3500);

// --- Charts Setup ---
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Space Grotesk', sans-serif";

// Source Chart
const ctxSource = document.getElementById('sourceChart').getContext('2d');
const sourceChart = new Chart(ctxSource, {
    type: 'doughnut',
    data: {
        labels: ['Vehicular Road Dust', 'Industrial Emissions', 'Vehicular Exhaust', 'Construction'],
        datasets: [{
            data: [32, 28, 25, 15],
            backgroundColor: [
                '#ff003c', // Danger neon
                '#ffe600', // Warning neon
                '#3b82f6', // Blue
                '#475569'  // Slate
            ],
            borderColor: '#020617',
            borderWidth: 3,
            hoverOffset: 10
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#f8fafc', padding: 15, usePointStyle: true }
            }
        },
        cutout: '70%'
    }
});

// Efficiency Chart
const ctxEfficiency = document.getElementById('efficiencyChart').getContext('2d');
const efficiencyChart = new Chart(ctxEfficiency, {
    type: 'bar',
    data: {
        labels: ['Open Bed', 'Manual Tarp', 'IoT Auto-Tarp'],
        datasets: [{
            label: 'Dust (kg/trip)',
            data: [2.5, 0.8, 0.12],
            backgroundColor: [
                'rgba(255, 0, 60, 0.8)',
                'rgba(255, 230, 0, 0.8)',
                'rgba(0, 255, 102, 0.8)'
            ],
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#f8fafc' }
            }
        },
        plugins: { legend: { display: false } }
    }
});

// --- Interactivity: Engage System Button ---
simulateBtn.addEventListener('click', () => {
    isSystemActive = !isSystemActive;
    
    if (isSystemActive) {
        // Activate system
        simulateBtn.innerHTML = '<i data-lucide="power-off"></i> DISENGAGE SYSTEM';
        simulateBtn.style.background = 'var(--cyan-neon)';
        simulateBtn.style.color = 'var(--bg-base)';
        
        // Update Status
        systemStatusIndicator.style.background = 'rgba(0, 255, 102, 0.1)';
        systemStatusIndicator.style.borderColor = 'rgba(0, 255, 102, 0.3)';
        statusDot.className = 'pulse-dot success';
        statusText.className = 'status-text success-text';
        statusText.innerText = 'System Active - Zero Emissions';
        
        // Animate Dust Drop
        dustDisplay.innerText = '0.9';
        dustDisplay.className = 'metric-value text-success';
        
        // Update Source Chart (Road dust drops)
        sourceChart.data.datasets[0].data[0] = 5; // Drops from 32 to 5
        sourceChart.update();
        
        // Show Success Overlay on Efficiency chart
        chartOverlay.classList.add('active');

        // Immediate AQI update
        updateAQI(85, true);
        
    } else {
        // Deactivate system
        simulateBtn.innerHTML = '<i data-lucide="power"></i> ENGAGE TARPING SYSTEM';
        simulateBtn.style.background = 'transparent';
        simulateBtn.style.color = 'var(--cyan-neon)';
        
        // Revert Status
        systemStatusIndicator.style.background = 'rgba(255, 0, 60, 0.1)';
        systemStatusIndicator.style.borderColor = 'rgba(255, 0, 60, 0.2)';
        statusDot.className = 'pulse-dot warning';
        statusText.className = 'status-text warning-text';
        statusText.innerText = 'System Inactive - High Emissions';
        
        // Revert Dust
        dustDisplay.innerText = '37.5';
        dustDisplay.className = 'metric-value text-warning';
        
        // Revert Source Chart
        sourceChart.data.datasets[0].data[0] = 32;
        sourceChart.update();
        
        // Hide Overlay
        chartOverlay.classList.remove('active');

        // Immediate AQI update
        updateAQI(285, true);
    }
    
    lucide.createIcons();
});
