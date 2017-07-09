'use strict';

//import PDFDocument from 'pdfkit';
import wkhtmltopdf from 'wkhtmltopdf';
import moment from 'moment';
import addZero from 'add-zero';
//import fs from 'fs';
import BudgetHtmlTemplate from '../html-template/budget';
import BrM from 'br-masks';

export default function BudgetPdf() {
  wkhtmltopdf.command = '/home/andreleite/Downloads/wkhtmltox/bin/wkhtmltopdf';
  let budgetPdf = {
    generateBudgetPdf
  };
  return budgetPdf;
}

function generateBudgetPdf(user, budget, acc, res) {
  console.log('generateBudgetPdf()', budget);
  try {
    let itensOrc = formatItem(budget);
    let data = moment().local()
      .format('DD/MM/YYYY HH:mm');

    let budgetHtml = new BudgetHtmlTemplate(`${acc.nome}`, budget);
    budgetHtml.data.budget = budget;
    budgetHtml.data.itens = itensOrc;

    setValues(budget, budgetHtml);
    setPreparado(user, budgetHtml);
    setContato(budget, budgetHtml);
    setConta(budget, budgetHtml);

    budgetHtml.data.dataValidade = budget.dataValidade ?
      formatEventDate(budget.dataValidade, 'DD/MM/YYYY') : '';
    budgetHtml.data.pagamento = budget.pagamento ? budget.pagamento : '';
    budgetHtml.data.parcela = budget.parcela ? budget.parcela : '';
    budgetHtml.data.numero = budget.numero ? addZero(budget.numero, 8) : '';

    setSubHeader(acc, budgetHtml);

    let html = budgetHtml.bindDataHtml();
    wkhtmltopdf(html, {
      'footer-left': `${data} por ${user.nome} ${user.sobrenome}`,
      /*'header-font-size': 8,*/
      'footer-spacing': 4,
      'footer-center': `${budgetHtml.data.copymark}`,
      'footer-right': 'Página [page] de [toPage]',
      'footer-font-size': 8
    }).pipe(res);
  } catch(err) {
    console.log(err);
  }
}

function formatItem(budget) {
  let itensOrc = [];
  budget.itens.forEach(item => {
    itensOrc.push({
      nome: item.produto.nome,
      medida: item.produto.unidade.split('-')[1].trim(),
      quantidade: BrM.finance(item.quantidade),
      desconto: `${(item.desconto * 100).toFixed(1)} %`,
      valor: `R$ ${BrM.finance(item.valor, 2, ',', '.')}`,
      valorTotal: `R$ ${BrM.finance(item.valorTotal, 2, ',', '.')}`,
    });
    item.valorText = BrM.finance(item.valor);
    item.valorTotalText = `${BrM.finance(item.valorTotal)}`;
  });
  return itensOrc;
}

function setValues(budget, budgetHtml) {
  budgetHtml.data.valor = `R$ ${BrM.finance(budget.valorVenda, 2, ',', '.')}`;
  budgetHtml.data.desconto = `${(budget.desconto * 100).toFixed(1)} %`;
  budgetHtml.data.valorTotal = `R$ ${BrM.finance(budget.valorTotal, 2, ',', '.')}`;
}

function setPreparado(user, budgetHtml) {
  budgetHtml.data.preparado = `${user.nome} ${user.sobrenome}`;
  budgetHtml.data.preparadoTelefone = user.celular ? BrM.phone(`${user.celular}`)
    : BrM.phone(`${user.telefone}`);
  budgetHtml.data.preparadoEmail = `${user.email}`;
}

function setContato(budget, budgetHtml) {
  budgetHtml.data.contato = '';
  budgetHtml.data.contatoTelefone = '';
  budgetHtml.data.contatoEmail = '';

  if(budget.contato) {
    budgetHtml.data.contato = `${budget.contato.nome} ${budget.contato.sobrenome}`;

    if(budget.contato.celular) {
      budgetHtml.data.contatoTelefone = BrM.phone(`${budget.contato.celular}`);
    } else if(budget.contato.telefone) {
      budgetHtml.data.contatoTelefone = BrM.phone(`${budget.contato.telefone}`);
    }

    if(budget.contato.email) {
      budgetHtml.data.contatoEmail = `${budget.contato.email}`;
    }
  }
}

function setConta(budget, budgetHtml) {
  budgetHtml.data.conta = '';
  budgetHtml.data.contaendereco = '';
  if(budget.conta) {
    budgetHtml.data.conta = `${budget.conta.nome}`;
    if(budget.conta.endereco) {
      budgetHtml.data.contaendereco = `${budget.conta.endereco.address},`
        + ` ${budget.conta.endereco.number} ${budget.conta.endereco.suburb}`
        + ` ${budget.conta.endereco.zipcode} ${budget.conta.endereco.city} /`
        + ` ${budget.conta.endereco.state}`;
    }
  }
}

function setSubHeader(acc, budgetHtml) {
  budgetHtml.data.headerSubtitle = '';
  if(!acc.endereco) {
    return;
  }
  budgetHtml.data.headerSubtitle = `${acc.endereco.address},`
    + ` ${acc.endereco.number} ${acc.endereco.suburb}`
    + ` ${acc.endereco.zipcode} ${acc.endereco.city} / ${acc.endereco.state} -`
    + ` ${acc.telefone} - ` + BrM.cnpj(acc.cnpj);
}

function formatEventDate(data, format) {
  return moment(data).tz('America/Sao_Paulo')
    .format(format);
}
