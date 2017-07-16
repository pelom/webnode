'use strict';
import angular from 'angular';
import addZero from 'add-zero';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
export default class BancoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, BancoService, usSpinnerService) {
    super($window, $scope, toastr, usSpinnerService);

    this.BancoService = BancoService;
    this.BancoService.loadBancoList()
    .then(bancos => {
      this.bancos = bancos;
      this.bancos.forEach(ban => {
        ban.saldo = ban.transactions[0].saldoFinal;
      });
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });
    //
    // $scope.$watch('ctl.buffer', () => {
    // });
  }

  findBancos() {
    this.usSpinnerService.spin('spinner-1');
    this.BancoService.loadBancoList()
    .then(bancos => {
      this.bancos = bancos;
      this.bancos.forEach(ban => {
        ban.saldo = ban.transactions[0].saldoFinal;
      });
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  isActive(status) {
    return status === this.status;
  }
}
