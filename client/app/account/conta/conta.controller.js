/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContaController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, usSpinnerService, ContaService) {
    super($window, $scope, toastr, usSpinnerService);

    this.pessoaFisica = [];
    this.pessoaJuridica = [];
    this.status = '';
    this.ContaService = ContaService;
    this.ContaService.loadContaList()
    .then(contas => {
      this.contas = contas;
      this.configAcc();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
  }

  findContas(type) {
    this.status = type;
    this.usSpinnerService.spin('spinner-1');
    this.ContaService.loadContaList({
      type,
    })
    .then(contas => {
      this.contas = contas;
      this.configAcc();
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  configAcc() {
    this.pessoaFisica = [];
    this.pessoaJuridica = [];
    this.contas.forEach(acc => {
      if(acc.cpf) {
        this.pessoaFisica.push(acc);
      }

      if(acc.cnpj) {
        this.pessoaJuridica.push(acc);
      }
    });
  }

  isActive(status) {
    return status === this.status;
  }
}
