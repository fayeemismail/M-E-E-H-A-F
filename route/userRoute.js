//REQUIRING EXPRESS IN USER_ROUTE
const express = require('express');
const user_route = express();
const session = require('express-session')

user_route.use(session({
    secret: 'yourSecretKey', // Replace with your own secret
    resave: false,           // Forces the session to be saved back to the session store
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  }))



//SETTING VIEW ENGINE(EJS) IN USER_ROUTE
user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');



//SETTING BODYPARSER IN USER_ROUTE
const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));


//REQUIRING USER CONTROLLER
const userController = require('../controller/userController')
const otpController = require('../controller/otpController');
const productCantroller = require('../controller/productCantroller')

// REQUIRING AUTH MIDDELEWARE
const userAuth = require('../middlewares/userAuth');
const { productBlock } = require('../controller/productCantroller');

//ROUTE FOR HOME PAGE
user_route.get('/' , userController.home);
//ROUTE FOR LOGIN PAGE
user_route.get('/login', userAuth.is_logout ,userController.login)
//ROUTE FOT SHOP PAGE
user_route.get('/shop' , userController.shop);
//ROUTE FOR REGISTER PAGE
user_route.get('/register', userAuth.is_logout ,userController.register);
//ROUTE FOR ADD USER PAGE
user_route.post('/login_post', userAuth.is_logout ,userController.addUser);
//ROUTE FOR VERIFY OTP
user_route.post('/verifyOtp' , userAuth.is_logout ,userController.verifyOtp);

user_route.post('/authUser', userAuth.is_logout ,userController.authUser);

user_route.get('/resendOtp' ,otpController.resendOtp);


user_route.get('/logout', userAuth.is_login ,userController.logout);

user_route.get('/forgotPass', userController.forgotPass);

user_route.get('/singleProduct', userController.singleProduct)











module.exports = user_route;