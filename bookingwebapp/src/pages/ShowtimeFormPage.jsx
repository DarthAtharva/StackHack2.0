import AccountNavigation from "./AccountNavigation";
import axios from "axios";

import { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { format, parseISO } from 'date-fns';

export default function ShowtimesFormPage() {

    const {id} = useParams();
    const [movieid, setmovieid] = useState('');
    const [movieName,setmoviename] = useState('');
    const [theatreid,settheatreid] = useState('');
    const [theatreName,settheatrename] = useState('');
    const [showdate,setdate] = useState('');
    const [daytime,settime] = useState([]);
    const [formFillError, setFormFillError] = useState({});
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState([null]);
    const [selectedTheatre, setSelectedTheatre] = useState([null]);
    const [redirect,setRedirect] = useState(false);
    const [city,settheatreCity] = useState([]);
    const [ticketPrice, setTicketPrice] = useState('');
    const [inputValueSlot, setInputValueSlot] = useState('')

    useEffect(() => {

        if(!id){ 
            return;
        }
        
        axios.get('/adminShowtimes/' + id).then(response => {

            const {data} = response;
            setmovieid(data.movieid);
            setmoviename(data.movieName);
            settheatreid(data.theatreid);
            settheatrename(data.theatreName);
            setTicketPrice(data.ticketPrice);
            setdate(data.showdate? format(parseISO(data.showdate), 'yyyy-MM-dd') : '');
            settime(data.daytime || []);
            settheatreCity(data.city);

      

        });

    }, [id]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('/adminMovies');  
                setMovies(response.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const response = await axios.get('/adminTheatres');  
                setTheatres(response.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchTheatres();
    }, []);
    
    const addSlot = () => {
        const trimmedValue = inputValueSlot.trim();
        if (trimmedValue && !daytime.includes(trimmedValue)) {
            settime([...daytime, trimmedValue]);
            setInputValueSlot('');
            setFormFillError(prevformFillError => ({
                ...prevformFillError,
                daytime: ''
            }));
        } else {
            setFormFillError({ daytime: 'This slot is either empty or already added.' });
        }
    }

    const removeSlot = (index) => {
        settime(daytime.filter((_, i) => i !== index));
    };

    function validateForm() {

        const newErrors = {};
        
        if (!movieid) newErrors.movieid = 'Movie name is required';
        if (!theatreid) newErrors.theatreid = 'Theatre name is required';
        if (!showdate || showdate === '') newErrors.showdate = 'Date is required';
        if (!daytime.length) newformFillErronewErrors.daytime = 'Slot is required';
        if (!ticketPrice || ticketPrice < 0) newErrors.ticketPrice = 'A valid amount is required';

        setFormFillError(newErrors);
        return Object.keys(newErrors).length === 0;
        
    }

    async function checkExistingShowtime() {

        try {
            const response = await axios.get('/adminShowtimes/check', {

                params: {
                    movieid,
                    theatreid,
                    showdate
                }

            });

            return response.data.exists;

        } catch (error) {
            
            console.error('Error checking existing showtime:', error);
            return false;
            
        }
    }
    
    async function saveShowtime(ev){

        ev.preventDefault(); 

        if (!validateForm()) {
            return;
        }

        if(!id){

            const exists = await checkExistingShowtime();

            if (exists) {
                alert('Showtime with this movie, theatre, and date already exists.');
                return;
            }
            
        }

        const showtimeData = {

            id,
            movieid,
            movieName,
            theatreid,
            theatreName,
            ticketPrice,
            showdate,
            daytime,
            city

        };

        if(id){

            /* update */

            try{
                
                console.log('showtime Successfully updated');

                await axios.put('/adminShowtimes', {
                    id, ...showtimeData
                });
                
                setRedirect(true);
                alert('showtime Successfully updated');
    
            }catch(error){
    
                console.error('Error updating showtime:', error);
                alert('Failed to upate this showtime');
    
            }

        }else{

            /* new */

            try{                   
                await axios.post('/adminShowtimes', showtimeData);
                setRedirect(true);
                alert('showtime Successfully added');
    
            }catch(error){
    
                console.error('Error adding new showtime:', error);
                alert('Failed to add new showtime');
    
            }

        }

    }

    async function deleteshowtime(){
        if (window.confirm("Are you sure you want to delete this showtime?")) {
            try {
              await axios.delete(`/adminShowtimes/${id}`);
              setRedirect(true);
              alert("showtime successfully deleted");
            } catch (error) {
              console.error("Error deleting showtime:", error);
              alert("Failed to delete the showtime");
            }
          }
    }

    const handleMovieSelect = (event) => {
        const movieId = event.target.value;
        //console.log(movies);
        const movie = movies.find(m => m._id === movieId);
        setSelectedMovie(movie);
        setmovieid(movieId);
        setmoviename(movie.title);
    };

    const handleTheatreSelect = (event) => {
        const TheatreId = event.target.value;
        const theatre = theatres.find(m => m._id === TheatreId);
        setSelectedTheatre(theatre);
        settheatreid(TheatreId);
        settheatrename(theatre.theatreName);
        settheatreCity(theatre.city);
        console.log(theatre.city);
    };
    
    if (redirect) {
        return <Navigate to='/account/adminShowtimes' />;
    }

    function handleChange(event, setter) {
        setter(event.target.value);
        
        /* For Clearing */
        if (formFillError[event.target.name]) {
            setFormFillError(prevformFillError => ({
                ...prevformFillError,
                [event.target.name]: ''
            }));
        }
    }

    return (

        <div className="flex flex-col items-center mb-10">

            <AccountNavigation/>
            

            <form 
                className="min-w-[40rem] max-w-[60rem]" 
                onSubmit={saveShowtime}>

                {/* Show Date */}
                <h2 className="text-xl mt-6 mb-2">Show Date</h2>
                <input 
                    type="date" 
                    value={showdate} 
                    onChange={ev => {
                        setdate(ev.target.value);
                        if (formFillError.showdate) {
                            setFormFillError(prevErrors => ({
                                ...prevErrors,
                                showDate: ''
                            }));
                        }
                    }} 
                    />  
                    {formFillError.showdate && <div style={{ color: 'red' }}>{formFillError.showdate}</div>}

                    {/* Slot */}
                    <h2 className="text-xl mt-6 mb-2">Slot</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {daytime.map((daytime, index) => (
                            <span key={index} className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 flex items-center">
                                {daytime}
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log(`Removing slot at index ${index}`);
                                        removeSlot(index);
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700 bg-transparent"
                                    aria-label={`Remove ${daytime}`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                
                    <div className="flex gap-2">
                        <input
                            type="time"
                            name="slotInput"
                            placeholder="Enter a slot"
                            value={inputValueSlot}
                            onChange={(ev) => handleChange(ev, setInputValueSlot)}
                            className="border rounded p-2 mb-2"
                        />
                        <button
                            type="button"
                            onClick={addSlot}
                            className="text-blue-500 bg-transparent">
                            Add
                        </button>
                    </div>
                    {formFillError.daytime && <div style={{ color: 'red' }}>{formFillError.daytime}</div>}
                
                    {/* Movie */}
                    <h2 className="text-xl mt-6 mb-2">Movie</h2>
                    <select 
                        value={movieid} 
                        onChange={handleMovieSelect}
                        className="w-full p-2 rounded-lg bg-transparent dark:bg-gray-800 dark:text-gray-300 overflow-hidden">
                        <option value="">Select a movie</option>
                        {movies.map(movie => (
                            <option key={movie._id} value={movie._id}>
                                {movie.title}
                            </option>
                        ))}
                    </select>
                    {formFillError.movieid && <div style={{ color: 'red' }}>{formFillError.movieid}</div>}

                    {/* Theatre */}
                    <h2 className="text-xl mt-6 mb-2">Theatre</h2>
                    <select 
                        value={theatreid}
                        onChange={handleTheatreSelect}
                        className="w-full p-2 rounded-lg bg-transparent dark:bg-gray-800 dark:text-gray-300 overflow-hidden">
                        <option value="">Select a theatre</option>
                        {theatres.map(theatre => (
                            <option key={theatre._id} value={theatre._id}>
                                {theatre.theatreName}
                            </option>
                        ))}
                    </select>
                    {formFillError.theatreid && <div style={{ color: 'red' }}>{formFillError.theatreid}</div>}

                    {/* Ticket */}
                    <h2 className="text-xl mt-6 mb-2">Ticket Price (INR)</h2>
                    <input
                        type="number"
                        name="ticket"
                        value={ticketPrice}
                        onChange={ev => handleChange(ev, setTicketPrice)}
                    />
                    {formFillError.ticketPrice && <div style={{ color: 'red' }}>{formFillError.ticketPrice}</div>}

                    {city && <label className=" text-sm mt-1 mx-2">City:{city}</label>}       

                    <div className="flex gap-4 mt-4">
                        <button type="submit" className="bg-gray-100 py-2 px-4 rounded-lg">
                            Submit
                        </button>

                        {id && (
                            <button
                                type="button"
                                onClick={deleteshowtime}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                            >
                                Delete
                            </button>
                        )}
                    </div>
            </form>
        </div>
    );
}