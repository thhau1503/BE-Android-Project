const cron = require('node-cron');
const UserPackage = require('../models/UserPackage');

cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        
        await UserPackage.updateMany(
            { 
                isActive: true,
                expiresAt: { $lt: now }
            },
            {
                isActive: false
            }
        );
        
        console.log('Cập nhật trạng thái gói hết hạn thành công');
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái gói:', error);
    }
});