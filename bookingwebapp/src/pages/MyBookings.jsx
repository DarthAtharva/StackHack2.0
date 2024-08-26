import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";
import AccountNavigation from "./AccountNavigation";

export default function MyBookings() {
    const [tickets, setTickets] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        // Fetch tickets data
        axios.get('/myTickets').then(({ data }) => {
            setTickets(data);
        }).catch(error => {
            console.error("Failed to fetch tickets", error);
        });
    }, []);

    const handleDelete = async (ticketId) => {
        const confirmDelete = window.confirm("Are you sure you want to cancel this ticket? This action cannot be undone.");

        if (confirmDelete) {
            try {
                await axios.delete(`/tickets/${ticketId}`);
                setTickets(tickets.filter(ticket => ticket._id !== ticketId));
            } catch (error) {
                console.error("Failed to delete the ticket", error);
            }
        }
    };

    return (
        <div>
            <AccountNavigation />
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-md text-primary-50 uppercase bg-primary-600 dark:bg-primary-900 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Movie Poster</th>
                            <th scope="col" className="px-6 py-3">Movie Name</th>
                            <th scope="col" className="px-6 py-3">Theatre Name</th>
                            <th scope="col" className="px-6 py-3">City</th>
                            <th scope="col" className="px-6 py-3">Show Date</th>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Seat Numbers</th>
                            <th scope="col" className="px-6 py-3">Ticket Price</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">CANCEL</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket._id} className="bg-white border-b dark:bg-gray-800 dark:border-primary-800">
                                <td className="px-6 py-4">
                                    {ticket.moviePoster && (
                                        <img src={'http://localhost:4000/uploads/' + ticket.moviePoster} alt={ticket.movieName} className="w-40 h-64 object-cover" />
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-primary-50">{ticket.movieName}</td>
                                <td className="px-6 py-4">{ticket.theatreName}</td>
                                <td className="px-6 py-4">{ticket.theatreCity}</td>
                                <td className="px-6 py-4">{new Date(ticket.showdate).toLocaleDateString('en-CA')}</td>
                                <td className="px-6 py-4">{ticket.daytime}</td>
                                <td className="px-6 py-4">
                                    {ticket.seatNumbers.join(', ')}
                                </td>
                                <td className="px-6 py-4">{ticket.ticketPrice}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(ticket._id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">
                                        CANCEL
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
