'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
export default class ProdutoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, ProdutoService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.filterAz = 'A B C D E F G H I J K L M N O P Q R S T U V X Z W Y'.split(' ');
    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadDomain().then(domain => {
      this.categorias = domain.categorias;
      this.init();
    });
    this.managerChange($scope);
  }

  init() {
    this.ProdutoService.loadProdutoList()
    .then(produtos => {
      this.produtos = produtos;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  managerChange($scope) {
    $scope.$watch('ctl.selectCat', () => {
      this.filterProduto('');
    });
  }

  filterProduto(search) {
    this.usSpinnerService.spin('spinner-1');
    this.ProdutoService.loadProdutoList({ search, categoria: this.selectCat })
    .then(produtos => {
      this.produtos = produtos;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }
}
