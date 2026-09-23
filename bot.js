const TelegramBot = require('node-telegram-bot-api');
const { getDatabase, ref, set, get, update } = require('firebase/database');
const { initializeApp } = require('firebase/app');

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAfsY0dQI9qnIrksRqY4TvOe7YtPhig_Pg",
    authDomain: "chekinroad-afa14.firebaseapp.com",
    databaseURL: "https://chekinroad-afa14-default-rtdb.firebaseio.com",
    projectId: "chekinroad-afa14",
    storageBucket: "chekinroad-afa14.firebasestorage.app",
    messagingSenderId: "871996125208",
    appId: "1:871996125208:web:7f98cf25c469ea0568536d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// التوكن من Environment Variable (نفس اللي ضفتيه بـ Render)
const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://jakesparow13.github.io/golden-tree-game/';

const bot = new TelegramBot(token, {polling: true});

// قائمة الأدمن (حط الـ User ID تبعك)
const ADMIN_IDS = [123456789]; // غيّر هذا الرقم بـ ID تبعك

// دالة لإنشاء أو جلب بيانات المستخدم
async function getOrCreateUser(userId, userName) {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
        const userData = {
            name: userName || 'مستخدم',
            balance: 0,
            gameBalance: 0,
            referrals: 0,
            referralCode: userId.toString(),
            totalDeposits: 0,
            totalWithdrawals: 0,
            createdAt: Date.now()
        };
        await set(userRef, userData);
        return userData;
    }
    return snapshot.val();
}

// قائمة الأزرار الرئيسية
function getMainKeyboard() {
    return {
        keyboard: [
            [{ text: '🎮 دخول الى الألعاب' }],
            [{ text: '📥 شحن رصيد من البوت' }, { text: '📤 سحب رصيد من البوت' }],
            [{ text: '🎁 إهداء رصيد' }, { text: '🎟️ كود هدية' }],
            [{ text: '✉️ تواصل مع الدعم' }, { text: '👥 الإحالات' }],
            [{ text: '🔄 السجل' }, { text: '🌟 العروض' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

// قائمة أزرار الألعاب
function getGamesKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '💰 شحن رصيد الألعاب', callback_data: 'charge_game' },
                { text: '💸 سحب رصيد الألعاب', callback_data: 'withdraw_game' }
            ],
            [
                { text: '🎰 لعب الآن', web_app: { url: webAppUrl } }
            ],
            [
                { text: '🔙 رجوع', callback_data: 'back_main' }
            ]
        ]
    };
}

// أمر /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name;
    
    const user = await getOrCreateUser(userId, userName);
    
    const welcomeMsg = `🌳 *مرحباً ${userName}!*\n\n` +
        `أهلاً بك في بوت الشجرة الذهبية 🎰\n\n` +
        `💰 رصيدك الأساسي: *${user.balance}* نقطة\n` +
        `🎮 رصيد الألعاب: *${user.gameBalance}* نقطة\n\n` +
        `استخدم الأزرار أدناه للتنقل:`;
    
    bot.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'Markdown',
        reply_markup: getMainKeyboard()
    });
});

