const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const url = `mongodb://127.0.0.1:27017/secretsDB`;
const port = process.env.PORT ? process.env.PORT : 4000;
require('dotenv').config();

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');



app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req, res) => {
    if(req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
    
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.post('/login',  (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        }
    })
});



app.listen(port, () => {
    console.log(`app is listening on ${port}`);
});