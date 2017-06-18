'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {schemaEmit} from './contact.events';

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
var origemList = 'Website,Indicação Cliente,Ligação,WhatsApp'.split(',');
var ContactSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 20, trim: true },
  sobrenome: {
    type: String, required: true, minlength: 3, maxlength: 40, trim: true },
  email: {
    type: String, required: false, maxlength: 60, lowercase: true, trim: true },
  celular: {
    type: String, required: false, maxlength: 20 },
  telefone: {
    type: String, required: false, maxlength: 20 },
  dataNascimento: { type: Date, required: false },
  titulo: {
    type: String, required: false, maxlength: 100 },
  cargo: {
    type: String, required: false, maxlength: 100 },
  descricao: {
    type: String, required: false, maxlength: 255 },
  origem: { type: String, enum: origemList, default: 'Ligação' },
  endereco: EnderecoSchema,
  isAtivo: { type: Boolean, required: true, default: true },
  conta: { type: Schema.Types.ObjectId, ref: 'Account' },
  atividades: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

schemaEmit(ContactSchema);

export default mongoose.model('Contact', ContactSchema);
