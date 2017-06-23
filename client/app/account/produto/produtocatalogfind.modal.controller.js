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
    this.search = '';

    let isToken = () => this.search && this.search.length > 2;
    let findCatalog = () => {
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
      if(isToken()) {
        findCatalog();
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
