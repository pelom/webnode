'use strict';
import angular from 'angular';
import addZero from 'add-zero';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
import {openBancoPagamentoModalView} from './banco.modal.service';

export default class BancoPagamentoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr, BancoService, usSpinnerService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.dataInicio = moment().startOf('month')
      .toDate();
    this.dataFim = moment().endOf('month')
      .toDate();
    this.Modal = Modal;
    this.format = 'dd/MM/yyyy';
    this.status = 'pagar';
    this.block = true;
    this.BancoService = BancoService;
    this.BancoService.accountPayable({
      start: this.dataInicio,
      end: this.dataFim,
    })
    .then(contas => {
      this.pagamentos = contas;
      this.block = false;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
    });

    // $scope.$watch('ctl.dataInicio', () => {
    //   this.findData();
    // });
    // $scope.$watch('ctl.dataFim', () => {
    //   this.findData();
    // });
  }

  findData() {
    if(this.block) {
      return;
    }
    if(this.dataInicio && this.dataFim) {
      if(this.dataInicio < this.dataFim) {
        if(this.status === 'pagar') {
          this.findContaPagar();
        } else if(this.status === 'receber') {
          this.findContaReceber();
        }
      }
    }
  }

  findContaPagar() {
    this.status = 'pagar';
    this.usSpinnerService.spin('spinner-1');
    this.block = true;
    this.BancoService.accountPayable({
      start: this.dataInicio,
      end: this.dataFim,
    })
    .then(contas => {
      console.log(contas);
      this.pagamentos = contas;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
      this.block = false;
    });
  }

  findContaReceber() {
    this.status = 'receber';
    this.usSpinnerService.spin('spinner-1');
    this.block = true;
    this.BancoService.accountReceivable({
      start: this.dataInicio,
      end: this.dataFim,
    })
    .then(contas => {
      console.log(contas);
      this.pagamentos = contas;
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
      this.block = false;
    });
  }

  isActive(status) {
    return status === this.status;
  }

  openPayment(pagamento) {
    let modalCtl = openBancoPagamentoModalView(this.Modal, {
      pagamento
    });
    modalCtl.setPagamento = () => {
      this.findData();
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.BancoService.setModalCtl(modalCtl);
  }
}
