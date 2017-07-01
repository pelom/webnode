'use strict';

//import PDFDocument from 'pdfkit';
import wkhtmltopdf from 'wkhtmltopdf';
import moment from 'moment';
import addZero from 'add-zero';
//import fs from 'fs';
import ProductPriceHtmlTemplate from '../html-template/product.price.html';
import BrM from 'br-masks';

export default function ProductPdf() {
  wkhtmltopdf.command = '/home/andreleite/Downloads/wkhtmltox/bin/wkhtmltopdf';
  let productPdf = {
    generateProductPricePdf
  };
  return productPdf;
}

function generateProductPricePdf(user, product, res) {
  console.log('generateProductPricePdf()', product);
  try {
    let itensOrc = [];
    /*budget.itens.forEach(item => {
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
    */
    let data = moment().local()
      .format('DD/MM/YYYY HH:mm');

    let budgetHtml = new ProductPriceHtmlTemplate(user, budget);
    budgetHtml.data.budget = budget;

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

function formatEventDate(data, format) {
  return moment(data).tz('America/Sao_Paulo')
    .format(format);
}
