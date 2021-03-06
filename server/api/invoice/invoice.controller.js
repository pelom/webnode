'use strict';
import {importInvoice} from './invoice.import';

import Invoice from './invoice.model';
import ApiService from '../api.service';
import Busboy from 'busboy';
import moment from 'moment';
let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    tipoNota: Invoice.schema.path('tipoNota').enumValues,
    status: Invoice.schema.path('status').enumValues,
    tipoPag: Invoice.schema.path('tipoPag').enumValues,
    bandeiraPag: Invoice.schema.path('bandeiraPag').enumValues,
    parcelaPag: Invoice.schema.path('parcelaPag').enumValues,
  });
}

const selectIndex = '_id numero serie dataEmissao chave valorTotal tipoNota status'
  + ' emitente destinatario criador modificador createdAt updatedAt';

const populationEmit = {
  path: 'emitente',
  select: '_id nome cpf cnpj telefone endereco'
};
const populationDest = {
  path: 'destinatario',
  select: '_id nome cpf cnpj telefone endereco'
};

export function index(req, res) {
  return api.find({
    model: 'Invoice',
    select: selectIndex,
    where: buildWhere(req),
    populate: [populationEmit, populationDest,
      api.populationCriador, api.populationModificador],
    options: { skip: 0, limit: 50,
      sort: {
        dataEmissao: -1
      }
    }
  }, res);
}

function buildWhere(req) {
  let where = {
  };

  if(req.query.status) {
    where.status = req.query.status;
  }
  if(req.query.search) {
    var reg = new RegExp(`^${req.query.search}`, 'i');
    where.$or = [
      { numero: { $in: reg } },
    ];
  }

  if(req.query.start && req.query.end) {
    let firstDay = new Date(req.query.start);
    let lastDay = new Date(req.query.end);
    where.dataEmissao = { $gte: firstDay, $lte: lastDay };
  }
  return where;
}

const selectShow = '_id numero serie dataEmissao chave valorTotal tipoNota titulo'
  + ' emitente destinatario criador modificador createdAt updatedAt status dataVencimento'
  + ' descricao produtos valorIcms valorCofins valorIpi valorPis '
  + ' valorFrete valorOutro valorSeguro valorVenda valorDesconto codigoServico'
  + ' oportunidade pagamentos';

const populateOpp = {
  path: 'oportunidade',
  select: '_id nome fase dataFechamento'
};

export function show(req, res) {
  return Invoice.findById(req.params.id, selectShow)
    .populate([populationEmit, populationDest, populateOpp,
      api.populationCriador, api.populationModificador])
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  let invoice = requestInvoiceCreate(req);
  console.log('Invoice:', invoice);

  if(req.body.ocorrencia && req.body.numeroOcorrencia) {
    for(let i = 1; i < Number(req.body.numeroOcorrencia); i++) {
      let clone = requestInvoiceCreate(req);
      if(clone.dataVencimento) {
        clone.dataVencimento = moment(clone.dataVencimento).add(i, 'month')
          .toDate();
      }
      if(clone.dataEmissao) {
        clone.dataEmissao = moment(invoice.dataEmissao).add(i, 'month')
          .toDate();
      }
      if(clone.pagamentos && clone.pagamentos.length) {
        clone.pagamentos[0].dataVencimento = moment(
          clone.pagamentos[0].dataVencimento).add(i, 'month')
          .toDate();
        clone.pagamentos[0].dataReferencia = moment(
          clone.pagamentos[0].dataReferencia).add(i, 'month')
          .toDate();
      }
      clone.save().then(inv => {
        console.log('Clone invoice:', inv);
      });
    }
  }

  invoice.save()
    .then(callbackCreateInvoice(req, res))
    .catch(handleValidationError(res));
}

function requestInvoiceCreate(req) {
  var invoice = new Invoice(req.body);
  invoice.criador = req.user._id;
  invoice.modificador = req.user._id;
  invoice.proprietario = req.user._id;
  return invoice;
}

