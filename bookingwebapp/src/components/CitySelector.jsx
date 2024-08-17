// CitySelector.js
import React, { useState } from 'react';

const CitySelector = () => {
    // const [isModalOpen, setIsModalOpen] = useState(false);
    //const [city, setCity] = useState('');

    // const handleSelectChange = (e) => {
    //     if (e.target.value === 'custom') {
    //         setIsModalOpen(true);
    //     }
    // };

    // const handleModalClose = () => {
    //     setIsModalOpen(false);
    // };

    // const handleCityChange = (e) => {
    //     setCity(e.target.value);
    // };

    // const handleCitySubmit = (e) => {
    //     e.preventDefault();
    //     // Handle city submission logic here
    //     console.log('City entered:', city);
    //     setIsModalOpen(false);
    // };

    return (
        <div className="relative">
            <select
                
                className="p-2 border rounded-full bg-back"
            >
                <option value="">Select a City</option>
                <option value="delhi">Delhi</option>
                <option value="jaipur">Jaipur</option>
                <option value="bhopal">Bhopal</option>
                <option value="pune">Pune</option>
                <option value="ahmedabad">Ahmedabad</option>
                <option value="kota">Kota</option>
                <option value="mumbai">Mumbai</option>
                {/* <option value="custom">Enter a Custom City</option> */}
            </select>

            {/* {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-1/3">
                        <h2 className="text-xl mb-4">Enter Your City</h2>
                        <form onSubmit={handleCitySubmit}>
                            <input
                                type="text"
                                value={city}
                                onChange={handleCityChange}
                                className="p-2 border rounded-md w-full mb-4"
                                placeholder="City Name"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-2 rounded-md"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="ml-2 bg-gray-500 text-white p-2 rounded-md"
                            >
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default CitySelector;
