const express = require('express');
const bodyParser = require('body-parser');

const { model } = require('mongoose');
const admin_route = express()


//SETTING VIEW ENGINE IN ADMIN ROUTE
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

//SETTING BODYPARSER IN ADMIN_ROUTE
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

//REQUIRING ADMIN CONTROLLER IN ADMIN ROUTE 
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productCantroller');
const usercontroller = require('../controller/userController');
const upload = require('../middlewares/multer');

//ROUTE FOR ADMIN PAGES
admin_route.get('/', adminController.home);
admin_route.get('/login', adminController.login);
admin_route.get('/product', adminController.product);
admin_route.get('/categories', categoryController.categories);
admin_route.get('/usersList', adminController.usersList);
admin_route.post('/categories', categoryController.addCategory);
admin_route.get('/order', adminController.order);
admin_route.get('/coupon', adminController.coupon)





//ROUTE FOR VERIFYING THE ADMIN 
admin_route.post('/', adminController.adminVeify)
// ROUTE FOR BLOCKING THE USER
admin_route.post('/userBlock', adminController.userBlock);
//ROUTE FOR CATEGORY PAGE TO ADD CATEGORY

//ROUTE FOR EDITCATEGORY PAGE
admin_route.get('/editCategory', categoryController.editCategory);

admin_route.post('/updateCategory', categoryController.updateCategory)

admin_route.post('/categoryBlock', categoryController.categoryBlock);

admin_route.get('/newProducts', productController.newProducts);

admin_route.post('/addProducts', upload.any(), productController.addProducts);

admin_route.get('/editProducts', productController.editProducts);

admin_route.post('/editProducts',upload.any(), productController.updateProducts);

admin_route.get('/product', productController.addProducts);

admin_route.post('/productBlock', productController.productBlock);

admin_route.get('/orderDetails', adminController.orderDetails);






admin_route.post('/cancelOrder', adminController.cancelOrder);

admin_route.post('/statusCange', adminController.statusCange)



module.exports = admin_route;