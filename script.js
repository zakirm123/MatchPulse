// Using TheSportsDB English Premier League (League ID: 4328)
const API_URL = 'https://thesportsdb.com';
const fixturesContainer = document.getElementById('pl-fixtures');

async function getPLFixtures() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        fixturesContainer.innerHTML = ''; 

        if (!data.events || data.events.length === 0) {
            fixturesContainer.innerHTML = '<p class="loading">No matches scheduled at the moment.</p>';
            return;
        }

        data.events.forEach(match => {
            const card = document.createElement('div');
            card.classList.add('match-card');
            
            // Allow users to click the card to watch video highlights/recaps
            card.setAttribute('title', 'Click to watch match video');

            const homeScore = match.intHomeScore !== null ? match.intHomeScore : '0';
            const awayScore = match.intAwayScore !== null ? match.intAwayScore : '0';
            
            const matchDate = new Date(match.dateEvent + 'T' + match.strTime);
            const formattedTime = matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            let statusText = formattedTime;
            let liveStatusClass = '';

            // Check match states
            if (match.strStatus === 'Match Finished' || match.strStatus === 'FT') {
                statusText = 'FT (Watch Video)';
                liveStatusClass = 'video-available';
            } else if (match.strStatus === 'In Progress' || match.strInProgress === 'true') {
                statusText = '🔴 LIVE (Watch Recaps)';
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
            
            // CLICK TRIGGER: Opens the video player when clicked
            card.addEventListener('click', () => {
                // The API provides an official YouTube highlight/recap video link if available
                // If the link isn't ready yet, it falls back to the official Sky Sports / NBC Premier League channel
                const videoUrl = match.strVideo || `https://youtube.com{encodeURIComponent(match.strEvent + ' highlights')}`;
                openVideoModal(videoUrl, match.strEvent);
            });

            fixturesContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Function to generate the pop-up video player component
function openVideoModal(url, matchTitle) {
    // Convert regular YouTube link to embed format so it plays directly inside your site
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        embedUrl = `https://youtube.com{videoId}?autoplay=1`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://youtube.com{videoId}?autoplay=1`;
    } else {
        // Fallback if it's a search page query link
        window.open(url, '_blank');
        return;
    }

    // Create the overlay elements dynamically
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    
    overlay.innerHTML = `
        <div class="video-modal">
            <div class="modal-header">
                <h3>${matchTitle}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="video-wrapper">
                <iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close video layout when clicking 'X' or outside the box
    overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

getPLFixtures();
