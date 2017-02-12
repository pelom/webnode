'use strict';

export default class PermissaoAppController {

  /*@ngInject*/
  constructor($scope, $timeout, PermissaoService) {
    this.PermissaoService = PermissaoService;
    this.$timeout = $timeout;
    this.filtrarResult = '';
    //index da aba ativa
    this.abaAtiva = 0;
    //controle das funcoes do componente radio
    this.checkModel = {
      ler: true,
      criar: true,
      modificar: true,
      excluir: true
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
    this.modulo = {
      nome: '',
      funcoes: []//funcoes que o modulo fornece
    };
    this.isAddModulo = false;
    //monitor alteracoes no campo
    $scope.$watchCollection('ctl.checkModel', function() {
      $scope.ctl.modulo.funcoes = [];
      angular.forEach($scope.ctl.checkModel, function(value, key) {
        if(value) {//funcao selecionada
          $scope.ctl.modulo.funcoes.push(key);//add no modulo
        }
      });
    });

    this.alerts = [];
    this.sucesso = {
      type: 'info',
      msg: 'Informações salvas com sucesso'
    }
  }

  /**
   * Obter referencia ao objeto Aplicativo
   */
  app() {
    return this.PermissaoService.getApp();
  }

  /**
   * Criar no Aplicativo
   */
  createApp(form) {
    if(form.$invalid) {
      return;
    }
    let app = this.app();
    return this.PermissaoService.createApp(app)
    .then(newApp => {
      console.log('createApp.then', newApp);
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

  createModulo(form) {
    console.log(this.modulo);
    if(form.$valid && this.modulo.funcoes.length > 0) {
      console.log('Valid');

      let arr = this.checkModel;
      //this.PermissaoService.createModulo(this.modulo);
      this.app().modulos.push({
        nome: this.modulo.nome,
        funcoes: this.modulo.funcoes
      });
      this.PermissaoService.createModulo();
      this.modulo.nome = '';
      this.modulo.funcoes = [];
      angular.forEach(this.checkModel, function(value, key) {
        arr[key] = false;
      });
      form.$setPristine();
      this.addMesagem(this.sucesso);
    }
  }

  deleteModulo(modulo) {
    let app = this.app();
    console.log(modulo, app);
    this.PermissaoService.createModulo();
    app.modulos.splice(app.modulos.indexOf(modulo), 1);
    this.addMesagem(this.sucesso);
  }

  addMesagem(msg) {
    this.alerts.push(msg);
    this.$timeout(() => {
      this.alerts.splice(0, 1);
     },
     2000);
  }
}
