'use strict';
import Lead from './lead.model';
import User from '../user/user.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

const selectIndex = '_id nome sobrenome telefone celular '
  + 'email status origem produto criador modificador updatedAt createdAt';

export function domain(req, res) {
  res.status(200).json({
    status: Lead.schema.path('status').enumValues,
    origem: Lead.schema.path('origem').enumValues,
    produto: Lead.schema.path('produto').enumValues,
  });
}

const statusDefaultList = 'Não Contatado,Contatado,Convertido';
export function index(req, res) {
  console.log(req.query.status);
  let status = req.query.status || statusDefaultList.split(',');
  return api.find({
    model: 'Lead',
    select: selectIndex,
    where: {
      proprietario: req.user._id,
      status: { $in: status }
    },
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

export function create(req, res) {
  let lead = requestUserCreate(req);
  console.log('Lead:', lead);
  lead.save()
    .then(callbackCreateLead(req, res))
    .catch(handleValidationError(res));
}

function requestUserCreate(req) {
  var lead = new Lead(req.body);
  lead.criador = req.user._id;
  lead.modificador = req.user._id;
  lead.proprietario = req.user._id;
  return lead;
}

function callbackCreateLead(req, res) {
  return function(lead) {
    res.status(201).json(true);
    return lead;
  };
}

const selectUpdate = '_id nome sobrenome telefone celular '
  + 'email criador modificador proprietario updatedAt createdAt '
  + 'endereco empresa produto descricao status origem';

export function update(req, res) {
  Lead.findOne({ _id: req.params.id }, selectUpdate)
    .exec()
    .then(handleEntityNotFound(res))
    .then(callbackUpdateLead(req, res))
    .catch(handleError(res));
}

function callbackUpdateLead(req, res) {
  return function(lead) {
    let leadJson = requestLeadUpdate(req);
    console.log(leadJson);
    console.log(lead);
    Object.assign(lead, leadJson);
    return lead.save()
      .then(newLead => {
        req.params.id = newLead._id;
        return show(req, res);
      })
      .catch(handleValidationError(res));
  };
}

function requestLeadUpdate(req) {
  let leadId = req.params.id;
  let leadUpdate = {
    _id: leadId,
    nome: req.body.nome,
    sobrenome: req.body.sobrenome,
    email: String(req.body.email),
    empresa: req.body.empresa,
    telefone: req.body.telefone,
    celular: req.body.celular,
    descricao: req.body.descricao,
    produto: req.body.produto,
    status: req.body.status,
    origem: req.body.origem,
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    modificador: req.user._id,
  };
  return leadUpdate;
}

const selectShow = '_id nome sobrenome telefone celular'
  + ' email criador modificador proprietario updatedAt createdAt isAtivo'
  + ' endereco empresa produto descricao status origem';

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Lead',
    select: selectShow,
    populate: [api.populationProprietario, api.populationCriador, api.populationModificador],
  }, res);
}
