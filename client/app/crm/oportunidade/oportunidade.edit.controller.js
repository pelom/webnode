'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import {openModalView} from '../conta/conta.modal.service';
import addZero from 'add-zero';
import moment from 'moment';
export default class OportunidadeEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    OrcamentoService, ContaService, ContatoService, OportunidadeService,
    EventoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
    this.accId = $stateParams.accId;

    this.$state = $state;
    this.$timeout = $timeout;
    this.Modal = Modal;

    this.EventoService = EventoService;
    this.OrcamentoService = OrcamentoService;
    this.ContaService = ContaService;
    this.ContatoService = ContatoService;
    this.OportunidadeService = OportunidadeService;
    this.OportunidadeService.loadDomain().then(domain => {
      this.fase = domain.fase;
      this.origem = domain.origem;
      this.init();
    });
  }

  init() {
    this.format = 'dd/MM/yyyy';
    if(this.id) {
      this.OportunidadeService.loadOportunidade({ id: this.id })
        .then(this.callbackLoadOportunidade())
        .finally(() => {
          this.usSpinnerService.stop('spinner-1');
        });
    } else {
      this.opp = this.createOportunidade();

      if(this.accId) {
        this.ContaService.loadConta({ id: this.accId})
          .then(acc => {
            this.opp.conta = acc;
            this.opp.nome = `${acc.nome}`;
          });
      }
      this.$timeout(() => {
        this.usSpinnerService.stop('spinner-1');
      }, 100);
    }
  }

  createOportunidade() {
    return {
      nome: 'Nova Oportunidade',
      fase: 'Qualificação',
      valor: 0,
    };
  }

  callbackLoadOportunidade() {
    return opp => {
      this.opp = opp;

      if(this.opp.dataFechamento) {
        this.opp.dataFechamento = new Date(this.opp.dataFechamento);
      }

      if(this.opp.orcamento) {
        this.loadOrcamentoId(this.opp.orcamento);
      }

      this.OrcamentoService.loadOrcamentoList({
        oportunidade: this.opp._id
      }).then(orcamentos => {
        orcamentos.forEach(item => {
          if(item.numero) {
            item.numero = addZero(item.numero, 8);
          }
        });
        this.opp.orcamentos = orcamentos;
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });

      this.loadAtividades();
    };
  }

  loadOrcamentoId(orcId) {
    this.usSpinnerService.spin('spinner-1');
    this.OrcamentoService.loadOrcamento({ id: orcId })
    .then(orcamento => {
      if(orcamento.itens) {
        orcamento.itens.forEach(item => {
          item.produto.unidade = item.produto.unidade.split('-')[0].trim();
        });
      }

      this.opp.orcamento = orcamento;
      this.opp.valor = orcamento.valorTotal;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  loadAtividades() {
    this.EventoService.loadEventoList({ idref: this.opp._id })
    .then(eventos => {
      this.opp.atividades = eventos;
    });
  }

  openFindConta(what) {
    let getParam = () => {
      if(typeof this.opp.conta === 'string') {
        return this.opp.conta;
      }
      return null;
    };
    let modalCtl = openModalView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      if(what === 'emit') {
        this.opp.contaProprietaria = acc;
      } else if(what === 'dest') {
        this.opp.conta = acc;
      }
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search, what) {
    if(search && search.length == 0) {
      if(what === 'emit') {
        this.opp.contaProprietaria = null;
      } else if(what === 'dest') {
        this.opp.conta = null;
      }
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          if(what === 'emit') {
            this.opp.contaProprietaria = contas[0];
          } else if(what === 'dest') {
            this.opp.conta = contas[0];
          }
        }
      }
      return contas;
    })
    .finally(() => {
      this.usSpinnerService.stop('spinner-1');
    });
  }

  saveOpp(form) {
    if(form.$invalid) {
      return;
    }
    if(this.opp.fase === 'Faturamento' && !this.validFaturamento()) {
      return;
    }
    this.usSpinnerService.spin('spinner-1');
    this.OportunidadeService.saveOportunidade(this.opp)
      .then(() => {
        this.toastr.success('Oportunidade salva com sucesso', `${this.opp.nome}`);
        this.$state.go('oportunidades');

        if(this.accId) {
          this.$state.go('contaedit', { id: this.accId });
        } else {
          this.$state.go('oportunidades');
        }
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }

  validFaturamento() {
    let message = '';
    console.log(this.opp.dataFechamento);
    console.log(moment().endOf('day')
      .toDate());
    if(!this.opp.dataFechamento) {
      message += this.getMessage('Data fechamento é necessária');
    } else if(this.opp.dataFechamento < moment().startOf('day').toDate()) {
      message += this.getMessage('Data fechamento deve ser maior que hoje');
    }
    if(!this.opp.conta || !this.opp.conta._id) {
      message += this.getMessage('Conta é necessária');
    }
    if(!this.opp.contaProprietaria || !this.opp.contaProprietaria._id) {
      message += this.getMessage('Conta Proprietária é necessária');
    }
    if(!this.opp.orcamento || !this.opp.orcamento._id) {
      message += this.getMessage('Orçamento é necessário');
    } else if(this.opp.valor <= 0) {
      message += this.getMessage('Valor Total inválido');
    }
    if(message.length > 0) {
      this.toastr.error(message, 'Para faturamento', { allowHtml: true });
      return false;
    }
    return true;
  }

  getMessage(value) {
    return `<small>${value}</small><br/>`;
  }
  selectOrcamentoOpp(orca) {
    this.loadOrcamentoId(orca._id);
    this.toastr.info('Alteração de orçamento da oportunidade', `${this.opp.nome}`);
  }

  createEventReference(type, subject, status, data) {
    let name = `Oportunidade (${this.opp.nome})`;
    let references = [this.createReferenceOpp(name)];
    if(this.opp.conta) {
      references.push(this.createReferenceConta(this.opp.conta));
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

  createReferenceOpp(name) {
    return {
      name,
      description: this.opp.descricao ? `${this.opp.descricao}` : '',
      link: `/oportunidades/edit/${this.opp._id}`,
      objectId: `${this.opp._id}`,
      object: 'Opportunity'
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

  newOrcamento(form) {
    if(form.$invalid) {
      return;
    }
    this.usSpinnerService.spin('spinner-1');
    this.OportunidadeService.saveOportunidade(this.opp)
      .then(() => {
        this.$state.go('orcamentoedit', { oppId: this.opp._id });
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
  }
}
