import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { Docente } from "../interfaces/Docente";
  
export const enviarCorreo = ( docente: Docente, token: string) => {
  return new Promise(async(res, rej)=>{
    try{
      // Traer el html del correo
      const filePath = path.join(__dirname, "../../public/emailBody.html");
      const html_base = fs.readFileSync(filePath, "utf8");

      const url = `${process.env.CLIENT_HOST}/Actualizar-contraseña?token=${token}`;
      
      // Cambiar variables del html por el nombre del docente y la url para restaurar la contraseña
      const html = html_base.replace("{{docente_nombre}}", docente.docente_nombre)
                            .replace("{{url_restauracion}}", url);

      // Conectarse a gmail
      const transporter = nodemailer.createTransport({
        // Servidor de gmail
        host: "smtp.gmail.com",
        // Puerto del servidor
        port: 587,
        // Credenciales de gmail
        auth: {
          user: process.env.EMAIL_CORREO,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      // Enviar el correo
      await transporter.sendMail({
        from: process.env.EMAIL_CORREO,
        to: docente.docente_mail,
        subject: "Restablecer contaseña",
        html: html,
      });

      res(true);
    }catch(err){
      console.log(err)
      rej(err);
    }
  });
}
