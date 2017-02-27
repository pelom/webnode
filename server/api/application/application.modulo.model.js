'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var ApplicationModuloSchema = new Schema({
  nome: String,
  descricao: String,
  /*status: {
    type: String,
    enum: ['Ativo', 'Desativo'],
    required: true,
    default: 'Ativo'
  },*/
  isAtivo: {
    type: Boolean,
    required: true,
    default: true
  },
  funcoes: [String],
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('ApplicationModulo', ApplicationModuloSchema);
