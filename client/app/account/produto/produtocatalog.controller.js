'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');
export default class ProdutoCatalogController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, ProdutoService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.ProdutoService = ProdutoService;
    this.ProdutoService.loadCatalogoList()
    .then(produtos => {
      this.produtos = produtos;
      this.produtos.forEach(item => {
        if(item.precos) {
          item.precos = item.precos[0];
        } else {
          item.precos = 0.0;
        }
      });
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }
}
