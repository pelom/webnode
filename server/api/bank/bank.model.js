'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

var TransactionSchema = new Schema({
  data: { type: Date, required: true, default: Date.now },
  dataPagamento: { type: Date, required: true, default: Date.now },
  valor: {
    type: Number, required: true },
  saldoInicial: {
    type: Number, required: true },
  saldoFinal: {
    type: Number, required: true },
  conta: { type: Schema.Types.ObjectId, ref: 'Account' },
  bank: { type: Schema.Types.ObjectId, ref: 'Bank' },
  titulo: {
    type: String, required: true, maxlength: 100, trim: true },
});

var BankSchema = new Schema({
  nome: {
    type: String, required: true, maxlength: 100, trim: true },
  agencia: {
    type: String, required: true, maxlength: 20, trim: true },
  conta: {
    type: String, required: true, maxlength: 20, trim: true },
  codigo: {
    type: String, required: true, maxlength: 20, trim: true },
  descricao: {
    type: String, required: false, maxlength: 255 },

  account: { type: Schema.Types.ObjectId, ref: 'Account' },
  contact: { type: Schema.Types.ObjectId, ref: 'Contact' },

  transactions: [TransactionSchema],

  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

export default mongoose.model('Bank', BankSchema);
