import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import { format, parse } from 'date-fns';
import axios from "axios";
import AccountNavigation from "./AccountNavigation";



export default function MyBookings() {
    const [tickets, setTickets] = useState([]);
    const { user } = useContext(UserContext);
   
    useEffect(() => {
        axios.get('/myTickets').then(({ data }) => {
            setTickets(data);
        }).catch(error => {
            console.error("Failed to fetch tickets", error);
        });
    }, []);

    const handleDelete = async (ticket) => {
        const confirmDelete = window.confirm("Are you sure you want to cancel this ticket? This action cannot be undone.");
    
        if (confirmDelete) {
            try {
                const response = await axios.delete(`/tickets/${ticket._id}`);
                if (response.status === 200) {
                    const { booking_code } = response.data;
    
                    // Email details
                    const emailDetails = {
                        booking_code,
                        seatNumbers :ticket.seatNumbers,
                        userEmail: user?.email, // Fetch the user email from context
                        userName: user?.name, // Same for the user name
                        movieTitle: ticket.movieName,
                        theatreName: ticket.theatreName,
                        chooseTime: ticket.daytime
                    };
    
                    // Call your email sending function
                    await sendCancellationEmail(emailDetails);
    
                    alert("Ticket successfully cancelled and confirmation email sent!");
                    setTickets(tickets.filter(ticket => ticket._id !== ticket._id));
                }
            } catch (error) {
                console.error("Failed to delete the ticket", error);
                alert("Failed to cancel the ticket!");
            }
        }
    };
    
    // Function to send the cancellation email
    const sendCancellationEmail = async (emailDetails) => {
        try {
            const response = await axios.post('/sendCancellationEmail', emailDetails);
    
            if (response.status === 200) {
                console.log('Cancellation email sent:', response.data.message);
            }
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    };
    

    const formatReleaseDate = (dateString) => {
        return format(new Date(dateString), 'dd MMM yyyy');
    };


    const formatTimeTo12Hour = (timeString) => {
        const date = parse(timeString, 'HH:mm', new Date());
        return format(date, 'hh:mm a');
    };

    return (
        <div>
            <AccountNavigation />
            {tickets.length === 0 ? (
                <div className="mt-36 text-center text-gray-500 dark:text-gray-400 font-light">
                    <p>Looks like you need to book a movie first!</p>
                </div>
            ) : (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-md text-primary-50 uppercase bg-primary-600 dark:bg-primary-900 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3"></th>
                                <th scope="col" className="px-6 py-3">Title</th>
                                <th scope="col" className="px-6 py-3">Theatre</th>
                                <th scope="col" className="px-6 py-3">City</th>
                                <th scope="col" className="px-6 py-3">Show Date</th>
                                <th scope="col" className="px-6 py-3">Time</th>
                                <th scope="col" className="px-6 py-3">Seats</th>
                                <th scope="col" className="px-6 py-3">Ticket Price</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">CANCEL</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket._id} className="bg-white border-b dark:bg-gray-800 dark:border-primary-800">
                                    <td className="px-6 py-4">
                                        {ticket.moviePoster && (
                                            <img 
                                                // src={'http://localhost:4000/uploads/' + ticket.moviePoster} 
                                                src={`${import.meta.env.VITE_BASE_URL}/uploads/${ticket.moviePoster}`}
                                                alt={ticket.movieName} 
                                                className="w-40 h-64 object-cover" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-primary-50">{ticket.movieName}</td>
                                    <td className="px-6 py-4">{ticket.theatreName}</td>
                                    <td className="px-6 py-4">{ticket.theatreCity}</td>
                                    <td className="px-6 py-4">{formatReleaseDate(ticket.showdate)}</td>
                                    <td className="px-6 py-4">{formatTimeTo12Hour(ticket.daytime)}</td>
                                    <td className="px-6 py-4">
                                        {ticket.seatNumbers.join(', ')}
                                    </td>
                                    <td className="px-6 py-4">{ticket.ticketPrice}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(ticket)} className="font-medium text-red-600 dark:text-red-500 bg-transparent">
                                            CANCEL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
