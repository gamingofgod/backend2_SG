import { Request, Response } from "express";
import docenteModel from "../models/mysql/docente.model";
import bc from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { enviarCorreo } from "../services/email.service";

const auth = async (req: Request, res: Response) => {
    try{
        if(res.locals.docente_id){
            // Busca y verfica si existe el docente
            var docente = await docenteModel.findByPk(res.locals.docente_id, {attributes: {exclude: ["docente_contrasena"]}});
            if(docente){
                res.status(200).json({succes: true, data: docente});
            }else{
                res.status(400).json({succes: false, message: "usuario no encontrado"});
            }
        }else{
            res.status(401).json({succes: false, message: "Invalid authentication"});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({succes: false, message: "Error en el servidor"});
    }
}

const login = async (req: Request, res: Response) => {
    try {
        // Obtener y verficar email y contraseña
        const { docente_mail, docente_contrasena } = req.body;

        if (!docente_mail || !docente_contrasena)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Verficar que exista el usuario por email
        var docente = await docenteModel.findOne({ where: { docente_mail } });

        if (!docente)
            return res.status(400).json({ succes: false, message: "usuario no encontrado" });

        // Comparar contraseña encriptada
        var match = await bc.compare(docente_contrasena, docente.docente_contrasena);

        // Si email y contraseña son validos crea un token con el id del docente y lo manda como respuesta
        if (match) {
            var token = jwt.sign(
                { docente_id: docente.docente_id },
                process.env.JWT_SECRET!,
                { expiresIn: "7d" }
            );
            return res.status(200).json({ succes: true, message: "logeado correctamente", data: token });
        } else {
            return res.status(400).json({ succes: false, message: "contraseña incorrecta" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ succes: false, message: "error en el servidor" });
    }
}

const register = async (req: Request, res: Response) => {
    try {
        // Obtener y verificar datos del docente
        const { docente } = req.body;

        if (!docente)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        const { docente_nombre, docente_mail, docente_contrasena } = docente;

        if (!docente_nombre || !docente_mail || !docente_contrasena)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Verificar si ya existe el correo
        const docente_mail_check = await docenteModel.findOne({where: {docente_mail}});
        
        if (docente_mail_check)
            return res.status(400).json({ succes: false, message: "email ya registrado" });

        // Crear id y encripta la contraseña
        docente.docente_id = uuid();
        docente.docente_contrasena = await bc.hash(docente_contrasena, 10);

        // Crear y guardar el modelo del docente
        var _docente = await docenteModel.create({...docente});

        var token = jwt.sign(
            { docente_id: _docente.docente_id },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        // Crea un token con el id del docente y lo manda como respuesta
        return res.status(200).json({ succes: true, message: "registrado correctamente", data: token });

    } catch (error) {
        res.status(500).json({ succes: false, message: "error en el servidor" });
    }
}

const restablecerPassword = async (req: Request, res: Response) => {
    try{
        // Obtener y verificar datos del docente
        const {docente_mail} = req.body;
        
        if (!docente_mail)
            return res.status(400).json({ succes: false, message: "datos incompletos" });

        // Verficar si existe el correo
        const docente = await docenteModel.findOne({where: {docente_mail}});

        if (!docente)
            return res.status(400).json({ succes: false, message: "usuario no encontrado" });

        // Crea un token para restablecer la contraseña
        const token = jwt.sign(
            { docente_id: docente.docente_id },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );
        
        // Enviar un correo
        await enviarCorreo(docente, token);
        return res.status(200).json({ succes: true, message: "correo enviado" });

    }catch(error){
        res.status(500).json({ succes: false, message: "error en el servidor" });
    }
}

const actualizarPassword = async (req: Request, res: Response) => {
    try{
        // Obtener y verificar datos
        const {docente_contrasena} = req.body;
        const {token} = req.query;

        if (!token && typeof token != "string" && !docente_contrasena)
            return res.status(400).json({ succes: false, message: "datos incompletos" });
        
        // Extrae el id del docente y busca si existe el docente en la base de datos
        var payload = jwt.verify(token as string, process.env.JWT_SECRET!) as JwtPayload;

        const docente = await docenteModel.findByPk(payload.docente_id);

        if (!docente)
            return res.status(400).json({ succes: false, message: "usuario no encontrado" });

        // Encripta y actualiza la contraseña
        docente.docente_contrasena = await bc.hash(docente_contrasena, 10);
        await docente.save();
        
        return res.status(200).json({ succes: true, message: "contraseña actualizada" });
    }catch(error){
        res.status(500).json({ succes: false, message: "error en el servidor" });
    }
}

export default {
    auth,
    login,
    register,
    restablecerPassword,
    actualizarPassword
}