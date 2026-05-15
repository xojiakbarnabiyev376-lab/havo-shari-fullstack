const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initDB = async () => {
    const count = await prisma.package.count();
    if (count === 0) {
        await prisma.package.createMany({
            data: [
                { id: "1", name: "Asosiy Parvoz", duration: "20-30 daqiqa", price: 300000, isPremium: true, image: "/images/premium.png", features: JSON.stringify(["50 metr balandlik", "6 kishi to'lganda uchadi", "Ish vaqti: Yo'riqnoma asosida"]) },
                { id: "2", name: "Kvadrat Sikl", duration: "15-20 daqiqa", price: 150000, isPremium: false, image: "/images/atv.png", features: JSON.stringify(["Kvadrat siklda yurish", "Foto zonada rasmlarga tushish", "Jamoaviy adrenalin"]) }
            ]
        });
    } else {
        await prisma.package.update({
            where: { id: "1" },
            data: { duration: "20-30 daqiqa", price: 300000, isPremium: true, image: "/images/premium.png", features: JSON.stringify(["50 metr balandlik", "6 kishi to'lganda uchadi", "Ish vaqti: Yo'riqnoma asosida"]) }
        });
        
        const pkg2 = await prisma.package.findUnique({ where: { id: "2" } });
        if (!pkg2) {
             await prisma.package.create({
                 data: { id: "2", name: "Kvadrat Sikl", duration: "15-20 daqiqa", price: 150000, isPremium: false, image: "/images/atv.png", features: JSON.stringify(["Kvadrat siklda yurish", "Foto zonada rasmlarga tushish", "Jamoaviy adrenalin"]) }
             });
        } else {
             await prisma.package.update({
                 where: { id: "2" },
                 data: { price: 150000, duration: "15-20 daqiqa", isPremium: false, image: "/images/atv.png", features: JSON.stringify(["Kvadrat siklda yurish", "Foto zonada rasmlarga tushish", "Jamoaviy adrenalin"]) }
             });
        }
    }
};

module.exports = { prisma, initDB };
