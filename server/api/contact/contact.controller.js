'use strict';
import Contact from './contact.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    origem: Contact.schema.path('origem').enumValues,
  });
}

const selectIndex = '_id nome sobrenome telefone celular conta'
  + ' email origem';

export function index(req, res) {
  return api.find({
    model: 'Contact',
    select: selectIndex,
    where: {
      proprietario: req.user._id,
    },
    populate: [populationConta],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

const selectShow = '_id nome sobrenome telefone celular endereco conta'
  + 'email origem criador modificador updatedAt createdAt';

const populationConta = {
  path: 'conta',
  select: '_id nome cpf cnpj'
};

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Contact',
    select: selectShow,
    populate: [populationConta, api.populationProprietario,
      api.populationCriador, api.populationModificador],
  }, res);
}

export function create(req, res) {
  let account = requestContactCreate(req);
  console.log('Contact:', account);
  account.save()
    .then(callbackCreateContact(req, res))
    .catch(handleValidationError(res));
}

function requestContactCreate(req) {
  var account = new Contact(req.body);
  account.criador = req.user._id;
  account.modificador = req.user._id;
  account.proprietario = req.user._id;

  if(req.body.conta && req.body.conta._id) {
    account.conta = req.body.conta._id;
  }
  return account;
}

function callbackCreateContact(req, res) {
  return function(contact) {
    res.status(201).json(true);
    return contact;
  };
}

export function update(req, res) {
  let contactJson = requestUpdateContact(req);
  Contact.findByIdAndUpdate(req.params.id, contactJson)
    .then(handleEntityNotFound(res))
    .then(event => {
      req.params.id = event._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateContact(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    sobrenome: req.body.sobrenome,
    descricao: req.body.descricao,
    telefone: req.body.telefone,
    celular: req.body.celular,
    email: req.body.email,
    dataNascimento: req.body.dataNascimento,
    origem: req.body.origem,
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    proprietario: req.user._id,
    modificador: req.user._id,
  };
}
export function destroy(req, res) {}
