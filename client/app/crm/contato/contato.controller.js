/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContatoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, usSpinnerService, ContatoService) {
    super($window, $scope, toastr, usSpinnerService);

    this.ContatoService = ContatoService;
    this.ContatoService.loadContatoList()
    .then(contatos => {
      this.contatos = contatos;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }
}
