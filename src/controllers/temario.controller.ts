import { Request, Response } from "express";
import TemarioModel from "../models/mysql/temario.model";

const obtenerTemarios = async (req: Request, res: Response) => {
    try{
        // Obtiene todos los temarios
        const temarios = await TemarioModel.findAll();
        return res.status(200).json({ succes: true, message: "datos", data: temarios });
    }catch(error){
        console.log(error);
        res.status(500).json({succes: false, message: "Error en el servidor"});
    }
} 

export default {
    obtenerTemarios
}
