import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Estudiante } from '../../interfaces/Estudiante.js';
import PruebaModel from './prueba.model.js';

interface EstudianteInstance extends Model<Estudiante>, Estudiante { }
type EstudianteModelStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): EstudianteInstance;
};

const EstudianteModel = db.define('Estudiantes', {
    estudiante_id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    estudiante_nombre: DataTypes.STRING,
    estudiante_puntaje: DataTypes.NUMBER,
    prueba_id: DataTypes.STRING
}, {
    freezeTableName: true,
    timestamps: false
}) as EstudianteModelStatic;


export default EstudianteModel;