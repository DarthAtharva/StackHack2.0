import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { format } from 'date-fns';

export default function MoviePage(){

    const {id} = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {

        if(!id) {return};

        axios.get('/adminMovies/' + id).then( response => {

            setMovie(response.data);

        });

    }, [id]);

    if(!movie){
        return;
    }

    const formatReleaseDate = (dateString) => {
        return format(new Date(dateString), 'dd MMM yyyy');
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        return `${parseInt(hours, 10)}h ${parseInt(minutes, 10)}m`;
    };

    return (
    
        <section className="mt-4 mb-10">

            <div className="flex w-full h-[30rem] bg-primary-950 items-center">

                {/* Poster */}
                <div className="ml-10 h-96 w-64 bg-gray-800">
                    <img 
                        // src={'http://localhost:4000/uploads' + movie.photos[0]} 
                        src={`${import.meta.env.VITE_BASE_URL}/uploads${movie.photos[0]}`}
                        alt={movie.title}
                        className="rounded-lg object-cover w-full h-full drop-shadow-2xl"/>
               
                </div>

                {/* INFO  */}
                <div className="flex flex-col h-72 -mt-10 ml-10 justify-between">

                    {/* Title */}
                    <h1 className="text-5xl text-primary-50 font-bold">
                        {movie.title}
                    </h1>

                    {/* Bottom Info*/}
                    <div className="mr-10">

                        {/* Language Tags */}
                        <div className="flex">
                            {movie.languages.map((language, index) => (
                            
                                <div className="px-2 mx-2 font-bold bg-primary-50 text-primary-950 rounded-sm opacity-90">
                                    {language.slice(0, 2).toUpperCase()}
                                </div>
                            ))}                  
                        </div>

                        {/* Others */}
                        <div className="flex gap-2 text-primary-50 mt-3 text-lg font-thin">

                            {formatTime(movie.length)}
                            
                            <div>•</div>

                            {movie.genre.map((genre, index) => (
                                <div className="">
                                    {genre}{index < movie.genre.length - 1 && ', '}
                                </div>
                            ))}

                            <div>•</div>

                            {movie.certificate}

                            <div>•</div>

                            {formatReleaseDate(movie.releaseDate)}        

                        </div>

                        {/* Button */}
                        <Link
                            className="mt-4 inline-flex gap-1 items-center bg-orange-400 rounded py-2 px-8 text-xl text-primary-50 font-medium"
                            to = {'/movie/book/' + id}> 

                            Book
                            
                        </Link>

                    </div>

                </div>

            </div>

            {/* About */}
            <div className="mx-10 mt-6 dark:text-primary-50">

                <h2 className="text-2xl font-medium mb-2 dark:text-primary-400">About the movie</h2>
                <div className="mb-6">
                    {movie.description}
                </div>

            </div>

        </section >

    );
}