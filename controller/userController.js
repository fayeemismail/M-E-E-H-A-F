const user = require('../models/userModel');
const sendOtp = require('../controller/otpController');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const products = require('../models/productModel')

const home = async (req, res) => {
    try {
        const allProduct = await products.find()

        res.render('home', {Products:allProduct});
    } catch (error) {
        console.log(error);
    }
};



//     try {
//         const userEmail = req.session.email; // Assuming the user ID is stored in the session
//         const userData = await user.findOne({userEmail:userEmail});

//         if (!userData) {
//             return res.redirect('/login'); // Redirect to login if the user is not found
//         }

//         if (userData.is_blocked==true) {
//             return res.render('login', { message: 'You are blocked' });
//         }

//         res.render('home');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Internal Server Error');
//     }
// };



const shop = async (req, res) => {
    try {
        const allProduct = await products.find()

        res.render('shop', {Products:allProduct});
      
    } catch (error) {
        console.log(error);
    }
};

const login = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
};

const register = async (req, res) => {
    try {
        res.render('register');
        
    } catch (error) {
        console.log(error);
    }
};



const addUser = async (req, res) => {
    try {
        const { name, email, mobile, password, cPassword } = req.body;
        const checkName = await user.findOne({name:name});
        if(!name || name.trim() == '' || name.length <= 3 ){
            res.render('register',{message:'Invalid Name'});
        }

        const checkEmail = await user.findOne({email:email});
        if(checkEmail){
            res.render('register' , { message1: 'email already taken' });
        }

        console.log(password, cPassword);
        if(password !== cPassword){
            res.render('register' , { message2: `password dosen't match` });
        }

        if (email) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = {
                name: name,
                email: email,
                mobile: mobile,
                password: hashedPassword
            };
            req.session.email = email;

            req.session.userData = userData;
            
            
            const otp = sendOtp.sendOtp(email);

            const data = new OTP({
                email: email,
                otp: otp,
            });

            await data.save();
            

            res.render('otp');
        }
    } catch (error) {
        console.log(error);
    }
};



const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const otpp = parseInt(otp.join(""));
        const email = req.session.email;
        const userData = req.session.userData;
        const OTPData = await OTP.findOne({ email: email });

        if (OTPData &&  OTPData.otp === otpp) {
            const newUser = new user(userData);
            await newUser.save();
            console.log('User registered successfully');
            res.render('login');
        } else {
            console.log('OTP verification failed');
            res.render('otp', { message: 'Invalid OTP, please try again' });
        }
    } catch (error) {
        console.log(error);
    }
};


const authUser = async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;
        

        // Find user by email
        const userData = await user.findOne({ email: userEmail });
        

        // Check if userData exists
        if (!userData) {
            console.log('login failed - user not found');
            return res.render('login', { message: 'Create an account' });
        }

        // Check if the user is blocked
        if (userData.is_blocked == true) {
            return res.render('login', { message: 'User is Blocked' });
        }

        // Verify the password
        const checkPass = await bcrypt.compare(userPassword, userData.password);
        if (!checkPass) {
            return res.render('login', { message: 'Password is incorrect' });
        }

        // Successful login
        req.session.user_id = userData._id;
        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};



const logout = async (req,res) => {

    try {
       let destroy =  req.session.destroy();
       if(destroy){
        console.log('destroyed session')
       }

        res.redirect('/login')


    } catch (error) {
        console.log(error)
    }

}


const forgotPass = async (req,res) => {
    
    try {
    
        res.render('forgotPass')

    } catch (error) {
        console.log(error)
    }

}


// THIS IS FOR FORGOT PASSWORD LINK SHARE
const fpLink = async (req,res) => {

    try {
        if(!req.session || !req.session.email) {
            res.render('forgotPass', { message:'Unauthorized: No session found' })
        }
        const email = req.body.email;
        console.log(email,'this is emailllllllllllllllllllllllll')
        // CHECKING IF THE OTP EXISTS IN THE DATABASE
        const existingOtp = await otp.findOne({ email: email });

        // IF IT EXISTS, DELETE THE DOCUMENT
        if (existingOtp) {
          await otp.deleteOne({ email: email });
        }


        const newOtp = Math.floor(1000 + Math.random() * 9000).toString(); 

        const otpDocument = new otp({
            email: email,
            otp: newOtp,
            createdAt: new Date()
        });

        const saving = await otpDocument.save();
        if(saving){
            console.log('otpDocument saved in the database at in fpLink');


            setTimeout(async () => {
                await otp.deleteOne({ email:email });
                console.log('the otp will delete at 120 sec fpLink');
            },120000)

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user: 'fayeemwayne@gmail.com',
                    pass: 'ccyttfulxvmzxstl'
                }
            });

            const mailOptions = {
                from: 'fayeemwayne@gmail.com',
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP code is ${newOtp}. It is valid for 2 minutes.`
              };
        
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  return res.status(500).render('otp', { message: "Error sending OTP" });
                } else {
                  console.log('Email sent: ' + info.response);
                  res.render('otp', { message: "OTP resent successfully" });
                }
              });
        } else {
            res.status(500).render('otp', { message: "Error saving OTP" });
          }

    } catch (error) {
        console.log(error)
    }

}


const singleProduct = async (req,res) => {

    try {
        const productData = req.query.id

        const findItem = await products.findById({_id:productData});
        const cateItem = await products.find({category:findItem.category});
        
        
        

        res.render('singleProduct', {Product:findItem, Related:cateItem})
    } catch (error) {
        console.log(error)
    }

}




module.exports = {
    home,
    shop,
    login,
    register,
    addUser,
    verifyOtp,
    authUser,
    logout,
    forgotPass,
    fpLink,
    singleProduct

    
};








// const authUser = async (req,res) => {
//     try {
//         const {userEmail, userPassword } = req.body
//         console.log( userEmail , userPassword );

//         const userData = await user.findOne({email: userEmail});
//         console.log('userdata-------------'+ userData)

//         if(userData.is_blocked == true){
//             res.render('login' , { message: 'User is Blocked' });
//         }

//         if(!userData){
//             console.log('login failed');
//             res.render('login' , { message: 'Create a account'});
//         }else{
//             const checkPass = await bcrypt.compare(userPassword ,userData.password );
//             if(!checkPass){
//                 res.render('login', { message: 'password not match'});
//             }else{
                
//                 res.redirect('/');

//             }
//         }
        
//     } catch (error) {
//         console.log(error)
//     }
// }






