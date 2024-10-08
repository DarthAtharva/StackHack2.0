import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (query.length > 0) {
            try {
                const response = await axios.get(`/search?query=${query}`);
                setSuggestions(response.data);
                setShowSuggestions(true);
                setFocusedSuggestion(-1);
            } catch (err) {
                console.error('Error fetching search results', err);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setFocusedSuggestion((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            setFocusedSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter' && focusedSuggestion !== -1) {
            const selectedMovie = suggestions[focusedSuggestion];
            navigate(`/movie/${selectedMovie._id}`);
        }
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showSuggestions, suggestions]);

    const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    return (
        <div className="flex-grow flex border border-primary-500 dark:bg-primary-950 rounded-full p-1 gap-3 items-center overflow-hidden">
            <div className="flex-grow">
                <form action="" className="overflow-hidden">
                    <input 
                        type="text" 
                        placeholder="Search for movies" 
                        className="w-full ml-4 border-none focus:outline-none overflow-hidden text-ellipsis bg-transparent text-gray-900 dark:text-stone-300 h-8 no-bg" 
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </form>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute">
                        <ul 
                            ref={dropdownRef} 
                            className="relative bg-white border border-gray-300 rounded-lg mt-1 z-10 shadow-lg mx-3">
                            {suggestions.map((movie, index) => (
                                <li
                                    key={movie._id}
                                    onClick={() => handleMovieClick(movie._id)}
                                    className={`p-2 hover:bg-gray-100 cursor-pointer px-3 ${index === focusedSuggestion ? 'bg-gray-200' : ''}`}
                                >
                                    {movie.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button className='mr-3 bg-transparent'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black" className="w-5 h-5 dark:stroke-primary-100">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </div>
    );
}
