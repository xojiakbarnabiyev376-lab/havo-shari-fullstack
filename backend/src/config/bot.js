const TelegramBot = require('node-telegram-bot-api');
const { prisma } = require('./prisma');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id.toString();
  try {
    await prisma.telegramAdmin.upsert({
      where: { chatId },
      update: {},
      create: { chatId }
    });
    bot.sendMessage(chatId, "Salom! Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Yangi buyurtmalar barcha adminlarga yuboriladi.");
  } catch (err) {
    console.error('Error saving admin:', err);
  }
});

const getAdminChatIds = async () => {
  try {
    const admins = await prisma.telegramAdmin.findMany();
    return admins.map(a => a.chatId);
  } catch (err) {
    console.error('Error fetching admins:', err);
    return [];
  }
};

module.exports = { bot, getAdminChatIds };
