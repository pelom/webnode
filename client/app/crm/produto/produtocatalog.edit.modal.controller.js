'use strict';
export default class ProdutoCatalogEditModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, ProdutoService, Modal) {
    this.toastr = toastr;
    this.$state = $state;
    this.Modal = Modal;
    this.usSpinnerService = usSpinnerService;
    this.ProdutoService = ProdutoService;
    this.init();
  }

  init() {
    console.log('init()');
    this.catalogo = this.ProdutoService.getModalCtl().params;
    if(this.isSubProduct()) {
      this.calcCustoSubproduto();
      this.catalogo.markup = this.calcMarkup();

      console.log(this.catalogo.markup);
      this.calc();
    }
    console.log(this.ProdutoService.getModalCtl().params);
  }

  isSubProduct() {
    return this.catalogo.subproduto && this.catalogo.subproduto.length > 0;
  }

  calcMarkup() {
    console.log('Markup', this.catalogo.indices);
    let markup = 1.000;
    this.catalogo.indices.forEach(ind => {
      console.log(ind.produto.nome, ind.quantidade / 100);
      markup -= ind.quantidade / 100;
    });
    return 1.000 / markup;
  }

  calcCustoSubproduto() {
    this.catalogo.custo = 0;
    this.catalogo.indices = [];

    this.catalogo.subproduto.forEach(item => {
      item.produto.unidade = item.produto.unidade.split('-')[0].trim();

      if(item.produto.precos && item.produto.precos.length > 0) {
        item.valor = item.produto.precos[0].valor;
        item.valorTotal = item.quantidade * item.valor;
        this.catalogo.custo += item.valorTotal;
      }

      if(item.produto.unidade === '%') {
        this.catalogo.indices.push(item);
      }
    });
  }

  calc() {
    this.catalogo.valorFinal = this.catalogo.custo * this.catalogo.markup;

    this.catalogo.indiceTotal = 0;
    this.catalogo.indices.forEach(ind => {
      ind.valor = this.catalogo.valorFinal * ind.quantidade / 100;
      this.catalogo.indiceTotal += ind.valor;
    });
    this.catalogo.diff = this.catalogo.valorFinal - this.catalogo.indiceTotal;
  }
  saveCatalogo(form) {
    if(form.$invalid) {
      return;
    }

    if(this.catalogo.valor <= 0) {
      this.toastr.error('Valor inválido', 'O valor deve ser maior que 0');
    }

    this.ProdutoService.addPrice({
      _id: this.catalogo._id,
      produto: 'produto',
      valor: this.catalogo.valor,
      descricao: this.catalogo.descricaoPreco
    })
      .then(result => {
        this.ProdutoService.getModalCtl().onSaveCatalogo(result);
      });
  }

  close() {
    this.ProdutoService.getModalCtl().onClose();
  }
}
