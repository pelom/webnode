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
      this.calc();
    }
  }

  isSubProduct() {
    return this.catalogo.subproduto && this.catalogo.subproduto.length > 0;
  }

  calcCustoSubproduto() {
    this.catalogo.custoItens = 0;
    this.catalogo.vendaItens = 0;
    this.catalogo.quantidade = 0;
    this.catalogo.indices = [];

    this.catalogo.subproduto.forEach(item => {
      item.produto.unidade = item.produto.unidade.split('-')[0].trim();

      if(item.unidade) {
        item.unidade = item.unidade.split('-')[0].trim();
      }

      if(this.isProductPrice(item.produto)) {
        let lastPrice = item.produto.precos[0];
        item.valor = lastPrice.valor;
        item.valorTotal = item.quantidade * lastPrice.valor;

        item.custo = lastPrice.custo;
        item.custoTotal = item.quantidade * lastPrice.custo;

        this.catalogo.custoItens += item.custoTotal;
        this.catalogo.vendaItens += item.valorTotal;
      }

      if(this.isIndice(item.produto)) {
        if(item.valor) {
          item.quantidade = item.valor;
        }
        if(item.quantidade) {
          this.catalogo.quantidade += item.quantidade;
        }
        this.catalogo.indices.push(item);
      }
    });
  }

  isProductPrice(produto) {
    return produto.precos && produto.precos.length > 0;
  }

  isIndice(produto) {
    return produto.unidade === '%';
  }

  calcMarkup() {
    let markup = 1.0000;
    this.catalogo.indices.forEach(ind => {
      markup -= ind.quantidade / 100;
    });
    return 1.0000 / markup;
  }

  calc() {
    this.catalogo.valorFinal = this.catalogo.custo * this.catalogo.markup;

    this.catalogo.indiceTotal = 0;
    this.catalogo.indices.forEach(ind => {
      ind.valor = this.catalogo.valorFinal * ind.quantidade / 100;
      this.catalogo.indiceTotal += ind.valor;
    });
  }

  saveCatalogo(form) {
    if(form.$invalid) {
      return;
    }

    if(this.catalogo.valor <= 0) {
      this.toastr.error('Valor inválido', 'O valor deve ser maior que 0');
    }

    this.usSpinnerService.spin('spinner-1');
    this.ProdutoService.addPrice({
      _id: this.catalogo._id,
      produto: 'produto',
      custo: this.catalogo.custo,
      valor: this.catalogo.valor,
      descricao: this.catalogo.descricaoPreco
    })
    .then(result => {
      this.ProdutoService.getModalCtl().onSaveCatalogo(result);
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  close() {
    this.ProdutoService.getModalCtl().onClose();
  }
}
