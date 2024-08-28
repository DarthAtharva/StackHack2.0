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
const nodemailer = require('nodemailer');
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

// Create a transporter object with SMTP server details
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASS, // Use the app password generated here
    }
});

// Middleware to check for token
// app.use((req, res, next) => {
//     const { token } = req.cookies;
//     if (!token) {
//         return res.status(401).json({ error: 'No token provided' });
//     }
//     jsonwebtoken.verify(token, jsonwebtokenSecret, (error, userData) => {
//         if (error) {
//             return res.status(401).json({ error: 'Invalid token' });
//         }
//         req.user = userData;
//         next();
//     });
// });




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
        //  ticketPrice,
         rows,
         cols
            } = req.body;



        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const theatreDocument = await Theatre.create({
                owner: userData.id,
                theatreName,
                city,
                // ticketPrice,
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
        // ticketPrice,
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
                // ticketPrice,
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
        movieid, movieName, theatreid, theatreName, 
        ticketPrice, 
        showdate, daytime, city
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



    const {id,movieid,movieName,theatreid,theatreName, 
        // ticketPrice, 
        showdate,daytime,city
        } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const showtimeDoc = await Showtime.findById(id);
    
        if(userData.id === showtimeDoc.owner.toString()){

            showtimeDoc.set({
                movieid,movieName,theatreid,theatreName,
                // ticketPrice,
                showdate,daytime,city
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
    const { token } = req.cookies;

    // if (!token) {
    //     return res.status(401).json({ error: 'No token provided' });
    // }

    // jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
    //     if (error) {
    //         return res.status(401).json({ error: 'Invalid token' });
    //     }

        const { movieid, city, showdate } = req.query;

        try {
            const query = { movieid };

            if (city) {
                query.city = city;
            }

            if (showdate) {
                const parsedDate = new Date(showdate);
                if (!isNaN(parsedDate)) {
                    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
                    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
                    query.showdate = { $gte: startOfDay, $lte: endOfDay };
                } else {
                    return res.status(400).json({ error: 'Invalid showdate' });
                }
            }
            

            const showtimes = await Showtime.find(query);
            res.json(showtimes);
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            res.status(500).json({ error: 'Error fetching showtimes' });
        }
    });
// });




// app.get('/findShowtimes', async (req, res) => {
    
//     const {token} = req.cookies;

//     if (!token) {
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

//         if(error) throw error;

//         const { movieid, city } = req.query;
        
//         try {
//             const showtimes = await Showtime.find({ movieid, city });
//             res.json(showtimes);
//           } catch (error) {
//             res.status(500).json({ error: 'Error fetching showtimes' });
//           }
        
//     });

// });

/** tickets */
app.post('/bookTicket', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided, please log in first' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) throw error;
        
        const {
            userId, // Expect userId from the frontend
            chooseShowtimeId,
            chooseTime,
            selectedSeatIds,
            ticketPrice
        } = req.body;

        try {
            // Generate a unique booking code for this transaction
            const booking_code = uuidv4();

            // Create a single ticket document that includes all selected seats
            const ticket = await Tickets.create({
                booking_code: booking_code,
                userId: userId,
                showtimeId: chooseShowtimeId,
                daytime: chooseTime,
                seatNumbers: selectedSeatIds, // Store the array of seat numbers
                ticketPrice: ticketPrice * selectedSeatIds.length // Calculate total price
            });

            res.status(200).json({
                message: "Ticket successfully created",
                booking_code: ticket.booking_code,
                seatNumbers: ticket.seatNumbers
            });
        } catch (error) {
            console.error("Failed to create ticket:", error);
            res.status(500).json({ error: "Failed to create ticket", details: error.message });
        }
    });
});



