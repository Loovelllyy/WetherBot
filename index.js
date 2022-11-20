const TelegramBot = require("node-telegram-bot-api");
const TOKEN = '5402284319:AAHInmcapWgfKmcdyb5D9nbBDSEozVFVJHk';
const bot = new TelegramBot(TOKEN, {polling: true});
const key = '62c1b562edb67b5e72415c6e4d367803';

const getWeather = (city) => {
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`);
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
            callback_data: 'mine',
        }
    ]
];

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Привет! Я могу подсказать погоду! Давай для начала выберем для какого города', {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    let weather = '';

    if (query.data === 'Tula') weather = 'Tula';

    if (query.data === 'Moscow') weather = 'Tula2';
    if (query.data === 'Kazan') weather = 'Tula3';
    if (query.data === 'mine') weather = 'Tula4';

    if (weather) {
        bot.sendMessage(chatId, weather);
    } else {
        bot.sendMessage(chatId, 'Непонятно, давай попробуем ещё раз?', { // прикрутим клаву
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
});