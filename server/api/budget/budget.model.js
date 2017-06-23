'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

var statusList = 'Rascunho,Aprovado,Rejeitado'.split(',');

var BudgetItemSchema = new Schema({
  quantidade: {
    type: Number, required: true, default: 1 },
  valor: {
    type: Number, required: true },
  desconto: {
    type: Number, required: false, default: 0, min: 0, max: 100 },
  valorTotal: {
    type: Number, required: true, default: 0 },
  valorCatalogo: {
    type: Number, required: true },
  produto: { type: Schema.Types.ObjectId, ref: 'Product' },
});

var BudgetSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  dataValidade: { type: Date, required: false },
  descricao: {
    type: String, required: false, maxlength: 255 },
  status: { type: String, enum: statusList, default: 'Rascunho' },
  valorTotal: {
    type: Number, required: true, default: 0 },
  conta: { type: Schema.Types.ObjectId, ref: 'Account' },
  contato: { type: Schema.Types.ObjectId, ref: 'Contact' },
  itens: [BudgetItemSchema],
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

export default mongoose.model('Budget', BudgetSchema);
