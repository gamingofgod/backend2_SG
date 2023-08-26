import { Request, Response } from "express";
import PreguntaModel from "../models/mysql/pregunta.model";
import PruebaModel from "../models/mysql/prueba.model";

const obtenerPreguntas = async (req: Request, res: Response) => {
    try{
        // Obtiene el id de la prueba
        const { prueba_id } = req.params;

        // Busca las preguntas por id de la prueba
        const preguntas = await PreguntaModel.findAll({
            include: {
                model: PruebaModel,
                attributes: [],
                where: { prueba_id }
            },
        });
        return res.status(200).json({ succes: true, message: "datos", data: preguntas });
    }catch(error){
        console.log(error);
        res.status(500).json({succes: false, message: "Error en el servidor"});
    }
} 

export default {
    obtenerPreguntas
}
