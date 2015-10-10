(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = [];

  /* @ngInject */
  function MainCtrl() {
    var vm = this;

    // vm.colorData = '#FFF062';

    vm.logData = function() {
      console.log(vm.colorData);
    };

  }
})();
