'use strict';
import Account from './account.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    origem: Account.schema.path('origem').enumValues,
    setor: Account.schema.path('setor').enumValues,
  });
}

const selectIndex = '_id nome descricao  telefone cpf cnpj criador modificador proprietario'
  + 'updatedAt createdAt';

export function index(req, res) {
  return api.find({
    model: 'Account',
    select: selectIndex,
    where: {
      proprietario: req.user._id,
    },
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

const selectShow = '_id nome descricao telefone cpf cnpj criador modificador proprietario'
  + 'updatedAt createdAt origem endereco contatos';
const populationContatos = {
  path: 'contatos',
  select: '_id nome sobrenome celular telefone email'
};
export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Account',
    select: selectShow,
    populate: [populationContatos, api.populationProprietario,
      api.populationCriador, api.populationModificador],
  }, res);
}

export function create(req, res) {
  let account = requestAccountCreate(req);
  console.log('Account:', account);
  account.save()
    .then(callbackCreateAccount(req, res))
    .catch(handleValidationError(res));
}

function requestAccountCreate(req) {
  var account = new Account(req.body);
  account.criador = req.user._id;
  account.modificador = req.user._id;
  account.proprietario = req.user._id;
  return account;
}

function callbackCreateAccount(req, res) {
  return function(account) {
    res.status(201).json(true);
    return account;
  };
}

export function update(req, res) {
  let eventJson = requestUpdateAccount(req);
  Account.findByIdAndUpdate(req.params.id, eventJson)
    .then(handleEntityNotFound(res))
    .then(event => {
      req.params.id = event._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateAccount(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    descricao: req.body.descricao,
    cpf: req.body.cpf,
    cnpj: req.body.cnpj,
    telefone: req.body.telefone,
    origem: req.body.origem,
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    proprietario: req.user._id,
    modificador: req.user._id,
  };
}

export function destroy(req, res) {}
