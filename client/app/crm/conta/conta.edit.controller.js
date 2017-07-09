/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import {openModalView} from '../contato/contato.modal.service';
import {openModalView as openContaPaiModalView} from './conta.modal.service';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');

export default class ContaEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $state, $timeout, $stateParams, toastr,
    usSpinnerService, EventoService, ContaService, ContatoService,
    OportunidadeService, Modal) {
    super($window, $scope, toastr, usSpinnerService, Modal);
    this.id = $stateParams.id;
    this.$timeout = $timeout;
    this.$state = $state;
    this.Modal = Modal;

    this.OportunidadeService = OportunidadeService;
    this.EventoService = EventoService;
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
      this.loadAtividades();

      this.ContatoService.loadContatoList({
        conta: this.conta._id
      }).then(contatos => {
        this.conta.contatos = contatos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });

      this.OportunidadeService.loadOportunidadeList({
        conta: this.conta._id
      }).then(opps => {
        this.conta.opps = opps;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    };
  }

  loadAtividades() {
    this.EventoService.loadEventoList({ idref: this.conta._id })
    .then(eventos => {
      this.conta.atividades = eventos;
    });
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
    this.openModalContact(contato);
  }

  openModalContact(contato) {
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

  openContact(contactId) {
    this.usSpinnerService.spin('spinner-1');
    this.ContatoService.loadContato({id: contactId })
      .then(contact => {
        this.openModalContact(contact);
      })
      .catch(err => {
        console.log('Ex:', err);
        this.toastr.error(err.data.message, err.data.name);
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  createEventReference(type, subject, status, data) {
    let name = `Conta (${this.conta.nome})`;
    return {
      title: name,
      type,
      subject,
      start: data,
      status,
      prioridade: 'Normal',
      references: [this.createReferenceConta(name)]
    };
  }

  createReferenceConta(name) {
    return {
      name,
      description: this.conta.descricao ? `${this.conta.descricao}` : '',
      link: `/contas/edit/${this.conta._id}`,
      objectId: `${this.conta._id}`,
      object: 'Account'
    };
  }

  openFindConta() {
    let getParam = () => {
      if(typeof this.conta.contaPai === 'string') {
        return this.conta.contaPai;
      }
      return null;
    };
    let modalCtl = openContaPaiModalView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      this.conta.contaPai = acc;

      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search) {
    if(search && search.length == 0) {
      this.conta.contaPai = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          this.conta.contaPai = contas[0];
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }
}
