import express, { Application, Request, Response } from "express";
import cors from "cors"
import router from "./app/routes";
import httpStatus from "http-status";
import GlobalErrorHandler from "./app/middleware/globalErrorHandler";

const app:Application = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));

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
