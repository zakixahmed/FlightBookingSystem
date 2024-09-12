// Variables to store flight details and exchange rates
const flightDetails = JSON.parse(localStorage.getItem('selectedFlight'));
let rates = {};
const originalUSDPrice = flightDetails.ticket_price; // Store original price as a global variable

// ----------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Initialize flightDetails
    let flightDetails = {};
    try {
        flightDetails = JSON.parse(localStorage.getItem('selectedFlight'));
    } catch (error) {
        console.error('Failed to retrieve flight details:', error);
    }

    // Populate UI with flight details or setup page
    if (flightDetails) {
        displayFlightDetails(flightDetails); // Assuming you have a function to display these details
    }

    // Setup event listeners
    document.getElementById('drivableRouteBtn').addEventListener('click', () => {
        showDrivableRoute(flightDetails);
    });

    // Other initialization code can go here
});

// Function to display flight details on the page
function displayFlightDetails(details) {
    const flightDetailsDiv = document.getElementById('flight-details');
    flightDetailsDiv.innerHTML = `
        <p>${details.origin_city} to ${details.destination_city}</p>
        <p>Airline: ${details.airline}</p>
        <p>Departure: ${details.departure_time}</p>
        <p>Arrival: ${details.arrival_time}</p>
        <p>Price: $${details.ticket_price}</p>
    `;
}

function showDrivableRoute() {
    // Retrieve the flight details from local storage or another source
    let flightDetails = JSON.parse(localStorage.getItem('selectedFlight'));
    if (!flightDetails) {
        alert('Flight details are not available.');
        return;
    }
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('drivableRouteBtn').addEventListener('click', showDrivableRoute);
    });
    

    const origin = flightDetails.origin_city.replace(" ", "+");
    const destination = flightDetails.destination_city.replace(" ", "+");
    L.mapquest.key = 'vRx1Y80k4o4MChBqAmB8VXKbYqexxBCJ'; // Replace with your actual API key

    var map = L.mapquest.map('map', {
        center: [0, 0], // This will be set dynamically
        layers: L.mapquest.tileLayer('map'),
        zoom: 7
    });

    L.mapquest.directions().route({
        start: origin,
        end: destination
    }, function(error, response) {
        if (error) {
            console.error('Failed to retrieve the route:', error);
            alert('Failed to retrieve the route: ' + error.message);
            return;
        }
        map.fitBounds(response.route.boundingBox); // Automatically adjusts the map to show the entire route
    });
}


// ----------------------------------------------------------------------------------------

function updateCurrency() {
    const currencySelect = document.getElementById('currency');
    const currency = currencySelect.value;
    const priceElement = document.getElementById('flight-price');

    if (rates[currency]) {
        const convertedPrice = (originalUSDPrice * rates[currency]).toFixed(2);
        priceElement.textContent = `Price: ${currency} ${convertedPrice}`;
    } else {
        console.error('Exchange rate for selected currency not available');
        alert('Exchange rate for selected currency not available');
    }
}

function loadCurrencyOptions() {
    fetch('/data/currency.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            rates = data;
            const currencySelect = document.getElementById('currency');
            currencySelect.innerHTML = '';
            Object.keys(data).forEach(currencyCode => {
                const option = document.createElement('option');
                option.value = currencyCode;
                option.textContent = currencyCode;
                currencySelect.appendChild(option);
            });

            updateCurrency();  // Initial update to display correct conversions
        })
        .catch(error => {
            console.error('Failed to load exchange rates:', error);
            alert('Failed to load exchange rates: ' + error.message);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCurrencyOptions();
    document.getElementById('currency').addEventListener('change', updateCurrency);
});

// DOMContentLoaded event to ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    if (flightDetails) {
        const flightDetailsDiv = document.getElementById('flight-details');
        flightDetailsDiv.innerHTML = `
            <p>${flightDetails.origin_city} to ${flightDetails.destination_city}</p>
            <p>Airline: ${flightDetails.airline}</p>
            <p>Departure: ${flightDetails.departure_time}</p>
            <p>Arrival: ${flightDetails.arrival_time}</p>
            <p>Price: $${flightDetails.ticket_price}</p>
        `;
        document.getElementById('flight-price').textContent = `Price: $${flightDetails.ticket_price}`;
    }

    loadCurrencyOptions(); // Load exchange rates and populate currency dropdown
    document.getElementById('currency').addEventListener('change', updateCurrency); // Listen for currency changes

    const confirmBookingButton = document.getElementById('confirm-booking');
    confirmBookingButton.addEventListener('click', confirmBooking);
});

// Function to handle booking confirmation
function confirmBooking() {
    const fullName = document.getElementById('full-name').value;
    const dob = document.getElementById('dob').value;
    const passportNumber = document.getElementById('passport-number').value;
    const flightDetails = JSON.parse(localStorage.getItem('selectedFlight'));


   if (fullName && dob && passportNumber) {
    // Send POST request to book the flight
    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            flight_id: flightDetails.id,
            seats: 1 // Assuming booking 1 seat; can be changed if needed
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('Booking confirmed for ' + fullName + '. Seats left: ' + data.seatsLeft);
        }
    })
    .catch(error => {
        console.error('Failed to book flight:', error);
    });
} else {
    alert('Please fill in all fields');
}
}



// to handle button click
document.getElementById('drivableRouteBtn').addEventListener('click', function() {
    const origin = flightDetails.origin_city.replace(" ", "+");
    const destination = flightDetails.destination_city.replace(" ", "+");
    const apiKey = 'YOUR_MAPQUEST_API_KEY';

    // Construct the URL to open the MapQuest directions page
    const routeUrl = `https://www.mapquest.com/directions/from/us/${origin}/to/us/${destination}?key=${apiKey}`;

    // Open the MapQuest directions in a new tab
    window.open(routeUrl, '_blank');
});


// Directions 
function getDrivingDirections() {
    const origin = flightDetails.origin_city.replace(" ", "+");
    const destination = flightDetails.destination_city.replace(" ", "+");
    const apiKey = 'vRx1Y80k4o4MChBqAmB8VXKbYqexxBCJ';

    const url = `http://www.mapquestapi.com/directions/v2/route?key=${apiKey}&from=${origin}&to=${destination}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.info.statuscode === 0) { // Check if the request was successful
                console.log(data.route); // Handle the driving directions data
                alert("Distance: " + data.route.distance + " miles");
            } else {
                alert("Failed to retrieve driving directions");
            }
        })
        .catch(error => {
            console.error('Error fetching driving directions:', error);
            alert('Error fetching driving directions');
        });
}

// Weather api
function fetchWeather(destination) {
    const apiKey = 'ec472113cb1e47ada2c223436241108'; 
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${destination}&aqi=no`;
    console.log("Fetching weather from URL:", url); // Check the URL in the console.


    
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayWeather(data);
    })
    .catch(error => {
        console.error('Failed to fetch weather data:', error);
    });

}
document.addEventListener('DOMContentLoaded', () => {
    const destinationCity = localStorage.getItem('destinationCity');
    fetchWeather(destinationCity);  // Fetch weather when the page loads.
});

function displayWeather(weatherData) {
    const weatherDiv = document.getElementById('weather-details');
    const weatherInfo = `
        <h3>Weather Details</h3>
        <p>Condition: ${weatherData.current.condition.text}</p>
        <p>Temperature: ${weatherData.current.temp_c} °C</p>
        <p>Wind: ${weatherData.current.wind_kph} kph</p>
    `;
    weatherDiv.innerHTML = weatherInfo;
}


document.getElementById('drivableRouteBtn').addEventListener('click', getDrivingDirections);

