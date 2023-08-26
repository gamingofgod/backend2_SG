import { Request, Response, NextFunction } from "express";
import { Docente } from "interfaces/Docente";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

const handle_auth = async (req: Request, res: Response, next: NextFunction)=>{
    try{
        // Verifica que en la url exista el header "Authorization"
        const auth = req.get('Authorization');
        if(auth===undefined) throw "There is no token in the header";

        // Verifcar token
        const token_bearer = auth.split(' ');
        if(token_bearer[0].toLowerCase()!=='bearer') throw "invalid token";

        // Extrae y guarda el id del docente del token
        var token = token_bearer[1];
        var payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        res.locals.docente_id = payload.docente_id;
        next();
    }catch(error){
        console.log(error);
        const err = error as Error;
        if(err.message){
            res.status(400).json({succes: false, message: (error as Error).message});
        }else{
            res.status(401).json({succes: false, message: error});
        }
    }
}

export default {
    handle_auth
}