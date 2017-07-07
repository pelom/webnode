'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

var statusList = 'Rascunho,Aprovado,Rejeitado'.split(',');
var tipoNotaList = 'NFe,NFSe,NFCe,Manual'.split(',');

var InvoiceItemSchema = new Schema({
  codigo: { type: String, required: false },
  nome: { type: String, required: true },
  ncm: { type: String, required: false },
  quantidade: { type: Number, required: true },
  unidade: { type: String, required: true },
  valor: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
});

var InvoiceSchema = new Schema({
  titulo: {
    type: String, required: false, maxlength: 100, trim: true },
  numero: {
    type: String, required: false, maxlength: 10, trim: true },
  serie: {
    type: String, required: false, maxlength: 10, trim: true },
  chave: {
    type: String, required: false, maxlength: 100, trim: true },
  codigoServico: {
    type: String, required: false, maxlength: 5, trim: true },
  descricao: {
    type: String, required: false, maxlength: 1000, trim: false },
  dataEmissao: { type: Date, required: true },

  emitente: { type: Schema.Types.ObjectId, ref: 'Account' },
  destinatario: { type: Schema.Types.ObjectId, ref: 'Account' },

  status: { type: String, required: true, enum: statusList, default: 'Rascunho' },
  tipoNota: { type: String, required: true, enum: tipoNotaList, default: 'Manual' },

  valorTotal: {
    type: Number, required: true, default: 0 },
  valorVenda: {
    type: Number, required: true, default: 0 },
  valorDesconto: {
    type: Number, required: true, default: 0 },

  valorFrente: {
    type: Number, required: true, default: 0 },
  valorSeguro: {
    type: Number, required: true, default: 0 },
  valorOutro: {
    type: Number, required: true, default: 0 },

  valorIcms: {
    type: Number, required: true, default: 0 },
  valorIpi: {
    type: Number, required: true, default: 0 },
  valorPis: {
    type: Number, required: true, default: 0 },
  valorCofins: {
    type: Number, required: true, default: 0 },

  desconto: {
    type: Number, required: true, default: 0, min: 0, max: 100 },

  produtos: [InvoiceItemSchema],
  xml: Buffer,

  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

export default mongoose.model('Invoice', InvoiceSchema);
