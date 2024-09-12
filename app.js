const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 3002;
const db = require('./db');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/data', express.static('C:/Users/zakia/Documents/NTU/test2/data/currency.json'));
app.use('/data', express.static(path.join(__dirname, 'data')));



// Function to generate flight data
const generateFlightData = (origin, destination, numOfFlights, date) => {
    const airlines = ["Delta", "United", "Southwest", "Alaska Airlines", "American Airlines", "JetBlue", "Spirit", "Frontier"];
    const flights = [];
    const baseDate = new Date(date || "2024-08-19T09:00:00Z");

    for (let i = 0; i < numOfFlights; i++) {
        const departureTime = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000);
        const arrivalTime = new Date(departureTime.getTime() + (1 + Math.floor(Math.random() * 2)) * 60 * 60 * 1000);
        
        const flight = {
            id: i + 1,
            origin_city: origin,
            destination_city: destination,
            airline: airlines[i % airlines.length],
            available_seats: Math.floor(Math.random() * 200) + 50,
            ticket_price: Math.floor(Math.random() * 100) + 50,
            departure_time: departureTime.toISOString(),
            arrival_time: arrivalTime.toISOString()
        };
        
        flights.push(flight);
    }

    return flights;
};

// Search flights endpoint
app.get('/flights', (req, res) => {
    const { origin, destination, date, seats } = req.query;
    let results = db.searchFlights({ origin, destination, date, seats });

    if (results.length === 0) {
        results = generateFlightData(origin, destination, 8, date);
        const existingFlights = db.getAllFlights();
        const updatedFlights = existingFlights.concat(results);
        db.writeDatabase(updatedFlights);
    }

    console.log("Generated/Returned Flights:", results);
    res.json(results);
});

// Book flight endpoint
app.post('/book', (req, res) => {
    const { flight_id, seats } = req.body;
    let flights = db.getAllFlights();
    const flightIndex = flights.findIndex(flight => flight.id === parseInt(flight_id));

    if (flightIndex === -1) {
        return res.status(404).send('Flight not found');
    }

    if (flights[flightIndex].available_seats >= seats) {
        flights[flightIndex].available_seats -= seats; // Decrement the seats
        db.writeDatabase(flights); //save the updated flights data
        return res.send({ message: 'Booking successful', seatsLeft: flights[flightIndex].available_seats });
    } else {
        return res.status(400).send('Not enough seats available');
    }
});


// Directions endpoint
app.get('/directions', async (req, res) => {
    const { from, to } = req.query;
    try {
        const response = await axios.get(`http://www.mapquestapi.com/directions/v2/route?key=YOUR_KEY&from=${from}&to=${to}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching directions: ' + error.stack);
        res.status(500).send('Error fetching directions: ' + error.message);
    }
});

// Start the server
const port = 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
