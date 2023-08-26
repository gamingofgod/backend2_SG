import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Tipo } from '../../interfaces/Tipo.js';

interface TipoInstance extends Model<Tipo>, Tipo { }
type TipoModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): TipoInstance;
};

const TipoModel = db.define('Tipos', {
  tipo_id: {
    primaryKey: true,
    type: DataTypes.NUMBER
  },
  tipo_nombre: DataTypes.STRING
}, {
  freezeTableName: true,
  timestamps: false
}) as TipoModelStatic;

export default TipoModel;