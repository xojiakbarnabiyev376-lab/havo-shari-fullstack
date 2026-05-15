const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/prisma');
const { bot, getAdminChatId } = require('../config/bot');

exports.createBooking = async (req, res, next) => {
  try {
    const { name, date, passengerCount, phone, packageId } = req.body;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const pId = packageId || '1';
    const pkg = await prisma.package.findUnique({ where: { id: pId } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const booking = await prisma.booking.create({
      data: {
        name: name || '',
        date: new Date(date),
        passengerCount: parseInt(passengerCount || '1'),
        phone,
        packageId: pId,
        paymentMethod: 'Karta orqali',
        receiptUrl,
        status: 'pending'
      }
    });

    const adminChatId = getAdminChatId();
    if (adminChatId) {
      let message = `🎈 *Yangi Buyurtma!*\n\n`;
      message += `👤 Mijoz: ${name || 'Noma\'lum'}\n`;
      message += `📞 Telefon: ${phone}\n`;
      message += `📅 Sana: ${date}\n`;
      message += `👥 Kishi soni: ${passengerCount}\n`;
      message += `📦 Paket: ${pkg.name}\n`;
      message += `💰 Jami to'lov: ${(parseInt(passengerCount || '1') * pkg.price).toLocaleString('uz-UZ')} so'm\n`;
      
      if (req.file) {
        bot.sendPhoto(adminChatId, req.file.path, { caption: message, parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(adminChatId, message, { parse_mode: 'Markdown' });
      }
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { filter } = req.query;
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

    const bookings = await prisma.booking.findMany({ 
      where: whereClause,
      include: { package: true }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({ 
        where: { id: req.params.id }, 
        data: { status } 
    });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.checkBooking = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const bookings = await prisma.booking.findMany({
      where: { phone: { contains: phone } },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.clearBookings = async (req, res, next) => {
  try {
    await prisma.booking.deleteMany({});
    const uploadPath = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadPath)) {
      const files = fs.readdirSync(uploadPath);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadPath, file));
      }
    }
    res.json({ success: true, message: 'Barcha buyurtmalar tozalandi' });
  } catch (err) {
    next(err);
  }
};
