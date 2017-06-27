'use strict';
import Lead from './lead.model';
import Event from '../event/event.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

const selectIndex = '_id nome sobrenome telefone celular cpfCnpj empresa'
  + ' email status origem produto criador modificador updatedAt createdAt';

export function domain(req, res) {
  res.status(200).json({
    status: Lead.schema.path('status').enumValues,
    origem: Lead.schema.path('origem').enumValues,
    produto: Lead.schema.path('produto').enumValues,
    setor: Lead.schema.path('setor').enumValues,
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
      //proprietario: req.user._id,
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

const selectUpdate = '_id nome sobrenome telefone celular cpfCnpj'
  + ' email criador modificador proprietario updatedAt createdAt'
  + ' endereco empresa produto descricao status origem isConvertido titulo setor';

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
    email: req.body.email,
    empresa: req.body.empresa,
    telefone: req.body.telefone,
    celular: req.body.celular,
    descricao: req.body.descricao,
    produto: req.body.produto,
    status: req.body.status,
    origem: req.body.origem,
    cpfCnpj: req.body.cpfCnpj,
    titulo: req.body.titulo,
    setor: req.body.setor,
    endereco: req.body.endereco,
    isAtivo: req.body.isAtivo,
    modificador: req.user._id,
  };
  return leadUpdate;
}

const selectShow = '_id nome sobrenome telefone celular cpfCnpj'
  + ' email criador modificador proprietario updatedAt createdAt isAtivo'
  + ' endereco empresa produto descricao status origem titulo setor isConvertido';

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Lead',
    select: selectShow,
    populate: [api.populationProprietario,
      api.populationCriador, api.populationModificador],
  }, res);
}

/*export function addActivity(req, res) {
  let eventId = req.body.evento;
  Lead.findByIdAndUpdate(req.params.id,
    { $push: { atividades: { $each: [eventId], $sort: { start: -1 } } }})
    .exec()
    .then(lead => {
      console.log('Lead addActivity()', lead._id);
      return res.status(201).json(true);
    })
    .catch(handleError(res));
}

export function removeActivity(req, res) {
  let eventId = req.body.evento;
  Lead.findByIdAndUpdate(req.params.id, { $pull: { atividades: { $in: [eventId] } } })
  .exec()
  .then(lead => {
    console.log('Lead removeActivity()', lead._id);
    return res.status(204).end();
  })
  .catch(handleError(res));
}*/
