const fs = require('fs');
const path = require('path');

// Path to the JSON file that acts as the database
const dbPath = path.join(__dirname, 'flights.json');

// Function to generate flight data (for reference)
function generateFlightData(origin, destination, numOfFlights) {
  const airlines = ["Delta", "United", "Southwest", "Alaska Airlines", "American Airlines", "JetBlue", "Spirit", "Frontier"];
  const flights = [];
  const baseDate = new Date("2024-08-19T09:00:00Z");

  for (let i = 0; i < numOfFlights; i++) {
    const departureTime = new Date(baseDate);
    departureTime.setHours(departureTime.getHours() + i * 2); // Increment departure time by 2 hours for each flight

    const arrivalTime = new Date(departureTime);
    arrivalTime.setHours(arrivalTime.getHours() + 1 + Math.floor(Math.random() * 2)); // Random arrival time between 1-2 hours after departure

    const flight = {
      id: i + 1,  // Unique ID for each flight
      origin_city: origin,
      destination_city: destination,
      airline: airlines[i % airlines.length],
      available_seats: Math.floor(Math.random() * 200) + 50, // Random seats between 50 and 250
      ticket_price: Math.floor(Math.random() * 100) + 50, // Random price between $50 and $150
      departure_time: departureTime.toISOString(),
      arrival_time: arrivalTime.toISOString().split("T")[1] // Just the time portion
    };

    flights.push(flight);
  }

  return flights;
}

// Function to search flights by origin, destination, date, and seats
function searchFlights({ origin, destination, date, seats }) {
  const flights = readDatabase();
  const uniqueFlights = [];

  // Ensure the date is correctly formatted for comparison (ISO format: YYYY-MM-DD)
  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : null;

  // Log the incoming parameters for debugging
  console.log(`Search Parameters: origin=${origin}, destination=${destination}, date=${date}, seats=${seats}`);

  // Filter flights based on origin, destination, date, and seats
  const filteredFlights = flights.filter(flight => {
    const flightDate = flight.departure_time ? new Date(flight.departure_time).toISOString().split('T')[0] : null;
    const matchOrigin = !origin || (flight.origin_city && flight.origin_city.toLowerCase() === origin.toLowerCase());
    const matchDestination = !destination || (flight.destination_city && flight.destination_city.toLowerCase() === destination.toLowerCase());
    const matchDate = !date || (flightDate === formattedDate);
    const matchSeats = !seats || flight.available_seats >= parseInt(seats);

    return matchOrigin && matchDestination && matchDate && matchSeats;
  });

  // Remove duplicates based on origin, destination, airline, and departure time
  filteredFlights.forEach(flight => {
    const isDuplicate = uniqueFlights.some(uniqueFlight => {
      return flight.origin_city === uniqueFlight.origin_city &&
             flight.destination_city === uniqueFlight.destination_city &&
             flight.airline === uniqueFlight.airline &&
             flight.departure_time === uniqueFlight.departure_time;
    });

    if (!isDuplicate) {
      uniqueFlights.push(flight);
    }
  });

  return uniqueFlights;
}

// Function to check for duplicates (used in other contexts)
function isFlightDuplicate(newFlight) {
  const flights = readDatabase();
  return flights.some(flight => {
    return flight.origin_city === newFlight.origin_city &&
           flight.destination_city === newFlight.destination_city &&
           flight.airline === newFlight.airline &&
           flight.departure_time === newFlight.departure_time;
  });
}

// Function to read the JSON file
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON database:', err);
    return [];
  }
}

// Function to write to the JSON file
function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to JSON database:', err);
  }
}

// Function to get all flights
function getAllFlights() {
  return readDatabase();
}

// Function to get a flight by ID
function getFlightById(id) {
  const flights = readDatabase();
  return flights.find(flight => flight.id === id);
}

module.exports = {
  getAllFlights,
  getFlightById,
  searchFlights,
  writeDatabase,
};
