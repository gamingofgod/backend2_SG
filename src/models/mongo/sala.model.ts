import { Sala } from "../../interfaces/Sala";
import Database from "../../database/mongo.database";
import { Collection } from "mongodb";
import { Estudiante } from "../../interfaces/Estudiante";
import { ErrorSala } from "../../utils/errors";

class SalaModel { 
 
    #collection: Collection<Sala>

    constructor(database: Database){
        this.#collection = database.getDb().collection<Sala>("salas");
    } 

    getAll = (): Promise<Sala[]> => {
        return new Promise(async(res, rej)=>{
            try{
                const users = await this.#collection.find({}).toArray();
                res(users);
            }catch(error){
                rej(error);
            }
        });
    };

    getById = (sala_id: string): Promise<Sala|null> => {
        return new Promise(async(res, rej)=>{
            try{
                const user = await this.#collection.findOne({sala_id});
                res(user);
            }catch(error){
                rej(error);
            }
        });
    };

    insert = (entity: Sala): Promise<number> => {
        return new Promise(async(res, rej)=>{
            try{
                const result = await this.#collection.insertMany([entity]);
                res(result.insertedCount);
            }catch(error){
                rej(error);
            }
        });
    };

    update = (sala_id:string, entity: Partial<Sala>): Promise<number> => {
        return new Promise(async(res, rej)=>{
            try{
                const result = await this.#collection.updateOne({sala_id}, entity);
                res(result.modifiedCount);
            }catch(error){
                rej(error);
            }
        });
    };

    delete = (sala_id: string): Promise<void> => {
        return new Promise(async(res, rej)=>{
            try{
                const result = await this.#collection.deleteOne({sala_id});
                if(result.deletedCount == 0) return rej(new ErrorSala("No se pudo eliminar la sala."));
                res();
            }catch(error){
                rej(error);
            }
        });
    };

    addEstudiante = (sala_id:string, estudiante: Estudiante): Promise<void> => {
        return new Promise(async(res, rej)=>{
            try{
                // añade un estudiante al objeto estudiantes del modelo de la sala, la llave es el id del estudiante y el valor el modelo del estudiante
                const result = await this.#collection.updateOne({sala_id}, {$set: {[`sala_estudiantes.${estudiante.estudiante_id}`]: estudiante}});
                if(result.modifiedCount == 0) return rej(new ErrorSala(`No se pudo entrar a la sala ${sala_id}, vuelve a intentarlo.`));
                res();
            }catch(error){
                rej(error);
            }
        });
    };

    aumentarPuntajeEstudiante = (sala_id: string, estudiante_id: string, puntaje: number): Promise<Estudiante> => {
        return new Promise(async(res, rej)=>{
            try{
                // Busca la sala si no la encuentra bota un error
                const sala = await this.#collection.findOne({sala_id});

                if(!sala) return rej(new ErrorSala("Sala no encontrada"));

                // Revisa si el estudiante existe en la sala, si no existe bota un error 
                if(!sala.sala_estudiantes[estudiante_id]) return rej(new ErrorSala("Estudiante no registrado en la sala"));

                // Aumentar el puntaje del estudiante
                sala.sala_estudiantes[estudiante_id].estudiante_puntaje += puntaje;

                const nuevoPuntaje = sala.sala_estudiantes[estudiante_id].estudiante_puntaje;

                const result = await this.#collection.updateOne({sala_id}, {
                    $set: {
                        [`sala_estudiantes.${estudiante_id}.estudiante_puntaje`]: nuevoPuntaje
                    }
                });

                // si no se actualizo el modelo bota un error
                if(result.modifiedCount == 0) return rej(new ErrorSala("No se pudo aumentar el puntaje."));

                res(sala.sala_estudiantes[estudiante_id]);
            }catch(error){
                rej(error);
            }
        });
    };

    findEstudianteByIdEnSala = (sala_id: string, estudiante_id: string): Promise<Estudiante> => {
        return new Promise(async(res, rej)=>{
            try{
                // Busca dentro de la sala el estudiante por id
                const sala = await this.#collection.findOne({sala_id});

                if(!sala) return rej(new ErrorSala("Sala no encontrada"));

                if(!sala.sala_estudiantes[estudiante_id]) return rej(new ErrorSala("Estudiante no registrado en la sala"));

                res(sala.sala_estudiantes[estudiante_id]);
            }catch(error){
                rej(error);
            }
        });
    };

    sigueintePregunta = (sala_id:string): Promise<number> => {
        return new Promise(async(res, rej)=>{
            try{
                // Busca la sala
                const sala = await this.#collection.findOne({sala_id});

                if(!sala) return rej(new ErrorSala("Sala no encontrada"));

                // Aumenta en +1 la pregunta actual
                sala.pregunta_actual += 1;

                const result = await this.#collection.updateOne({sala_id}, {$set: {"pregunta_actual": sala.pregunta_actual}});
                
                // si no se actualizo el modelo bota un error
                if(result.modifiedCount == 0) return rej(new ErrorSala("No se pudo cambiar de pregunta."));
                
                res(sala.pregunta_actual);
            }catch(error){
                rej(error);
            }
        });
    };

}

export const salaModel = new SalaModel(new Database());