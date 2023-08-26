import { Estudiante } from "interfaces/Estudiante";
import { Request, Response } from "express";
import { salaModel } from "../models/mongo/sala.model";
import { v4 as uuid } from 'uuid';

const obtenerSala = async (req: Request, res: Response) => {
    try {
        // Obtener y verificar los datos
        const { sala_id } = req.params;
        
        if (!sala_id)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Busca la sala por id
        const sala = await salaModel.getById(sala_id);

        // Verifica que la sala exista
        if (!sala)
            return res.status(404).json({ succes: false, message: "sala no encontrada" });
        else
            return res.status(200).json({ succes: true, message: "datos", data: sala });

    } catch (error) {
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

const obtenerEstudianteSala = async (req: Request, res: Response) => {
    try {
        // Obtener y verificar datos
        const { sala_id, estudiante_id } = req.params;

        if (!sala_id || !estudiante_id)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Busca y verfica la sala
        const sala = await salaModel.getById(sala_id);

        if (!sala)
            return res.status(404).json({ succes: false, message: "sala no encontrada" });
        else {

            // Verificar que exista el estudiante
            const estudiante = sala.sala_estudiantes[estudiante_id];
            if (!estudiante)
                return res.status(404).json({ succes: false, message: "estudiante no encontrado" });
            else
                return res.status(200).json({ succes: true, message: "datos", data: estudiante });
        }

    } catch (error) {
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

const unirseSala = async (req: Request, res: Response) => {
    try {
        // Obtiene y verifica los datos
        const { sala_id } = req.params;
        const { estudiante_nombre } = req.body;
        if (!sala_id || !estudiante_nombre)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Verficas que la sala exista
        const sala = await salaModel.getById(sala_id);
        if(!sala)
            return res.status(400).json({ succes: false, message: "sala no encontrada" });

        // Crea un modelo del estudiante
        const estudiante: Estudiante = {
            estudiante_id: uuid(),
            estudiante_nombre,
            estudiante_puntaje: 0
        } 

        // Añade un estudiante a la sala
        await salaModel.addEstudiante(sala_id, estudiante);

        return res.status(200).json({ succes: true, message: "unido con exito", data: estudiante});

    } catch (error) {
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

export default {
    unirseSala,
    obtenerSala,
    obtenerEstudianteSala
}
