/*eslint no-useless-constructor: 0*/
'use strict';
import angular from 'angular';
import moment from 'moment';
moment.locale('pt-br');

export default class Controller {
  constructor($window, $scope, toastr, usSpinnerService) {
    this.usSpinnerService = usSpinnerService;
    this.toastr = toastr;
    this.managerLayout($window, $scope);
    this.contas = [];
  }

  managerLayout($window, $scope) {
    this.width = $window.innerWidth;

    let onResize = () => {
      //console.log('$window.innerWidth:', $window.innerWidth);
      this.width = $window.innerWidth;
      $scope.$digest();
    };

    angular.element($window).on('resize', onResize);

    $scope.$on('$destroy', () => {
      console.log('$destroy');
      angular.element($window).off('resize', onResize);
    });
  }

  isJustified() {
    if(this.isFull()) {
      return 'nav-justified';
    }
    return '';
  }

  isFull() {
    return this.width >= 800;
  }
}
