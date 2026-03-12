import express, { Application, Request, Response } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import router from "./app/routes";
import httpStatus from "http-status";
import GlobalErrorHandler from "./app/middleware/globalErrorHandler";
import config from "./config";

const app:Application = express();
app.use(express.json());
app.use(
  cors({
    origin: config.client_url || true,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  keyGenerator: (req: Request) => {
    // Handle Forwarded header (standardized X-Forwarded-For) - proper RFC 7239 parsing
    const forwarded = req.get("Forwarded");
    if (forwarded) {
      const match = forwarded.match(/for=([^;,\s]+)/);
      if (match) {
        // Safely handle IPv6 addresses in brackets
        let ip = match[1].trim();
        if (ip.startsWith("[") && ip.endsWith("]")) {
          ip = ip.slice(1, -1);
        }
        return ip;
      }
    }
    
    // Fallback to X-Forwarded-For header (commonly set by proxies like Vercel)
    const xForwardedFor = req.get("X-Forwarded-For");
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    
    // Fallback to direct IP, handling IPv6 properly
    let ip = req.ip;
    if (ip && ip.startsWith("[") && ip.endsWith("]")) {
      ip = ip.slice(1, -1);
    }
    return ip || "127.0.0.1";
  },
});

app.use(globalLimiter);

app.use("/api/v1", router);
app.use(GlobalErrorHandler);

app.get("/", (req, res) => {
    res.send(
      `<h1 style='text-align: center; padding: 20px; color:green'>Scaling Garbanzo Trading Server is Running!</h1>`
    );
});

//handle not found
app.all("*", (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `🚦 Requested ${req.originalUrl} this Route Not Found 💥`,
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
});


export default app;