app.post('/sendBookingConfirmationEmail', async (req, res) => {
    const { userEmail, userName, movieTitle, theatreName, chooseTime, seatNumbers, booking_code } = req.body;

    try {
        // Set up the transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, // Replace with your email address
                pass: process.env.EMAIL_PASS   // Replace with your email password or an app-specific password
            }
        });

        // Prepare the email content
        const mailOptions = {
            from: process.env.EMAIL, // Sender address
            to: userEmail, // User's email address
            subject: `Booking Confirmation - ${movieTitle} at ${theatreName}`,
            html: `
                <h2>Dear ${userName},</h2>
                <p>Thank you for booking with us! Here are your ticket details:</p>
                <p><strong>Movie:</strong> ${movieTitle}</p>
                <p><strong>Theatre:</strong> ${theatreName}</p>
                <p><strong>Showtime:</strong> ${chooseTime}</p>
                <p><strong>Seats:</strong> ${seatNumbers.join(', ')}</p>
                <p><strong>Booking Code:</strong> ${booking_code}</p>
                <p>We hope you enjoy the show!</p>
                <p>Best regards,<br/>Your Movie Booking Team</p>
            `
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Failed to send email:", error);
                return res.status(500).json({ error: "Failed to send confirmation email", details: error.message });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Confirmation email sent successfully' });
        });

    } catch (error) {
        console.error("Error in sending email:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});




app.get('/bookedSeats', async (req, res) => {
    const { showtimeId, daytime } = req.query; // Use req.query for GET requests

    if (!showtimeId || !daytime) {
        return res.status(400).json({ error: "showtimeId and daytime are required" });
    }

    try {
        // Find all tickets that match the given showtimeId and daytime
        const bookedTickets = await Tickets.find({ showtimeId, daytime }, 'seatNumbers');

        // Extract and flatten the seat numbers into a single array
        const seatNumbers = bookedTickets.flatMap(ticket => ticket.seatNumbers);

        res.status(200).json({
            message: `Successfully retrieved booked seats for showtime ${showtimeId} on ${daytime}`,
            seats: seatNumbers
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve booked seats", details: error.message });
    }
});

// app.get('/myTickets', async (req, res) => {
//     const { token } = req.cookies;

//     if (!token) {
//         return res.status(401).json({ error: 'No token provided. Please log in first.' });
//     }

//     jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
//         if (error) {
//             return res.status(401).json({ error: 'Invalid token.' });
//         }

//         try {
//             // Fetch tickets for the authenticated user
//             const tickets = await Tickets.find({ userId: userData._id });
//             res.status(200).json(tickets);
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to get tickets for the user.', details: error.message });
//         }
//     });
// });
app.get('/myTickets/:id', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided. Please log in first.' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        try {
            // Fetch tickets for the authenticated user
            const { id } = req.params;
            const tickets = await Tickets.find({ userId: id });

            // Fetch showtimes and related movie and theatre details
            const ticketsWithDetails = await Promise.all(tickets.map(async (ticket) => {
                const showtime = await Showtime.findById(ticket.showtimeId)
                    .populate('movieid', 'photos title') // Populate movie details
                    .populate('theatreid', 'theatreName city'); // Populate theatre details

                return {
                    ...ticket.toObject(),
                    movieName: showtime.movieid.title,
                    moviePoster: showtime.movieid.photos[0], // Assuming the first photo is the poster
                    theatreName: showtime.theatreid.theatreName,
                    theatreCity: showtime.theatreid.city,
                    showdate: showtime.showdate,
                };
            }));

            res.status(200).json(ticketsWithDetails);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get tickets for the user.', details: error.message });
        }
    });
});




app.get('/movies/:movieId', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
        const {
            movieId
        } = req.params;
        try {
            const movie = await Movie.findById(movieId); // Await the result
            if (!movie) {
                return res.status(404).json({ error: "Movie not found" });
            }
            res.status(200).json(movie);
        } catch (error) {
            res.status(500).json({ error: "Failed to get the movie from its id", details: error.message });
        }
        
    });
}); 
app.get('/Showtimes/:showtimeId', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
        const {
            showtimeId
        } = req.params;
        try {
            const showtime = await Showtime.findById(showtimeId); // Await the result
            if (!showtime) {
                return res.status(404).json({ error: "Showtime not found" });
            }
            res.status(200).json(showtime);
        } catch (error) {
            res.status(500).json({ error: "Failed to get the showtime from its id", details: error.message });
        }
    });
});
app.get('/theatres/:theatreId', async (req, res) => {

    const {token} = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
        const {
            theatreId
        } = req.params;
        try {
            const theatre = await Theatre.findById(theatreId); // Await the result
            if (!theatre) {
                return res.status(404).json({ error: "Theatre not found" });
            }
            res.status(200).json(theatre);
        } catch (error) {
            res.status(500).json({ error: "Failed to get the theatre from its id", details: error.message });
        }
        
    });
});   

// Delete ticket by ID
app.delete('/tickets/:ticketId', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ error: 'Invalid token.' });
        }

        const { ticketId } = req.params;

        try {
            // Find the ticket by ID
            const ticket = await Tickets.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found.' });
            }

            // Delete the ticket
            await Tickets.findByIdAndDelete(ticketId);
   
              

            res.status(200).json({ ticket });
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            res.status(500).json({ error: 'Failed to delete the ticket.', details: error.message });
        }
    });
});

app.post('/sendCancellationEmail', async (req, res) => {
    const { userEmail, userName, movieTitle, theatreName, chooseTime, seatNumbers, booking_code } = req.body;

    // Default seatNumbers to an empty array if it's undefined
    const seatNumbersString = Array.isArray(seatNumbers) ? seatNumbers.join(', ') : 'No seats selected';

    try {
        // Set up the transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, // Replace with your email address
                pass: process.env.EMAIL_PASS   // Replace with your email password or an app-specific password
            }
        });

        // Prepare the email content
        const mailOptions = {
            from: process.env.EMAIL, // Sender address
            to: userEmail, // User's email address
            subject: `Booking Cancellation - ${movieTitle} at ${theatreName}`,
            html: `
                <h2>Dear ${userName},</h2>
                <p>We regret seeing you go! Here are your ticket details which is cancelled:</p>
                <p><strong>Movie:</strong> ${movieTitle}</p>
                <p><strong>Theatre:</strong> ${theatreName}</p>
                <p><strong>Showtime:</strong> ${chooseTime}</p>
                <p><strong>Seats:</strong> ${seatNumbersString}</p>
                <p><strong>Booking Code:</strong> ${booking_code}</p>
                <p>We hope you enjoy the show!</p>
                <p>Best regards,<br/>Your Movie Booking Team</p>
            `
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Failed to send email:", error);
                return res.status(500).json({ error: "Failed to send confirmation email", details: error.message });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Confirmation email sent successfully' });
        });

    } catch (error) {
        console.error("Error in sending email:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


app.listen(4000);
