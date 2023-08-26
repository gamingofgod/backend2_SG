import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Temario } from '../../interfaces/Temario.js';

interface TemarioInstance extends Model<Temario>, Temario { }
type TemarioModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): TemarioInstance;
};

const TemarioModel = db.define('Temarios', {
  temario_id: {
    primaryKey: true,
    type: DataTypes.NUMBER
  },
  temario_nombre: DataTypes.STRING
}, {
  freezeTableName: true,
  timestamps: false
}) as TemarioModelStatic;

export default TemarioModel;