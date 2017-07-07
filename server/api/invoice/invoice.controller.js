'use strict';
import {parseXml} from './invoice.parsexml';
import {parseCsv} from './invoice.parsecsv';
import Account from '../account/account.model';
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

const selectIndex = '_id numero serie dataEmissao chave valorTotal tipoNota'
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
        nome: 1
      }
    }
  }, res);
}

function buildWhere(req) {
  let where = {
  };

  if(req.query.search) {
    var reg = new RegExp(`^${req.query.search}`, 'i');
    where.$or = [
      { numero: { $in: reg } },
    ];
  }
  return where;
}

const selectShow = '_id numero serie dataEmissao chave valorTotal tipoNota'
  + ' emitente destinatario criador modificador createdAt updatedAt'
  + ' descricao produtos valorIcms valorCofins valorIpi valorPis '
  + ' valorFrente valorOutro valorSeguro valorVenda valorDesconto codigoServico';

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
    dataEmissao: req.body.dataEmissao,
    numero: req.body.numero,
    serie: req.body.serie,
    chave: req.body.chave,
    emitente: req.body.emitente,
    destinatario: req.body.destinatario,
    status: req.body.status,
    valorTotal: req.body.valorTotal,
    valorVenda: req.body.valorVenda,
    valorDesconto: req.body.valorDesconto,
    desconto: req.body.desconto,
    proprietario: req.user._id,
    modificador: req.user._id,
    precificacao: req.body.precificacao
  };
}
export function destroy(req, res) {}

var Iconv = require('iconv').Iconv;

export function uploadInvoice(req, res) {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.on('data', data => {
      if(mimetype === 'text/csv') {
        var dec = new Iconv('CP1252', 'utf8');
        let textCsv = dec.convert(data);

        importInvoiceCsv(req, textCsv);
      } else if(mimetype === 'text/xml') {
        importInvoiceXml(req, data);
      }
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

function importInvoiceCsv(req, data) {
  parseCsv(data, invoices => {
    invoices.forEach(invoice => {
      console.log(invoice);
      importSaveInvoice(req, invoice);
    });
  });
}

function importInvoiceXml(req, data) {
  let invoiceJson = parseXml(data.toString());
  invoiceJson.xml = data;
  findAccount(invoiceJson.emitente.cnpj, accEmit => {
    console.log('AccEmit', accEmit);

    if(notExistAccount(accEmit)) {
      accEmit = createAccount(req, invoiceJson.emitente);
      accEmit.save().then(accNewEmit => {
        console.log('Conta Emitente criada', accNewEmit);
        invoiceJson.emitente = accNewEmit._id;
        findDestinatario(req, invoiceJson);
      });
    } else {
      invoiceJson.emitente = accEmit[0]._id;
      findDestinatario(req, invoiceJson);
    }
  });
}

function findAccount(cnpjCpf, callback) {
  console.log('findAccount', cnpjCpf);
  Account.find({
    $or: [
      { cnpj: cnpjCpf },
      { cpf: cnpjCpf}
    ]}, '_id nome cnpj telefone').exec()
    .then(callback);
}

function createAccount(req, json) {
  let acc = new Account(json);
  acc.criador = req.user._id;
  acc.modificador = req.user._id;
  acc.proprietario = req.user._id;
  return acc;
}

function notExistAccount(acc) {
  return acc && acc.length == 0;
}

function importSaveInvoice(req, invoice) {
  findAccount(invoice.emitente.cnpj, accEmit => {
    console.log('AccEmit', accEmit);

    if(notExistAccount(accEmit)) {
      accEmit = createAccount(req, invoice.emitente);
      accEmit.save().then(accNewEmit => {
        console.log('Conta Emitente criada', accNewEmit);
        invoice.emitente = accNewEmit._id;
        findDestinatario(req, invoice);
      });
    } else {
      invoice.emitente = accEmit[0]._id;
      findDestinatario(req, invoice);
    }
  });
}

function findDestinatario(req, invoiceJson) {
  let cnpjCpf = invoiceJson.destinatario.cpf ? invoiceJson.destinatario.cpf
    : invoiceJson.destinatario.cnpj;
  findAccount(cnpjCpf, accDest => {
    if(notExistAccount(accDest)) {
      accDest = createAccount(req, invoiceJson.destinatario);
      accDest.save().then(accNewDest => {
        console.log('Conta Destinatario criada', accNewDest);
        invoiceJson.destinatario = accNewDest._id;
        saveInvoice(req, invoiceJson);
      });
    } else {
      invoiceJson.destinatario = accDest[0]._id;
      saveInvoice(req, invoiceJson);
    }
  });
}

function saveInvoice(req, invoiceJson) {
  let invoice = createInvoice(req, invoiceJson);
  invoice.save().then(invoiceDb => {
    console.log('Nota fiscal importada com sucesso', invoiceDb.numero);
  });
}
function createInvoice(req, invoiceJson) {
  var invoice = new Invoice(invoiceJson);
  invoice.criador = req.user._id;
  invoice.modificador = req.user._id;
  invoice.proprietario = req.user._id;
  return invoice;
}
