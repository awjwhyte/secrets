const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const url = `mongodb://127.0.0.1:27017/secretsDB`;
const port = process.env.PORT ? process.env.PORT : 3000;
require('dotenv').config();

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs');

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if(!err) {
            res.render('secrets');
        } else {
            console.log(err);
        }
    });
});

app.post('/login',  (req, res) => {
    User.findOne({email:req.body.username}, (err, foundItem) => {
        if(err) {
            console.log(err);
        } else {
            if(foundItem) {
                if(foundItem.password === req.body.password) {
                    res.render('secrets');
                }
            }
        }
    })
})



app.listen(port, () => {
    console.log(`app is listening on ${port}`);
});