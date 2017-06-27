'use strict';
import Budget from './budget.model';
import User from '../user//user.model';
import ApiService from '../api.service';
import BudgetPdf from '../../components/genarate-pdf/budget.pdf';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    status: Budget.schema.path('status').enumValues,
    pagamento: Budget.schema.path('pagamento').enumValues,
    parcela: Budget.schema.path('parcela').enumValues,
  });
}

const selectIndex = '_id nome dataValidade descricao status valorTotal valorVenda'
  + ' conta contato criador modificador createdAt updatedAt numero';

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
  let where = {};
  if(req.query.status) {
    where.status = { $in: req.query.status };
  }
  if(req.query.oportunidade) {
    where.oportunidade = { $in: req.query.oportunidade };
  }
  return where;
}

const selectShow = '_id nome dataValidade descricao status valorTotal valorVenda'
  + ' desconto conta contato criador modificador createdAt updatedAt itens numero'
  + ' oportunidade pagamento parcela';

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
    parcela: req.body.parcela,
    pagamento: req.body.pagamento,
    modificador: req.user._id,
  };
}

export function destroy(req, res) { }

const selectShowPdf = '_id nome dataValidade descricao status valorTotal valorVenda'
  + ' desconto conta contato criador modificador createdAt updatedAt itens numero'
  + ' oportunidade pagamento parcela';

const populationContaPdf = {
  path: 'conta',
  select: '_id nome endereco'
};

const populationContatoPdf = {
  path: 'contato',
  select: '_id nome sobrenome email celular telefone'
};

const populationProdutoPdf = {
  path: 'itens.produto',
  select: '_id nome unidade'
};

const populationOportunidadePdf = {
  path: 'oportunidade',
  select: '_id nome'
};

export function showPdf(req, res) {
  Budget.findById(req.params.id)
    .select(selectShowPdf)
    .populate([populationContaPdf, populationContatoPdf,
      populationProdutoPdf, populationOportunidadePdf,
      api.populationCriador, api.populationModificador])
    .exec()
    .then(budget => {
      User.findById(req.user._id)
        .select('_id nome sobrenome email telefone celular empresa endereco')
        .exec()
        .then(user => {
          console.log(user);
          //let user = api.getUserRequest(req);
          BudgetPdf().generateBudgetPdf(user, budget, res);
        });
    })
  .catch(handleError(res));
}
