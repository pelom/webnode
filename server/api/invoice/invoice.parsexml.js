'use strict';
/* eslint no-sync: 0 */
import XmlReader from 'xml-reader';
import xmlQuery from 'xml-query';

const mapProductFields = new Map();
mapProductFields.set('cProd', 'codigo');
mapProductFields.set('xProd', 'nome');
mapProductFields.set('NCM', 'ncm');
mapProductFields.set('uCom', 'unidade');
mapProductFields.set('qCom', 'quantidade');
mapProductFields.set('vUnCom', 'valor');
mapProductFields.set('vProd', 'valorTotal');

const mapResultoFields = new Map();
mapResultoFields.set('vProd', 'valorVenda');
mapResultoFields.set('vDesc', 'valorDesconto');
mapResultoFields.set('vNF', 'valorTotal');
mapResultoFields.set('vFrete', 'valorFrete');
mapResultoFields.set('vSeg', 'valorSeguro');
mapResultoFields.set('vOutro', 'valorOutro');
mapResultoFields.set('vICMS', 'valorIcms');
mapResultoFields.set('vPIS', 'valorPis');
mapResultoFields.set('vIPI', 'valorIpi');
mapResultoFields.set('vCOFINS', 'ValorCofins');

export function parseXml(invoiceXml) {
  const ast = XmlReader.parseSync(invoiceXml);
  const xq = xmlQuery(ast);

  let invoice = createNotaFiscal(xq);
  invoice.emitente = createEmitente(xq);
  invoice.destinatario = createDestinatario(xq);
  invoice.produtos = createProdutos(xq);
  return invoice;
}

function createNotaFiscal(xQuery) {
  let ide = xQuery.find('ide');

  let invoice = {
    tipoNota: 'NFe',
    status: 'Pendente',
    numero: ide.find('nNF').text(),
    dataEmissao: new Date(ide.find('dhEmi').text()),
    serie: ide.find('serie').text(),
    chave: xQuery.find('infNFe').attr('Id'),
    descricao: xQuery.find('infCpl').text(),
  };
  console.log(invoice);
  let tot = xQuery.find('total').find('ICMSTot');
  for(var i = 0; i < tot.length; i++) {
    tot.get(i).children.forEach(field => {
      let key = mapResultoFields.get(field.name);
      if(key) {
        invoice[key] = Number(field.children[0].value);
      }
    });
  }
  console.log(invoice);
  return invoice;
}

function createEmitente(xQuery) {
  let enderEmit = 'enderEmit';
  let emit = xQuery.find('emit');
  return {
    cnpj: emit.find('CNPJ').text(),
    cpf: emit.find('CPF').text(),
    nome: emit.find('xNome').text(),
    email: emit.find('email').text(),
    telefone: emit.find(enderEmit).find('fone')
      .text(),
    endereco: {
      address: emit.find(enderEmit).find('xLgr')
        .text(),
      number: emit.find(enderEmit).find('nro')
        .text(),
      complement: emit.find(enderEmit).find('xCpl')
        .text(),
      suburb: emit.find(enderEmit).find('xBairro')
        .text(),
      city: emit.find(enderEmit).find('xMun')
        .text(),
      state: emit.find(enderEmit).find('UF')
        .text(),
      zipcode: emit.find(enderEmit).find('CEP')
        .text(),
      country: emit.find(enderEmit).find('xPais')
        .text(),
    },
  };
}

function createDestinatario(xQuery) {
  let enderDest = 'enderDest';
  let dest = xQuery.find('dest');
  return {
    cnpj: dest.find('CNPJ').text(),
    cpf: dest.find('CPF').text(),
    nome: dest.find('xNome').text(),
    email: dest.find('email').text(),
    telefone: dest.find(enderDest).find('fone')
      .text(),
    endereco: {
      address: dest.find(enderDest).find('xLgr')
        .text(),
      number: dest.find(enderDest).find('nro')
        .text(),
      complement: dest.find(enderDest).find('xCpl')
        .text(),
      suburb: dest.find(enderDest).find('xBairro')
        .text(),
      city: dest.find(enderDest).find('xMun')
        .text(),
      state: dest.find(enderDest).find('UF')
        .text(),
      zipcode: dest.find(enderDest).find('CEP')
        .text(),
      country: dest.find(enderDest).find('xPais')
        .text(),
    },
  };
}

function createProdutos(xQuery) {
  let produtos = [];
  let prods = xQuery.find('det').find('prod');
  for(var i = 0; i < prods.length; i++) {
    let produto = {};
    prods.get(i).children.forEach(field => {
      let key = mapProductFields.get(field.name);
      if(key) {
        produto[key] = field.children[0].value;
      }
    });
    produtos.push(produto);
  }
  return produtos;
}

// function createImpostos(xQuery) {
//   let impostos = [];
//   let impo = xQuery.find('total').find('ICMSTot');
//   for(var i = 0; i < impo.length; i++) {
//     impo.get(i).children.forEach(field => {
//       console.log('Item', field.name);
//       let key = mapImpostoFields.get(field.name);
//       console.log('Key', key);
//       if(key) {
//         let produto = {
//           nome: key,
//           valor: Number(field.children[0].value)
//         };
//         impostos.push(produto);
//       }
//     });
//   }
//   return impostos;
// }
