'use strict';
import Opportunity from './opportunity.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

const selectIndex = '_id nome fase valor conta dataFechamento'
  + ' criador modificador updatedAt createdAt';

export function domain(req, res) {
  res.status(200).json({
    origem: Opportunity.schema.path('origem').enumValues,
    fase: Opportunity.schema.path('fase').enumValues,
  });
}

export function index(req, res) {
  let where = buildWhere(req);
  console.log('where:', where);

  return api.find({
    model: 'Opportunity',
    select: selectIndex,
    where,
    populate: [api.populationProprietario, populationConta,
      api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

function buildWhere(req) {
  let where = {
    //proprietario: req.user._id
  };

  if(req.query.search) {
    let searchs = req.query.search.split(' ');
    let regexs = [];
    searchs.forEach(item => {
      if(item.trim().length > 2) {
        var reg = new RegExp(item, 'i');
        regexs.push(reg);
      }
    });
    where.$or = [
      { nome: { $in: regexs } },
    ];
  }

  if(req.query.conta) {
    where.conta = { $in: req.query.conta };
  }

  if(req.query.status) {
    where.fase = { $in: req.query.status };
  }
  return where;
}

const selectShow = '_id nome descricao fase valor dataFechamento conta'
  + ' criador modificador proprietario updatedAt createdAt'
  + ' origem orcamento';

const populationConta = {
  path: 'conta',
  select: '_id nome '
};

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Opportunity',
    select: selectShow,
    populate: [api.populationProprietario, populationConta,
      api.populationCriador, api.populationModificador],
  }, res);
}

export function create(req, res) {
  let opp = requestUserOpportunity(req);
  console.log('Opportunity:', opp);
  opp.save()
    .then(callbackCreateOpportunity(req, res))
    .catch(handleValidationError(res));
}

function requestUserOpportunity(req) {
  var opp = new Opportunity(req.body);
  opp.criador = req.user._id;
  opp.modificador = req.user._id;
  opp.proprietario = req.user._id;
  return opp;
}

function callbackCreateOpportunity(req, res) {
  return function(opp) {
    res.status(201).json(true);
    return opp;
  };
}

export function update(req, res) {
  let oppJson = requestUpdateOpportinuty(req);
  console.log(oppJson);
  if(oppJson.conta && oppJson.conta.length == 0) {
    oppJson.conta = null;
  } else if(oppJson.conta && oppJson.conta._id) {
    oppJson.conta = req.body.conta._id;
  }

  if(oppJson.orcamento && oppJson.orcamento._id) {
    oppJson.orcamento = oppJson.orcamento._id;
  }

  Opportunity.findByIdAndUpdate(req.params.id, oppJson)
    .then(handleEntityNotFound(res))
    .then(opp => {
      req.params.id = opp._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateOpportinuty(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    descricao: req.body.descricao,
    dataFechamento: req.body.dataFechamento,
    orcamento: req.body.orcamento,
    fase: req.body.fase,
    valor: req.body.valor,
    conta: req.body.conta,
    origem: req.body.origem,
    modificador: req.user._id,
  };
}
