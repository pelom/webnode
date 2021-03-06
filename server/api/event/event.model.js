'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {schemaEmit} from './event.events';

var ItemSchema = new Schema({
  name: {
    type: String, required: true, minlength: 3, maxlength: 80, trim: true },
  description: {
    type: String, required: false, maxlength: 255 },
  objectId: {
    type: String, required: true, trim: true, index: true },
  object: {
    type: String, required: true, minlength: 3, maxlength: 80, trim: true },
});

var EventSchema = new Schema({
  title: {
    type: String, required: true, minlength: 3, maxlength: 60, trim: true },
  url: String,
  start: { type: Date, required: true },
  end: Date,
  allDay: {type: Boolean, required: true, default: false },
  local: {
    type: String, required: false, minlength: 3, maxlength: 40, trim: true },
  descricao: String,
  status: { type: String, enum: [
    'Pendente', 'Em Andamento', 'Concluído', 'Cancelado'], default: 'Pendente'},
  type: {
    type: String, required: false, minlength: 3, maxlength: 40, trim: true, default: 'Event' },
  subject: {
    type: String, required: false, maxlength: 60, trim: true },
  prioridade: { type: String, enum: ['Alta', 'Normal', 'Baixa'], default: 'Normal'},
  isAtivo: { type: Boolean, required: true, default: true },
  tarefas: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  references: [ItemSchema],
  origin: { type: Schema.Types.ObjectId, ref: 'Event' },
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

schemaEmit(EventSchema);

export default mongoose.model('Event', EventSchema);
