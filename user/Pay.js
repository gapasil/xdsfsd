const rn = require('random-number');
const User = require("../model/User")


class Pay {

    async addPay(name, sum){
        const oldUser = await User.find({name:name})

        if(oldUser){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    state: "",
                    timePay:Date.now(),
                    candidatePay:sum
                }},
                {
                    new:true
                }
            )
        }
    }
    async payNow(name){
        const user = await User.find({name:name})

        if(user[0].timePay + 1000 < Date.now()){
            const newUser = await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    state: "",
                    timePay:0,
                    candidatePay:0,
                    pay:user[0].pay + user[0].candidatePay
                }},
                {
                    new:true
                }
            )
            return newUser
        }

        return false
    }
}

module.exports = new Pay();