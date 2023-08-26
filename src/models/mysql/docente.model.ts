import { Model, DataTypes, BuildOptions } from 'sequelize';
import db from '../../database/mysql.database.js';
import { Docente } from '../../interfaces/Docente.js';

interface DocenteInstance extends Model<Docente>, Docente { }
type DocenteModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): DocenteInstance;
};

const DocenteModel = db.define('Docentes', {
  docente_id: {
    primaryKey: true,
    type: DataTypes.STRING
  },
  docente_nombre: DataTypes.STRING,
  docente_mail: DataTypes.STRING,
  docente_contrasena: DataTypes.STRING,
}, {
  freezeTableName: true,
  timestamps: false
}) as DocenteModelStatic;

export default DocenteModel;