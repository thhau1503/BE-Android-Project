const jwt = require('jsonwebtoken');

module.exports = function (requireRole = []) {
    return (req, res, next) => {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log (req.user);

            if(requireRole.length > 0 && !requireRole.includes(req.user.user_role)){
                return res.status(401).json({ msg: 'You dont have permission' + req.user.user_role});
            }

            next();
        } catch (err) {
            res.status(401).json({ msg: 'Token is not valid' });
        }

    }
};