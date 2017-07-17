'use strict';
import Controller from '../../account/controller';
import moment from 'moment';
moment.locale('pt-br');

export default class BancoFluxoCaixaController extends Controller {
  typeViewMonth = 'month';
  typeViewWeek = 'week';
  typeViewDay = 'day';

  /*@ngInject*/
  constructor($window, $scope, toastr,
    BancoService, NfService, ProdutoService, usSpinnerService, Modal) {
    super($window, $scope, toastr, usSpinnerService);

    this.BancoService = BancoService;
    this.NfService = NfService;
    this.ProdutoService = ProdutoService;

    this.init();

    this.isPrevisao = false;

    this.Modal = Modal;
    this.format = 'dd/MM/yyyy';

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
  }

  init() {
    this.mapTypeView = new Map();
    this.mapTypeView.set(this.typeViewMonth,
      { formatText: 'MMMM', formatKey: 'YYYY-M', typeView: this.typeViewMonth, length: 6 });
    this.mapTypeView.set(this.typeViewWeek,
      { formatText: 'DD MMMM', formatKey: 'YYYY-MM-DD', typeView: this.typeViewWeek, length: 5 });
    this.mapTypeView.set(this.typeViewDay,
      { formatText: 'DD ddd MMM', formatKey: 'YYYY-M-DD', typeView: this.typeViewDay, length: 7 });

    this.typeView = this.typeViewMonth;
    this.startDate = new Date();
    this.cashFlowView = this.createCashFlowView(this.startDate, this.typeView);
    //this.cashFlowView.forEach(item => console.log(item));
    this.cashFlowViewReceitas(this.cashFlowView);
    this.cashFlowViewDespesas(this.cashFlowView);
    this.cashFlowViewSaldo(this.cashFlowView);

    let format = this.mapTypeView.get(this.typeView).formatText;
    this.nowSelect = moment()
      .startOf(this.typeView)
      .format(format);
  }

  createCashFlowView(monthStart, typeView) {
    let data = moment(monthStart).add(-1, typeView);
    let sets = this.mapTypeView.get(typeView);
    let cashFlowViewList = [];
    for(var x = 0; x < sets.length; x++) {
      let start = data.startOf(typeView);
      let end = moment(start).endOf(typeView);

      let key = this.generateKey(start, typeView, sets);
      cashFlowViewList.push({
        key, index: x,
        mes: start.format(sets.formatText),
        start: start.toDate(), end: end.toDate(),
      });
      data = data.add(1, typeView);
    }
    return cashFlowViewList;
  }

  generateKey(start, typeView, sets) {
    if(typeView === 'week') {
      return start.week();
    }
    return start.format(sets.formatKey);
  }

