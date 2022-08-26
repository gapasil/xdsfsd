const User = require("../model/User")

class Referal {

    async findRef(link){
        const oldUser = await User.find({ref:`https://t.me/Jack_Casino_bot?start=${link}`})

        console.log(oldUser);

        if(oldUser){
            const user = await User.findOneAndUpdate(
                {"ref":`https://t.me/Jack_Casino_bot?start=${link}`},
                {$set:{
                    useradd:oldUser[0].useradd+1
                }},
                {
                    new:true
                }
            )
            return user
        } else {
            return false
        }
    }
    async tradeRef(name){
        const oldUser = await User.find({name:name})
        const sum = oldUser.ref * 50
        console.log(sum);

        if(oldUser){
            const user = await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    ref:0,
                    pay:sum
                }},
                {
                    new:true
                }
            )
            return user
        } else {
            return false
        }
    }


}

module.exports = new Referal();