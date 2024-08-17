import React from 'react';

const MovieCard = ({ title, year, imageSrc, quality, link }) => {
    return (
        <div className="relative w-60 h-80">
            <div className="relative">
                <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    {quality}
                </div>
                <img 
                    className="w-full h-auto rounded" 
                    src={imageSrc} 
                    alt={title} 
                />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
                <h3 className="text-lg font-semibold mb-2">
                    <a href={link} title={title}>{title}</a>
                </h3>
                <div className="flex space-x-2 text-sm">
                    <span className="bg-teal-700 bg-opacity-40 text-teal-300 px-2 py-1 rounded">
                        Movie
                    </span>
                    <span className="bg-teal-700 bg-opacity-40 text-teal-300 px-2 py-1 rounded">
                        {year}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
