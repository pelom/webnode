'use strict';

import OpportunityEvents from './opportunity.events';

import Budget from '../budget/budget.model';
import Invoice from '../invoice/invoice.model';
import Opportunity from './opportunity.model';

export function register() {
  console.log('register');

  OpportunityEvents.on('save', createListenerSave('product:save'));
  OpportunityEvents.on('findOneAndUpdate', createListenerSave('product:findOneAndUpdate'));
  //OpportunityEvents.on('remove', createListenerRemove('product:remove'));
}

const selectBudget = 'numero itens valorTotal valorVenda desconto';
const populationProduto = {
  path: 'itens.produto',
  select: '_id nome unidade'
};

function createListenerSave(event) {
  return function(doc) {
    console.log(event, doc._id);
    Opportunity.findById(doc._id)
      .exec()
      .then(opp => {
        console.log('Opp:', opp);
        if(isValidFaturamento(opp)) {
          Invoice.find({ oportunidade: opp._id })
            .exec()
            .then(invoices => {
              if(invoices.length == 0) {
                Budget.findById(opp.orcamento)
                .select(selectBudget)
                .populate([populationProduto])
                .exec()
                .then(budget => {
                  let invoiceJ = createInvoice(opp, budget);
                  let invoiceNew = new Invoice(invoiceJ);
                  invoiceNew.save().then(invoice => {
                    console.log('Nota fiscal criada com sucesso', invoice);
                  });
                });
              }
            });
        }
      });
  };
}

function isValidFaturamento(opp) {
  if(!isFaturamento(opp)) {
    return false;
  }
  if(!opp.dataFechamento) {
    return false;
  }
  if(!opp.conta) {
    return false;
  }
  if(!opp.contaProprietaria) {
    return false;
  }
  if(!opp.orcamento) {
    return false;
  }
  if(opp.valor <= 0) {
    return false;
  }
  return true;
}

function isFaturamento(opp) {
  return opp.fase === 'Faturamento';
}

function createInvoice(doc, budget) {
  let invoiceJ = {
    titulo: `${doc.fase} ${doc.nome}`,
    emitente: doc.contaProprietaria,
    destinatario: doc.conta,
    numero: budget.numero,
    dataEmissao: new Date(),
    dataVencimento: doc.dataFechamento,
    valorVenda: budget.valorVenda,
    valorTotal: budget.valorTotal,
    desconto: budget.desconto,
    status: 'Pendente',
    criador: doc.modificador,
    modificador: doc.modificador,
    proprietario: doc.modificador,
    oportunidade: doc._id,
  };
  if(budget.desconto > 0) {
    invoiceJ.valorDesconto = budget.valorVenda * budget.desconto;
  }
  invoiceJ.produtos = createProduct(budget);
  return invoiceJ;
}

function createProduct(budget) {
  let produtos = [];
  budget.itens.forEach(item => {
    produtos.push({
      codigo: item.produto.codigo,
      produto: item.produto,
      nome: item.produto.nome,
      quantidade: item.quantidade,
      valor: item.valor,
      valorTotal: item.valorTotal,
      unidade: item.produto.unidade.split(' ')[0],
    });
  });
  return produtos;
}
