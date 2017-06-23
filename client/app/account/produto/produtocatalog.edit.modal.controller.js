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
    this.catalogo = this.ProdutoService.getModalCtl().params;
    if(this.catalogo.subproduto && this.catalogo.subproduto.length > 0) {
      this.catalogo.custo = 0;
      this.catalogo.subproduto.forEach(item => {
        if(item.produto.precos && item.produto.precos.length > 0) {
          item.valor = item.produto.precos[0].valor;
          item.valorTotal = item.quantidade * item.valor;
          this.catalogo.custo += item.valorTotal;
        }
      });
    }
    console.log(this.ProdutoService.getModalCtl().params);
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
      valor: this.catalogo.valor
    })
      .then(result => {
        this.ProdutoService.getModalCtl().onSaveCatalogo(result);
      });
  }

  close() {
    this.ProdutoService.getModalCtl().onClose();
  }
}
