// Get game from URL parameter (default to maze)
const urlParams = new URLSearchParams(window.location.search);
const currentGame = urlParams.get('game') || 'maze';

// Current user data
let currentUser = null;
let currentUserIdNumber = '';

// Fetch user session
async function fetchUserSession() {
    try {
        const response = await fetch('../Login/session_user.php', { credentials: 'include' });
        const data = await response.json();
        if (data.ok) {
            currentUser = data.username;
            currentUserIdNumber = data.user_id_number || '';
        }
    } catch (e) {
        console.log('Not logged in');
    }
}

// Fetch leaderboard data from API
async function fetchLeaderboard() {
    try {
        const response = await fetch(`leaderboard_api.php?action=get&game=${currentGame}`, { credentials: 'include' });
        const data = await response.json();
        if (data.ok && data.leaderboard) {
            return data.leaderboard;
        }
    } catch (e) {
        console.error('Failed to fetch leaderboard:', e);
    }
    return [];
}

// Render table with database data
async function renderTable(filter = "") {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    
    const leaderboard = await fetchLeaderboard();
    tableBody.innerHTML = "";
    
    const filteredData = leaderboard.filter(row => 
        row.username.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.username}</td>
            <td>${row.user_id_number}</td>
            <td>${row.time_recorded}</td>
        `;
        tr.onclick = () => openPlayerDetails(row, index);
        tableBody.appendChild(tr);
    });
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No records yet. Play the game to set a time!</td></tr>';
    }
}

function openPlayerDetails(rowData, index) {
    document.getElementById('cardName').innerText = rowData.username;
    document.getElementById('cardScore').innerText = "TIME: " + rowData.time_recorded;
    document.getElementById('cardAge').innerText = "ID: " + rowData.user_id_number;
    document.getElementById('cardLoc').innerText = "Played: " + new Date(rowData.created_at).toLocaleDateString();
    toggleCard(true);
}

function toggleCard(show) {
    const slidingCard = document.getElementById('slidingCard');
    if (show) {
        slidingCard.classList.add('open');
    } else {
        slidingCard.classList.remove('open');
    }
}

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.onkeyup = () => {
    renderTable(searchInput.value);
};

// Initialize
fetchUserSession().then(() => {
    renderTable();
});
