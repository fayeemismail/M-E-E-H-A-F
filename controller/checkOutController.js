const cartSchema = require('../models/cartModel');
const addressSchema = require('../models/addressModel');
const UserSchema = require('../models/userModel');
const orderSchema = require('../models/orderModel')

const checkOut = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const userData = await UserSchema.findOne({_id:userId});
        const userAddress = await addressSchema.findOne({ user_id: userId});

        const addresses = userAddress && userAddress.address ? userAddress.address : [];

        const cartData = await cartSchema.findOne({user:userId}).populate('Products.Product');

        res.render('checkOut', { userData: userData, addresses: addresses, cartData: cartData.Products })
    } catch (error) {
        console.log(error)
    }
}


const placeOrder = async (req,res) => {
    try {
        const {checkAddress} = req.body;
        const userId = req.session.user_id;
        const userData = await UserSchema.findOne({_id: userId});

        const addressData = await addressSchema.findOne({user_id:userId});
        const correctAddress = addressData.address.find(value => value.id == checkAddress ? value : '' );
        
        const findCart = await cartSchema.findOne({user:userId}).populate('Products.Product');

        const productDetails = findCart.Products.map(val => ({
            Product: val.Product.id,
            name: val.Product.name,
            quantity: val.quantity,
            price: val.Product.price
        }))

        console.log(productDetails,'details of product')
       const totalAmount = productDetails.reduce((accu, val)=> {
            return accu + val.quantity * val.price
       },0);
       

       const newOrder = new orderSchema({
        user: userId,
        Products: productDetails,
        billingAddress:{
            userName: userData.name,
            email: userData.email,
            address: correctAddress.id,
            city:correctAddress.city,
            state:correctAddress.state,
            pincode: correctAddress.pincode,
            mobile: correctAddress.mobile
        },
        paymenMethod:'COD',
        totalAmount: totalAmount,
        orderStatus: 'Pending'
       })

       const saving = await newOrder.save();

       if(saving){
        console.log('order saved');
        
        res.send({success:1});
        
       }
        


    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    checkOut,
    placeOrder,

    
}