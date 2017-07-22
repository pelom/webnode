'use strict';
import Bank from './bank.model';
import ApiService from '../api.service';
import Invoice from '../invoice/invoice.model';
import moment from 'moment';
import mongoose from 'mongoose';

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
  if(req.query.accountBank) {
    where.account = req.query.accountBank;
  }
  return where;
}

const selectShow = '_id nome conta agencia account contact'
  + ' descricao codigo criador modificador createdAt updatedAt';

export function show(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  console.log(firstDay);
  console.log(lastDay);
  Bank.findById(req.params.id)
    .select(selectShow)
    .populate([populationConta, api.populationCriador, api.populationModificador])
    .then(bank => {
      Bank.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
        { $unwind: '$transactions' },
        { $match: {
          'transactions.dataPagamento': {
            $gte: firstDay, $lte: lastDay
          } }
        },
        { $group: {
          _id: '$transactions.data',
          transactions: { $push: '$transactions' },
        }},
        { $sort: { 'transactions.data': -1 } },
      ]).exec((err, results) => {
        console.log(results);
        if(err) {
          handleError(res)(err);
          return;
        }
        let transList = [];
        results.forEach(item => {
          console.log(item);
          transList.push(item.transactions[0]);
        });
        console.log();
        let obj = bank.toObject();
        obj.transactions = transList;
        res.status(201).json(obj);
      });
    });
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

export function destroy(req, res) { }

export function operation(req, res) {
  let operat = {
    valor: req.body.valor,
    titulo: req.body.titulo,
    conta: req.body.conta,
    produto: req.body.produto,
    dataPagamento: req.body.dataPagamento,
    pagamentoId: req.body.pagamentoId,
    nfId: req.body.nfId,
  };
  console.log('operation()', operat);

  Bank.findById(req.params.id, 'id nome transactions')
    .populate([populationSaldo])
    .exec()
    .then(bank => {
      let lastTransaction = bank.transactions[0];
      console.log('Last transaction:', lastTransaction);
      let trans = createTransation(operat, lastTransaction);
      saveOperation(req.params.id, operat, trans, res);
    });
}

function createTransation(operat, lastTransaction) {
  let saldo = lastTransaction.saldoFinal + operat.valor;
  return {
    titulo: operat.titulo,
    valor: operat.valor,
    saldoFinal: saldo,
    saldoInicial: lastTransaction.saldoFinal,
    dataPagamento: operat.dataPagamento,
    conta: operat.conta ? operat.conta : undefined,
  };
}

function saveOperation(bankId, operat, trans, res) {
  console.log('bankId:', bankId);
  console.log('trans:', trans);

  Bank.findByIdAndUpdate(bankId,
    { $push: { transactions: { $each: [trans], $sort: { data: -1 } } } },
    { new: true })
    .populate([populationSaldo])
    .then(callbackOperation(operat, res))
    .catch(handleError(res));
}

function callbackOperation(operat, res) {
  return bank => {
    Invoice.findOneAndUpdate({ _id: operat.nfId, 'pagamentos._id': operat.pagamentoId },
      { $set: { 'pagamentos.$.dataPagamento': operat.dataPagamento,
        'pagamentos.$.dataReferencia': new Date() } },
      (err, doc) => {
        console.log(err, doc);
        res.status(201).json(true);
      });
    return bank;
  };
}

