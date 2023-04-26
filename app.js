const express = require("express");
const app = express();
const {port, databaseURL, sessionSecret} = require('./config.js');
require('./utils/database_connect');
const logins = require('./models/login');
const session = require('express-session');
const sessionStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const {addRoleID} = require("./middlewares/common");

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slick-peas-relax-223-233-65-180.loca.lt"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/* SERVER CONFIGURATIONS */
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));


/* SESSION STORE */
const store = new sessionStore({
    uri: databaseURL,
    collection: 'sessionStore'
});


/* SESSION & COOKIE SETUP */
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week,
        secure: false
    },
    Store: store
}));


/* PASSPORT SETUP */
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use('passport-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass'
}, logins.authenticate()));
app.use(passport.initialize({}));
app.use(passport.session({}));
passport.serializeUser(logins.serializeUser());
passport.deserializeUser(logins.deserializeUser());


/* MIDDLEWARES */
app.use(addRoleID);
app.use((req, res, next) => {
    res.locals.userRoleID = req.session.userRoleID || null;
    next();
});


/* HOME ROUTE */
app.get('/', (req, res) => {
    res.send({
        message: "Jai shree ram!",
        user: req.user || null,
        userRoleID: req.session.userRoleID || null
    });
});

const {stateUTList, cityMap} = require('./utils/state_city_provider');
app.get('/state-list', (req, res) => {
    res.send(stateUTList);
});

app.get('/city/:state', (req, res) => {
    const {state} = req.params;
    res.send(cityMap[state]);
});


/* ROUTER CONFIGURATION */
const authRouter = require('./routes/auth');
const riderRouter = require('./routes/rider');
const providerRouter = require('./routes/provider');
const propertyRouter = require('./routes/property');
const bookingRouter = require('./routes/booking');
const reviewRouter = require('./routes/review');

app.use('/auth', authRouter);
app.use('/rider', riderRouter);
app.use('/provider', providerRouter);
app.use('/property', propertyRouter);
app.use('/booking', bookingRouter);
app.use('/review', reviewRouter);


/* LISTENING TO PORT */
app.listen (port, () => {
    console.log("Listening to port : " + port);
});
