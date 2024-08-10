const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.js');
const Movie = require('./models/movie.js');
const {Theatre} = require('./models/theatre');
const Showtime = require('./models/showtime.js');
const Reservation = require('./models/reservation.js')
const Image = require('./models/image.js');
const jsonwebtoken = require('jsonwebtoken');
const { z } = require('zod');
const fs = require('fs');

//use router for theater as app size increase
const theatreRouter = require("./router1.js");
const showtimeRouter = require("./router2.js");
const reservationRouter = require("./router3.js");



require('dotenv').config()
const app = express();

const bcryptSalt = bcrypt.genSaltSync(8);
const jsonwebtokenSecret = 'wewillwinthishackathon';

app.use(express.json());

app.use(cors({

    credentials: true,
    origin: 'http://localhost:5173',

}));

// console.log(process.env.MONGO_URL) // remove this after you've confirmed it is working
//mongoose.connect(process.env.MONGO_URL);
mongoose.connect("mongodb+srv://yash:jkhdtjz0@cluster0.ztriphd.mongodb.net/");

app.get('/test', (req, res) =>{
    res.json('test ok');
});


app.use("/theatre", theatreRouter);
app.use("/showtime",showtimeRouter);
app.use("/reservation",showtimeRouter);

// Define the Zod schema for validation
const userZodSchema = z.object({
    username: z.string().min(1, 'Name is required'), // Ensures that name is a non-empty string
    email: z.string().email('Invalid email address'), // Validates the email format
    password: z.string().min(6, 'Password must be at least 6 characters long'), // Minimum length for password
    role: z.enum(['Admin', 'Customer', 'SuperAdmin']), // Ensures role is one of the defined values
    orderID: z.array(z.string().optional()).optional(), // Optional array of strings (ObjectId as strings)
  });



app.post('/register', async(req, res) => {

    const validation = userZodSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error });
    }

    const {username, email, password,role,orderID} = validation.data;
    // res.json({name, email, password});

    try{

        const userDocument = await User.create({
        
            username,
            email,
            password : bcrypt.hashSync(password, bcryptSalt),
            role,
            orderID
    
        });

        res.json(userDocument);

    }catch (duplicateMailError){

        res.status(422).json(duplicateMailError);

    }

    
});

const userZodSchemaLogin = z.object({
    email: z.string().email('Invalid email address'), // Validates the email format
    password: z.string().min(6, 'Password must be at least 6 characters long'), // Minimum length for password
    
})

app.post('/login', async (req, res) => {
    
    const validation = userZodSchemaLogin.safeParse(req.body);
    if(!validation.success){
        return res.status(400).json({ error: validation.error });
    
    }

    const {email, password} = validation.data;
    const userDocument = await User.findOne({email});

    if(userDocument){

        const checkPassword = bcrypt.compareSync(password, userDocument.password);

        if(checkPassword){

            jsonwebtoken.sign({email:userDocument.email, id: userDocument._id}, jsonwebtokenSecret, {}, (error, token) => {
                if(error) throw error;
                res.cookie('token', token).json('Password matched');
            });

        }else{

            res.status(401).json('Password not matched');

        }

        // res.json('found');

    }else{

        res.json('email not found');

    }

});


//update user 

//zod validation
const userZodSchemaUpdate = z.object({
    username: z.string().min(1, 'Name is required').optional(), // Ensures that name is a non-empty string
    email: z.string().email('Invalid email address').optional(), // Validates the email format
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(), // Minimum length for password
    role: z.enum(['Admin', 'Customer', 'SuperAdmin']).optional(), // Ensures role is one of the defined values
    orderID: z.array(z.string().optional()).optional(), // Optional array of strings (ObjectId as strings)
  });

app.put('/user/:id',async (req,res)=>{
    const validation = userZodSchemaUpdate.safeParse(req.body);
    const {id} = req.params;

    if(!validation.success){
       return res.status(400).json({error:validation.error.errors});
    }

    try{
        const updatedUser = await User.findByIdAndUpdate(id,validation.data,{
            new:true,
            runValidators:true,
        })

        if(!updatedUser){
            return res.status(400).json({message:"user not found"})
        }

        res.status(200).json({ message: 'User updated successfully', updatedUser });
    }catch(error){
        res.status(500).json({message:"an error has occured while updating user"})
    }


})  



//movies
//zod validation 
const movieSchema = z.object({
    title: z.string(),
    director: z.string().optional(),
    releaseDate: z.string().optional(),
    genre: z.string().optional()
  });

//create a new movie
app.post("/movies",async (req,res)=>{

    const validation = movieSchema.safeParse(req.body);
    if (!validation.success) {
    return res.status(400).json({ error: validation.error});
    }
    const { title, director, releaseDate, genre } = validation.data;


    try{
        const newMovie =  await new Movie({
            title,
            director,
            releaseDate: releaseDate ? new Date(releaseDate) : undefined, // Convert to Date object
            genre
        }).save();

        // Save the new movie to the database
        

        // Respond with the newly created movie
        res.status(201).json({ message: 'Movie added successfully', newMovie });
    }catch(error){
        console.error("error adding movies",error);
        res.status(500).json({message:"internal server error"});
    }


})




//get movies
app.get("/movies",async (req,res)=>{
    const allmovies = await Movie.find({});

    res.json({
        allmovies
    })


})

//search for a movie
app.post("/searchmovie",async (req,res)=>{
    const {searchString} = req.body;
    try {
        // Using a regular expression to perform a case-insensitive search
        const movies = await Movie.find({ title: new RegExp(searchString, 'i') }, 'title');
    
        if (movies.length > 0) {
          res.status(200).json({ movies });
        } else {
          res.status(404).json({ message: 'No movies found' });
        }
      } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      } 

});

//update a movie
app.put("/movies/:id",async (req,res)=>{
    const movieId = req.params.id;
    const updatedata = req.body;

    try{
        //find movie by id and update it
        const updatedMovie = await Movie.findByIdAndUpdate(movieId,updatedata, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the update adheres to the schema
          })

          if (updatedMovie) {
            res.status(200).json({ message: 'Movie updated successfully', updatedMovie });
          } else {
            res.status(404).json({ message: 'Movie not found' });
          }  

    }catch(error){
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'Internal Server Error' });

    }

})

//delete a movie
app.delete("/movies/:id",async (req,res)=>{
    const movieId = req.params.id;
    try{
        const deletedMovie = await Movie.findByIdAndDelete(movieId);

        if (deletedMovie) {
            res.status(200).json({ message: 'Movie deleted successfully', deletedMovie });
          } else {
            res.status(404).json({ message: 'Movie not found' });
          }

    }catch(error){
        console.error("error deleting movie",error);
        res.status(500).json({message:'internal server error'})
    }
})

//images

// Function to save an image
const saveImage = async (filePath,imgname) => {
    const imgData = fs.readFileSync(filePath);
    const newImage = new Image({
      name: imgname,
      img: {
        data: imgData,
        contentType: 'image/png' // Adjust based on your image type
      }
    });
  
    await newImage.save();
    console.log('Image saved successfully');
  };

//upload images
app.post("/images",async (req,res)=>{
    // Call the function to save an image
    saveImage('C:/Users/yshar/Downloads/banner4.png',"photo");
    res.status(200).json({message:"image saved on mongo"});

})
//get image
app.get('/image/:id', async (req, res) => {
    const image = await Image.findById(req.params.id);
    res.contentType(image.img.contentType);
    res.send(image.img.data);
  });


  //theatres


app.listen(4000);
