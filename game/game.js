const User  = require("../model/User")
const State = require("../user/state")

class Game {
    async addBet(name,sum){
        const oldUser = await User.find({name:name})

        if(oldUser){
            const user = await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    bet:sum
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

    async coin(name, typeBet){
        let user = await User.find({name: name})
        user = user[0]
        const rand = 1 + Math.random() * (2 - 1);

        if(user.bet > user.pay){
            return false
        }

        if(typeBet == "rel"&&Math.round(rand) == 1){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    bet:0,
                    pay:(user.pay - user.bet) + user.bet * 2
                }},
                {
                    new:true
                }
            )
            const obj = {
                win:true,
                bet:(user.pay - user.bet) + user.bet * 2
            }
            return obj
        }
        if(typeBet == "res"&&Math.round(rand) == 2){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    bet:0,
                    pay:(user.pay - user.bet) + user.bet * 2
                }},
                {
                    new:true
                }
            )
            const obj = {
                win:true,
                bet:(user.pay - user.bet) + user.bet * 2
            }
            return obj
        }

        await User.findOneAndUpdate(
            {"name":name},
            {$set:{
                bet:0,
                pay:user.pay - user.bet
            }},
            {
                new:true
            }
        )
        const obj = {
            win:false,
            bet:user.pay - user.bet
        }
        return obj
    }

    async coinFlip(bot,chatId){
        await bot.sendAnimation(chatId,'coin.gif')
        return bot.sendMessage(chatId, "Сделайте ставку:", {
          "reply_markup": {
            "inline_keyboard": [
              [
                {
                  text: "Орел",
                  callback_data: "Орел",
                },
              ],
              [
                {
                  text: "Решка",
                  callback_data: "Решка",
                },
              ],
              ],                 
          },            
      });
    }
    async diceAddProc(name,sum){
        const oldUser = await User.find({name:name})

        if(oldUser){
            const user = await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    diceproc:sum
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
    async diceFlip(bot,chatId,name){
        State.fixState(name,"dice")
        await bot.sendAnimation(chatId,'2INg.gif')
        return bot.sendMessage(chatId, `🎲Dice🎲
Введите процент:`)           
    }

    async dice(bot,chatId,name){
        let user = await User.find({name: name})
        user = user[0]
        const rand = Math.floor(1 + Math.random() * (100 - 1))

        if(user.bet > user.pay){
            await bot.sendMessage(chatId,`🎲Dice🎲
            ❌ Недостаточно средств для ставки! ❌
                `)
            return this.diceFlip(bot,chatId,name)
        }

        if(user.diceproc >= rand){
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    bet:0,
                    pay:(user.pay - user.bet) + Math.floor(100/user.diceproc)*user.bet
                }},
                {
                    new:true
                }
            )
            await bot.sendMessage(chatId,`🎉 Вы победили! ${(user.pay - user.bet) + Math.floor(100/user.diceproc)*user.bet} : ваш баланс 🎉`)
            return this.diceFlip(bot,chatId,name)
        } else {
            await User.findOneAndUpdate(
                {"name":name},
                {$set:{
                    bet:0,
                    pay: user.pay - user.bet
                }},
                {
                    new:true
                }
            )
            await bot.sendMessage(chatId,`Вы проиграли ${user.pay - user.bet} : ваш баланс `)
            return this.diceFlip(bot,chatId,name)
        }
    }
}

module.exports = new Game();