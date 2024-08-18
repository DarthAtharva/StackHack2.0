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
// const movieModel = require('./models/movie.js');
require('dotenv').config()


const User = require('./models/user.js');
const Movie = require('./models/movie.js');
const Theatre = require('./models/theatre.js');
const Showtime = require('./models/showtime.js');

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
        title, addedPhotos
        // ,languages, length, genre, certificate, releaseDate, director, description, cast, crew

    } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const movieDoc = await Movie.findById(id);
    
        if(userData.id === movieDoc.owner.toString()){

            movieDoc.set({

                title, photos: addedPhotos,
                // ,languages, length, genre, certificate, releaseDate, director, description, cast, crew

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
        movieid,movieName,theatreid,theatreName,showdate,daytime,city
        } = req.body;



        jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {

            if(error) throw error;
        
            const showtimeDocument = await Showtime.create({
                owner: userData.id,
                movieid,
                movieName,
                theatreid,
                theatreName,
                showdate,
                daytime,
                city
            });

            res.status(200).json({
                message:"success",
                showtimeDocument:showtimeDocument});
                
    
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



    const {id,movieid,movieName,theatreid,theatreName,showdate,daytime,city
        } = req.body;
    
    jsonwebtoken.verify(token, jsonwebtokenSecret, {}, async (error, userData) => {
        
        if(error) throw error;

        const showtimeDoc = await Showtime.findById(id);
    
        if(userData.id === showtimeDoc.owner.toString()){

            showtimeDoc.set({
                movieid,movieName,theatreid,theatreName,showdate,daytime,city
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

app.listen(4000);
