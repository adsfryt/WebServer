import express from "express"
import WebSocket from "ws";
import WSserver from "express-ws";
import tokenRouter from "./tokenRouter.js";
import cors from "cors";
import cookie from "cookie";
import  cookieParser from "cookie-parser";
import { WebSocketServer } from 'ws';
import https from "https";
import fs from "fs";
import enforce from "express-sslify";
import cluster from "cluster";
import os from "os";
import {validationResult} from "express-validator";
import Output from "../Output.js";
import userRouter from "./userRouter.js";
import subjectRouter from "./subjectRouter.js"
import testRouter from "./testRouter.js";

const numCPUs = os.cpus().length;

const PORT = 5000;
const app = express();

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    //var worker = cluster.fork();

    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: [
           "http://192.168.1.106:3000", "http://localhost:3000"
        ],
        credentials: true,
    }));

    async function start() {
        try {
            app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT));

        }catch (e){
            Output(e);
        }
    }
    start();
    app.use('/token',tokenRouter);
    app.use('/user',userRouter);
    app.use('/subject',subjectRouter);
    app.use('/test',testRouter);

}
