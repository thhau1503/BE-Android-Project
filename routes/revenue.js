const express = require('express');
const router = express.Router();
const UserPackage = require('../models/UserPackage');
const PostPackage = require('../models/PostPackage');

router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.purchasedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const packages = await PostPackage.find({});
    const packageMap = {};
    packages.forEach(pkg => {
      packageMap[pkg._id] = pkg;
    });

    const userPackages = await UserPackage.find(dateFilter)
      .populate('package')
      .populate('user', 'name email');

    let totalRevenue = 0;
    const revenueByPackage = {};
    const packageCounts = {};

    userPackages.forEach(up => {
      const packagePrice = packageMap[up.package]?.price || 0;
      totalRevenue += packagePrice;

      const packageId = up.package.toString();
      revenueByPackage[packageId] = (revenueByPackage[packageId] || 0) + packagePrice;
      packageCounts[packageId] = (packageCounts[packageId] || 0) + 1;
    });

    const result = {
      totalRevenue,
      revenueByPackage: packages.map(pkg => ({
        packageId: pkg._id,
        packageName: pkg.name,
        revenue: revenueByPackage[pkg._id.toString()] || 0,
        count: packageCounts[pkg._id.toString()] || 0
      })),
      totalPackagesSold: userPackages.length,
      recentTransactions: userPackages.slice(0, 10).map(up => ({
        userName: up.user?.name || 'Unknown',
        packageName: packageMap[up.package]?.name || 'Unknown',
        price: packageMap[up.package]?.price || 0,
        purchasedAt: up.purchasedAt
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;