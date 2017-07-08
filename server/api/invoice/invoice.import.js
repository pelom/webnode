'use strict';
import {parseXml} from './invoice.parsexml';
import {parseCsv} from './invoice.parsecsv';

import Product from '../product/product.model';
import Account from '../account/account.model';
import Invoice from './invoice.model';

var Iconv = require('iconv').Iconv;

export function importInvoice(req, data, mimetype) {
  console.log('importInvoice()', data.length, mimetype);

  if(mimetype === 'text/csv') {
    let dec = new Iconv('CP1252', 'utf8');
    let textCsv = dec.convert(data);

    importInvoiceCsv(req, textCsv);
  } else if(mimetype === 'text/xml') {
    importInvoiceXml(req, data);
  }
}

function importInvoiceCsv(req, data) {
  parseCsv(data, invoices => {
    invoices.forEach(invoice => {
      console.log(invoice);
      importSaveInvoice(req, invoice);
    });
  });
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

function findAccount(cnpjCpf, callback) {
  console.log('findAccount', cnpjCpf);
  Account.find({
    $or: [
      { cnpj: cnpjCpf },
      { cpf: cnpjCpf}
    ]}, '_id nome cnpj telefone').exec()
    .then(callback);
}

function notExistAccount(acc) {
  return acc && acc.length == 0;
}

function createAccount(req, json) {
  let acc = new Account(json);
  acc.criador = req.user._id;
  acc.modificador = req.user._id;
  acc.proprietario = req.user._id;
  return acc;
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

function findDestinatario(req, invoiceJson) {
  let cnpjCpf = invoiceJson.destinatario.cpf ? invoiceJson.destinatario.cpf
    : invoiceJson.destinatario.cnpj;

  findAccount(cnpjCpf, accDest => {
    console.log('accDest', accDest);

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

  if(isProduct(invoice)) {
    let productCodeMap = getProductCodeMap(invoice);

    Product.find({ codigoFornecedor: { $in: [...productCodeMap.keys()] }},
      '_id nome codigoFornecedor')
      .exec()
      .then(produtos => {
        syncProduct(productCodeMap, produtos);

        invoice.save().then(invoiceDb => {
          console.log('Nota fiscal importada com sucesso', invoiceDb.numero);
        });
      });
  } else {
    invoice.save().then(invoiceDb => {
      console.log('Nota fiscal importada com sucesso', invoiceDb.numero);
    });
  }
}

function createInvoice(req, invoiceJson) {
  var invoice = new Invoice(invoiceJson);
  invoice.criador = req.user._id;
  invoice.modificador = req.user._id;
  invoice.proprietario = req.user._id;
  return invoice;
}

function isProduct(invoice) {
  return invoice.produtos && invoice.produtos.length;
}

function syncProduct(mapCodigo, produtos) {
  produtos.forEach(item => {
    item.codigoFornecedor.forEach(cf => {
      let profNf = mapCodigo.get(cf);
      if(profNf) {
        profNf.produto = item._id;
      }
    });
  });
}

function getProductCodeMap(invoice) {
  let mapCodigo = new Map();
  invoice.produtos.forEach(prodNf => {
    mapCodigo.set(prodNf.codigo, prodNf);
  });
  return mapCodigo;
}
