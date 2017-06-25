'use strict';
import Budget from './budget.model';
import ApiService from '../api.service';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    status: Budget.schema.path('status').enumValues,
  });
}

const selectIndex = '_id nome dataValidade descricao status valorTotal valorVenda'
  + ' conta contato criador modificador createdAt updatedAt';

const populationConta = {
  path: 'conta',
  select: '_id nome '
};

const populationContato = {
  path: 'contato',
  select: '_id nome sobrenome'
};

export function index(req, res) {
  return api.find({
    model: 'Budget',
    select: selectIndex,
    where: buildWhere(req),
    populate: [populationConta, populationContato,
      api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        createdAt: -1
      }
    }
  }, res);
}

function buildWhere(req) {
  if(req.query.status) {
    return {
      status: { $in: req.query.status }
    };
  }
  if(req.query.oportunidade) {
    return {
      oportunidade: { $in: req.query.oportunidade }
    };
  }
  return {
    //proprietario: req.user._id
  };
}

const selectShow = '_id nome dataValidade descricao status valorTotal valorVenda'
  + ' desconto conta contato criador modificador createdAt updatedAt itens'
  + ' oportunidade';

const populationProduto = {
  path: 'itens.produto',
  select: '_id nome unidade'
};

const populationOportunidade = {
  path: 'oportunidade',
  select: '_id nome'
};

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Budget',
    select: selectShow,
    populate: [populationConta, populationContato,
      populationProduto, populationOportunidade,
      api.populationCriador, api.populationModificador],
  }, res);
}

export function create(req, res) {
  let budget = requestBudgetCreate(req);
  console.log('Budget:', budget);
  budget.save()
    .then(callbackCreateBudget(req, res))
    .catch(handleValidationError(res));
}

function requestBudgetCreate(req) {
  var budget = new Budget(req.body);
  budget.criador = req.user._id;
  budget.modificador = req.user._id;
  budget.proprietario = req.user._id;

  if(req.body.conta && req.body.conta._id) {
    budget.conta = req.body.conta._id;
  }
  if(req.body.contato && req.body.contato._id) {
    budget.contato = req.body.contato._id;
  }
  return budget;
}

function callbackCreateBudget(req, res) {
  return function(contact) {
    res.status(201).json(true);
    return contact;
  };
}

export function update(req, res) {
  let budgetJson = requestUpdateBudget(req);

  if(budgetJson.conta && budgetJson.conta.length == 0) {
    budgetJson.conta = null;
  } else if(budgetJson.conta && budgetJson.conta._id) {
    budgetJson.conta = req.body.conta._id;
  }

  if(budgetJson.contato && budgetJson.contato.length == 0) {
    budgetJson.contato = null;
  } else if(budgetJson.contato && budgetJson.contato._id) {
    budgetJson.contato = req.body.contato._id;
  }

  if(budgetJson.oportunidade && budgetJson.oportunidade._id) {
    budgetJson.oportunidade = req.body.oportunidade._id;
  }

  Budget.findByIdAndUpdate(req.params.id, budgetJson)
    .then(handleEntityNotFound(res))
    .then(budget => {
      req.params.id = budget._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateBudget(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    descricao: req.body.descricao,
    dataValidade: req.body.dataValidade,
    status: req.body.status,
    valorTotal: req.body.valorTotal,
    valorVenda: req.body.valorVenda,
    desconto: req.body.desconto,
    itens: req.body.itens,
    conta: req.body.conta,
    oportunidade: req.body.oportunidade,
    contato: req.body.contato,
    modificador: req.user._id,
  };
}

export function destroy(req, res) { }
