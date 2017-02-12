'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var ModuloSchema = new Schema({
  nome: String,
  funcoes: [String]
}, {
  timestamps: true
});
var ApplicationSchema = new Schema({
  nome: String,
  descricao: String,
  modulos: [ModuloSchema],
  perfis: [{}],
  isAtivo: {
    type: String,
    required: true,
    default: true
  },
  criador:{ type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('Application', ApplicationSchema);
