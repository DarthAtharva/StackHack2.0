import { Link } from "react-router-dom";
import AccountNavigation from "./AccountNavigation";
import { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";

export default function MoviesPage() {
    
    const [movies, setMovies] = useState([]);

    useEffect(() => {

        axios.get('/adminMovies').then(({data}) => {

            setMovies(data);

        });

    }, []);

    return (
        <div>

            <AccountNavigation/>

            <div className="text-center">
                <Link
                    className="inline-flex gap-1 items-center bg-gray-100 rounded-l py-2 px-5"
                    to={'/account/adminMovies/new'}>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5">
                            
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>

                    Add New Movie
                    
                </Link><br/>

                <div className="mt-4">
                    {movies.length > 0 && movies.map(it => (



                        
                        <Link 
                            key={it._id} 
                            to = {'/account/adminMovies/' + it._id} 
                            className="flex cursor-pointer gap-4 bg-gray-200 p-4">
                                
                                <MovieCard title={it.title} year='2000' imageSrc={'http://localhost:4000/uploads/' + it.photos[0]}  quality='1080'link={'/account/adminMovies/' + it._id} >
                                </MovieCard>


                            {/* <div className="flex w-32 h-40 bg-gray-300 overflow-hidden">

                                {it.photos.length > 0 && (

                                    <img 
                                        src={'http://localhost:4000/uploads/' + it.photos[0]} 
                                        alt="Movie Poster" 
                                        className = "w-full h-full object-cover"
                                    />
                                )}

                            </div>

                            <h2 className="text-xl">

                                {it.title}
                                
                            </h2> */}

                        </Link>
                    ))}
                </div>
                
            </div>

        </div>
    );
}
