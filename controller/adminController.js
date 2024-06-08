const user = require('../models/userModel');
const category = require('../models/categoryModel');
const products = require('../models/productModel')
require('dotenv').config();


const home = async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error)
    }
}


const login = async (req, res) => {
    try {
        res.render('login');

    } catch (error) {
        console.log(error);
    }
}


const product = async (req, res) => {
    try {
        const item = await products.find()
        res.render('product', {item});

    } catch (error) {
        console.log(error)
    }
}






const adminVeify = async (req, res) => {
    try {

        const { userEmail, userPassword } = req.body

        console.log(userEmail, userPassword)
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        console.log(adminEmail, adminPassword)

        if (userEmail !== adminEmail) {
            res.render('login', { message: 'email not match' })
        }

        if (userPassword !== adminPassword) {
            res.render('login', { message1: 'password not match' })
        }
        res.render('home')
    } catch (error) {
        console.log(error)
    }
}

const usersList = async (req, res) => {
    try {

        const data = await user.find({})

        res.render('usersList', { data })

    } catch (error) {
        console.log(error)
    }
}

const userBlock = async (req, res) => {
    try {


        const userId = req.query.id
        const userData = await user.findOne({ _id: userId });
        userData.is_blocked = !userData.is_blocked
        const saving = await userData.save();

        

        if (saving) {
            res.send({ success: 1 })
            console.log(userId + ' blocking or unblocking user')
        }

    } catch (error) {
        console.log(error)
    }
}












module.exports = {
    home,
    login,
    product,
    usersList,
    adminVeify,
    userBlock,


}