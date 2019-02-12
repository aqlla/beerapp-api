import {Request, Response} from "express";
import {NextFunction} from "express-serve-static-core";

export const cors = (urls: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", urls.join(","));
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
  };
};
