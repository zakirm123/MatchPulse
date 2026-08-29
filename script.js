const API_URL = 'https://thesportsdb.com';
const fixturesContainer = document.getElementById('pl-fixtures');
const refreshBtn = document.getElementById('refresh-btn');

async function getPLFixtures() {
    try {
        fixturesContainer.innerHTML = '<p class="loading">Updating latest matches...</p>';
        
        const response = await fetch(API_URL);
        const data = await response.json();
        
        fixturesContainer.innerHTML = ''; 

        if (!data.events || data.events.length === 0) {
            fixturesContainer.innerHTML = '<p class="loading">No matches scheduled at the moment.</p>';
            return;
        }

        // Beautiful structural placement for update tracking timestamp text
        const now = new Date();
        const timeStamp = document.createElement('div');
        timeStamp.className = 'timestamp-msg';
        timeStamp.innerHTML = `🔄 Connected Live • Updated at: <strong>${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</strong>`;
        fixturesContainer.appendChild(timeStamp);

        data.events.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';
            
            const homeScore = match.intHomeScore !== null ? match.intHomeScore : '0';
            const awayScore = match.intAwayScore !== null ? match.intAwayScore : '0';
            
            const matchDate = new Date(match.dateEvent + 'T' + match.strTime);
            const formattedTime = matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            let statusText = formattedTime;
            let liveStatusClass = '';

            if (match.strStatus === 'Match Finished' || match.strStatus === 'FT') {
                statusText = 'FT';
            } else if (match.strStatus === 'In Progress' || match.strInProgress === 'true') {
                statusText = '🔴 LIVE';
                liveStatusClass = 'live-pulse';
            }

            card.innerHTML = `
                <div class="team-box">
                    <span class="team-name">${match.strHomeTeam}</span>
                </div>
                <div class="center-box">
                    <div class="score">${homeScore} : ${awayScore}</div>
                    <div class="time-status ${liveStatusClass}">${statusText}</div>
                </div>
                <div class="team-box">
                    <span class="team-name">${match.strAwayTeam}</span>
                </div>
            `;
            
            fixturesContainer.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        fixturesContainer.innerHTML = '<p style="color:#ff0055; text-align:center;">Network error fetching live updates.</p>';
    }
}

// Hook up your button click action listener safely
refreshBtn.addEventListener('click', getPLFixtures);

// Initial bootstrap trigger sequence loader
getPLFixtures();
