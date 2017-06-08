'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var EnderecoSchema = new Schema({
  address: String,
  zipcode: String,
  suburb: String,
  city: String,
  state: String,
  complement: String,
  country: String,
  number: String
});

var statusList = 'Não Contatado,Contatado,Convertido,Não Convertido'.split(',');
var origemList = 'Website,Indicação Cliente,Ligação,WhatsApp'.split(',');
var produtoList = ('Instalação Split 7.000,Instalação Split 9.000,'
  + 'Instalação Split 12.000,Instalação Split 18.000,Instalação Split 24.000,'
  + 'Instalação Split 36.000').split(',');
var LeadSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 20, trim: true },
  sobrenome: {
    type: String, required: true, minlength: 3, maxlength: 40, trim: true },
  email: {
    type: String, required: true, maxlength: 60, lowercase: true, trim: true },
  celular: {
    type: String, required: false, maxlength: 20 },
  telefone: {
    type: String, required: false, maxlength: 20 },
  empresa: {
    type: String, required: false, maxlength: 60 },
  website: {
    type: String, required: false, maxlength: 40 },
  descricao: {
    type: String, required: false, maxlength: 255 },
  status: { type: String, enum: statusList, default: 'Não Contatado' },
  origem: { type: String, enum: origemList, default: 'Ligação' },
  produto: { type: String, enum: produtoList },
  endereco: EnderecoSchema,

  isAtivo: { type: Boolean, required: true, default: true },
  tarefas: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});
export default mongoose.model('Lead', LeadSchema);
