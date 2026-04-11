import jwt from "jsonwebtoken";
const createAccessToken = (userId) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jwt.sign({ id: userId }, secret, {
        expiresIn: "20m",
        algorithm: "HS256",
    });
    return token;
};
export default createAccessToken;
