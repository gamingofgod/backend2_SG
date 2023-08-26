import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import userRouter from './router/user.router';
import http from 'http';
import io from 'socket.io';
import SalaListeners from './listeners/sala.listener';
import PruebaListeners from './listeners/prueba.listener';

class App {

    private app: express.Express
    server: http.Server
    ioServer: io.Server

    constructor() {
        this.app = express();
        // Crea un servidor http y websocket
        this.server = new http.Server(this.app);
        this.ioServer = new io.Server(this.server, {
            cors: { origin: process.env.CLIENT_HOST || "*" },
            path: '/socket/sala'
        });

        this.config();
        this.routes();
        this.start();
    }

    private config() {
        // Middleware de express para cors
        this.app.use(cors({ origin: process.env.CLIENT_HOST || "*" }));
        // Middleware de express para manejar json
        this.app.use(express.json());
        // Middleware de express para capturar las peticiones
        this.app.use(morgan('dev'));
    }

    private routes() {
        // Se utiliza el router
        this.app.use(userRouter.router);
    }

    private start() {

        // Añade los eventos webosckets al usuario que se conecte al servidor
        this.ioServer.on('connection', (socket) => {
            new SalaListeners(this.ioServer, socket);
            new PruebaListeners(this.ioServer, socket);
        });

        // Inicia el servidor
        this.server.listen(parseInt(process.env.API_PORT!), process.env.API_HOST!, () => {
            console.log(`Listen on http://${process.env.API_HOST}:${process.env.API_PORT}/`);
        });
    }
}

new App();