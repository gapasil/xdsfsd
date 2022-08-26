const {Schema, model} = require("mongoose")

const User = new Schema({
    name:String,
    pay:Number,
    ref:String,
    useradd:Number,
    state:String,
    timePay:Number,
    candidatePay:Number,
    bet:Number,
    idDelete:String,
    diceproc:Number
})

module.exports = model("User",User)