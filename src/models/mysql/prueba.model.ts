import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Prueba } from '../../interfaces/Prueba.js';
import TemarioModel from './temario.model.js';
import DocenteModel from './docente.model.js';
import PreguntaModel from './pregunta.model.js';
import PruebaxPreguntaModel from './pruebaxPregunta.model.js';
import EstudianteModel from './estudiante.mode.js';

interface PruebaInstance extends Model<Prueba>, Prueba { }
type PruebaModelStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): PruebaInstance;
};

const PruebaModel = db.define('Pruebas', {
    prueba_id: {
        primaryKey: true,
        type: DataTypes.NUMBER
    },
    prueba_numero_preguntas: DataTypes.NUMBER,
    prueba_puntaje_promedio: DataTypes.NUMBER,
    prueba_fecha: DataTypes.DATE,
    temario_id: DataTypes.NUMBER,
    docente_id: DataTypes.STRING
}, {
    freezeTableName: true,
    timestamps: false
}) as PruebaModelStatic;

PruebaModel.belongsTo(TemarioModel, {foreignKey: 'temario_id', as: 'temario'});
PruebaModel.belongsTo(DocenteModel, {foreignKey: 'docente_id'});
PruebaModel.hasMany(EstudianteModel, {foreignKey: 'prueba_id', as: 'estudiantes'});

PruebaModel.belongsToMany(PreguntaModel, {
    through: PruebaxPreguntaModel,
    foreignKey: "prueba_id"
});
PreguntaModel.belongsToMany(PruebaModel, {
    through: PruebaxPreguntaModel,
    foreignKey: "pregunta_id"
});


export default PruebaModel;