'use strict';
import {importInvoice} from './invoice.import';

import Invoice from './invoice.model';
import ApiService from '../api.service';
import Busboy from 'busboy';

let api = ApiService();
let handleError = api.handleError;
let respondWithResult = api.respondWithResult;
let handleEntityNotFound = api.handleEntityNotFound;
let handleValidationError = api.handleValidationError;

export function domain(req, res) {
  res.status(200).json({
    tipoNota: Invoice.schema.path('tipoNota').enumValues,
    status: Invoice.schema.path('status').enumValues,
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
        createdAt: -1
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
  return where;
}

const selectShow = '_id numero serie dataEmissao chave valorTotal tipoNota titulo'
  + ' emitente destinatario criador modificador createdAt updatedAt status dataVencimento'
  + ' descricao produtos valorIcms valorCofins valorIpi valorPis '
  + ' valorFrete valorOutro valorSeguro valorVenda valorDesconto codigoServico';

export function show(req, res) {
  return Invoice.findById(req.params.id, selectShow)
    .populate([populationEmit, populationDest,
      api.populationCriador, api.populationModificador])
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  let invoice = requestInvoiceCreate(req);
  console.log('Invoice:', invoice);
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

    proprietario: req.user._id,
    modificador: req.user._id,
    precificacao: req.body.precificacao
  };
}
export function destroy(req, res) {}

export function uploadInvoice(req, res) {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.on('data', data => {
      importInvoice(req, data, mimetype);
    });
    file.on('end', () => {
      console.log(`File [${fieldname}] Finished`);
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
