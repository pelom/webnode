'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');
export default class ProdutoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, ProdutoService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadProdutoList()
    .then(produtos => {
      this.produtos = produtos;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }
}
