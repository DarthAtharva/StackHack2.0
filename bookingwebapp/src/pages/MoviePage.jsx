import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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

    return (

        <div className="mt-8 bg-back">

            <h1 className="text-2xl">
                {movie.title}
            </h1>
        
        </div>

    );
}