import { Router } from "express";
import authController from '../controllers/auth.controller';
import authMiddleware from "../middleware/auth.middleware";
import temarioController from "../controllers/temario.controller";
import pruebaController from "../controllers/prueba.controller";
import salaController from "../controllers/sala.controller";
import preguntaController from "../controllers/pregunta.controller";

class UserRouter {

    router:Router;

    constructor(){
        this.router = Router();
        this.config();
    }

    private config(){
        // Autentica el docente
        this.router.route('/auth').post(authMiddleware.handle_auth, authController.auth);
        // Ruta del login
        this.router.route('/auth/login').post(authController.login);
        // Ruta del register
        this.router.route('/auth/register').post(authController.register);
        // Ruta para crear y mandar el token al correo
        this.router.route('/auth/password/restablecer').post(authController.restablecerPassword);
        // Ruta para actualizar contraseña
        this.router.route('/auth/password/actualizar').post(authController.actualizarPassword);

        // Ruta para que el docente obtenga las pruebas
        this.router.route('/docente/:docente_id/pruebas').get(authMiddleware.handle_auth, pruebaController.obtenerPruebas);

        // Ruta para obtener una prueba
        this.router.route('/prueba/:prueba_id').get(pruebaController.obtenerPrueba);
        // Ruta para obtener las preguntas de la prueba
        this.router.route('/prueba/:prueba_id/preguntas').get(preguntaController.obtenerPreguntas);
        // Ruta para crear la prueba
        this.router.route('/prueba/crear').post(authMiddleware.handle_auth, pruebaController.crearPrueba);

        // Ruta para obtener la sala
        this.router.route('/sala/:sala_id').get(salaController.obtenerSala);
        // Ruta para unirse a la sala
        this.router.route('/sala/:sala_id').post(salaController.unirseSala);
        // Ruta para obtener un estudiante en una sala
        this.router.route('/sala/:sala_id/estudiante/:estudiante_id').get(salaController.obtenerEstudianteSala);

        // Ruta para obtener los temarios
        this.router.route('/temario').get(temarioController.obtenerTemarios);
    }
}

export default new UserRouter();