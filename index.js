const TelegramApi = require("node-telegram-bot-api");
const mongoose = require('mongoose')
const Game = require("./game/game");
const Auth = require("./auth/createUser");
const Referal = require("./referal/referal");
const Pay = require("./user/Pay");
const State = require("./user/state");
const fs = require('fs');

const token = "5402538794:AAE4FmPjOzawQyyuBVVgtCGMN91kEeoXiEM";

const bot = new TelegramApi(token, { polling : true });

const flipCoin = async (user,coin,chatId) =>{
  const results = await Game.coin(user.name,coin)
  if(!results){
    await bot.sendMessage(chatId,`🪙coinFlip🪙
❌ Недостаточно средств для ставки! ❌
    `)
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
  } else {
    if(results.win){
      await bot.sendMessage(chatId,`🪙coinFlip🪙
🎉 Вы победили! ${results.bet} : ваш баланс 🎉
      `)
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
    } else {
      await bot.sendMessage(chatId,`🪙coinFlip🪙
Вы проиграли ${results.bet} : ваш баланс 
      `)
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
  }
}

const start = async () =>{
    try{

        await mongoose.connect(
            `mongodb+srv://gagarinvili:gagarinvili@cluster0.dcbvnrz.mongodb.net/?retryWrites=true&w=majority`
        )

    } catch (e) {

        console.log(e);

    }
    let ifMessage 

    bot.setMyCommands([
        {command: "/start",description: "Запустить бота"},
        {command: "/game",description: "Выбрать режим игры"},
        {command: "/pay",description: "Пополнить/вывести"}
    ])
    
    bot.on("message", async msg => {
        const text   = msg.text;
        const chatId = msg.chat.id;

        if(msg.message_id == ifMessage){
            ifMessage = msg.message_id
            return false
        }

        ifMessage = msg.message_id

        let user = await Auth.login(msg.chat.username)

        if(!user){
            user = await Auth.registration(msg.chat.username)
            let ref = []

            for(let i = 0; i <= msg.text.length - 1; i++){
                if(i>6){
                    ref.push(msg.text[i])
                }
            }
            const referal = ref.join("")
            Referal.findRef(referal)
        }
        if(text == "/start"){
          State.fixState(user.name,"")
          bot.sendMessage(chatId, "Выберите действие:", {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                      text: "🔄 Обновить баланс 🔄",
                      callback_data: "retry",
                    },
                  ],
                  ],                 
              },            
          });
          return bot.sendPhoto(chatId,"https://t.me/acescasino/15",{
              caption:`
              💼 Личный кабинет
➖➖➖➖➖➖➖➖
💰 Баланс: ${user.pay}₽
                  
👤 Приглашено: ${user.useradd}
                  
🔗 Пригласительная ссылка:
${user.ref}
➖➖➖➖➖➖➖➖
🟢 Игроков в сети: ${500}`
          })
      }

      if(text == "/game"){
          State.fixState(user.name,"")
          return bot.sendMessage(chatId, "Режимы игры:", {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                      text: "Монетка 🪙",
                      callback_data: "coin",
                    },
                  ],
                  [
                    {
                      text: "Dice 🎲",
                      callback_data: "dice",
                    },
                  ]
                  ],                 
              },            
          });         
      }
      if(text == "/pay"){
          State.fixState(user.name,"")
          return bot.sendMessage(chatId, "Выберите действие:", {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                      text: "Пополнить 🪙",
                      callback_data: "add",
                    },
                  ],
                  [
                    {
                      text: "Вывести 🎲",
                      callback_data: "diminish",
                    },
                  ],
                  [
                    {
                      text: "Обменять рефералы 🔗",
                      callback_data: "ref",
                    },
                  ]
                  ],                 
              },            
          });         
      }

        if(user.state == "addPay"){
            if (!isNaN(parseFloat(text)) && isFinite(text)){
                Pay.addPay(user.name,text)
                return bot.sendMessage(chatId,"💸Зачисление по qiwi приходит в течений 5 минут после оплаты💸")
            } else {
                State.fixState(user.name,"")
                bot.sendMessage(chatId,"❌Сумма должна быть числом!")
            }
        }
        if(user.state == "Орел"){
          if (!isNaN(parseFloat(text)) && isFinite(text)){
              State.fixState(user.name,"")
              await Game.addBet(user.name, text)
              return bot.sendMessage(chatId, "Выберите действие:", {
                "reply_markup": {
                  "inline_keyboard": [
                    [
                      {
                        text: `💸Сумма ставки ${text}, на орел если готовы бросить монету нажмите на меня!💸`,
                        callback_data: "ОрелFlip",
                      },
                    ],
                  ],                 
                },            
            });
          } else {
              State.fixState(user.name,"")
              return bot.sendMessage(chatId,"❌Сумма должна быть числом!")
          }
        }
        if(user.state == "Решка"){
          if (!isNaN(parseFloat(text)) && isFinite(text)){
              State.fixState(user.name,"")
              await Game.addBet(user.name, text)
              return bot.sendMessage(chatId, "Выберите действие:", {
                "reply_markup": {
                  "inline_keyboard": [
                    [
                      {
                        text: `💸Сумма ставки ${text}, на решка нажмите на меня чтобы бросить монету!💸`,
                        callback_data: "РешкаFlip",
                      },
                    ],
                  ],                 
                },            
              });
          } else {
              State.fixState(user.name,"")
              return bot.sendMessage(chatId,"❌Сумма должна быть числом!")
          }
        }
        if(user.state == 'dice'){
          if (!isNaN(parseFloat(text)) && isFinite(text) && text > 1 && text < 99){
            State.fixState(user.name,"sumDice")
            await Game.diceAddProc(user.name, text)
            return bot.sendMessage(chatId, `🎲Dice🎲
        Процент ставки ${text}%, введите сумму ставки!💸`);
        } else {
            State.fixState(user.name,"")
            bot.sendMessage(chatId,"❌Процент должен быть числом от 1 до 99!")
            State.fixState(user.name,"dice")
            return Game.diceFlip(bot,chatId,user.name)
        }
        }
        if(user.state == "sumDice"){
          if (!isNaN(parseFloat(text)) && isFinite(text)){
            State.fixState(user.name,"")
            await Game.addBet(user.name, text)
            const candidatePrise = Math.floor(100/user.diceproc)*text
            bot.sendMessage(chatId, `🎲Dice🎲
        💸Сумма ставки ${text}, на ${user.diceproc}% возможный выйгрыш ${candidatePrise}!💸`)
            return bot.sendMessage(chatId, "Выберите действие:", {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                      text: `⬆️Больше⬆️`,
                      callback_data: "diceFlip",
                    },
                    {
                      text: `⬇️Меньше⬇️`,
                      callback_data: "diceFlip",
                    }
                  ],
                ],                 
              },              
            });
          } else {
            State.fixState(user.name,"")
            return bot.sendMessage(chatId,"❌Сумма должна быть числом!")
          }
        }
    }
    )
    bot.on("callback_query", async msg => {
        console.log(msg.data);
        const text   = msg.text;
        const chatId = msg.message.chat.id;

        let user = await Auth.login(msg.message.chat.username)

        if(!user){
            return bot.sendMessage(chatId,"Сначала зарегайся") 
        }

        if(msg.data == "retry"){
            let candidateUser = Pay.payNow(user.name)

            candidateUser.then((e)=>{
                if(e){
                    user = candidateUser
                }
            })

            bot.sendMessage(chatId, "Выберите действие:", {
                "reply_markup": {
                  "inline_keyboard": [
                    [
                      {
                        text: "🔄 Обновить баланс 🔄",
                        callback_data: "retry",
                      },
                    ],
                    ],                 
                },            
            });
            return bot.sendPhoto(chatId,"https://t.me/acescasino/15",{
                caption:`
                💼 Личный кабинет
➖➖➖➖➖➖➖➖
💰 Баланс: ${user.pay}₽
                    
👤 Приглашено: ${user.useradd}
                    
🔗 Пригласительная ссылка:
${user.ref}
➖➖➖➖➖➖➖➖
🟢 Игроков в сети: ${500}`
            })
        }
      
        if(msg.data == "add"){
            State.fixState(user.name,"addPay")
            return bot.sendMessage(chatId,"Введите сумму для пополнения")
        }

        if(msg.data == "diminish"){
            return Pay.addPay()
        }

        if(msg.data == "ref"){
            if(user.pay < 200){
                return bot.sendMessage(chatId,"❌ Для перевода рефералов в баланс требуется минимальный баланс! ❌")
            }
            return Referal.tradeRef(user.name)
        }

        if(msg.data == "ОрелFlip"){
          flipCoin(user,"rel",chatId)
        }
        if(msg.data == "РешкаFlip"){
          flipCoin(user,"res",chatId)
        }

        if(msg.data == "Орел"){
          State.fixState(user.name,"Орел")
                     return bot.sendMessage(chatId,`🪙coinFlip🪙
      Орел
Введите сумму ставки:
`)
        }

        if(msg.data == "Решка"){
          State.fixState(user.name,"Решка")
                     return bot.sendMessage(chatId,`🪙coinFlip🪙
      Решка
Введите сумму ставки:
`)
        }

        if(msg.data == "coin"){
          return Game.coinFlip(bot,chatId)
        }

        if(msg.data == "dice"){
          return Game.diceFlip(bot,chatId,user.name)
        }

        if(msg.data == "diceFlip"){
          return Game.dice(bot,chatId,user.name)
        }
    })
}


start()
