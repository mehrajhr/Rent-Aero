import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (
  jwtPayload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn,
  } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Invalid token",
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
