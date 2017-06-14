/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContatoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);
    this.contatos = [{ nome: 'Nome' }];
  }
}
