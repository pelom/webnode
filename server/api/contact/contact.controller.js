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
  + ' email origem titulo cargo criador modificador createdAt updatedAt';

export function index(req, res) {
  return api.find({
    model: 'Contact',
    select: selectIndex,
    where: buildWhere(req),
    populate: [populationConta],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

function buildWhere(req) {
  if(req.query.conta) {
    return {
      conta: { $in: req.query.conta }
    };
  }
  return {
    proprietario: req.user._id
  };
}

const selectShow = '_id nome sobrenome telefone celular endereco conta titulo cargo'
  + ' dataNascimento email origem criador modificador updatedAt createdAt descricao';

const populationConta = {
  path: 'conta',
  select: '_id nome cpf cnpj descricao'
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
  let contact = requestContactCreate(req);
  console.log('Contact:', contact);
  contact.save()
    .then(callbackCreateContact(req, res))
    .catch(handleValidationError(res));
}

function requestContactCreate(req) {
  var contact = new Contact(req.body);
  contact.criador = req.user._id;
  contact.modificador = req.user._id;
  contact.proprietario = req.user._id;

  if(req.body.conta && req.body.conta._id) {
    contact.conta = req.body.conta._id;
  }
  return contact;
}

function callbackCreateContact(req, res) {
  return function(contact) {
    res.status(201).json(true);
    return contact;
  };
}

export function update(req, res) {
  let contactJson = requestUpdateContact(req);

  if(contactJson.conta.length == 0) {
    contactJson.conta = null;
  } else if(contactJson.conta._id) {
    contactJson.conta = req.body.conta._id;
  }
  Contact.findByIdAndUpdate(req.params.id, contactJson)
    .then(handleEntityNotFound(res))
    .then(contact => {
      req.params.id = contact._id;
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
    conta: req.body.conta,
    titulo: req.body.titulo,
    cargo: req.body.cargo,
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    proprietario: req.user._id,
    modificador: req.user._id,
  };
}

export function destroy(req, res) {}
