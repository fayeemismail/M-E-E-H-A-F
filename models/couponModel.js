const { default: mongoose } = require('mongoose');
const mogoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    amount:{
        type: Number,
        required: true
    },
    couponCode:{
        type: String,
        required: true
    },
    minimumAmount:{
        type: Number,
        required: true
    },
    exipires:{
        type:Date,
        required: true
    },
    userList:[{
        userId:{
            type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
        },
        couponUsed:{
            type:Boolean,
            default:false
        }
    }]
},{
    timestamps:true
});



module.exports = mongoose.model('coupon', couponSchema)