'use strict';
import angular from 'angular';
import addZero from 'add-zero';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');
import {openBancoPagamentoModalView} from './banco.modal.service';

export default class BancoPagamentoController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, toastr,
    BancoService, ProdutoService, usSpinnerService, Modal) {
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
    .then(this.callbackTitulos())
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      usSpinnerService.stop('spinner-1');
      this.block = false;
    });

    this.colors = ['#000000', '#a94442', '#337ab7'];
    this.labels = [];
    this.options = {
      title: {
        display: true,
        text: `Contas a ${this.status}`
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          fontColor: 'rgb(255, 99, 132)'
        }
      }
      //maintainAspectRatio: false,
    };
    this.data = [[], []];
    this.datasetOverride = [{
      label: 'Registros',
      borderWidth: 1,
      type: 'bar'
    },
    {
      label: 'Vencidos',
      borderWidth: 1,
      //hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      //hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'bar'
    },
    {
      label: 'Total',
      borderWidth: 1,
      //hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      //hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'bar'
    }];

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
    .then(this.callbackTitulos())
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
    .then(this.callbackTitulos())
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
      this.block = false;
    });
  }

  callbackTitulos() {
    return titulos => {
      this.pagamentos = titulos;
      this.valorVencido = 0;
      this.valorTotal = 0;

      let mapData = new Map();
      this.pagamentos.forEach(tit => {
        console.log(tit.pagamento.dataVencimento);
        let vencimento = moment(tit.pagamento.dataVencimento).toDate();
        let now = moment().toDate();
        if(vencimento < now) {
          this.valorVencido += tit.pagamento.valor;
          tit.vencido = true;
        }
        this.valorTotal += tit.pagamento.valor;

        let key = moment(tit.pagamento.dataVencimento).format('MMMM YYYY');
        let value = mapData.get(key);
        if(!value) {
          value = [];
          mapData.set(key, value);
        }
        value.push(tit.pagamento);
      });
      console.log(mapData);

      let registros = [];
      let total = [];
      let vencidos = [];
      this.labels = [];
      mapData.forEach((value, key) => {
        let venc = 0;
        let tot = 0;
        value.forEach(tit => {
          let vencimento = moment(tit.dataVencimento).toDate();
          let now = moment().toDate();
          if(vencimento < now) {
            venc += tit.valor;
          }
          tot += tit.valor;
        });
        registros.push(value.length);
        vencidos.push(venc.toFixed(2));
        total.push(tot.toFixed(2));
        this.labels.push(key);
      });
      this.labels.reverse();
      this.data = [
        registros.reverse(),
        vencidos.reverse(),
        total.reverse(),
      ];
    };
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
