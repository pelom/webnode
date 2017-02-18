'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
var PermissaoSchema = new Schema({
  application: {type: Schema.Types.ObjectId, ref: 'Application', required: true },
  modulo: {type: Schema.Types.ObjectId, ref: 'ApplicationModulo', required: true },
  funcoes: [{type: String, required: true }]
}, {
  timestamps: true
});
var ProfileSchema = new Schema({
  nome: String,
  descricao: String,
  permissoes: [PermissaoSchema],
  role: {
    type: String,
    default: 'user'
  },
  isAtivo: {
    type: String,
    required: true,
    default: true
  },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('Profile', ProfileSchema);
