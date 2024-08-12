import React, { useState, useEffect } from 'react';

export default function SeatSelector({ onBookingComplete }) {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);

    // Generate seat labels from A1 to J9
    const rows = Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + i)); // A-J
    const cols = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9
    const seats = rows.flatMap(row => cols.map(col => `${row}${col}`));

    // Fetch booked seats from backend when component mounts
    useEffect(() => {
        const fetchBookedSeats = async () => {
            try {
                const response = await fetch('/api/booked-seats'); // Replace with your backend endpoint
                const data = await response.json();
                setBookedSeats(data.bookedSeats);
            } catch (error) {
                console.error('Error fetching booked seats:', error);
            }
        };

        fetchBookedSeats();
    }, []);

    const handleSeatSelect = (seat) => {
        if (!bookedSeats.includes(seat)) {
            if (selectedSeats.includes(seat)) {
                setSelectedSeats(selectedSeats.filter(s => s !== seat));
            } else {
                setSelectedSeats([...selectedSeats, seat]);
            }
        }
    };

    const handleBookTickets = () => {
        onBookingComplete();
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-300 rounded-lg shadow-xl max-w-xl mx-auto mt-12">
            <h3 className="text-2xl font-semibold mb-6">Select Your Seats</h3>
            <div className="grid grid-cols-9 gap-2 mb-6">
                {seats.map((seat, index) => (
                    <label
                        key={index}
                        className={`w-12 h-12 flex items-center justify-center text-sm font-semibold border border-gray-300 rounded cursor-pointer
                        ${bookedSeats.includes(seat) ? 'bg-gray-400 text-white cursor-not-allowed' : 
                          selectedSeats.includes(seat) ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                    >
                        <input
                            type="checkbox"
                            onChange={() => handleSeatSelect(seat)}
                            checked={selectedSeats.includes(seat)}
                            disabled={bookedSeats.includes(seat)}
                            className="hidden"
                        />
                        {seat}
                    </label>
                ))}
            </div>
            <div className="flex justify-between w-full mb-4">
                <span>{selectedSeats.length} Tickets</span>
                <span>₹ {selectedSeats.length * 200}</span>
            </div>
            <button
                onClick={handleBookTickets}
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
                Book Now
            </button>
        </div>
    );
}
