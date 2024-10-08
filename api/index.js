const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 
const nodemailer = require('nodemailer');


require('dotenv').config()

const User = require('./models/user.js');
const Movie = require('./models/movie.js');
const Theatre = require('./models/theatre.js');
const Showtime = require('./models/showtime.js');
const AdminRequests = require('./models/adminRequest.js')
const Tickets = require('./models/tickets.js');

const app = express();

const bcryptSalt = bcrypt.genSaltSync(8);
const jsonwebtokenSecret = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));

app.use(cors({

    credentials: true,
    origin: process.env.FRONTEND_URL,

}));

app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT} PORT`));

mongoose.connect(process.env.MONGO_URL);

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASS, 
    }
});

app.get('/test', (req, res) =>{
    res.json('test ok');
});

app.get('/atharva', (req, res) =>{
    res.json('Hello There');
});

app.post('/register', async(req, res) => {

    const {name, email, password} = req.body;
    

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
             
            }, jsonwebtokenSecret, {}, (error, token)=>{

                if (error) {
                    res.status(500).json('Error signing token');
                } else {
                    
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
        
            const {name, email, _id, role} = await User.findById(userData.id);
            res.json( {name, email, _id, role});

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
       

    } = req.body;

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

        if(error) throw error;
    
        const movieDoc = await Movie.create({

            owner: userData.id,
            title, photos: addedPhotos,
            languages, length, genre, certificate, releaseDate, director, description,
          

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
//showtime

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

//Admin request
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






/** tickets */
app.post('/bookTicket', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided, please log in first' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) throw error;
        
        const {
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
                userId: userData._id,
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
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASS   
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
    const { showtimeId, daytime } = req.query;

    if (!showtimeId || !daytime) {
        return res.status(400).json({ error: "showtimeId and daytime are required" });
    }

    try {
        const bookedTickets = await Tickets.find({ showtimeId, daytime }, 'seatNumbers');
        const seatNumbers = bookedTickets.flatMap(ticket => ticket.seatNumbers);

        res.status(200).json({
            message: `Successfully retrieved booked seats for showtime ${showtimeId} on ${daytime}`,
            seats: seatNumbers
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve booked seats", details: error.message });
    }
});

app.get('/myTickets', async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided. Please log in first.' });
    }

    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        if (error) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        try {
            const tickets = await Tickets.find({ userId: userData._id });

            const ticketsWithDetails = await Promise.all(tickets.map(async (ticket) => {
                const showtime = await Showtime.findById(ticket.showtimeId)
                    .populate('movieid', 'photos title')
                    .populate('theatreid', 'theatreName city');

                return {
                    ...ticket.toObject(),
                    movieName: showtime.movieid.title,
                    moviePoster: showtime.movieid.photos[0],
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
    const { movieId } = req.params;
    try {
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ error: "Movie not found" });
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ error: "Failed to get the movie from its id", details: error.message });
    }
});

app.get('/Showtimes/:showtimeId', async (req, res) => {
    const { showtimeId } = req.params;
    try {
        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ error: "Showtime not found" });
        }
        res.status(200).json(showtime);
    } catch (error) {
        res.status(500).json({ error: "Failed to get the showtime from its id", details: error.message });
    }
});

app.get('/theatres/:theatreId', async (req, res) => {
    const { theatreId } = req.params;
    try {
        const theatre = await Theatre.findById(theatreId);
        if (!theatre) {
            return res.status(404).json({ error: "Theatre not found" });
        }
        res.status(200).json(theatre);
    } catch (error) {
        res.status(500).json({ error: "Failed to get the theatre from its id", details: error.message });
    }
});

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
            const ticket = await Tickets.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found.' });
            }

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
    const seatNumbersString = Array.isArray(seatNumbers) ? seatNumbers.join(', ') : 'No seats selected';

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
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

app.post("/send-email", (req, res) => {
    const { query, userEmail, userName } = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions = {
        from: userEmail,
        to: process.env.EMAIL,
        subject: "Support Query from " + userName,
        text: query,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Failed to send email.");
        } else {
            console.log("Email sent: " + info.response);
            res.status(200).send("Query sent successfully!");
        }
    });
});