  cashFlowViewDespesas(cashFlowView) {
    console.log('cashFlowViewDespesas()', cashFlowView);

    const typeCashFlow = 'saida';
    this.despesas = [];
    this.loadPlanAccount('#FLXCX-D', planList => {
      console.log('#FLXCX-D', planList.length);
      let dataStart = cashFlowView[0].start;
      let dataEnd = cashFlowView[cashFlowView.length - 1].end;
      this.NfService.cashFlowInputOrigin({
        start: dataStart, end: dataEnd, type: typeCashFlow, group: this.typeView })
      .then(result => {
        console.log(result);

        let mapItem = this.createMapResult(result);

        planList.forEach(plan => {
          let map = mapItem.get(plan.nome);
          let itPr = { nome: plan.nome, saidas: [] };
          let itRe = { nome: '', saidas: [] };

          this.setResult(cashFlowView, map, itPr, itRe);
          this.despesas.push(itPr);
          this.despesas.push(itRe);
        });
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    });
  }

  cashFlowViewReceitas(cashFlowView) {
    console.log('cashFlowViewReceitas()', cashFlowView);

    const typeCashFlow = 'entrada';
    this.receitas = [];
    this.loadPlanAccount('#FLXCX-R', planList => {
      console.log('#FLXCX-R', planList.length);
      let dataStart = cashFlowView[0].start;
      let dataEnd = cashFlowView[cashFlowView.length - 1].end;
      this.NfService.cashFlowInputOrigin({
        start: dataStart, end: dataEnd, type: typeCashFlow, group: this.typeView })
      .then(result => {
        console.log(result);

        let mapItem = this.createMapResult(result);

        planList.forEach(plan => {
          let map = mapItem.get(plan.nome);
          let itPr = { nome: plan.nome, saidas: [] };
          let itRe = { nome: '', saidas: [] };

          this.setResult(cashFlowView, map, itPr, itRe);
          this.receitas.push(itPr);
          this.receitas.push(itRe);
        });
      })
      .finally(() => {
        this.usSpinnerService.stop('spinner-1');
      });
    });
  }

  loadPlanAccount(codigo, callback) {
    this.ProdutoService.loadProdutoList({ search: codigo}).then(produtos => {
      if(produtos.length == 0) {
        return;
      }
      this.ProdutoService.loadProduto({id: produtos[0]._id}).then(produto => {
        if(produto) {
          let list = [];
          produto.subproduto.forEach(item => {
            list.push(item.produto);
          });
          return callback(list);
        }
      });
    });
  }

  createMapResult(result) {
    let mapItem = new Map();
    result.forEach(item => {
      let m = item._id.month;
      let y = item._id.year;
      let d = item._id.day;
      let w = item._id.week;

      let key = item._id.nome[0];
      let map = mapItem.get(key);
      if(!map) {
        map = new Map();
        mapItem.set(key, map);
      }

      if(this.typeView === this.typeViewMonth) {
        map.set(`${y}-${m}`, item);
      } else if(this.typeView === this.typeViewWeek) {
        map.set(`${w}`, item);
      } else if(this.typeView === this.typeViewDay) {
        map.set(`${y}-${m}-${d}`, item);
      }
    });
    return mapItem;
  }

  setResult(cashFlowView, map, itPr, itRe) {
    cashFlowView.forEach(flow => {
      if(!map) {
        itPr.saidas.push(0);
        itRe.saidas.push(0);
        return;
      }
      let info = map.get(`${flow.key}`);
      if(!info) {
        itPr.saidas.push(0);
        itRe.saidas.push(0);
      } else {
        itPr.saidas.push(info.realizado);
        itRe.saidas.push(info.previsao);
      }
    });
  }

  isActive(status) {
    return status === this.status;
  }

  cashFlowViewSaldo(cashFlowView) {
    let dataStart = cashFlowView[0].start;
    let dataEnd = cashFlowView[cashFlowView.length - 1].end;
    this.saldos = [];
    this.BancoService.cashFlow({
      start: dataStart,
      end: dataEnd,
      type: this.typeView,
    }).then(result => {
      console.log('Start', this.start, ' End', this.end);
      console.log(result);

      let map = this.createMapResultSaldo(result);
      console.log(map);
      cashFlowView.forEach(flow => {
        console.log(flow);
        let info = map.get(`${flow.key}`);
        console.log('INFO', info);
        if(!info) {
          this.saldos.push(null);
        } else {
          this.saldos.push(info);
        }
      });
    });
  }

  createMapResultSaldo(result) {
    let mapItem = new Map();
    result.forEach(item => {
      let m = item._id.month;
      let y = item._id.year;
      let d = item._id.day;
      let w = item._id.week;

      if(this.typeView === this.typeViewMonth) {
        mapItem.set(`${y}-${m}`, item);
      } else if(this.typeView === this.typeViewWeek) {
        mapItem.set(`${w}`, item);
      } else if(this.typeView === this.typeViewDay) {
        mapItem.set(`${y}-${m}-${d}`, item);
      }
    });
    return mapItem;
  }
}
