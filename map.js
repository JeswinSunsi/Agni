// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Create the map instance
    const map = L.map('map').fitWorld(); // Fit world view until location is found

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Locate the user and set the view
    map.locate({ setView: true, maxZoom: 16 });

    // Handle successful location detection
    map.on('locationfound', (e) => {
        L.circleMarker(e.latlng, {
            color: 'white',
            fillColor: '#3388ff',
            fillOpacity: 1,
            radius: 8,
            weight: 2
        }).addTo(map).bindPopup("Updated just now!").openPopup();
    });

    // Handle location error
    map.on('locationerror', (e) => {
        console.error(e.message);
        alert("Location access denied or unavailable. Please enable location services.");
    });

    // Disable zoom controls for cleaner look
    map.zoomControl.remove();

    // Add click event listeners for settings items
    document.querySelectorAll('.settings-item').forEach(item => {
        item.addEventListener('click', function() {
            alert(`${this.textContent} clicked`);
        });
    });

    // Add click event for download button
    document.querySelector('.download-button').addEventListener('click', function() {
        alert('Download app clicked');
    });

    // Add click event for notification bell
    document.querySelector('.notification-bell').addEventListener('click', function() {
        alert('Notifications clicked');
    });
});
