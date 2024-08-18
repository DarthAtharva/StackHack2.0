import { useState,useEffect } from "react";
import AccountNavigation from "./AccountNavigation";
import axios from "axios";
import {Navigate, useParams} from "react-router-dom";

export default function ShowtimesFormPage() {

    const {id} = useParams();
    const [movieid, setmovieid] = useState('');
    const [movieName,setmoviename] = useState('');
    const [theatreid,settheatreid] = useState('');
    const [theatreName,settheatrename] = useState('');
    const [errors, setErrors] = useState({});
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState([null]);
    const [selectedTheatre, setSelectedTheatre] = useState([null]);
    const [redirect,setRedirect] = useState(false);
    const [city,settheatreCity] = useState([]);
    const [showdate,setdate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [daytime,settime] = useState(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    });;

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
            setdate(data.showdate);
            settime(data.daytime);
            settheatreCity(data.city);

            /* AND EXTRA SETS */

        });

    }, [id]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('/adminMovies');  //gives whole movie object
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
                const response = await axios.get('/adminTheatres');  //gives whole movie object
                setTheatres(response.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
        fetchTheatres();
    }, []);
    

    function validateForm() {
        const newErrors = {};
        if (!movieid || movieid == 'Select a movie') newErrors.movieid = 'Movie name is required';
        if (!theatreid || theatreid == 'Select a movie') newErrors.theatreid = 'Theatre name is required';
        if (!showdate || showdate === '') newErrors.showdate = 'showDate is required';
        if (!daytime || daytime === '') newErrors.daytime = 'Time is required';
        if(!city || city == '') newErrors.city = 'city is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    

    async function saveshowtime(ev){

        ev.preventDefault(); 

        if (!validateForm()) {
            return;
        }

        const showtimeData = {

            id,
            movieid,
            movieName,
            theatreid,
            theatreName,
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


    

    return (

        <div>

            <AccountNavigation/>
            

            <form onSubmit={saveshowtime}>
                
                
                <h2 className="text-xl mt-2">showdate</h2>
                <input 
                    type="date" 
                    // id="showtime-name"
                    // name="name" 
                    placeholder="Name of showtime" 
                    value={showdate} 
                    onChange={ev => setdate(ev.target.value)}
                    className={`border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    // required 
                    />  
                    {errors.showdate && <div className="text-red-500 text-sm mt-1">{errors.showdate}</div>}

                <h2 className="text-xl mt-2">time</h2>
                <input 
                    type="time" 
                    // id="showtime-name"
                    // name="name" 
                    placeholder="time" 
                    value={daytime} 
                    
                    
                    onChange={ev => settime(ev.target.value)} 
                    className={`border ${errors.daytime ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`}
                    // required 
                    />
                {errors.daytime && <div className="text-red-500 text-sm mt-1">{errors.daytime}</div>} 
                
                
                    <label 
                    className="text-xl mt-2"
                    //className={`border ${errors.movieid ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    >Select a Movie</label>
                    <select onChange={handleMovieSelect}
                    className={`border ${errors.movieid ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    >
                        <option>Select a movie</option>
                        {movies.map(movie => (
                                <option key={movie._id} value={movie._id}>
                                    {movie.title}
                                </option>
                        ))};
                    </select>
                    {errors.movieid && <div className="text-red-500 text-sm mt-1">{errors.movieid}</div>}

                    <label 
                    className="text-xl mt-2"
                    >Select a Theatre</label>
                    <select onChange={handleTheatreSelect}
                    className={`border ${errors.theatreid ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    >
                        <option>Select a Theatre</option>
                        {theatres.map(theatre => (
                                <option key={theatre._id} value={theatre._id}>
                                    {theatre.theatreName}
                                </option>
                        ))};
                    </select>
                    {errors.theatreid && <div className="text-red-500 text-sm mt-1">{errors.theatreid}</div>} 
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