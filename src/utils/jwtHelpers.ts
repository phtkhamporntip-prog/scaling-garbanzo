import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  const options: SignOptions = { expiresIn: expireTime as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

const generateTokenId = (): string => {
  return crypto.randomUUID();
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  decodeToken,
  generateTokenId,
  hashToken,
};
