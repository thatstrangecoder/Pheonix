require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session');
const passport = require('passport');
const cart = require('./routes/cart')
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)
// Require
require('./config/passport')(passport)

// DB Config
const db = require('./config/keys').MongoURI
const exprsecret = require('./config/no').Secret

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected'))
    .catch(err => console.log(err))

// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

// body-parser
app.use(express.urlencoded({ extended: true }))

// Express Session
app.use(session({
    secret: exprsecret,
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Connect Sockets to Routes.
app.set('socketio', io);
app.locals.io = io

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error_msg = req.flash('error')
    next();
})

// Allow partials to be accessed in EJS.
app.use('/views', express.static(__dirname + '/views/partials/'))


// Routes
app.use('/', require('./routes/index'))
app.use('/enroll', require('./routes/users'))
app.use('/cart', require('./routes/cart'))
const PORT = process.env.PORT || 5000

http.listen(PORT, console.log(`Server started on port ${PORT}`))
