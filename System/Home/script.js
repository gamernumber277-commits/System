function navigate(destination) {
    console.log("Navigating to: " + destination);
    
    switch(destination) {
        case 'new':
            // This would link to your PlatformGame HTML file
            window.location.href = 'index.html'; 
            break;
        case 'continue':
            alert("Resuming saved game...");
            break;
        case 'leaderboard':
            alert("Opening Leaderboard...");
            break;
        case 'settings':
            alert("Opening Settings...");
            break;
        default:
            alert("Feature coming soon!");
    }
}