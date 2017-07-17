'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

var statusList = 'Cadastrada,Pendente,Faturada,Cancelada'.split(',');
var tipoNotaList = 'NFe,NFSe,NFCe,Manual'.split(',');

var tipoPagList = ('Dinheiro;Cartão Débito;Cartão Crédito;Cheque;Boleto;'
+ 'Transferência TED;Transferência DOC;Depósito').split(';');
var parcelaList = ('1 - Àvista;2 - Vezes;3 - Vezes;4 - Vezes;5 - Vezes;'
+ '6 - Vezes;7 - Vezes;8 - Vezes').split(';');
var bandeiraList = 'Master;Visa;Elo;American Express'.split(';');

var InvoiceItemSchema = new Schema({
  codigo: { type: String, required: false },
  nome: { type: String, required: true },
  ncm: { type: String, required: false },
  quantidade: { type: Number, required: true },
  unidade: { type: String, required: true },
  valor: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
  categoria: { type: String, required: false },
  produto: { type: Schema.Types.ObjectId, ref: 'Product' },
});

var InvoicePaymentSchema = new Schema({
  dataReferencia: { type: Date, required: true, default: Date.now },
  dataVencimento: { type: Date, required: true, default: Date.now },
  dataPagamento: { type: Date, required: false },
  dataCriacao: { type: Date, required: false, default: Date.now },
  valor: {
    type: Number, required: true, default: 0 },
  tipo: { type: String, required: false },

  parcela: { type: Number, required: true },
  documento: { type: String, required: false },
  autorizacao: { type: String, required: false },
  bandeira: { type: String, required: false },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  planoConta: { type: Schema.Types.ObjectId, ref: 'Product' },
});

var InvoiceSchema = new Schema({
  titulo: {
    type: String, required: false, maxlength: 100, trim: true },
  dataVencimento: { type: Date, required: false, default: Date.now },

  emitente: { type: Schema.Types.ObjectId, ref: 'Account' },
  destinatario: { type: Schema.Types.ObjectId, ref: 'Account' },

  status: { type: String, required: true, enum: statusList, default: 'Cadastrada' },
  tipoNota: { type: String, required: true, enum: tipoNotaList, default: 'Manual' },
  xml: Buffer,

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
  dataEmissao: { type: Date, required: false },

  valorTotal: {
    type: Number, required: true, default: 0 },
  valorVenda: {
    type: Number, required: true, default: 0 },
  valorDesconto: {
    type: Number, required: true, default: 0 },

  valorFrete: {
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

  oportunidade: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
  pagamentos: [InvoicePaymentSchema],

  tipoPag: { type: String, required: false, enum: tipoPagList},
  parcelaPag: { type: String, required: false, enum: parcelaList},
  bandeiraPag: { type: String, required: false, enum: bandeiraList},

  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

export default mongoose.model('Invoice', InvoiceSchema);
