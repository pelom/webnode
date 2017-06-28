'use strict';

export default class ProdutoFindModalController {
  /*@ngInject*/
  constructor($state, $scope, toastr, usSpinnerService, Auth, ProdutoService) {
    this.Auth = Auth;
    this.toastr = toastr;
    this.$state = $state;
    this.usSpinnerService = usSpinnerService;
    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadProdutoList(ProdutoService.getModalCtl().params)
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
      this.ProdutoService.loadProdutoList({
        search: this.search
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
    let selectList = this.getSelect();
    if(selectList.length == 0) {
      return;
    }

    this.toastr.success('Produto selecionado', `Total de ${selectList.length} produtos`);
    this.ProdutoService.getModalCtl().onSelectProduct(selectList);
  }

  isSelect() {
    return this.getSelect().length != 0;
  }
  getSelect() {
    return this.produtos.filter(item => item.check === true);
  }

  close() {
    this.ProdutoService.getModalCtl().onClose();
  }
}
