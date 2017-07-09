'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {schemaEmit} from './opportunity.events';

var origemList = 'Website,Indicação Cliente,Ligação,WhatsApp'.split(',');
var faseList = 'Qualificação,Orçamento,Negociação,Faturamento,Perdida'.split(',');

var OpportunitySchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  dataFechamento: {
    type: Date, required: false },
  valor: {
    type: Number, required: true, default: 0 },
  descricao: {
    type: String, required: false, maxlength: 255 },
  origem: { type: String, enum: origemList },
  fase: { type: String, enum: faseList, default: 'Qualificação' },
  conta: { type: Schema.Types.ObjectId, ref: 'Account' },
  orcamento: { type: Schema.Types.ObjectId, ref: 'Budget' },
  contaProprietaria: { type: Schema.Types.ObjectId, ref: 'Account' },
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

schemaEmit(OpportunitySchema);

export default mongoose.model('Opportunity', OpportunitySchema);
