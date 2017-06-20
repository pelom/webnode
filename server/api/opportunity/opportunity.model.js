'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {schemaEmit} from './contact.events';

var origemList = 'Website,Indicação Cliente,Ligação,WhatsApp'.split(',');

var OpportunitySchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  dataFechamento: { type: Date, required: false },
  descricao: {
    type: String, required: false, maxlength: 255 },
  origem: { type: String, enum: origemList, default: 'Ligação' },

  isAtivo: { type: Boolean, required: true, default: true },

  conta: { type: Schema.Types.ObjectId, ref: 'Account' },

  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

schemaEmit(OpportunitySchema);

export default mongoose.model('Opportunity', OpportunitySchema);
