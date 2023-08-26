import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Pregunta } from '../../interfaces/Pregunta.js';
import TemarioModel from './temario.model.js';
import TipoModel from './tipo.model.js';

interface PreguntaInstance extends Model<Pregunta>, Pregunta { }
type PreguntaModelStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): PreguntaInstance;
};

const PreguntaModel =  db.define('Preguntas', {
    pregunta_id: {
        primaryKey: true,
        type: DataTypes.NUMBER
    },
    pregunta_imagen: DataTypes.STRING,
    pregunta_pregunta: DataTypes.STRING,
    pregunta_respuesta_correcta: DataTypes.STRING,
    pregunta_respuesta_incorrecta: DataTypes.STRING,
    temario_id: DataTypes.NUMBER,
    tipo_id: DataTypes.NUMBER
}, {
    freezeTableName: true,
    timestamps: false
}) as PreguntaModelStatic;

PreguntaModel.belongsTo(TemarioModel, {foreignKey: 'temario_id'});
PreguntaModel.belongsTo(TipoModel, {foreignKey: 'tipo_id'});

export default PreguntaModel;