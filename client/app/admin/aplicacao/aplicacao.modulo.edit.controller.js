'use strict';
import angular from 'angular';
export default class AplicacaoModuloEditController {
  /*@ngInject*/
  constructor($scope, AplicacaoService) {
    this.AplicacaoService = AplicacaoService;
    this.modalCtl = this.AplicacaoService.getModalCtl();
    let moduloEdit = this.AplicacaoService.getModuloEdit();
    this.modulo = angular.copy(moduloEdit);
    this.modulo.select = [];
    this.modulo.funcoes.forEach(f => {
      this.modulo.select.push({
        name: f
      });
    });
    this.itemArray = this.AplicacaoService.getItemFuncaoDefault();
    this.itemAtivo = this.AplicacaoService.getItemIsAtivoDefault();
    $scope.$watchCollection('ctl.modulo.select', function() {
      $scope.ctl.modulo.funcoes = [];
      angular.forEach($scope.ctl.modulo.select, function(value, key) {
        $scope.ctl.modulo.funcoes.push(value.name);
      });
    });
  }
  addAllFuncoes() {
    this.modulo.select = [];
    this.itemArray.forEach(item => {
      this.modulo.select.push(item);
    });
  }
  removeAllFuncoes() {
    this.modulo.select = [];
  }
  saveModulo(form) {
    console.log(this.modulo);
    if(form.$valid && this.modulo.funcoes.length > 0) {
      return this.AplicacaoService.saveModulo(this.modulo)
      .then(newModulo => {
        newModulo.select = [];
        newModulo.funcoes.forEach(f => {
          newModulo.select.push({ name: f });
        });
        let moduloEdit = this.AplicacaoService.getModuloEdit();
        if(angular.isUndefined(moduloEdit.isNew) || !moduloEdit.isNew) {
          Object.assign(moduloEdit, newModulo);
        } else if(moduloEdit.isNew) {
          this.AplicacaoService.getModalCtl().onModulo(newModulo);
        }
      })
      .catch(err => {
        console.log('Ex:', err);
      })
      .finally(() => {
        this.wait = false;
        this.modalCtl.dismiss();
      });
      //let app = this.AplicacaoService.getApp();
      //app.modulos.push(this.modulo);
      /*if(this.modulo._id) {
        Object.assign(moduloEdit, this.modulo);
      } else {
      }*/
      //moduloEdit.nome = 'Ola';
      //moduloEdit = this.modulo;
      //this.AplicacaoService.setModuloEdit(this.modulo);
    }
  }
  tagTransform(newTag) {
    var item = { id: 0, name: newTag, class: 'fa fa-tag' };
    return item;
  }
}