function callbackCreateInvoice(req, res) {
  return function(invoice) {
    res.status(201).json(true);
    return invoice;
  };
}

export function update(req, res) {
  let invoiceJson = requestUpdateInvoice(req);
  //productJson.subproduto = req.body.subproduto;
  Invoice.findByIdAndUpdate(req.params.id, invoiceJson)
    //.populate([populationPrice])
    .then(handleEntityNotFound(res))
    .then(invoice => {
      req.params.id = invoice._id;
      return show(req, res);
    })
    .catch(handleError(res));
}

function requestUpdateInvoice(req) {
  return {
    _id: req.body._id,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    status: req.body.status,
    dataVencimento: req.body.dataVencimento,

    emitente: req.body.emitente,
    destinatario: req.body.destinatario,
    numero: req.body.numero,
    serie: req.body.serie,
    dataEmissao: req.body.dataEmissao,
    produtos: req.body.produtos,

    valorTotal: req.body.valorTotal,
    valorVenda: req.body.valorVenda,
    valorDesconto: req.body.valorDesconto,
    valorFrete: req.body.valorFrete,
    valorOutro: req.body.valorOutro,
    valorSeguro: req.body.valorSeguro,

    valorIcms: req.body.valorIcms,
    valorPis: req.body.valorPis,
    valorIpi: req.body.valorIpi,
    valorCofins: req.body.valorCofins,

    pagamentos: req.body.pagamentos,

    proprietario: req.user._id,
    modificador: req.user._id,
    precificacao: req.body.precificacao
  };
}
export function destroy(req, res) {}

export function uploadInvoice(req, res) {
  const busboy = new Busboy({ headers: req.headers,
    limits: { files: 1 }
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.fileRead = [];
    var size = 0;

    file.on('data', function(chunk) {
      size += chunk.length;
      if(size > 1024 * 1024 * 2) {
        file.resume();
        return res.json({
          success: false,
          message: 'Invalid file format'
        });
      }
      file.fileRead.push(chunk);
    });

    file.on('end', function() {
      console.log(`File [${fieldname}] Finished`);
      let data = Buffer.concat(file.fileRead, size);
      importInvoice(req, data, mimetype);
    });
  });
  busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated) => {
    console.log(`Field [${fieldname}]: value: ${val}`, valTruncated);
  });
  busboy.on('finish', () => {
    console.log('Done parsing form!');
    res.writeHead(303, { Connection: 'close', Location: '/' });
    res.end();
  });
  req.pipe(busboy);
}

export function cashFlow(req, res) {
  //cashFlowInputOrigin('Faturada');
  //cashFlowInputOrigin('Pendente');
  //cashFlowOutputOrigin('Faturada');
  //cashFlowOutputOrigin('Pendente');
  cashFlowProduct(true);
  cashFlowProduct(false);
}

/*function matStatus(status, firstDay, lastDay) {
  if(status === 'Faturada') {
    return {
      pagamentos: { $exists: true },
      'pagamentos.dataPagamento': { $exists: true },
      'pagamentos.dataVencimento': {
        $gte: firstDay, $lte: lastDay
      }
    };
  }
  return {
    pagamentos: { $exists: true },
    'pagamentos.dataPagamento': { $exists: false }
  };
}*/

/*function cashFlowOutputOrigin(status, start, end) {
  Invoice.aggregate([
    { $match: { oportunidade: { $exists: false }, status: { $nin: ['Cadastrada', 'Cancelada'] } } },
    { $unwind: '$destinatario' },
    { $lookup: {
      from: 'accounts',
      localField: 'destinatario',
      foreignField: '_id',
      as: 'destinatarioInfo'
    } },
    { $unwind: '$pagamentos' },
    { $match: matStatus(status, start, end)
    },
    { $group: createGroupTarget() }
  ]).exec((err, results) => {
    console.log('cashFlowOutputOrigin()', status);
    if(err) {
      console.log(err);
      return;
    }
    console.log(results);
  });
}*/

