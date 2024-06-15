const user = require('../models/userModel');
const sendOtp = require('../controller/otpController');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const products = require('../models/productModel');
const category = require('../models/categoryModel')



const home = async (req, res) => {
    try {
        const userData = req.session;
        const allProduct = await products.find();

        const falseCategories = await category.find({status:false});

        const falseCategoryName = falseCategories.map(category => category.name);

        const productsInFalseCategory = allProduct.filter(product => !falseCategoryName.includes(product.category))

        res.render('home', {Products:productsInFalseCategory, User:userData});
    } catch (error) {
        console.log(error);
    }
};







const shop = async (req, res) => {
    try {
        const allProduct = await products.find();

        const falseCategories = await category.find({status:false});

        const falseCategoryName = falseCategories.map(category => category.name);

        const productsInFalseCategory = allProduct.filter(product => !falseCategoryName.includes(product.category))

        res.render('shop', {Products:productsInFalseCategory});
      
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
        const {email} = req.body;
        req.session.email = email
        const userData = await user.findOne({email:email});
        if(userData){
            const otp = sendOtp.sendOtp(email);
            const Data = new OTP({
                email:email,
                otp:otp
            });

            await Data.save()
            res.render('fpOTP')
        };
        
       
    } catch (error) {
        console.log(error)
    }

}

const fpverify = async (req,res) => {

    try {
        const {otp} = req.body;
        const email = req.session.email;
        const OTPData = await OTP.findOne({email:email});
        console.log(OTPData)
        if(OTPData && OTPData.otp == parseInt(otp)){
            console.log('USER REGISTERED SUCCESSFULLY');
            res.render('changePassword')
        }else{
            console.log('USER VERIFICATION FAILED')
        }
    } catch (error) {
        console.log(error)
    }
}



const newPassword = async (req,res) => {

    try {
        const { Password, confirmPassword } = req.body
        const email = req.session.email
        const userData = await user.findOne({email:email});
        const hashedPassword = await bcrypt.hash(Password, 10)
        if(userData){

            userData.password = hashedPassword

            await userData.save();
            res.render('login')
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

const userProfile = async (req,res) => {
      
    try {
        const userId = req.session.user_id;
        const userData = await user.findOne({_id:userId});
        res.render('userProfile', {userData:userData})
    } catch (error) {
        console.log(error)
    }

}

const detailsChange = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { name, mobile, curPassword, newPassword } = req.body;
        const userData = await user.findOne({ _id: userId });

        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        const checkPass = await bcrypt.compare(curPassword, userData.password);
        if (!checkPass) {
            return res.json({ success: false, message: 'The Current Password is not matching. Try again' });
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            userData.password = hashedPassword;
        }

        userData.name = name;
        userData.mobile = mobile;
        
        await userData.save();
        console.log('The user details changed and saved to database successfully');
        return res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: 'An error occurred. Please try again.' });
    }
};






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
    singleProduct,
    userProfile,
    fpverify,
    newPassword,
    detailsChange,

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






