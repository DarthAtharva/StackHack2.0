const express = require('express');
const router = express.Router();
const Showtime  = require('./models/showtime');
const Movie = require('./models/movie'); 
const Theatre = require('./models/theatre'); 
const {z} = require('zod');



const showtimeSchema = z.object({
    movie: z.string().min(1,"Movie ID is required"),  // ObjectId as string
    theatre: z.string().min(1,"Theatre ID is required"),  // ObjectId as string
    ticketPrice: z.number().min(0, "Ticket price must be a non-negative number"),  // Ensure positive number
    startDate: z.string().refine(value => !isNaN(Date.parse(value)), {
        message: "Invalid start date format. Please use a valid date string."
    }),
    endDate: z.string().refine(value => !isNaN(Date.parse(value)), {
        message: "Invalid end date format. Please use a valid date string."
    }),
});

router.get('/test',(req,res)=>{
    res.json({message:"test ok"});
})  


//create new showtimes 
router.post('/showtimes',async (req,res)=>{
    const validation = showtimeSchema.safeParse(req.body);
    if(!validation.success){
        return res.status(400).json({error: validation.error});
    }

    const {movie,theatre,ticketPrice,startDate,endDate} = validation.data;

    try{
        const showtimeDocument = await Showtime.create({
            movie,
            theatre,
            ticketPrice,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        
        res.status(200).json({
            message:"success",
            showtimeDocument:showtimeDocument});
    }catch(error){
        console.error("Error creating showtime:", error);
        res.status(422).json({ error: error.message });
    }
    
    
});

//get all showtimes

router.get("/showtimes",async (req,res)=>{
    const allshowtimes = await Showtime.find({});

    res.json({allshowtimes});
})


//SEARCH FOR A showtime by movie
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



        const showtimes = await Showtime.find({ movie: { $in: movieIds } });
        res.json(showtimes);
        
        
    }catch(error){
        console.error('error searching showtimes:',error);
        res.status(500).json({message:'internal server error'});

    }
})

//SEARCH FOR A showtime by theatre
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



        const showtimes = await Showtime.find({ theatre: { $in: theatreIds } });
        res.json(showtimes);
        
        
    }catch(error){
        console.error('error searching showtimes:',error);
        res.status(500).json({message:'internal server error'});

    }
})

//update a showtime


router.put("/showtimes/:id",async (req,res)=>{
    const showtimeId = req.params.id;
    const updatedata = req.body;

    try{
        //find showtime by id and update it
        const updatedshowtime = await Showtime.findByIdAndUpdate(showtimeId,updatedata, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the update adheres to the schema
          })

          if (updatedshowtime) {
            res.status(200).json({ message: 'showtime updated successfully', updatedshowtime });
          } else {
            res.status(404).json({ message: 'showtime not found' });
          }  

    }catch(error){
        console.error('Error updating showtime:', error);
        res.status(500).json({ message: 'Internal Server Error' });

    }
})



//delete a showtime
router.delete("/showtimes/:id",async (req,res)=>{
    const showtimeId = req.params.id;
    try{
        const deletedshowtime = await Showtime.findByIdAndDelete(showtimeId);

        if (deletedshowtime) {
            res.status(200).json({ message: 'showtime deleted successfully', deletedshowtime });
          } else {
            res.status(404).json({ message: 'showtime not found' });
          }

    }catch(error){
        console.error("error deleting showtime",error);
        res.status(500).json({message:'internal server error'})
    }
})



module.exports = router;