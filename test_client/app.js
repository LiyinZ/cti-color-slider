(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope'];

  /* @ngInject */
  function MainCtrl($scope) {
    var vm = this;

    vm.colorData = { hex: '#FFF062' };

    vm.logData = function() {
      console.log(vm.colorData.hex);
    };

  }
})();
