const { prisma } = require('../config/prisma');

exports.getPackages = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany();
    res.json(packages);
  } catch (err) {
    next(err);
  }
};
