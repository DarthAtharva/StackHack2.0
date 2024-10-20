import { Link } from "react-router-dom";
import AccountNavigation from "./AccountNavigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TheatrePage() {
    const [theatres, setTheatres] = useState([]);
    const [sortBy, setSortBy] = useState('theatreName'); // Default sorting by theatreName

    useEffect(() => {
        axios.get('/admintheatres').then(({ data }) => {
            setTheatres(data);
        });
    }, []);

    const sortTheatres = (theatres) => {
        return [...theatres].sort((a, b) => {
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
                    to={'/account/admintheatres/new'}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                    Add New Theatre
                </Link>
                <br />

                <div className="mt-4">
                    <div className="mb-8">
                        <label htmlFor="sort" className="mr-2 dark:text-primary-50">Sort by:</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={handleSortChange}
                            className="p-2 rounded bg-transparent font-bold dark:text-primary-500">
                            <option value="theatreName">Theatre Name</option>
                            <option value="city">City</option>
                        </select>
                    </div>

                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-md text-primary-50 uppercase bg-primary-600 dark:bg-primary-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Theatre Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        City
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortTheatres(theatres).map(it => (
                                    <tr key={it._id} className="bg-white border-b dark:bg-gray-800 dark:border-primary-800">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-primary-50">
                                            {it.theatreName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {it.city}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={'/account/adminTheatres/' + it._id}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
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
