import React, { useState, useEffect } from 'react';
import SeatSelector from '../components/SeatSelector';

export default function MovieBookingPage() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        // Fetch movies from backend
        fetch('/api/movies')
            .then(response => response.json())
            .then(data => setMovies(data))
            .catch(error => console.error('Error fetching movies:', error));
    }, []);

    const handleMovieSelect = (movie) => {
        setSelectedMovie(movie);
        setIsBooking(true);
    };

    const handleBookingComplete = () => {
        setIsBooking(false);
        alert('Booking Complete!');
    };

    return (
        <SeatSelector></SeatSelector>
    );
}
