const searchButton = document.getElementById('search');
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const dateInput = document.getElementById('date');
const seatsInput = document.getElementById('seats');
const resultsDiv = document.getElementById('results');
const loadingIndicator = document.getElementById('loading-indicator');

searchButton.addEventListener('click', () => {
  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();
  const date = dateInput.value; // This sends the date in 'YYYY-MM-DD' format
  const seats = seatsInput.value;

  if (!origin || !destination || !date || !seats) {
    resultsDiv.textContent = 'Please enter all fields';
    return;
  }

  loadingIndicator.style.display = 'block'; // Show loading indicator
  resultsDiv.textContent = 'Loading flights...';

  fetch(`/flights?origin=${origin}&destination=${destination}&date=${date}&seats=${seats}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      loadingIndicator.style.display = 'none'; // Hide loading indicator
      resultsDiv.innerHTML = ''; // Clear previous results

      if (data.length === 0) {
        resultsDiv.textContent = 'No flights found';
      } else {
        data.forEach(flight => {
          const flightDiv = document.createElement('div');
          flightDiv.classList.add('flight-item'); // Add a class for styling

          const departureDate = new Date(flight.departure_time);
          const formattedDepartureDate = departureDate.toISOString().split('T')[0]; // Get just the date part
          const formattedDepartureTime = departureDate.toISOString().split('T')[1].slice(0, 5); // Get time part in HH:MM

          // Create the flight information text
          const flightInfo = `${flight.origin_city} to ${flight.destination_city} - ${flight.airline} on ${formattedDepartureDate} - Departs: ${formattedDepartureTime} - Arrives: ${flight.arrival_time} - Price: $${flight.ticket_price}`;

          // Create the "Book Now" button
          const bookButton = document.createElement('button');
          bookButton.textContent = 'Book Now';
          bookButton.classList.add('book-button');

// Disable booking button if no seats are available
if (flight.available_seats === 0) {
  bookButton.disabled = true;
  bookButton.textContent = 'Sold Out';
}

          
          bookButton.onclick = () => {
            // Save flight details to local storage
            localStorage.setItem('selectedFlight', JSON.stringify(flight));
            localStorage.setItem('destinationCity', flight.destination_city);  // Save destination city to local storage.
            
            // Redirect to the booking page
            window.location.href = 'booking.html';
          };

          // Append the flight info and the button to the flightDiv
          flightDiv.textContent = `${flight.origin_city} to ${flight.destination_city} - ${flight.airline} - Departs: ${formattedDepartureDate} at ${formattedDepartureTime} - ${flight.available_seats} seats available - $${flight.ticket_price}`;
          flightDiv.appendChild(bookButton);

          resultsDiv.appendChild(flightDiv);
        });
      }
    })
    .catch(error => {
      loadingIndicator.style.display = 'none'; // Hide loading indicator
      console.error('Error fetching flights:', error);
      resultsDiv.textContent = 'An error occurred while fetching flights. Please try again later.';
    });
});
