'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, { Schema } from 'mongoose';

var statusList = 'Rascunho,Aprovado,Rejeitado'.split(',');

var InvoiceSchema = new Schema({
  titulo: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  fornecedor: { type: Schema.Types.ObjectId, ref: 'Account' },
  cliente: { type: Schema.Types.ObjectId, ref: 'Account' },

  status: { type: String, required: true, enum: statusList, default: 'Rascunho' },

  valorTotal: {
    type: Number, required: true, default: 0 },
  valorVenda: {
    type: Number, required: true, default: 0 },
  valorDesconto: {
    type: Number, required: true, default: 0 },
  desconto: {
    type: Number, required: true, default: 0, min: 0, max: 100 },

  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}

}, {
  timestamps: true
});

export default mongoose.model('Invoice', InvoiceSchema);
