import jwt from "jsonwebtoken";
const createRefreshToken = (userId) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign({ userId }, secret, {
        expiresIn: "1 week",
        algorithm: "HS256",
    });
    return refreshToken;
};
export default createRefreshToken;
