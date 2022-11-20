const request = require('request');
const axios = require('axios');
const fs = require('fs');
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = '5402284319:AAHInmcapWgfKmcdyb5D9nbBDSEozVFVJHk';
const bot = new TelegramBot(TOKEN, {polling: true});
const key = '62c1b562edb67b5e72415c6e4d367803';
let defaultDay = Math.floor( +new Date().setHours(18, 0, 0) / 1000);


const pic = fs.readFileSync('./1.jpg');
let awaitCity = false;
const getWeatherArr = async (city) => {
    const curArr = [];
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`)
    // console.log(res.data.)
    curArr.push(res.data.list[0]);
    res.data.list.forEach(el => {
        if (el.dt === defaultDay + 86400) {
            defaultDay = defaultDay + 86400;
            curArr.push(el);
        }
    })
    return curArr;
}
const keyboard = [
    [
        {
            text: 'Тула',
            callback_data: 'Tula',
        }
    ],
    [
        {
            text: 'Москва',
            callback_data: 'Moscow',
        }
    ],
    [
        {
            text: 'Казань',
            callback_data: 'Kazan',
        }
    ],
    [
        {
            text: 'Свой вариант...',
            callback_data: 'my',
        }
    ]
];

bot.on('message', (query) => {
    const chatId = query.chat.id;
    if (query.text === 'нет' || query.text === 'Нет') {
        bot.sendMessage(chatId, 'Токсика ответ :D');
    }
    if (!awaitCity) {
        bot.sendMessage(chatId, 'Привет! Я могу подсказать погоду! Давай для начала выберем для какого города', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
    if (awaitCity) {
        getWeatherArr(query.text).then(d => {
            bot.sendMessage(chatId, d.length);
        }).catch(e => {
            if (e.response.data.cod === '404') bot.sendMessage(chatId, ' Ты точно не тестировщик? Введёного тобой города не существует :с');
            else bot.sendMessage(chatId, 'Похоже, произошли технические шоколадки. Давай попробуем ещё раз?');
        }).finally(() => {
            awaitCity = false;
        })
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    let weather = '';

    if (query.data === 'Tula') weather = 'Tula';
    if (query.data === 'Moscow') weather = 'Moscow';
    if (query.data === 'Kazan') weather = 'Kazan';
    if (query.data === 'my') weather = 'my';

    if (weather) {
        if (weather === 'my') {
            awaitCity = true;
            bot.sendMessage(chatId, 'Введите интересующий вас город')

        } else {
            bot.sendMessage(chatId, weather);
            bot.sendPhoto(chatId, pic, {}, {filename: '123456789'});
        }
    } else {
        bot.sendMessage(chatId, 'Непонятно, давай попробуем ещё раз?', { // прикрутим клаву
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
});