'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var ApplicationSchema = new Schema({
  nome: String,
  descricao: String,
  modulos: [{ type: Schema.Types.ObjectId, ref: 'ApplicationModulo' }],
  isAtivo: {
    type: Boolean,
    required: true,
    default: true
  },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('Application', ApplicationSchema);
