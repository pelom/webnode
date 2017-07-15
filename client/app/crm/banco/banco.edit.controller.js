'use strict';
import moment from 'moment';
import Controller from '../../account/controller';
import {openModalView as openModalAccView} from '../conta/conta.modal.service';

export default class BancoEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    BancoService, ContaService, ContatoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;

    this.ContatoService = ContatoService;
    this.ContaService = ContaService;
    this.BancoService = BancoService;
    this.BancoService.loadDomain().then(domain => {
      this.init();
    });
    this.start = moment().startOf('month')
      .toDate();
    this.end = moment().endOf('month')
      .toDate();
    this.format = 'dd/MM/yyyy';

    this.colors = ['#337ab7', '#a94442', '#000000'];
    this.labels = [];
    this.options = {
      //maintainAspectRatio: false,
    };
    this.data = [[], []];
    this.datasetOverride = [{
      label: 'Saldo',
      borderWidth: 1,
      type: 'bar'
    },
    {
      label: 'Dédito',
      borderWidth: 3,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'line'
    },
    {
      label: 'Crédito',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'line'
    }];
  }

  init() {
    if(this.id) {
      this.BancoService.loadBanco({ id: this.id, start: this.start, end: this.end })
        .then(this.callbackLoadBanco())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.banco = this.createBanco();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadBanco() {
    return banco => {
      this.banco = banco;
      this.totalCredito = 0;
      this.totalDedito = 0;
      this.saldoFinal = 0;
      if(!this.banco.transactions) {
        this.banco.transactions = [];
      } else if(this.banco.transactions.length > 0) {
        this.saldoFinal = this.banco.transactions[0].saldoFinal;
      }

      let mapData = new Map();
      this.banco.transactions.forEach(trans => {
        this.totalDedito += trans.valor < 0 ? trans.valor : 0;
        this.totalCredito += trans.valor > 0 ? trans.valor : 0;
        let key = moment(trans.dataPagamento).format('DD/MM');
        let value = mapData.get(key);
        if(!value) {
          value = [];
          mapData.set(key, value);
        }
        value.push(trans);
      });

      let saldos = [];
      let debitos = [];
      let creditos = [];
      this.labels = [];
      mapData.forEach((value, key) => {
        saldos.push(value[0].saldoFinal.toFixed(2));
        let d = 0;
        let c = 0;
        value.forEach(item => {
          if(item.valor > 0) {
            c += item.valor;
          } else if(item.valor < 0) {
            d += item.valor;
          }
        });
        creditos.push(c.toFixed(2));
        debitos.push(d.toFixed(2));
        this.labels.push(key);
      });
      this.labels.reverse();
      this.data = [
        saldos.reverse(),
        debitos.reverse(),
        creditos.reverse(),
      ];
    };
  }

  createBanco() {
    return {
      nome: '',
      saldoInicial: 0,
    };
  }

  openFindConta() {
    let getParam = () => {
      if(typeof this.banco.account === 'string') {
        return this.banco.account;
      }
      return null;
    };
    let modalCtl = openModalAccView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      this.banco.account = acc;
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search) {
    if(search && search.length == 0) {
      this.banco.account = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          this.banco.account = contas[0];
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  saveBanco(form) {
    if(form.$invalid) {
      return;
    }
    console.log(this.nf);

    this.usSpinnerService.spin('spinner-1');
    this.BancoService.saveBanco(this.banco)
      .then(() => {
        this.toastr.success('Banco salva com sucesso',
        `${this.banco.nome}`);
        this.$state.go('bancos');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  findData() {
    if(this.start && this.end) {
      if(this.start < this.end) {
        this.init();
      }
    }
  }
}
