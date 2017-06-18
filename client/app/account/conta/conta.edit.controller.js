/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import {openModalView} from '../contato/contato.modal.service';
import Controller from '../controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContaEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $state, $timeout, $stateParams,
    toastr, usSpinnerService, ContaService, ContatoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);
    this.id = $stateParams.id;
    this.$timeout = $timeout;
    this.$state = $state;
    this.Modal = Modal;
    this.ContatoService = ContatoService;
    this.ContaService = ContaService;
    this.ContaService.loadDomain().then(domain => {
      this.origem = domain.origem;
      this.setor = domain.setor;
      this.setor.sort();
      this.init();
    });
  }

  init() {
    if(this.id) {
      this.ContaService.loadConta({ id: this.id })
        .then(this.callbackLoadConta());
        // .finally(() => {
        //   this.usSpinnerService.stop('spinner-1');
        // });
    } else {
      this.conta = this.createConta();
      this.setMask();
      this.updateMask();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadConta() {
    return conta => {
      this.conta = conta;
      this.setMask();
      this.updateMask();

      this.ContatoService.loadContatoList({
        conta: this.conta._id
      }).then(contatos => {
        this.conta.contatos = contatos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    };
  }

  createConta() {
    return {
      nome: '',
      iden: 'cpf',
      isAtivo: true
    };
  }

  setMask() {
    this.conta.iden = 'cpf';
    if(this.conta.cpf) {
      this.conta.numIden = this.conta.cpf;
    } else if(this.conta.cnpj) {
      this.conta.iden = 'cnpj';
      this.conta.numIden = this.conta.cnpj;
    }
  }

  updateMask() {
    if(this.conta.iden == 'cpf') {
      this.mask = '999.999.999-99';
    } else if(this.conta.iden == 'cnpj') {
      this.mask = '99.999.999.9999-99';
    }
  }

  setCfpCnpj() {
    if(this.conta.iden == 'cpf') {
      this.conta.cpf = this.conta.numIden;
    } else if(this.conta.iden == 'cnpj') {
      this.conta.cnpj = this.conta.numIden;
    }
  }

  save(form) {
    if(form.$invalid) {
      return;
    }
    console.log(form);

    this.setCfpCnpj();
    this.usSpinnerService.spin('spinner-1');
    this.ContaService.saveConta(this.conta)
      .then(() => {
        this.toastr.success('Conta salva com sucesso',
        `${this.conta.nome}`);
        this.$state.go('contas');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  newContact() {
    let contato = {
      nome: '',
      sobrenome: '',
      conta: {
        _id: this.conta._id,
        nome: this.conta.nome,
      }
    };
    let modalCtl = openModalView(contato, this.Modal);
    modalCtl.onSaveEvent = ev => {
      console.log('onSaveEvent()', ev);
      modalCtl.dismiss();
      this.init();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContatoService.setModalCtl(modalCtl);
  }
}
