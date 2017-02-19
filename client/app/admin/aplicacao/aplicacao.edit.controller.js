'use strict';

export default class AplicacaoEditController {

  /*@ngInject*/
  constructor($scope, $timeout, AplicacaoService) {
    this.AplicacaoService = AplicacaoService;
    this.$timeout = $timeout;
    this.filtrarResult = '';
    //index da aba ativa
    this.abaAtiva = 0;
    this.mapFn = [];
    this.mapFn.ler = 'Ler';
    this.mapFn.criar = 'Criar';
    this.mapFn.modificar = 'Modificar';
    this.mapFn.excluir = 'Excluir';
    //controle das funcoes do componente radio
    this.checkModel = {
      ler: true,
      criar: false,
      modificar: false,
      excluir: false
    };
    this.situacao = [
      { name: 'Ativo', value: 'true' },
      { name: 'Desativo', value: 'false' }
    ];
    this.wait = false;
    /*$timeout(function() {
       $scope.ctl.wait = false;
     }, 2000);
     */
    //referencia para a criacao de um novo modulo
    this.modulo = this.initModulo();
    this.isAddModulo = false;
    //monitor alteracoes no campo
    $scope.$watchCollection('ctl.checkModel', function() {
      $scope.ctl.modulo.funcoes = [];
      angular.forEach($scope.ctl.checkModel, function(value, key) {
        if(value) {//funcao selecionada
          let action = $scope.ctl.mapFn[key];
          $scope.ctl.modulo.funcoes.push(action);//add no modulo
        }
      });
    });

    this.alerts = [];
    this.sucesso = {
      type: 'info',
      msg: 'Informações salvas com sucesso'
    };
  }

  /**
   * Obter referencia ao objeto Aplicativo
   */
  app() {
    return this.AplicacaoService.getApp();
  }

  /**
   * Salvar Aplicativo
   */
  saveApp(form) {
    if(form.$invalid) {
      return;
    }
    let app = this.app();
    return this.AplicacaoService.saveAplicavo(app)
    .then(newApp => {
      this.abaAtiva = 1;
      this.addMesagem(this.sucesso);
    })
    .catch(err => {
      console.log('Ex:', err);
    })
    .finally(() => {
      this.wait = false;
    });
  }

  saveModulo(form) {
    console.log(this.modulo);

    if(form.$valid && this.modulo.funcoes.length > 0) {
      let that = this;
      this.AplicacaoService.saveModulo(this.modulo, function(data) {
        console.log('saveModulo', data);
        that.newModulo();
        that.isAddModulo = false;
        form.$setPristine();
        that.addMesagem(that.sucesso);
      });
    }
  }

  newModulo() {
    this.modulo = this.initModulo();
    this.isAddModulo = true;

    let arr = this.checkModel;
    angular.forEach(this.checkModel, function(value, key) {
      arr[key] = false;
    });
  }

  initModulo() {
    return {
      _id: null,
      nome: '',
      funcoes: []//funcoes que o modulo fornece
    };
  }

  selectModulo(modulo) {
    this.modulo = modulo;
    this.isAddModulo = true;
    let arr = this.checkModel;
    var that = this;
    angular.forEach(this.checkModel, function(value, key) {
      let action = that.mapFn[key];
      arr[key] = that.modulo.funcoes.indexOf(action) >= 0;
    });
  }
  removeFuncao(fn) {
    console.log(fn, this.modulo.funcoes.indexOf(fn));
    this.checkModel[fn.toLowerCase()] = false;
    var result = this.modulo.funcoes.splice(
      this.modulo.funcoes.indexOf(fn), 1);
    console.log(result);
  }
  /*deleteModulo(modulo) {
    let app = this.app();
    console.log(modulo, app);
    this.AplicacaoService.createModulo();
    app.modulos.splice(app.modulos.indexOf(modulo), 1);
    this.addMesagem(this.sucesso);
  }*/

  addMesagem(msg) {
    this.alerts.push(msg);
    this.$timeout(() => {
      this.alerts.splice(0, 1);
    }, 2000);
  }
}
