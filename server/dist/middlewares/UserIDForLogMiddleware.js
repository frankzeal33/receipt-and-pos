import jwt from 'jsonwebtoken';
const UserIDForLogMiddleware = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        // Invalid token, treat as unauthenticated
        return next();
    }
};
export { UserIDForLogMiddleware };
