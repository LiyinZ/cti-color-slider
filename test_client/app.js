(function() {
  'use strict';

  var demo = angular.module('ctiCpDemo', [ 'ctiColorSlider' ]);

  demo.controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = [];

  /* @ngInject */
  function MainCtrl() {
    var vm = this;

    // vm.colorData = {
    //   cv0_x: 199, cv0_y: 27, cv1_x: 12, rgba: "rgba(233,88,88,255)"
    // };

    vm.logData = function() {
      console.log(vm.colorData);
    };

  }
})();
