import { Request, Response } from "express";
import PruebaModel from "../models/mysql/prueba.model";
import ui from 'uniqid';
import TemarioModel from "../models/mysql/temario.model";
import sequelize from "../database/mysql.database";
import PreguntaModel from "../models/mysql/pregunta.model";
import PruebaxPreguntaModel from "../models/mysql/pruebaxPregunta.model";
import { shuffle } from "../utils/estenxions";
import { salaModel } from "../models/mongo/sala.model";
import EstudianteModel from "../models/mysql/estudiante.mode";

const crearPrueba = async (req: Request, res: Response) => {

    // Obtenemos los datos de la prueba
    const { docente_id, prueba_numero_preguntas, temario_id } = req.body;

    // Y crea una nueva transaccion de mysql
    const t = await sequelize.transaction();

    try {
        // Verificamos los datos
        if (!docente_id || !prueba_numero_preguntas || !temario_id)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Busca y verifica que exista el temario por id
        const temario = await TemarioModel.findByPk(temario_id);

        if (!temario)
            return res.status(404).json({ succes: false, message: "temario no encontado" });

        // Busca todas las preguntas del temario
        let preguntas = await PreguntaModel.findAll({ where: { temario_id } });

        // Verifica que no ponga un numero de preguntas mayor a la cantidad de preguntas del temario
        if(prueba_numero_preguntas > preguntas.length)
            return res.status(400).json({ succes: false, message: `no hay suficientes preguntas max (${preguntas.length})` });

        // Crear el modelo de la prueba
        const prueba = await PruebaModel.create({
            docente_id,
            prueba_fecha: new Date(),
            prueba_id: ui.time(),
            prueba_numero_preguntas,
            prueba_puntaje_promedio: 0,
            temario_id
        });

        // Randomiza las preguntas
        const _preguntas_randomizadas = shuffle(preguntas);
        
        // Coje solo la cantidad de preguntas que especifico el docente
        const _preguntas_del_docente = _preguntas_randomizadas.slice(0, prueba_numero_preguntas);
        
        // Crea un array con el modelo de pruebaXpregunta
        const _preguntas = _preguntas_del_docente.map(p => ({ 
            prueba_id: prueba.prueba_id, pregunta_id: p.pregunta_id
        }));

        // Guarda las preguntas de la prueba
        await PruebaxPreguntaModel.bulkCreate(_preguntas);

        // Crea una sala
        await salaModel.insert({
            sala_id: prueba.prueba_id,
            sala_docente_id: docente_id,
            sala_estudiantes: {},
            pregunta_actual: 0
        });

        // Confirmar los cambios
        await t.commit();

        return res.status(200).json({ succes: true, message: "datos", data: prueba });
    } catch (error) {
        console.log(error)
        // Si algo sale mal, no guarda los datos
        await t.rollback();
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

const obtenerPrueba = async (req: Request, res: Response) => {
    try {
        // Otener t y verificar los datos
        const { prueba_id } = req.params;

        if (!prueba_id)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Buscar la prueba por id
        const prueba = await PruebaModel.findByPk(prueba_id);

        // Verficamos si existe la prueba
        if (!prueba)
            return res.status(404).json({ succes: false, message: "no existe la prueba" });
        else
            return res.status(200).json({ succes: true, message: "datos", data: prueba });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

const obtenerPruebas = async (req: Request, res: Response) => {
    try {
        // Obtener y verificar los datos
        const { docente_id } = req.params;

        if (!docente_id)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Buscar todas las pruebas que a hecho el docente
        const pruebas = await PruebaModel.findAll({
            where: {docente_id},
            include: [
                {
                    model: EstudianteModel,
                    as: "estudiantes",
                    attributes: {
                        exclude: ["prueba_id"]
                    }
                },{
                    model: TemarioModel,
                    as: "temario",
                    attributes: {
                        exclude: ["temario_id"]
                    }
                }
            ]
        });
        
        return res.status(200).json({ succes: true, message: "datos", data: pruebas });

    } catch (error) {
        console.log(error);
        res.status(500).json({ succes: false, message: "Error en el servidor" });
    }
}

export default {
    obtenerPrueba,
    obtenerPruebas,
    crearPrueba
}
