const express = require('express');
const router = express.Router();
const reservation  = require('./models/reservation');
const Movie = require('./models/movie'); 
const Theatre = require('./models/theatre'); 
const {z} = require('zod');


// Define the Zod schema for reservations
const reservationZodSchema = z.object({
    movie: z.string().uuid('Invalid movie ID'), // UUID validation for MongoDB ObjectId
    theatre: z.string().uuid('Invalid theatre ID'), // UUID validation for MongoDB ObjectId
    date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format'), // Ensures a valid date string
    startAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date format'), // Ensures a valid date string
    seats: z.number().positive('Seats must be a positive number').int('Seats must be an integer'),
    orderID: z.string().nonempty('Order ID is required'),
    ticketPrice: z.number().positive('Ticket price must be a positive number'),
    total: z.number().positive('Total must be a positive number'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be at most 15 digits'),
  });

router.get('/test',(req,res)=>{
    res.json({message:"test ok"});
})  


//create new reservations 
router.post('/reservations',async (req,res)=>{
    const validation = reservationZodSchema.safeParse(req.body);
    if(!validation.success){
        return res.status(400).json({error: validation.error});
    }

    const {movie,theatre,date,startAt,seats,orderID,ticketPrice,total,name,phone} = validation.data;

    try{
        const reservationDocument = await reservation.create({
            movie,
            theatre,
            date,
            startAt,
            seats,
            orderID,
            ticketPrice,
            total,
            name,
            phone

        });
        
        res.status(200).json({
            message:"success",
            reservationDocument:reservationDocument});
    }catch(error){
        console.error("Error creating reservation:", error);
        res.status(422).json({ error: error.message });
    }
    
    
});

//get all reservations

router.get("/reservations",async (req,res)=>{
    const allreservations = await reservation.find({});

    res.json({allreservations});
})


//SEARCH FOR A reservation by movie
router.get("/searchByMovie", async (req,res)=>{
    const {movieName} = req.body;
    if (!movieName) {
        return res.status(400).json({ error: 'Movie name is required' });
    }

    try{
        // Find movies by name
        const movies = await Movie.find({ title: new RegExp(movieName, 'i') });

        if (movies.length === 0) {
            return res.status(404).json({ message: 'No movies found with the given name' });
        }

        // Extract movie IDs
        const movieIds = movies.map(movie => movie._id);



        const reservations = await reservation.find({ movie: { $in: movieIds } });
        res.json(reservations);
        
        
    }catch(error){
        console.error('error searching reservations:',error);
        res.status(500).json({message:'internal server error'});

    }
})

//SEARCH FOR A reservation by theatre
router.get("/searchByTheatre", async (req,res)=>{
    const {theatreName} = req.body;
    if (!theatreName) {
        return res.status(400).json({ error: 'theatre name is required' });
    }

    try{
        // Find theatre by name
        const theatres = await Theatre.find({ name: new RegExp(theatreName, 'i') });

        if (theatres.length === 0) {
            return res.status(404).json({ message: 'no theatres found with the given name' });
        }

        // Extract movie IDs
        const theatreIds = theatres.map(theatre => theatre._id);



        const reservations = await reservation.find({ theatre: { $in: theatreIds } });
        res.json(reservations);
        
        
    }catch(error){
        console.error('error searching reservations:',error);
        res.status(500).json({message:'internal server error'});

    }
})

//update a reservation


router.put("/reservations/:id",async (req,res)=>{
    const reservationId = req.params.id;
    const updatedata = req.body;

    try{
        //find reservation by id and update it
        const updatedreservation = await reservation.findByIdAndUpdate(reservationId,updatedata, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the update adheres to the schema
          })

          if (updatedreservation) {
            res.status(200).json({ message: 'reservation updated successfully', updatedreservation });
          } else {
            res.status(404).json({ message: 'reservation not found' });
          }  

    }catch(error){
        console.error('Error updating reservation:', error);
        res.status(500).json({ message: 'Internal Server Error' });

    }
})



//delete a reservation
router.delete("/reservations/:id",async (req,res)=>{
    const reservationId = req.params.id;
    try{
        const deletedreservation = await reservation.findByIdAndDelete(reservationId);

        if (deletedreservation) {
            res.status(200).json({ message: 'reservation deleted successfully', deletedreservation });
          } else {
            res.status(404).json({ message: 'reservation not found' });
          }

    }catch(error){
        console.error("error deleting reservation",error);
        res.status(500).json({message:'internal server error'})
    }
})



module.exports = router;