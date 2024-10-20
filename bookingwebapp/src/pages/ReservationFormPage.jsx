import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CityContext } from '../CityContext';
import SeatSelector from '../components/SeatSelector';
import DateSelector from '../components/DateSelector';
import { format, parse } from 'date-fns';

export default function ReservationFormPage() {
    const { id } = useParams();
    const { city, setCity } = useContext(CityContext);

    const [chooseCity, setChooseCity] = useState(city || '');
    const [chooseShowDate, setChooseShowDate] = useState(new Date());
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [showSeatSelector, setShowSeatSelector] = useState(false);
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(5);
    const [ticketPrice, setTicketPrice] = useState([]);
    const [chooseTime, setChooseTime] = useState([]);
    const [chooseShowtimeId, setChooseShowtimeId] = useState([]);
    const [activeShowtime, setActiveShowtime] = useState(null);
    
    const cities = ['Delhi', 'Jaipur', 'Bhopal', 'Pune', 'Ahmedabad', 'Kota', 'Mumbai'];

    useEffect(() => {
        if (!id) return;

        axios.get('/adminMovies/' + id).then(response => {
            setMovie(response.data);
        });
    }, [id]);

    useEffect(() => {
        setChooseCity(city);
    }, [city]);

    useEffect(() => {
        if (chooseCity && chooseShowDate) {
            findMovie(); 
        }
    }, [chooseCity, chooseShowDate]);

    if (!movie) {
        return;
    }

    async function findMovie() {

        if (!chooseCity) {
            console.log('City is required');
            return;
        }

        const params = {
            movieid: id,
            city: chooseCity,
            showdate: format(chooseShowDate, 'yyyy-MM-dd'),
        };

        try {
            const response = await axios.get('/findShowtimes', { params });
            setShowtimes(response.data);
        } catch (error) {
            console.error("Error fetching showtimes:", error);
        }
    }

    function handleChange(event, setter) {
        setter(event.target.value);
        setCity(event.target.value);
    }

    async function handleSeatSelection(it, time) {
        try {
            const response = await axios.get('/adminTheatres/' + it.theatreid);
            setRows(response.data.rows);
            setCols(response.data.cols);
            setTicketPrice(it.ticketPrice);
            setChooseTime(time);
            setChooseShowtimeId(it._id);
            setActiveShowtime({ id: it._id, time });
            setShowSeatSelector(true);
        } catch (error) {
            console.error("Error fetching theatre details:", error);
        }
    }

    const handleDateSelect = (date) => {
        setChooseShowDate(date || new Date()); 
    };

    const closeModal = () => {
        setShowSeatSelector(false);
    };

    const formatTimeTo12Hour = (timeString) => {
        const date = parse(timeString, 'HH:mm', new Date());
        return format(date, 'hh:mm a');
    };

    return (
        <section className='mt-14 mb-10'>

            <div className="flex flex-col mx-10">

                <h2 className="text-5xl text-primary-950 font-bold">{movie.title}</h2>

                <div className="flex mx-2 text-black dark:text-primary-50 mt-3 text-sm font-thin items-center">
                    <div className="text-red-600 dark:text-red-400 py-1 pr-3 text-lg font-medium">{movie.certificate}</div>
                    <div className="flex gap-3">
                        {movie.genre.map((genre, index) => (
                            <div className="border rounded-full px-3 py-1" key={index}>
                                {genre}
                            </div>
                        ))}
                    </div>
                </div>   

                {/* City + Date */}
                <div className="flex justify-between items-center mt-6">

                    <div>
                        <select
                            value={chooseCity}
                            onChange={ev => handleChange(ev, setChooseCity)}
                            className="p-2 bg-transparent text-primary-950 dark:text-primary-600 font-semibold"
                            required
                        >
                            <option value="">Select a city</option>
                            {cities.map(cityName => (
                                <option key={cityName} value={cityName} className="uppercase">
                                    {cityName.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <DateSelector onSelect={handleDateSelect} />
                    </div>

                </div>

            </div>

            <div className="flex flex-col mx-14">

                <div className="">
                    {showtimes.length > 0 ? (
                        showtimes.map(it => (

                            <div 
                                className="flex items-center border-b border-primary-800 py-4"
                                key={it._id}>
                                <div className="font-bold text-sm w-80 dark:text-primary-200">{it.theatreName}</div> <br />
                               
                                <br />

                                {Array.isArray(it.daytime) && it.daytime.length > 0 ? (

                                    it.daytime.map((time, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center text-xs">

                                            <button
                                                onClick={() => handleSeatSelection(it, time)} 
                                                className="bg-transparent border border-primary-500 hover:bg-primary-500 hover:text-primary-50 dark:text-primary-100 rounded-md mx-3 px-3 py-2">

                                                {formatTimeTo12Hour(time)}

                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div>No showtimes available</div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="mt-20 text-center text-gray-500 dark:text-gray-400 font-light">
                            <p>Ohoo, no showtimes available!</p>
                        </div>
                    )}
                </div>

                {showSeatSelector && (
                    <div className="fixed realtive inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg relative">

                            <button
                                onClick={closeModal}
                                className="absolute bg-transparent top-1 right-1 m-2 text-black font-bold text-xl dark:text-primary-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>

                            </button>

                            <SeatSelector
                                rows={rows}
                                cols={cols}
                                ticketPrice={ticketPrice}
                                chooseTime={chooseTime}
                                chooseShowtimeId={chooseShowtimeId}
                                userId={id}
                            />

                        </div>
                    </div>
                )}

            </div>
            
        </section>
    );
}
