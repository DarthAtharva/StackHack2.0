const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const zod = require('zod');
const { v4: uuidv4 } = require('uuid'); // For generating unique booking codes
// const movieModel = require('./models/movie.js');
require('dotenv').config()


const User = require('./models/user.js');
const Movie = require('./models/movie.js');
const Theatre = require('./models/theatre.js');
const Showtime = require('./models/showtime.js');
const AdminRequests = require('./models/adminRequest.js')
const Tickets = require('./models/tickets.js');
const app = express();

const bcryptSalt = bcrypt.genSaltSync(8);
// const jsonwebtokenSecret = 'wewillwinthishackathon';
// const jsonwebtokenSecret = process.env.JWT_SECRET || 'defaultsecret';
const jsonwebtokenSecret = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));

app.use(cors({

    credentials: true,
    origin: 'http://localhost:5173',

}));

// console.log(process.env.MONGO_URL) // remove this after you've confirmed it is working
mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req, res) =>{
    res.json('test ok');
});

app.get('/atharva', (req, res) =>{
    res.json('Hello There');
});

app.post('/register', async(req, res) => {

    const {name, email, password} = req.body;
    // res.json({name, email, password});

    try{

        const userDocument = await User.create({
        
            name,
            email,
            password : bcrypt.hashSync(password, bcryptSalt),
    
        });

        res.json(userDocument);

    }catch (duplicateMailError){

        res.status(422).json(duplicateMailError);

    }

    
});

app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    const userDocument = await User.findOne({ email });

    if (userDocument){
    
        if(bcrypt.compareSync(password, userDocument.password)) {

            jsonwebtoken.sign({
                email: userDocument.email, 
                id: userDocument._id, 
                // name: userDocument.name
            }, jsonwebtokenSecret, {}, (error, token)=>{

                if (error) {
                    res.status(500).json('Error signing token');
                } else {
                    // res.cookie('token', token).json(userDocument);
                    res.cookie('token', token, { httpOnly: true, secure: true }).json(userDocument);
                }

            });

        }else{

            res.status(401).json('Password not matched');

        }

    } else {

        res.status(404).json('Email not registered');

    }
});

app.get('/profile', (req, res) => {

    const {token} = req.cookies;

    if(token){

        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const {name, email, _id,role} = await User.findById(userData.id);
            res.json( {name, email, _id,role});

        });

    }else{

        res.json(null);

    }

});


//route for getting userdata with role
app.get('/getAllUsers', (req, res) => {

    const {token} = req.cookies;

    if(token){

        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const users = await User.find();
            res.json(users);

        });

    }else{

        res.json(null);

    }

});


app.get('/getUser/:id', (req, res) => {

    const {token} = req.cookies;
    const {id} = req.params;

    if(token){

        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const users = await User.findById(id);
            res.json(users);

        });

    }else{

        res.json(null);

    }

});

//route for updating userdata by id for superadmin
app.put('/updateUser/:id',(req,res)=>{
    const {id} = req.params;
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const {

        name,
        email,
        role

    } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const userDoc = await User.findById(id);
    
        {

            userDoc.set({

                name, email, role

            });

            await userDoc.save();
            res.json('ok');

        }

    });
    
})





app.post('/logout', (req, res) => {

    res.clearCookie('token').json({ message: 'Logged out successfully' });

});

app.post('/upload-by-link', async (req, res) => {

    const { link } = req.body;

    console.log('Received link:', link); 

    if (!link) {
        return res.status(400).json({ error: 'Link is required' });
    }

    const newName = 'photo' + Date.now() + '.jpg';

    try {
        
        await imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName,
        });

        res.json(newName);

    } catch (error) {

        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });

    }
});

const photosMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photosMiddleware.array('photos', 10), (req, res) => {

    const uploadedFiles = [];

    req.files.forEach(file => {
        const { path, originalname } = file;
        const ext = originalname.split('.').pop();
        const newPath = `${path}.${ext}`;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads', ''));
    });


    res.json(uploadedFiles);

});

/* FOR ALL MOVIES */
app.get('/', async(req, res) => {

    try {

        const movies = await Movie.find(); 
        res.json(movies);

    } catch (error) {

        res.status(500).json({ error: 'Internal server error' });

    }

});

app.post('/adminMovies', (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const {

        title, addedPhotos,
        languages, length, genre, certificate, releaseDate, director, description, 
        // cast, crew

    } = req.body;

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const movieDoc = await Movie.create({

            owner: userData.id,
            title, photos: addedPhotos,
            languages, length, genre, certificate, releaseDate, director, description,
            // cast, crew

        });

        res.json(movieDoc);

    });
});

