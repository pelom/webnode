/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import Controller from '../controller';
import {openModalView} from '../conta/conta.modal.service';
import moment from 'moment';
moment.locale('pt-br');

export default class ContatoEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $state, $timeout, $stateParams,
    toastr, usSpinnerService, EventoService, ContaService, ContatoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);
    this.id = $stateParams.id;
    this.$timeout = $timeout;
    this.$state = $state;
    this.Modal = Modal;
    this.EventoService = EventoService;
    this.ContaService = ContaService;
    this.ContatoService = ContatoService;
    this.ContatoService.loadDomain().then(domain => {
      this.origem = domain.origem;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    if(this.id) {
      this.ContatoService.loadContato({ id: this.id })
        .then(this.callbackLoadContato())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.contato = this.createContato();
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  callbackLoadContato() {
    return contato => {
      this.contato = contato;
      this.loadAtividades();
    };
  }

  loadAtividades() {
    this.EventoService.loadEventoList({ idref: this.contato._id })
    .then(eventos => {
      this.contato.atividades = eventos;
    });
  }

  createContato() {
    return {
      nome: '',
      sobrenome: '',
      isAtivo: true
    };
  }

  openFindConta() {
    let getParam = () => {
      if(typeof this.contato.conta === 'string') {
        return this.contato.conta;
      }
      return null;
    };
    let modalCtl = openModalView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      console.log('onSelectAcc()', acc);
      this.contato.conta = acc;
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search) {
    if(search && search.length == 0) {
      this.contato.conta = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          this.contato.conta = contas[0];
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  save(form) {
    if(form.$invalid) {
      return;
    }
    console.log(this.contato);
    this.usSpinnerService.spin('spinner-1');
    this.ContatoService.saveContato(this.contato)
      .then(() => {
        this.toastr.success('Contato salva com sucesso',
        `${this.contato.nome} ${this.contato.sobrenome}`);
        this.$state.go('contatos');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  createEventReference(type, subject, status, data) {
    let name = `Contato (${this.contato.nome} ${this.contato.sobrenome})`;
    let references = [this.createReferenceContato(name)];
    if(this.contato.conta) {
      references.push(this.createReferenceConta(this.contato.conta));
    }
    return {
      title: name,
      type,
      subject,
      start: data,
      status,
      prioridade: 'Normal',
      references,
    };
  }

  createReferenceContato(name) {
    return {
      name,
      description: this.contato.descricao ? `${this.contato.descricao}` : '',
      link: `/contatos/edit/${this.contato._id}`,
      objectId: `${this.contato._id}`,
      object: 'Contact'
    };
  }

  createReferenceConta(acc) {
    let name = `Conta (${acc.nome})`;
    return {
      name,
      description: acc.descricao ? `${acc.descricao}` : '',
      link: `/contas/edit/${acc._id}`,
      objectId: `${acc._id}`,
      object: 'Account'
    };
  }
}
