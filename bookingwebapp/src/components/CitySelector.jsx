import React, { useContext,useState } from 'react';
import { CityContext } from '../CityContext';

const CitySelector = () => {
    const { city, setCity } = useState();

    const handleChange = (event) => {
        setCity(event.target.value); // Update city context
    };

    return (
        <div className="relative">
            <select
                id="countries"
                value={city || ''} // Sync with city context
                onChange={handleChange}
                className="p-2 border rounded-full border-primary-500 bg-transparent dark:bg-primary-950 text-gray-400"
            >
                <option value="">Select a City</option>
                <option value="Delhi">Delhi</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Kota">Kota</option>
                <option value="Mumbai">Mumbai</option>
            </select>
        </div>
    );
};

export default CitySelector;
