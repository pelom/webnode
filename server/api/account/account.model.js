'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

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

var setorList = ('Agricultura,Vestuário,Bancário,Biotecnologia,Produtos Quimicos,'
  + 'Comunicações,Construção,Consultando,Educação,Eletrônicos,Energia,Engenharia,'
  + 'Entretenimento,Meio Ambiente,Finança,Comida & Bebida,Governo,Cuidados de saúde,'
  + 'Hospitalidade,Seguro,Máquinas,Fabricação,Meios de comunicação,Sem fins lucrativos,'
  + 'Lazer,Varejo,Remessa,Tecnologia,Telecomunicações,Transporte,Serviços,Outros').split(',');

var origemList = 'Website,Indicação Cliente,Ligação,WhatsApp,Outros'.split(',');
var AccountSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  telefone: {
    type: String, required: false, maxlength: 20 },
  website: {
    type: String, required: false, maxlength: 40 },
  descricao: {
    type: String, required: false, maxlength: 255 },
  cnpj: {
    type: String, required: false, maxlength: 14 },
  cpf: {
    type: String, required: false, maxlength: 11 },
  origem: { type: String, enum: origemList },
  setor: { type: String, enum: setorList },
  endereco: EnderecoSchema,
  isAtivo: { type: Boolean, required: true, default: true },
  atividades: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  proprietario: { type: Schema.Types.ObjectId, ref: 'User' },
  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

AccountSchema.index({ nome: 'text', cpf: 'text', cnpj: 'text', telefone: 'text' });

export default mongoose.model('Account', AccountSchema);
