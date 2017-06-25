'use strict';
import angular from 'angular';
import Controller from '../../account/controller';
import {openModalView} from '../conta/conta.modal.service';

export default class OportunidadeEditController extends Controller {
  /*@ngInject*/
  constructor($window, $scope, $stateParams, $timeout, $state, toastr, usSpinnerService,
    OrcamentoService, ContaService, ContatoService, OportunidadeService,
    EventoService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.id = $stateParams.id;
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

  openFindConta() {
    let getParam = () => {
      if(typeof this.opp.conta === 'string') {
        return this.opp.conta;
      }
      return null;
    };
    let modalCtl = openModalView(this.Modal, getParam());
    modalCtl.onSelectAcc = acc => {
      console.log('onSelectAcc()', acc);
      this.opp.conta = acc;
      modalCtl.dismiss();
    };
    modalCtl.onClose = () => {
      modalCtl.dismiss();
    };
    this.ContaService.setModalCtl(modalCtl);
  }

  findAcc(search) {
    if(search && search.length == 0) {
      this.opp.conta = null;
    } else if(search && search.length < 3) {
      return;
    }
    return this.ContaService.loadContaList({
      search,
    })
    .then(contas => {
      if(contas && contas.length == 1) {
        if(search === contas[0].nome) {
          this.opp.conta = contas[0];
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
    this.usSpinnerService.spin('spinner-1');
    this.OportunidadeService.saveOportunidade(this.opp)
      .then(() => {
        this.toastr.success('Oportunidade salva com sucesso', `${this.opp.nome}`);
        this.$state.go('oportunidades');
      })
      .catch(this.callbackError(form))
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
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
}
