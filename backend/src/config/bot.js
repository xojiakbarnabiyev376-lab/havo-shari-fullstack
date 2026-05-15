const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

let adminChatId = null;
const chatIdPath = path.join(__dirname, '../../chatId.txt');

if (fs.existsSync(chatIdPath)) {
  adminChatId = fs.readFileSync(chatIdPath, 'utf8');
}

bot.onText(/\/start/, (msg) => {
  adminChatId = msg.chat.id.toString();
  fs.writeFileSync(chatIdPath, adminChatId);
  bot.sendMessage(adminChatId, "Salom! Men Havo Shari botiman. Yangi buyurtmalar shu yerga keladi.");
});

const getAdminChatId = () => adminChatId;

module.exports = { bot, getAdminChatId };
