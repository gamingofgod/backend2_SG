import {Server, Socket} from 'socket.io';
import PreguntaModel from '../models/mysql/pregunta.model';
import { Estudiante } from '../interfaces/Estudiante';
import { salaModel } from '../models/mongo/sala.model';
import { ErrorSala } from '../utils/errors';
import EstudianteModel from '../models/mysql/estudiante.mode';
import PruebaModel from '../models/mysql/prueba.model';
import sequelize from '../database/mysql.database';

export default class PruebaListeners{
    io: Server;
    socket: Socket;

    constructor(io: Server, socket: Socket){
        this.socket = socket;
        this.io = io;
        this.listeners();
    }

    // Evento socket para unirse a una sala
    private unirsePruebaSocket = async (sala_id: string) => {
        try{
            this.socket.join(`prueba:${sala_id}`);
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("prueba:error", error.message);
            else this.socket.emit("prueba:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socket para contestar una pregunta
    private contestarPregunta = async (sala_id: string, estudiante_id: string, pregunta_id: number, respuesta: string) => {
        try{
            // Buscar y verficar la pregunta
            const pregunta = await PreguntaModel.findByPk(pregunta_id);
            if(pregunta){
                // Verificar que la pregunta este correcta
                var estudiante: Estudiante | null = null;
                var math = pregunta.pregunta_respuesta_correcta == respuesta;
                // Aumenta en +1 el puntaje del estudiante y si no obtiene el estudiante
                if(math){
                    estudiante = await salaModel.aumentarPuntajeEstudiante(sala_id, estudiante_id, 1);
                }else{
                    estudiante = await salaModel.findEstudianteByIdEnSala(sala_id, estudiante_id);
                }
                // Envia a todos en la sala que alguien contesto la pregunta
                this.io.to(`prueba:${sala_id}`).emit("prueba:pregunta:contestar", math, estudiante);
            }
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("prueba:error", error.message);
            else this.socket.emit("prueba:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socket para cambiar la pregunta
    private siguientePregunta = async (sala_id: string) => {
        try{
            // Cambias a las siguiente pregunta
            const nuevaPregunta = await salaModel.sigueintePregunta(sala_id);
            
            // Envia a todos en que el profesor cambio de pregunta
            this.io.to(`prueba:${sala_id}`).emit("prueba:pregunta:siguiente", nuevaPregunta);
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("prueba:error", error.message);
            else this.socket.emit("prueba:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socekt para terminar la pregunta
    private terminarPrueba = async (sala_id: string) => {

        // Creamos una trasaccion de mysql
        const t = await sequelize.transaction();
        
        try{
            // Buscamos y verificamos si existen las salas y la prueba
            const sala = await salaModel.getById(sala_id);
            const prueba = await PruebaModel.findByPk(sala_id);

            if(!sala || !prueba) throw new ErrorSala("Sala no encontrada");

            // Convertir el objeto de estudiantes en un array
            const estudiantes = Object.values(sala.sala_estudiantes);

            // Calcular el promedio del puntaje de los estudiantes
            await prueba.update({
                prueba_puntaje_promedio: estudiantes.reduce((sum, a) => a.estudiante_puntaje + sum, 0) / estudiantes.length
            });
            
            // Guardar los modelos del los estudiantes en la base de datos
            await EstudianteModel.bulkCreate(estudiantes.map(e => ({...e, prueba_id: sala.sala_id})));

            // Se borra la sala
            await salaModel.delete(sala_id);
            
            // Se guardan los cambios
            t.commit();

            // Envia un evento a todos de que la prueba ya termino
            this.io.to(`prueba:${sala_id}`).emit("prueba:terminar");
        }catch(error){
            console.log(error);
            // Si ocurre un error no guarda nada
            t.rollback();
            if(error instanceof ErrorSala) this.socket.emit("prueba:error", error.message);
            else this.socket.emit("prueba:error", "Ocurrio un error inesperado.");
        }
    }

    listeners(){
        this.socket.on("socket:unirse:prueba", this.unirsePruebaSocket);
        this.socket.on("prueba:pregunta:contestar", this.contestarPregunta);
        this.socket.on("prueba:pregunta:siguiente", this.siguientePregunta);
        this.socket.on("prueba:terminar", this.terminarPrueba);
    }
}