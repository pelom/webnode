'use strict';

export default class ProdutoCatalogFindModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, ProdutoService) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.usSpinnerService = usSpinnerService;
    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadCatalogoList(ProdutoService.getModalCtl().params)
      .then(produtos => {
        this.produtos = produtos;
        this.produtosAll = produtos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    this.int($scope);
  }

  int($scope) {
    this.produtos = [];
    this.produtosAll = [];
    this.select = -1;
    this.search = '';

    let isToken = () => this.search && this.search.length > 2;
    let findAcc = () => {
      this.ProdutoService.loadCatalogoList({
        searchFull: this.search,
        price: true,
      })
      .then(produtos => {
        this.produtos = produtos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    };

    $scope.$watch('ctl.search', () => {
      this.select = -1;

      if(isToken()) {
        findAcc();
      } else {
        this.produtos = this.produtosAll;
      }
    });
  }

  selectProduct() {
    if(this.select == -1) {
      return;
    }

    let prd = this.produtos[this.select];
    this.toastr.success('Produto selecionada', `${prd.nome}`);
    this.ProdutoService.getModalCtl().onSelectProduct(prd);
  }

  close() {
    this.ProdutoService.getModalCtl().onClose();
  }
}
