import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { PruebaxPregunta } from '../../interfaces/PruebaxPregunta.js';

interface PruebaxPreguntaInstance extends Model<Omit<PruebaxPregunta, "pruebasxPreguntas_id">>, Omit<PruebaxPregunta, "pruebasxPreguntas_id"> { }
type PruebaxPreguntaModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): PruebaxPreguntaInstance;
};

const PruebaxPreguntaModel =  db.define('PruebasxPreguntas', {
  pruebasxPreguntas_id: {
    primaryKey: true,
    type: DataTypes.STRING
  },
  prueba_id: DataTypes.STRING,
  pregunta_id: DataTypes.NUMBER
}, {
  freezeTableName: true,
  timestamps: false
}) as PruebaxPreguntaModelStatic;

export default PruebaxPreguntaModel;