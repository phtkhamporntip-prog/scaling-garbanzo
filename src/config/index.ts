import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  salt_rounds: process.env.SALT_ROUNDS,
  app_name: process.env.APP_NAME,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
  },
};
