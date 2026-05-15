const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backup() {
  try {
    const bookings = await prisma.booking.findMany({ include: { package: true } });
    const users = await prisma.user.findMany();
    const packages = await prisma.package.findMany();

    const data = {
      bookings,
      users,
      packages,
      exportedAt: new Date().toISOString()
    };

    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(__dirname, '../backups', fileName);

    if (!fs.existsSync(path.join(__dirname, '../backups'))) {
      fs.mkdirSync(path.join(__dirname, '../backups'));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Backup created successfully: ${fileName}`);
  } catch (err) {
    console.error('Backup failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
