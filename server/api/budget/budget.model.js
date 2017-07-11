'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-easy-auto-increment';

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

var pagamentoList = ('Dinheiro;Cartão Débito;Cartão Crédito;Cheque;Boleto;'
+ 'Transferência TED;Transferência DOC;Depósito').split(';');
var parcelaList = '1 - Àvista;2 - Vezes;3 - Vezes'.split(';');
var BudgetSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  dataValidade: { type: Date, required: false },
  descricao: {
    type: String, required: false, maxlength: 255 },
  status: { type: String, required: true, enum: statusList, default: 'Rascunho' },
  pagamento: { type: String, required: false, enum: pagamentoList, default: 'Dinheiro' },
  parcela: { type: String, required: false, enum: parcelaList, default: '1 vez' },
  valorTotal: {
    type: Number, required: true, default: 0 },
  valorVenda: {
    type: Number, required: true, default: 0 },
  desconto: {
    type: Number, required: true, default: 0, min: 0, max: 100 },
  conta: { type: Schema.Types.ObjectId, ref: 'Account' },
  contato: { type: Schema.Types.ObjectId, ref: 'Contact' },
  oportunidade: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
  itens: [BudgetItemSchema],
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

BudgetSchema.plugin(autoIncrement, { field: 'numero' });

export default mongoose.model('Budget', BudgetSchema);
