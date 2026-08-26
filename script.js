// Sign up for a free token at football-data.org
const API_TOKEN = 'YOUR_FOOTBALL_DATA_API_KEY_HERE'; 
const PREMIER_LEAGUE_ID = 'PL'; // Standard code for Premier League on this platform
const API_URL = `https://football-data.org{PREMIER_LEAGUE_ID}/matches`;

const matchContainer = document.getElementById('match-container');
const refreshBtn = document.getElementById('refresh-btn');

async function fetchPLMatches() {
    matchContainer.innerHTML = '<div class="loading">Loading Premier League Matchday...</div>';
    
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Auth-Token': API_TOKEN
            }
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        // Filtering to show matches from the current active matchday
        renderMatches(data.matches);
        
    } catch (error) {
        matchContainer.innerHTML = '<div class="error">Unable to sync live Premier League data. Displaying standby slate...</div>';
        console.error(error);
        injectMockData(); // Safeguard to prevent an empty screen while testing
    }
}

function renderMatches(matches) {
    matchContainer.innerHTML = '';
    
    if (!matches || matches.length === 0) {
        matchContainer.innerHTML = '<div class="no-matches">No Premier League matches scheduled for today.</div>';
        return;
    }

    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : '-';
        const awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : '-';
        
        // Status cleanups (IN_PLAY, TIMED, FINISHED)
        let statusText = match.status.replace('_', ' ');
        const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

        card.innerHTML = `
            <div class="league">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</div>
            <div class="teams-container">
                <div class="team-row">
                    <span>${homeTeam}</span>
                    <span class="score">${homeScore}</span>
                </div>
                <div class="team-row">
                    <span>${awayTeam}</span>
                    <span class="score">${awayScore}</span>
                </div>
            </div>
            <div class="match-status">
                <span>${statusText}</span>
                ${isLive ? `<span class="live">⏱️ LIVE</span>` : ''}
            </div>
        `;
        
        matchContainer.appendChild(card);
    });
}

// Automatic testing fallback if you haven't dropped your API key in yet
function injectMockData() {
    const fallbackData = [
        { homeTeam: { name: "Arsenal" }, awayTeam: { name: "Chelsea" }, score: { fullTime: { home: 3, away: 2 } }, status: "FINISHED" },
        { homeTeam: { name: "Manchester City" }, awayTeam: { name: "Liverpool" }, score: { fullTime: { home: 1, away: 1 } }, status: "IN_PLAY" },
        { homeTeam: { name: "Tottenham Hotspur" }, awayTeam: { name: "Manchester United" }, score: { fullTime: { home: null, away: null } }, status: "TIMED" }
    ];
    renderMatches(fallbackData);
}

refreshBtn.addEventListener('click', fetchPLMatches);
window.addEventListener('DOMContentLoaded', fetchPLMatches);
