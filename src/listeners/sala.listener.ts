import { Server, Socket } from 'socket.io';
import { salaModel } from "../models/mongo/sala.model";
import { Estudiante } from '../interfaces/Estudiante';
import { ErrorSala } from '../utils/errors';

export default class SalaListeners{
    io: Server;
    socket: Socket;

    constructor(io: Server, socket: Socket){
        this.socket = socket;
        this.io = io;
        this.listeners();
    }

    // Evento socket para unirse a una sala
    private unirseSalaSocket = async (sala_id: string) => {
        try{
            this.socket.join(`sala:${sala_id}`);
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("sala:error", error.message);
            else this.socket.emit("sala:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socket para que el estudiante se una a la sala
    private unirseSala = async (sala_id: string, estudiante: Estudiante) => {
        try{
            // Envia un evento a todos en la sala exepto al que envia el evento, que alguien se unio
            this.socket.broadcast.to(`sala:${sala_id}`).emit("sala:unirse", estudiante);
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("sala:error", error.message);
            else this.socket.emit("sala:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socket para empezar una sala
    private empezarSala = async (sala_id: string) => {
        try{
            // Envia un evento a todos que la prueba ya empieza
            this.io.to(`sala:${sala_id}`).emit("sala:empezar");
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("sala:error", error.message);
            else this.socket.emit("sala:error", "Ocurrio un error inesperado.");
        }
    }

    // Evento socket para eliminar la sala
    private eliminarSala = async (sala_id: string) => {
        try{
            // Elimina y Envia un evento a todos de que se elimino la sala
            await salaModel.delete(sala_id);
            this.io.to(`sala:${sala_id}`).emit("sala:eliminar");
        }catch(error){
            if(error instanceof ErrorSala) this.socket.emit("sala:error", error.message);
            else this.socket.emit("sala:error", "Ocurrio un error inesperado.");
        }
    }

    listeners(){
        this.socket.on("socket:unirse:sala", this.unirseSalaSocket);
        this.socket.on("sala:unirse", this.unirseSala);
        this.socket.on("sala:empezar", this.empezarSala);
        this.socket.on("sala:eliminar", this.eliminarSala);
    }
}