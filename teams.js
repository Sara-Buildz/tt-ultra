// teams.js

// This function acts as the "Bridge" to your Node.js Backend
async function loadTeams() {
    const container = document.getElementById('teamsContainer');
    
    try {
        // Step 10: Fetching data from the API you built in server.js
     const response = await fetch('https://tt-ultra-production.up.railway.app/teams');
        
        if (!response.ok) throw new Error("Server error");
        
        const teams = await response.json();
        console.log("Data received from Server:", teams);
        displayTeams(teams);

    } catch (error) {
        console.warn("Backend server not detected. Showing local data.");
        
        // This ensures the website still works even if you haven't run 'node server.js'
       const fallbackTeams = [
    { name: "Lahore Table Tennis Club", region: "PUNJAB", players: 12 },
    { name: "Karachi TT Academy", region: "SINDH", players: 15 },
    { name: "Islamabad Ping Pong Union", region: "ISLAMABAD", players: 8 },
    { name: "Peshawar TT Warriors", region: "KPK", players: 10 },
    { name: "Quetta Smashers", region: "BALOCHISTAN", players: 9 },
    { name: "Rawalpindi Spin Masters", region: "PUNJAB", players: 14 },
    { name: "Multan Topspin Syndicate", region: "PUNJAB", players: 11 },
    { name: "Hyderabad Paddle Kings", region: "SINDH", players: 13 },
    { name: "Faisalabad TT Titans", region: "PUNJAB", players: 16 },
    { name: "Abbottabad Elevation TT", region: "KPK", players: 7 },
    { name: "Gwadar Coastal Pings", region: "BALOCHISTAN", players: 10 }
];
        displayTeams(fallbackTeams);
    }
}


function displayTeams(teams) {
    const container = document.getElementById('teamsContainer');
    container.innerHTML = ''; // Clear loading state

    teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="team-badge">TEAM</div>
            <h3>${team.name}</h3>
            <p style="margin-top:10px;"><strong>📍 Region:</strong> ${team.region}</p>
            <p><strong>👥 Players:</strong> ${team.players}</p>
        `;
        container.appendChild(card);
    });
}

// Initialize the data fetch
loadTeams();