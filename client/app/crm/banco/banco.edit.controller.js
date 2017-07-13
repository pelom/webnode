'use strict';
import angular from 'angular';
import addZero from 'add-zero';
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
  }

  init() {
    if(this.id) {
      // this.BancoService.operation({
      //   _id: this.id,
      //   valor: 1000,
      //   dataPagamento: new Date(),
      //   titulo: 'debito test',
      // }).then(operation => {
      //   console.log('operation:', operation);
      // });
      this.BancoService.loadBanco({ id: this.id })
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
}
