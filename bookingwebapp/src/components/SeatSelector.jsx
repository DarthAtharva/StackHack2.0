import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { Navigate } from 'react-router-dom'; 
import DummyPayment from "./DummyPayment"; 
import { format, parse } from 'date-fns';
import { UserContext } from "../UserContext";

const SeatSelector = (props) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [redirect, setRedirect] = useState(false); 
  const [movieTitle, setMovieTitle] = useState('');
  const [theatreName, setTheatreName] = useState('');
  const { user, ready } = useContext(UserContext); // Use UserContext

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const showtimeResponse = await axios.get(`/Showtimes/${props.chooseShowtimeId}`);
        const showtime = showtimeResponse.data;
        
        const movieResponse = await axios.get(`/movies/${showtime.movieid}`);
        setMovieTitle(movieResponse.data.title);

        const theatreResponse = await axios.get(`/theatres/${showtime.theatreid}`);
        setTheatreName(theatreResponse.data.theatreName);
        
       
        await fetchBookedSeatsAndGenerateSeats();
      } catch (error) {
        console.error("Failed to fetch details:", error);
      }
    };

    fetchDetails();
  }, [props.chooseShowtimeId, props.chooseTime, props.rows, props.cols, props.ticketPrice]);

  const fetchBookedSeatsAndGenerateSeats = async () => {
    try {
      const response = await axios.get('/bookedSeats', {
        params: {
          showtimeId: props.chooseShowtimeId,
          daytime: props.chooseTime
        }
      });

      const bookedSeatNumbers = response.data.seats;
      setBookedSeats(bookedSeatNumbers);

      const generatedSeats = [];
      const rowLabels = Array.from({ length: props.rows }, (_, i) => String.fromCharCode(65 + i));

      for (let row = 0; row < props.rows; row++) {
        for (let col = 0; col < props.cols; col++) {
          const seatId = `${rowLabels[row]}${col + 1}`;
          generatedSeats.push({
            id: seatId,
            row: rowLabels[row],
            col: col + 1,
            booked: bookedSeatNumbers.includes(seatId),
            selected: false,
            price: props.ticketPrice,
          });
        }
      }
      setSeats(generatedSeats);

    } catch (error) {
      console.error("Failed to fetch booked seats:", error);
    }
  };

  const handleSeatSelection = (index) => {
    const updatedSeats = [...seats];
    const seat = updatedSeats[index];
    if (!seat.booked) {
      seat.selected = !seat.selected;
      setSelectedSeats((prevSelectedSeats) =>
        seat.selected ? prevSelectedSeats + 1 : prevSelectedSeats - 1
      );
      setTotalAmount((prevTotalAmount) =>
        seat.selected ? prevTotalAmount + seat.price : prevTotalAmount - seat.price
      );
      setSelectedSeatIds((prevSelectedSeatIds) =>
        seat.selected
          ? [...prevSelectedSeatIds, seat.id]
          : prevSelectedSeatIds.filter((id) => id !== seat.id)
      );
    }
    setSeats(updatedSeats);
  };

  const bookingHandler = async () => {
    try {
      const response = await axios.post('/bookTicket', {
        chooseShowtimeId: props.chooseShowtimeId,
        chooseTime: props.chooseTime,
        selectedSeatIds,
        ticketPrice: props.ticketPrice
      });

      if (response.status === 200) {
        const { booking_code, seatNumbers } = response.data;

        // Email details
        const emailDetails = {
          booking_code,
          seatNumbers,
          userEmail: user?.email, 
          userName: user?.name, 
          movieTitle,
          theatreName,
          chooseTime: props.chooseTime
        };

       
        await sendBookingConfirmationEmail(emailDetails);

        alert("Ticket successfully booked and confirmation email sent!");
        setSelectedSeats(0);
        setTotalAmount(0);
        setSelectedSeatIds([]);
        setRedirect(true);
      }
    } catch (error) {
      console.error("Failed to book tickets:", error);
      alert("Failed to book tickets! Are you logged out?");
    }
  };

  
  const sendBookingConfirmationEmail = async (emailDetails) => {
    try {
      const response = await axios.post('/sendBookingConfirmationEmail', emailDetails);

      if (response.status === 200) {
        console.log('Email sent:', response.data.message);
      }
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleBookNowClick = () => {
    setShowPayment(true); 
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false); 
    bookingHandler();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (redirect) {
    return <Navigate to='/account/myBookings' />;
  }

  const formatTimeTo12Hour = (timeString) => {
    const date = parse(timeString, 'HH:mm', new Date());
    return format(date, 'hh:mm a');
  };

  return (
    <section className="items-center py-4 px-10 dark:bg-gray-950">

      <div className="flex flex-col items-center font-bold">
        <h2>SCREEN</h2>
        <span className="text-primary-600">{formatTimeTo12Hour(props.chooseTime)}</span>
      </div>

      <div
        className="custom-scrollbar flex flex-col items-center overflow-auto py-16 px-10" 
        style={{
          maxWidth: '80vw', 
          maxHeight: '60vh',
          minWidth: '30vw'
        }}
      >

        <h2 className="font-light text-sm mb-2"> Rs. {props.ticketPrice}</h2>
        <div
          className="grid gap-0 w-max border-t" 
          style={{
            gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`,
          }}
        >
          
          {seats.map((seat, index) => (

            <label
              key={seat.id}
              className={`relative flex w-7 h-7 m-2 rounded-md cursor-pointer duration-200 items-center justify-center text-xs font-light  ${
                seat.booked
                  ? "bg-gray-400 cursor-not-allowed"
                  : seat.selected
                  ? "bg-primary-500 dark:bg-primary-700"
                  : "bg-primary-50 dark:bg-gray-800 border border-gray-400 dark:border-primary-800 hover:bg-gray-300"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={seat.selected}
                onChange={() => handleSeatSelection(index)}
                disabled={seat.booked}
              />

              <span className="absolute text-xs font-light text-gray-700 dark:text-primary-100">{seat.id}</span>

            </label>
          ))}

        </div>

        <div className="mt-3 w-full">
        {showPayment ? (
          <DummyPayment
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        ) : (
          <div className="flex justify-between items-center gap-6">
            <div className="font-light dark:text-primary-50">
              <span><strong>Tickets:</strong> {selectedSeats}</span>
              <div className="">
                <strong>Selected Seats:</strong> {selectedSeats ? selectedSeatIds.join(", ") : 0}
              </div>
              <div className="">
                <strong>Total: <span className="text-primary-600">₹ {totalAmount}</span></strong>
              </div>
            </div>

            <div>
              <button
                onClick={handleBookNowClick}
                disabled={selectedSeats === 0}
                className={`px-6 py-3 rounded-md shadow-md transition duration-300 font-semibold ${
                  selectedSeats === 0
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-primary-800 text-white hover:bg-orange-400"
                }`}
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>

      </div>

    </section>
  );
};

export default SeatSelector;