app.get('/adminMovies', async(req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const {id} = userData;

        res.json(await Movie.find({owner:id}));
        

    });

    // try {

    //     const movies = await Movie.find(); 
    //     res.json(movies);

    // } catch (error) {

    //     res.status(500).json({ error: 'Internal server error' });

    // }

});

app.get('/adminMovies/:id', async (req, res) => {

    const {id} = req.params;
    res.json(await Movie.findById(id));

});

/* For Update */
app.put('/adminMovies', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const {

        id,
        title, addedPhotos,
        languages, length, genre, certificate, releaseDate, director, description, 
        // cast, crew

    } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const movieDoc = await Movie.findById(id);
    
        if(userData.id === movieDoc.owner.toString()){

            movieDoc.set({

                title, photos: addedPhotos,
                languages, length, genre, certificate, releaseDate, director, description,
                // cast, crew

            });

            await movieDoc.save();
            res.json('ok');

        }

    });

});

// app.get('/adminMovies', async (req, res) => {

//     res.json(await Movie.find());

// });

/*delete movie */
app.delete('/adminMovies/:id',async (req,res)=>{
    const {id} = req.params;
    res.json(await Movie.findByIdAndDelete(id));
})


//create new theatre
app.post('/adminTheatres',async (req,res)=>{
    
    const {token} = req.cookies;

    if(!token){
        res.status(401).json({error:'token not found'});
    }
    const {theatreName,
         city,
         ticketPrice,
         rows,
         cols
            } = req.body;



        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const theatreDocument = await Theatre.create({
                owner: userData.id,
                theatreName,
                city,
                ticketPrice,
                rows,
                cols
            });
            res.status(200).json({
                message:"success",
                theatreDocument:theatreDocument});
                
    
        });
    
    
});

//get all theatres
app.get('/adminTheatres', async (req, res) => {

    // res.json(await Theatre.find());

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const {id} = userData;

        res.json(await Theatre.find({owner:id}));
        

    });

});


//update theatres



/* For Update */
app.put('/adminTheatres', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }



    const {

        id,
        theatreName,
        city,
        ticketPrice,
        rows,
        cols
    } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const theatreDoc = await Theatre.findById(id);
    
        if(userData.id === theatreDoc.owner.toString()){

            theatreDoc.set({

                theatreName,
                city,
                ticketPrice,
                rows,
                cols

            });

            await theatreDoc.save();
            res.json('ok');

        }

    });

});

app.get('/adminTheatres/:id', async (req, res) => {

    const {id} = req.params;
    res.json(await Theatre.findById(id));

});

app.delete('/adminTheatres/:id',async (req,res)=>{
    const {id} = req.params;
    res.json(await Theatre.findByIdAndDelete(id));
})

// Search endpoint
app.get('/search', async (req, res) => {

    const { query } = req.query;

    if (!query) {
        return res.json([]);
    }

    try {

        const movies = await Movie.find({ title: new RegExp(query, 'i') }).limit(10);
        res.json(movies);

    } catch (err) {

        res.status(500).json({ error: 'Something went wrong' });

    }
    
});
//showtime showtime showtime showtime showtime showtime showtime showtime showtime showtime showtime 

//create new showtime
app.post('/adminShowtimes',async (req,res)=>{
    
    const {token} = req.cookies;

    if(!token){
        res.status(401).json({error:'token not found'});
    }
    const {
        movieid, movieName, theatreid, theatreName, ticketPrice, showdate, daytime, city
        } = req.body;



        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const showtimeDocument = await Showtime.create({
                owner: userData.id,
                movieid,
                movieName,
                theatreid,
                theatreName,
                ticketPrice,
                showdate,
                daytime,
                city
            });

            res.status(200).json({
                message:"success",
                showtimeDocument:showtimeDocument});
                
    
        });
    
    
});

/* Check Showtimes before adding */
app.get('/adminShowtimes/check', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const { movieid, theatreid, showdate } = req.query;

        const existingShowtime = await Showtime.findOne({
            movieid,
            theatreid,
            showdate: new Date(showdate)  
        });

        if (existingShowtime) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
        
    });

});

app.get('/adminShowtimes/:id', async (req, res) => {

    const {id} = req.params;
    const element = await Showtime.findById(id) 
    res.json(element);

});

//get all showtimes
app.get('/adminShowtimes', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const {id} = userData;

        res.json(await Showtime.find({owner:id}));
        

    });

});

//get all showtimes for customer (all showtimes created by admins)
// app.get('/customerShowtimes', async (req, res) => {

//     const {token} = req.cookies;

//     if (!token) {
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

