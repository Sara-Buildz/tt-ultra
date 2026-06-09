// players.js - Updated to fetch from Backend
async function loadPlayerData() {
    try {
        const response = await fetch('https://tt-ultra-production.up.railway.app/players'); 
        const players = await response.json();
        
        localStorage.setItem('tt_athletes', JSON.stringify(players));
        displayPlayers(players);
    } catch (error) {
        console.error("Cannot connect to server, using local data...", error);
        const stored = localStorage.getItem('tt_athletes');
        displayPlayers(stored ? JSON.parse(stored) : initialPlayers);
    }
}

function filterData() {
    const players = JSON.parse(localStorage.getItem('tt_athletes')) || initialPlayers;
    
    const searchTerm = document.getElementById('nameSearch').value.toLowerCase();
    const regionTerm = document.getElementById('regionFilter').value;
    const sortTerm = document.getElementById('rankSort').value;

    let filtered = players.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm);
        const matchesRegion = regionTerm === "all" || p.region === regionTerm;
        return matchesName && matchesRegion;
    });

    if (sortTerm === "top") {
        filtered.sort((a, b) => parseInt(a.rank) - parseInt(b.rank));
    }

    displayPlayers(filtered);
}

function displayPlayers(players) {
    let container = document.getElementById("playersContainer");
    container.innerHTML = "";

    players.forEach(player => {
        let card = document.createElement("div");
        card.className = "p-card";
        
        let badgeHTML = parseInt(player.rank) <= 3
            ? `<div class="diamond-badge">💎 TOP TIER</div>`
            : '';

        let avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(player.name);

        card.innerHTML = `
            ${badgeHTML}
            <img src="${avatarUrl}" alt="Player Avatar">
            <h3>${player.name}</h3>
            <div class="rank-tag">RANK #${player.rank} - ${player.region}</div>
            <div class="player-info">Points: ${player.score}</div>
        `;
        container.appendChild(card);
    });
}

// Initial Data (Fallback — matches server.js / players.json)
const initialPlayers = [
    { "name": "Babar Hussain", "region": "PUNJAB", "rank": "1", "score": "4500" },
    { "name": "Asim Qureshi", "region": "SINDH", "rank": "2", "score": "4200" },
    { "name": "Fahad Khawaja", "region": "KPK", "rank": "3", "score": "3900" },
    { "name": "Hamza Ali", "region": "ISLAMABAD", "rank": "4", "score": "3700" },
    { "name": "Shah Khan", "region": "BALOCHISTAN", "rank": "5", "score": "3500" },
    { "name": "Rizwan Ahmad", "region": "PUNJAB", "rank": "6", "score": "3100" }
];

// Start
loadPlayerData();

// Event Listeners
document.getElementById('nameSearch').addEventListener('input', filterData);
document.getElementById('regionFilter').addEventListener('change', filterData);
document.getElementById('rankSort').addEventListener('change', filterData);