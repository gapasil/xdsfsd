const rn = require('random-number');
const User = require("../model/User")


class State {
    async idDelete(name, id){
        const oldUser = await User.find({name:name})

        if(oldUser){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    idDelete: id
                }},
                {
                    new:true
                }
            )
            return oldUser
        } else {
            return false
        }
    }
    async fixState(name, state){
        const oldUser = await User.find({name:name})

        if(oldUser){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    state: state
                }},
                {
                    new:true
                }
            )
            return oldUser
        } else {
            return false
        }
    }
}

module.exports = new State();