// معالجة الأزرار النصية
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    
    if (!text || text.startsWith('/')) return;
    
    const user = await getOrCreateUser(userId, msg.from.first_name);
    
    switch(text) {
        case '🎮 دخول الى الألعاب':
            bot.sendMessage(chatId, 
                `🎰 *قسم الألعاب*\n\n` +
                `💰 رصيدك الأساسي: *${user.balance}* نقطة\n` +
                `🎮 رصيد الألعاب: *${user.gameBalance}* نقطة\n\n` +
                `اختر العملية:`, 
                { parse_mode: 'Markdown', reply_markup: getGamesKeyboard() }
            );
            break;
            
        case '📥 شحن رصيد من البوت':
            const depositMsg = `💳 *طرق الشحن المتاحة:*\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📱 *سيرياتل كاش:*\n` +
                `الرقم: \`00525989\`\n` +
                `الرقم: \`43833398\`\n\n` +
                `📱 *شام كاش:*\n` +
                `الكود: \`afeb9f1352b9d297ab8e553ff5eb01e2\`\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `⚠️ *خطوات الشحن:*\n` +
                `1️⃣ قم بالتحويل لأحد الأرقام أعلاه\n` +
                `2️⃣ صوّر إيصال التحويل\n` +
                `3️⃣ أرسل الصورة للدعم مع ذكر المبلغ\n\n` +
                `📞 للتواصل: اضغط زر "تواصل مع الدعم"`;
            bot.sendMessage(chatId, depositMsg, { parse_mode: 'Markdown' });
            break;
            
        case '📤 سحب رصيد من البوت':
            if (user.balance < 100) {
                bot.sendMessage(chatId, 
                    `❌ الحد الأدنى للسحب هو 100 نقطة\n` +
                    `💰 رصيدك الحالي: ${user.balance} نقطة`
                );
            } else {
                bot.sendMessage(chatId, 
                    `💸 *طلب سحب رصيد*\n\n` +
                    `💰 رصيدك المتاح: *${user.balance}* نقطة\n\n` +
                    `الرجاء إرسال:\n` +
                    `1️⃣ المبلغ المطلوب سحبه\n` +
                    `2️⃣ طريقة السحب (سيرياتل/شام)\n` +
                    `3️⃣ رقم محفظتك\n\n` +
                    `مثال: سحب 500 سيرياتل 0944123456\n\n` +
                    `أو تواصل مع الدعم مباشرة`,
                    { parse_mode: 'Markdown' }
                );
            }
            break;
            
        case '🎁 إهداء رصيد':
            bot.sendMessage(chatId, 
                `🎁 *إهداء رصيد لمستخدم آخر*\n\n` +
                `💰 رصيدك: *${user.balance}* نقطة\n\n` +
                `لإهداء رصيد، أرسل:\n` +
                `\`/gift [user_id] [amount]\`\n\n` +
                `مثال: \`/gift 123456789 100\``,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case '🎟️ كود هدية':
            bot.sendMessage(chatId, 
                `🎟️ *استخدام كود هدية*\n\n` +
                `أرسل الكود على الشكل:\n` +
                `\`/code YOUR_CODE\`\n\n` +
                `مثال: \`/code GOLD2024\``,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case '✉️ تواصل مع الدعم':
            bot.sendMessage(chatId, 
                `✉️ *خدمة الدعم الفني*\n\n` +
                `للتواصل مع الإدارة:\n` +
                `📧 أرسل رسالتك هنا وسيتم الرد عليك في أقرب وقت\n\n` +
                `أو تواصل مباشرة: @YourSupportUsername`
            );
            break;
            
        case '👥 الإحالات':
            const refLink = `https://t.me/${(await bot.getMe()).username}?start=${userId}`;
            bot.sendMessage(chatId, 
                `👥 *نظام الإحالات*\n\n` +
                `🔗 رابط الدعوة الخاص بك:\n` +
                `\`${refLink}\`\n\n` +
                `📊 عدد إحالاتك: *${user.referrals || 0}*\n` +
                `💰 أرباح الإحالات: قريباً\n\n` +
                `🎁 احصل على 50 نقطة عن كل صديق يسجل!`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case '🔄 السجل':
            bot.sendMessage(chatId, 
                `🔄 *سجل العمليات*\n\n` +
                `💰 إجمالي الإيداعات: ${user.totalDeposits || 0}\n` +
                `💸 إجمالي السحوبات: ${user.totalWithdrawals || 0}\n` +
                `🎮 رصيد الألعاب: ${user.gameBalance || 0}\n\n` +
                `📅 تاريخ التسجيل: ${new Date(user.createdAt).toLocaleDateString('ar')}`
            );
            break;
            
        case '🌟 العروض':
            bot.sendMessage(chatId, 
                `🌟 *العروض والمكافآت*\n\n` +
                `🎁 عرض الترحيب: 100 نقطة مجاناً!\n` +
                `💎 مكافأة يومية: سجل دخول يومي واحصل على نقاط\n` +
                `🏆 مسابقة أسبوعية: جوائز قيمة للفائزين\n\n` +
                `ترقبوا المزيد من العروض! 🎉`
            );
            break;
    }
});

