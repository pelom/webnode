'use strict';
import Bank from './bank.model';
import Account from '../account/account.model';
import User from '../user/user.model';
import ApiService from '../api.service';
import Invoice from '../invoice/invoice.model';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    //status: Budget.schema.path('status').enumValues,sssss
  });
}

const selectIndex = '_id nome conta agencia account contact transactions'
  + ' codigo descricao criador modificador createdAt updatedAt';

const populationSaldo = {
  path: 'transactions',
  select: '_id valor data saldoFinal saldoInicial',
  options: {
    limit: 1
  }
};

const populationConta = {
  path: 'account',
  select: '_id nome cnpj cpf'
};

const populationContato = {
  path: 'contact',
  select: '_id nome sobrenome'
};

export function index(req, res) {
  return api.find({
    model: 'Bank',
    select: selectIndex,
    where: buildWhere(req),
    populate: [populationConta, populationContato, populationSaldo,
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
  return where;
}

const selectShow = '_id nome conta agencia account contact'
  + ' descricao codigo criador modificador createdAt updatedAt';

export function show(req, res) {
  return api.findById(req.params.id, {
    model: 'Bank',
    select: selectShow,
    populate: [populationConta, populationContato, populationSaldo,
      api.populationCriador, api.populationModificador],
  }, res);
}

export function create(req, res) {
  let bank = requestBankCreate(req);
  bank.transactions = [{
    valor: 0,
    saldoInicial: req.body.saldoInicial,
    saldoFinal: 0,
    conta: bank.account,
    titulo: 'Conta aberta',
  }];
  console.log('Bank:', bank);
  bank.save()
    .then(callbackCreateBank(req, res))
    .catch(handleValidationError(res));
}

function requestBankCreate(req) {
  var bank = new Bank(req.body);
  bank.criador = req.user._id;
  bank.modificador = req.user._id;
  bank.proprietario = req.user._id;

  if(req.body.conta && req.body.conta._id) {
    bank.conta = req.body.conta._id;
  }
  if(req.body.contato && req.body.contato._id) {
    bank.contato = req.body.contato._id;
  }
  return bank;
}

function callbackCreateBank(req, res) {
  return function(contact) {
    res.status(201).json(true);
    return contact;
  };
}
export function update(req, res) {
  let bankJson = requestUpdateBank(req);

  if(bankJson.conta && bankJson.conta.length == 0) {
    bankJson.conta = undefined;
  } else if(bankJson.conta && bankJson.conta._id) {
    bankJson.conta = req.body.conta._id;
  }

  if(bankJson.contato && bankJson.contato.length == 0) {
    bankJson.contato = null;
  } else if(bankJson.contato && bankJson.contato._id) {
    bankJson.contato = req.body.contato._id;
  }

  Bank.findByIdAndUpdate(req.params.id, bankJson)
    .then(handleEntityNotFound(res))
    .then(bank => {
      req.params.id = bank._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateBank(req) {
  return {
    _id: req.body._id,
    nome: req.body.nome,
    descricao: req.body.descricao,
    codigo: req.body.codigo,
    agencia: req.body.agencia,
    conta: req.body.conta,
    account: req.body.account,
    contact: req.body.contact,
    modificador: req.user._id,
  };
}

export function destroy(req, res) {
}

export function operation(req, res) {
  let valor = req.body.valor;
  let titulo = req.body.titulo;
  let conta = req.body.conta;

  Bank.findById(req.params.id, 'id nome transactions')
    .populate([populationSaldo])
    .exec()
    .then(bank => {
      let transaction = bank.transactions[0];
      console.log('Transaction:', transaction);

      let saldo = transaction.saldoFinal + valor;
      let trans = {
        titulo,
        valor,
        saldoFinal: saldo,
        saldoInicial: transaction.saldoFinal,
        conta: conta ? conta : undefined
      };
      Bank.findByIdAndUpdate(req.params.id,
        { $push: { transactions: { $each: [trans], $sort: { data: -1 } } } },
        { new: true })
        .populate([populationSaldo])
        .then(callbackOperation(res))
        .catch(handleError(res));
    });
}

function callbackOperation(res) {
  return bank => {
    res.status(201).json(true);
    return bank;
  };
}

export function accountPayable(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  console.log(firstDay);
  console.log(lastDay);

  Invoice.aggregate([
    { $match: { oportunidade: { $exists: false }, status: { $nin: ['Cadastrada', 'Cancelada'] } } },
    { $unwind: '$emitente' },
    { $lookup: {
      from: 'accounts',
      localField: 'emitente',
      foreignField: '_id',
      as: 'emitenteInfo'
    } },
    { $unwind: '$pagamentos' },
    { $match: {
      pagamentos: { $exists: true },
      'pagamentos.dataPagamento': { $exists: false },
      'pagamentos.dataVencimento': {
        $gte: firstDay, $lte: lastDay
      } }
    },
    { $group: {
      _id: '$pagamentos.dataVencimento',
      titulo: { $push: '$titulo' },
      numero: { $push: '$numero' },
      status: { $push: '$status' },
      dataEmissao: { $push: '$dataEmissao' },
      emitente: { $push: { $arrayElemAt: ['$emitenteInfo', 0] } },
      pagamentos: { $push: '$pagamentos' },
    }}
  ]).exec((err, results) => {
    if(err) {
      handleError(res)(err);
      return;
    }
    let pagamentos = [];
    for(var i = 0; i < results.length; i++) {
      let titulo = results[i].titulo[0];
      let numero = results[i].numero[0];
      let status = results[i].status[0];
      let dataEmissao = results[i].dataEmissao[0];

      let nome = results[i].emitente[0].nome;
      let _id = results[i].emitente[0]._id;
      let cnpj = results[i].emitente[0].cnpj;
      let origem = results[i].emitente[0].origem;
      let pagamento = results[i].pagamentos[0];
      pagamentos.push({
        titulo,
        numero,
        status,
        dataEmissao,
        emitente: {
          nome,
          _id,
          cnpj,
          origem,
        },
        pagamento,
      });
    }
    console.log(results);
    console.log(pagamentos);
    res.status(201).json(pagamentos);
  });
}
