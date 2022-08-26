const rn = require('random-number');
const User = require("../model/User")

class Auth {

    async registration(nameUser){
        const candidateUser = {
            name:nameUser,
            pay:0,
            ref:`https://t.me/Jack_Casino_bot?start=${(""+rn()).replace(/[^\d]/g,"")}`,
            useradd:0,
            state:"",
            timePay:0,
            candidatePay:0,
            bet:0,
            idDelete:"",
            diceproc:0
        }
        const user = new User(candidateUser)
        await user.save()
        return user
    }

    async login(nameUser){

        const user = await User.find({name: nameUser})

        if(user.length > 0){
            return await new Promise((resolve, reject)=>{
                resolve(user[0])
            })
        } else {
            return await new Promise((resolve, reject)=>{
                resolve(false)
            })
        }

    }
}

module.exports = new Auth();