export function cashFlow(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let type = req.query.type;
  console.log('cashFlow()', firstDay, lastDay);

  let getGroupId = () => {
    let group = { };
    if(type === 'month') {
      group.year = { $year: '$transactions.data' };
      group.month = { $month: '$transactions.data' };
    } else if(type === 'week') {
      group.week = { $week: '$transactions.data' };
    } else if(type === 'day') {
      group.year = { $year: '$transactions.data' };
      group.month = { $month: '$transactions.data' };
      group.day = { $dayOfMonth: '$transactions.data' };
    }
    return group;
  };
  Bank.aggregate([
    //{ $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
    { $unwind: '$transactions' },
    { $match: {
      'transactions.data': {
        $gte: firstDay, $lte: lastDay
      } }
    },
    { $group: {
      _id: getGroupId(),
      //{ $dateToString: { format, date: '$transactions.dataPagamento' } },
      countDeb: { $sum: { $cond: { if: { $lt: ['$transactions.valor', 0]}, then: 1, else: 0 } }},
      countCred: { $sum: { $cond: { if: { $gt: ['$transactions.valor', 0]}, then: 1, else: 0 } }},
      sumDeb: { $sum: { $cond: { if: { $lt: ['$transactions.valor', 0]}, then: '$transactions.valor', else: 0 } }},
      sumCred: { $sum: { $cond: { if: { $gt: ['$transactions.valor', 0]}, then: '$transactions.valor', else: 0 } }},
      balance: { $sum: '$transactions.valor' },
      saldoFinal: { $first: '$transactions' },
      saldoInicial: { $last: '$transactions' },
    }},
    { $sort: { _id: -1 } },

  ]).exec((err, results) => {
    console.log(results);
    if(err) {
      handleError(res)(err);
      return;
    }
    res.status(201).json(results);
  });
}
export function accountReceivable(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  console.log(firstDay);
  console.log(lastDay);

  Invoice.aggregate([
    { $match: { oportunidade: { $exists: true }, status: { $nin: ['Cadastrada', 'Cancelada'] } } },
    { $unwind: '$destinatario' },
    { $lookup: { from: 'accounts', localField: 'destinatario', foreignField: '_id', as: 'destinatarioInfo' } },
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
      nfId: { $push: '$_id' },
      titulo: { $push: '$titulo' },
      numero: { $push: '$numero' },
      status: { $push: '$status' },
      dataEmissao: { $push: '$dataEmissao' },
      valorTotal: { $push: '$valorTotal' },
      accountBank: { $push: '$emitente' },
      beneficiario: { $push: { $arrayElemAt: ['$destinatarioInfo', 0] } },
      pagamentos: { $push: '$pagamentos' },
    }}
  ]).exec((err, results) => {
    if(err) {
      handleError(res)(err);
      return;
    }
    let pagamentos = convertResult(results, 'receivable');
    res.status(201).json(pagamentos);
  });
}

export function accountPayable(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  console.log(firstDay);
  console.log(lastDay);

  Invoice.aggregate([
    { $match: { oportunidade: { $exists: false }, status: { $nin: ['Cadastrada', 'Cancelada'] } } },
    { $unwind: '$emitente' },
    { $lookup: { from: 'accounts', localField: 'emitente', foreignField: '_id', as: 'emitenteInfo' } },
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
      nfId: { $push: '$_id' },
      titulo: { $push: '$titulo' },
      numero: { $push: '$numero' },
      status: { $push: '$status' },
      valorTotal: { $push: '$valorTotal' },
      dataEmissao: { $push: '$dataEmissao' },
      accountBank: { $push: '$destinatario' },
      beneficiario: { $push: { $arrayElemAt: ['$emitenteInfo', 0] } },
      pagamentos: { $push: '$pagamentos' },
    }},
    { $sort: { 'pagamentos.dataVencimento': -1 } },
  ]).exec((err, results) => {
    if(err) {
      handleError(res)(err);
      return;
    }
    let pagamentos = convertResult(results, 'payable');
    res.status(201).json(pagamentos);
  });
}

function convertResult(results, tipo) {
  let pagamentos = [];
  for(var i = 0; i < results.length; i++) {
    let cnpj = results[i].beneficiario[0].cnpj;
    let cpf = results[i].beneficiario[0].cpf;
    pagamentos.push({
      nfId: results[i].nfId[0],
      tipo,
      accountBank: results[i].accountBank[0],
      titulo: results[i].titulo[0],
      numero: results[i].numero[0],
      status: results[i].status[0],
      valorTotal: results[i].valorTotal[0],
      dataEmissao: results[i].dataEmissao[0],
      referente: {
        nome: results[i].beneficiario[0].nome,
        _id: results[i].beneficiario[0]._id,
        cpfCnpj: cnpj ? cnpj : cpf,
        origem: results[i].beneficiario[0].origem,
      },
      pagamento: results[i].pagamentos[0],
    });
  }
  console.log(results);
  console.log(pagamentos);
  return pagamentos;
}