//         if(error) throw error;
    

//         res.json(await Showtime.find());
        

//     });

// });

/* For Update */
app.put('/adminShowtimes', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }



    const {id,movieid,movieName,theatreid,theatreName, ticketPrice, showdate,daytime,city
        } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const showtimeDoc = await Showtime.findById(id);
    
        if(userData.id === showtimeDoc.owner.toString()){

            showtimeDoc.set({
                movieid,movieName,theatreid,theatreName,ticketPrice,showdate,daytime,city
            });

            await showtimeDoc.save();
            res.json('ok');

        }

    });

});

app.delete('/adminShowtimes/:id',async (req,res)=>{
    const {id} = req.params;
    res.json(await Showtime.findByIdAndDelete(id));
})

//Admin request Admin request Admin request Admin request Admin request Admin request Admin request
app.post('/createAdminList',async (req,res)=>{
    res.json(await AdminRequests.create({
        'requestList' : []
    }));
})

app.get('/adminList', async (req,res)=>{
    const {token} = req.cookies;
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if (error) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        try {
            const data = await AdminRequests.findOne();
            if (!data) {
                return res.status(404).json({ error: 'No admin requests found' });
            }

            res.json(data);
        } catch (error) {
            console.error('Failed to fetch admin requests:', error);
            return res.status(500).json({ error: 'Failed to fetch admin requests' });
        }

   });

});


//create new request
app.post('/adminList/:id', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'Token not found' });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ObjectId' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        try {
            let adminRequest = await AdminRequests.findOne();

            if (!adminRequest) {
                // Create a new AdminRequest object if none exists
                adminRequest = new AdminRequests({
                    requestList: []
                });
            }

            // Add the user ID to the requestList array
            adminRequest.requestList.push(id);
            await adminRequest.save();

            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            console.error('Failed to add user to admin list:', error);
            return res.status(500).json({ error: 'Failed to process request' });
        }
    });
});

app.delete('/adminList/:userId',async (req,res)=>{
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({error:'token not found'});
    }

    const {userId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid ObjectId' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) {
            return res.status(403).json({ error: 'Invalid token' });
        }
    
        try{
            const adminRequest = await AdminRequests.findOne();
            adminRequest.requestList = adminRequest.requestList.filter(id => id.toString() !== userId);
            await adminRequest.save();
            res.status(200).json({message:"success"});
        }catch(error){
            res.status(500).json({ error: 'Failed to remove the user from the request list.' });
        }
        
            

    });

})
/* RESERVATION */

app.get('/findShowtimes', async (req, res) => {
    
    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;

        const { movieid, city } = req.query;
        
        try {
            const showtimes = await Showtime.find({ movieid, city });
            res.json(showtimes);
          } catch (error) {
            res.status(500).json({ error: 'Error fetching showtimes' });
          }
        
    });

});

/** tickets */

app.post('/bookTicket', async (req, res) => {
    const {
        chooseShowtimeId,
        chooseTime,
        selectedSeatIds,
        ticketPrice
    } = req.body;

    try {
        const bookingPromises = selectedSeatIds.map(async (singleSeat) => {
            const booking_code = uuidv4();
            // Creating a ticket for each seat
            return Tickets.create({
                booking_code:booking_code,
                showtimeId:chooseShowtimeId,
                daytime :chooseTime,
                seatNumber: singleSeat, // Assuming this field stores the seat number
                ticketPrice:ticketPrice
            });
        });

        // Await all booking operations
        const bookingResults = await Promise.all(bookingPromises);

        // Collect successful bookings and send them in the response
        const successfulBookings = bookingResults.map((booking, index) => ({
            seat: selectedSeatIds[index],
            booking_code: booking.booking_code
        }));

        res.status(200).json({
            message: "Tickets successfully created for all selected seats",
            bookings: successfulBookings
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create one or more tickets", details: error.message });
    }
});

app.get('/bookedSeats', async (req, res) => {
    const { showtimeId, daytime } = req.query; // Use req.query for GET requests

    if (!showtimeId || !daytime) {
        return res.status(400).json({ error: "showtimeId and daytime are required" });
    }

    try {
        // Find all tickets that match the given showtimeId and daytime
        const bookedSeats = await Tickets.find({ showtimeId, daytime }, 'seatNumber');

        // Extract the seat numbers into an array
        const seatNumbers = bookedSeats.map(ticket => ticket.seatNumber);

        res.status(200).json({
            message: `Successfully retrieved booked seats for showtime ${showtimeId} on ${daytime}`,
            seats: seatNumbers
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve booked seats", details: error.message });
    }
});


app.listen(4000);
