'use strict';
/*eslint no-invalid-this:0*/
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var usoList = ('00 - Mercadoria para Revenda;01 - Matéria-Prima;'
  + '02 - Embalagem;03 - Produto em Processo;04 - Produto Acabado;'
  + '05 - Subproduto;06 - Produto Intermediário;'
  + '07 - Material de Uso e Consumo;08 - Ativo Imobilizado;09 - Serviços;'
  + '10 - Outros insumos;99 - Outras').split(';');

var medidaList = ('m2 - Metro quadrado;cm2 - Centímetro quadrado;'
  + 'm - Metro;cm - Centímetro;UN - Unidade;CT - Cartela (1);CX - Caixa (1);'
  + 'DZ - Duzia (12);GZ - Groza (144);PA - Par (2);PÇ - Peça (1);'
  + 'PT - Pacote (1);RL - Rolo (1);kg - Kilograma;g - Grama;SC60 - Saca 60Kg (60);'
  + 'l - Litro;m3 - Metro cúbico').split(';');

var ProductItemSchema = new Schema({
  status: { type: String, enum: ['Disponível', 'Indisponível', 'Reservado'], default: 'Disponível' },
  dataEntrada: { type: Date, required: false },
  dataValida: { type: Date, required: false },
  dataReserva: { type: Date, required: false },
  dataSaida: { type: Date, required: false },
  userEntrada: { type: Schema.Types.ObjectId, ref: 'User' },
  userReserva: { type: Schema.Types.ObjectId, ref: 'User' },
  userSaida: { type: Schema.Types.ObjectId, ref: 'User' },
});

var ProductSubSchema = new Schema({
  quantidade: { type: Number, required: true },
  produto: { type: Schema.Types.ObjectId, ref: 'Product' },
});

var ProductPriceSchema = new Schema({
  valor: { type: Number, required: true },
  data: { type: Date, required: true, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

var ProductSchema = new Schema({
  nome: {
    type: String, required: true, minlength: 3, maxlength: 100, trim: true },
  descricao: {
    type: String, required: false, maxlength: 255 },
  codigo: {
    type: String, required: false, maxlength: 80 },

  marca: {
    type: String, required: false, maxlength: 100, trim: true },
  modelo: {
    type: String, required: false, maxlength: 100, trim: true },
  categoria: {
    type: String, required: false, maxlength: 100, trim: true },
  subcategoria: {
    type: String, required: false, maxlength: 100, trim: true },

  unidade: { type: String, enum: medidaList },
  uso: { type: String, enum: usoList },

  estoque: [ProductItemSchema],
  subproduto: [ProductSubSchema],
  precos: [ProductPriceSchema],

  criador: { type: Schema.Types.ObjectId, ref: 'User' },
  modificador: { type: Schema.Types.ObjectId, ref: 'User'}
}, {
  timestamps: true
});

export default mongoose.model('Product', ProductSchema);
