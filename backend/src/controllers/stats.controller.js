const exceljs = require('exceljs');
const { prisma } = require('../config/prisma');
const { bot, getAdminChatId } = require('../config/bot');

const getFilterWhere = (filter) => {
    let whereClause = {};
    const now = new Date();
    if (filter === 'daily') {
      const today = new Date(now.setHours(0,0,0,0));
      whereClause = { createdAt: { gte: today } };
    } else if (filter === 'weekly') {
      const day = now.getDay() || 7; 
      const monday = new Date(now);
      monday.setHours(-24 * (day - 1), 0, 0, 0);
      whereClause = { createdAt: { gte: monday } };
    } else if (filter === 'monthly') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause = { createdAt: { gte: firstDay } };
    }
    return whereClause;
};

exports.exportExcel = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const whereClause = getFilterWhere(filter);

    const bookings = await prisma.booking.findMany({ 
      where: whereClause,
      include: { package: true }, 
      orderBy: { createdAt: 'desc' } 
    });
    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Buyurtmalar');
    
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Mijoz Ismi', key: 'name', width: 20 },
      { header: 'Sana', key: 'date', width: 15 },
      { header: 'Telefon', key: 'phone', width: 20 },
      { header: "Paket", key: 'package', width: 15 },
      { header: "Kishi soni", key: 'count', width: 15 },
      { header: 'Summa', key: 'sum', width: 15 },
      { header: 'Holati', key: 'status', width: 15 }
    ];

    bookings.forEach(b => {
      worksheet.addRow({
        id: b.id.substring(0,8),
        name: b.name || 'Noma\'lum',
        date: new Date(b.date).toLocaleDateString('uz-UZ'),
        phone: b.phone,
        package: b.package?.name || '',
        count: b.passengerCount,
        sum: b.passengerCount * (b.package?.price || 0),
        status: b.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=HavoShari_Hisobot.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

exports.sendToTelegram = async (req, res, next) => {
  try {
    const adminChatId = getAdminChatId();
    if (!adminChatId) return res.status(400).json({ error: 'Bot hali faollashtirilmagan' });

    const { filter } = req.query;
    const whereClause = getFilterWhere(filter);
    const filterName = filter === 'daily' ? 'Bugungi' : filter === 'weekly' ? 'Haftalik' : filter === 'monthly' ? 'Oylik' : 'Barcha';

    const bookings = await prisma.booking.findMany({ 
      where: whereClause,
      include: { package: true }
    });
    
    const totalCount = bookings.length;
    const totalSum = bookings.reduce((acc, b) => acc + (b.passengerCount * (b.package?.price || 0)), 0);

    let message = `📊 *${filterName} Hisobot*\n\n`;
    bookings.forEach((b) => {
      const sum = b.passengerCount * (b.package?.price || 0);
      message += `👤 ${b.name || "Noma'lum"} | 📞 ${b.phone} | 💰 ${sum.toLocaleString('ru-RU')} so'm\n`;
    });

    message += `\n📦 Jami buyurtmalar: ${totalCount} ta\n`;
    message += `💰 Jami tushum: ${totalSum.toLocaleString('ru-RU')} so'm\n`;
    
    bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