// معالجة الأزرار الداخلية (Inline)
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    
    const user = await getOrCreateUser(userId, query.from.first_name);
    
    switch(data) {
        case 'charge_game':
            bot.sendMessage(chatId, 
                `💰 *شحن رصيد الألعاب*\n\n` +
                `رصيدك الأساسي: *${user.balance}*\n` +
                `رصيد الألعاب: *${user.gameBalance}*\n\n` +
                `أرسل المبلغ الذي تريد تحويله:\n` +
                `مثال: \`/transfer 100\``,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case 'withdraw_game':
            if (user.gameBalance < 10) {
                bot.sendMessage(chatId, 
                    `❌ رصيد الألعاب غير كافٍ\n` +
                    `💰 رصيدك: ${user.gameBalance} نقطة`
                );
            } else {
                const userRef = ref(db, `users/${userId}`);
                await update(userRef, {
                    balance: user.balance + user.gameBalance,
                    gameBalance: 0
                });
                bot.sendMessage(chatId, 
                    `✅ تم سحب ${user.gameBalance} نقطة من رصيد الألعاب\n` +
                    `💰 رصيدك الأساسي الجديد: ${user.balance + user.gameBalance}`
                );
            }
            break;
            
        case 'back_main':
            bot.sendMessage(chatId, '🏠 القائمة الرئيسية:', {
                reply_markup: getMainKeyboard()
            });
            break;
    }
    
    bot.answerCallbackQuery(query.id);
});

// أمر تحويل رصيد للألعاب
bot.onText(/\/transfer (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const amount = parseInt(match[1]);
    
    const user = await getOrCreateUser(userId, msg.from.first_name);
    
    if (amount > user.balance) {
        bot.sendMessage(chatId, `❌ رصيدك غير كافٍ\n💰 رصيدك: ${user.balance}`);
        return;
    }
    
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, {
        balance: user.balance - amount,
        gameBalance: user.gameBalance + amount
    });
    
    bot.sendMessage(chatId, 
        `✅ تم تحويل ${amount} نقطة إلى رصيد الألعاب\n\n` +
        `💰 رصيدك الأساسي: ${user.balance - amount}\n` +
        `🎮 رصيد الألعاب: ${user.gameBalance + amount}`
    );
});

// أمر إهداء
bot.onText(/\/gift (\d+) (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const targetId = parseInt(match[1]);
    const amount = parseInt(match[2]);
    
    const user = await getOrCreateUser(userId, msg.from.first_name);
    
    if (amount > user.balance) {
        bot.sendMessage(chatId, '❌ رصيدك غير كافٍ');
        return;
    }
    
    const targetUser = await getOrCreateUser(targetId, 'مستخدم');
    
    const senderRef = ref(db, `users/${userId}`);
    const targetRef = ref(db, `users/${targetId}`);
    
    await update(senderRef, { balance: user.balance - amount });
    await update(targetRef, { balance: targetUser.balance + amount });
    
    bot.sendMessage(chatId, `✅ تم إرسال ${amount} نقطة بنجاح!`);
    bot.sendMessage(targetId, `🎁 تلقيت ${amount} نقطة من مستخدم!`);
});

console.log('🤖 البوت شغال!');
console.log('✅ جميع الوظائف جاهزة');

// Keep-alive (عشان Render ما يطفي المشروع)
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running!');
});
server.listen(process.env.PORT || 3000);
