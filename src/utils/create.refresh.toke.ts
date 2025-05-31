import jwt from "jsonwebtoken";

const createRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET as string;
  const refreshToken = jwt.sign({ userId }, secret, {
    expiresIn: "2 weeks",
    algorithm: "HS256",
  });
  return refreshToken;
};

export default createRefreshToken;
