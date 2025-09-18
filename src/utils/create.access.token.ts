import jwt from "jsonwebtoken";

const createAccessToken = (userId: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: "1 hour",
    algorithm: "HS256",
  });
  return token;
};

export default createAccessToken;
