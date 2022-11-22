const axios = require('axios');
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = '5402284319:AAHInmcapWgfKmcdyb5D9nbBDSEozVFVJHk';
const bot = new TelegramBot(TOKEN, {polling: true});
const key = '62c1b562edb67b5e72415c6e4d367803';
const { createGenerator } = require('weather-picture-generator');

let awaitCity = false;

const picGen = createGenerator();

const getWeatherArr = async (city) => {
    let defaultDay = Math.floor( +new Date().setHours(15, 0, 0) / 1000);
    console.log(defaultDay);
    const curArr = [];
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`)
    curArr.push({...res.data.list[0], weather: [{...res.data.list[0].weather[0], icon: `http://openweathermap.org/img/wn/${res.data.list[0].weather[0].icon}@2x.png`}]});
    res.data.list.forEach(el => {
        if (el.dt === defaultDay + 86400) {
            defaultDay = defaultDay + 86400;
            curArr.push({...el, weather: [{...el.weather[0], icon: `http://openweathermap.org/img/wn/${el.weather[0].icon}@2x.png`}]});
        }
    })
    return curArr;
}

async function getForecast(city){
    try {
        const weatherArr = await getWeatherArr(city);
        return { picture: await picGen(weatherArr, city), bool: weatherArr[0].main.temp < 0} ;
    } catch (e) {
        throw e.response?.data?.cod;
    }
}

const keyboard = [
    [
        {
            text: 'Тула',
            callback_data: 'Тула',
        }
    ],
    [
        {
            text: 'Москва',
            callback_data: 'Москва',
        }
    ],
    [
        {
            text: 'Казань',
            callback_data: 'Казань',
        }
    ],
    [
        {
            text: 'Свой вариант...',
            callback_data: 'userChose',
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
        getForecast(query.text).then(({picture, bool}) => {
            if (bool) bot.sendMessage(chatId, 'Одевайся теплее <3');
            bot.sendPhoto(chatId, picture);
        }).catch( e => {
            if (e === '404') bot.sendMessage(chatId, ' Ты точно не тестировщик? Введёного тобой города не существует :с');
            else bot.sendMessage(chatId, 'Похоже, произошли технические шоколадки. Давай попробуем ещё раз?');
        }).finally(() => {
            awaitCity = false;
        })
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    let city = '';

    if (query.data === 'Тула') city = 'Тула';
    if (query.data === 'Москва') city = 'Москва';
    if (query.data === 'Казань') city = 'Казань';
    if (query.data === 'userChose') city = 'userChose';

    if (city) {
        if (city === 'userChose') {
            awaitCity = true;
            bot.sendMessage(chatId, 'Введите интересующий вас город')

        } else {
            getForecast(city).then(({picture, bool}) => {
                if (bool) bot.sendMessage(chatId, 'Одевайся теплее <3');
                bot.sendPhoto(chatId, picture);
            }).catch( e => {
                if (e === '404') bot.sendMessage(chatId, ' Ты точно не тестировщик? Введёного тобой города не существует :с');
                else bot.sendMessage(chatId, 'Похоже, произошли технические шоколадки. Давай попробуем ещё раз?');
            }).finally(() => {
                awaitCity = false;
            })
        }
    } else {
        bot.sendMessage(chatId, 'Непонятно, давай попробуем ещё раз?', {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
});
