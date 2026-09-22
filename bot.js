const TelegramBot = require('node-telegram-bot-api');

// استخدام المتغير من ملف .env (عشان الأمان)
const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://jakesparow13.github.io/golden-tree-game/';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    bot.sendMessage(chatId, 
        `🌳 مرحباً ${firstName}!\n\n` +
        `مرحباً بك في لعبة الشجرة الذهبية 🎰\n\n` +
        `اضغط الزر في الأسفل لبدء اللعب! 💰\n\n` +
        `🎁 رصيدك الابتدائي: 1000 نقطة`,
        {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎮 العب الآن', web_app: { url: webAppUrl } }
                ]]
            }
        }
    );
});

bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
        bot.sendMessage(msg.chat.id, '👋 استخدم الأمر /start لبدء اللعبة');
    }
});

console.log('🤖 البوت شغال!');
console.log('✅ البوت جاهز ويعمل 24/7');

// Keep-alive (عشان Render ما يطفي المشروع)
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running!');
});
server.listen(process.env.PORT || 3000);