/*function createGroupTarget() {
  return {
    _id: { $arrayElemAt: ['$destinatarioInfo', 0] },
    count: { $sum: 1 },
    valorTotal: { $sum: '$pagamentos.valor' },
  };
}*/

function cashFlowProduct(input) {
  Invoice.aggregate([
    { $match: { oportunidade: { $exists: input }, status: 'Faturada' } },
    { $unwind: '$produtos' },
    { $unwind: '$pagamentos' },
    { $match: {
      pagamentos: { $exists: true },
      'pagamentos.dataPagamento': { $exists: true } }
    },
    { $group: createGroupOutputProduct() }
  ]).exec((err, results) => {
    console.log(`cashFlowProduct(${input})`);
    if(err) {
      console.log(err);
      return;
    }
    console.log(results);
  });
}

function createGroupOutputProduct() {
  return {
    _id: '$produtos.nome',
    count: { $sum: 1 },
    quantidade: { $sum: '$produtos.quantidade' },
    valorTotal: { $sum: '$produtos.valorTotal' },
  };
}

export function cashFlowInputOrigin(req, res) {
  let firstDay = new Date(req.query.start);
  let lastDay = new Date(req.query.end);
  let entrada = Boolean(req.query.type === 'entrada');
  let group = req.query.group;
  console.log(firstDay, lastDay, entrada, group);
  Invoice.aggregate([
    { $match: { oportunidade: { $exists: entrada }, status: { $nin: ['Cadastrada', 'Cancelada'] } } },
    { $unwind: '$pagamentos' },
    { $match: {
      pagamentos: { $exists: true },
      //'pagamentos.dataPagamento': { $exists: true },
      'pagamentos.dataReferencia': {
        $gte: firstDay, $lte: lastDay
      }
    }
    },
    { $lookup: {
      from: 'products',
      localField: 'pagamentos.planoConta',
      foreignField: '_id',
      as: 'planoContaInfo'
    } },
    { $group: createGroupOrigin(group) },
    //{ $sort: { 'transactions.data': -1 } },
  ]).exec((err, results) => {
    console.log('cashFlowInputOrigin()');
    if(err) {
      handleError(res)(err);
      return;
    }
    //console.log(results);
    res.status(201).json(results);
  });
}

function createGroupOrigin(type) {
  let getGroupId = () => {
    let group = { nome: '$planoContaInfo.nome', };
    if(type === 'month') {
      group.year = { $year: '$pagamentos.dataReferencia' };
      group.month = { $month: '$pagamentos.dataReferencia' };
    } else if(type === 'week') {
      group.week = { $week: '$pagamentos.dataReferencia' };
    } else if(type === 'day') {
      group.year = { $year: '$pagamentos.dataReferencia' };
      group.month = { $month: '$pagamentos.dataReferencia' };
      group.day = { $dayOfMonth: '$pagamentos.dataReferencia' };
    }
    return group;
  };

  return {
    _id: getGroupId(),
    count: { $sum: 1 },
    countPrevisao: { $sum: {
      $cond: { if: { $eq: ['$pagamentos.dataPagamento', '$exist']}, then: 1, else: 0 }
    }},
    countRealizado: { $sum: {
      $cond: { if: { $ne: ['$pagamentos.dataPagamento', '$exist']}, then: 1, else: 0 }
    }},
    realizado: { $sum: {
      $cond: { if: { $ne: ['$pagamentos.dataPagamento', '$exist']}, then: '$pagamentos.valor', else: 0 }
    }},
    previsao: { $sum: {
      $cond: { if: { $eq: ['$pagamentos.dataPagamento', '$exist']}, then: '$pagamentos.valor', else: 0 }
    }}
  };
}
