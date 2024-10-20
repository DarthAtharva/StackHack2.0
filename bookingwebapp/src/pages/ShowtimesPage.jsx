import axios from "axios";
import AccountNavigation from "./AccountNavigation";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { format, parse } from 'date-fns';

export default function ShowtimesPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [sortBy, setSortBy] = useState('movieName'); 

    useEffect(() => {
        axios.get('/adminShowtimes').then(({ data }) => {
            setShowtimes(data);
        });

        
    }, []);

    const formatReleaseDate = (dateString) => {
        return format(new Date(dateString), 'dd MMM yyyy');
    };

    const formatTimeTo12Hour = (timeString) => {
        const date = parse(timeString, 'HH:mm', new Date());
        return format(date, 'hh:mm a');
    };

    const sortShowtimes = (showtimes) => {
        return [...showtimes].sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    return (
        <div>
            <AccountNavigation />

            <div className="text-center">
                <Link
                    className="addNewButton"
                    to={'/account/adminShowtimes/new'}>
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
                    Add New Showtime
                </Link>
                <br />

                <div className="mt-4">
                    <div className="mb-8">
                        <label htmlFor="sort" className="mr-2 dark:text-primary-50">Sort by:</label>
                        <select id="sort" value={sortBy} onChange={handleSortChange} className="p-2 rounded bg-transparent font-bold dark:text-primary-500">
                            <option value="movieName">Movie Name</option>
                            <option value="theatreName">Theatre Name</option>
                            <option value="showdate">Show Date</option>
                        </select>
                    </div>

                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-md text-primary-50 uppercase bg-primary-600 dark:bg-primary-900 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Movie Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Theatre Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Show Date
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Time
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Ticket Price (INR)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortShowtimes(showtimes).map((it, index) => (
                                    <tr 
                                        key={it._id} 
                                        className="bg-white border-b dark:bg-gray-800 dark:border-primary-800">

                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-primary-50">
                                            {it.movieName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {it.theatreName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatReleaseDate(it.showdate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {[...it.daytime]
                                                .sort((a, b) => {
                                                    const timeA = parse(a, 'HH:mm', new Date());
                                                    const timeB = parse(b, 'HH:mm', new Date());
                                                    return timeA - timeB;
                                                })
                                                .map((time, index) => (
                                                    <span key={index} className="mr-2">
                                                        {formatTimeTo12Hour(time)}
                                                    </span>
                                                ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            {it.ticketPrice}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={'/account/adminShowtimes/' + it._id} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
