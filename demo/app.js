!function(){"use strict";function e(e,o){function r(){return a.colors.length==u}function l(){return a.colors.length==f}function c(){a.disableAdd=r(),a.disableRm=l()}function s(e){a.selected=e>-1?e:0,a.colorData=a.colors[e]}function t(e){return a.selected==e}function n(){if(a.ready){var e=a.colors.length;e>=u||(a.colors.push({rgb:"rgb(255,0,0)"}),a.selectColor(e),c())}}function i(){if(a.ready){var e=a.colors.length;f>=e||(e=a.selected==e-1?e-2:a.selected,a.colors.splice(a.selected,1),a.selectColor(e),c())}}function d(){a.ready&&(h.colors=a.colors,h.selected=a.selected,h.$save().then(function(e){console.log("Colors saved!")},function(e){console.log("Error:",error)}))}var a=this,u=8,f=0,b=new Firebase("https://cticolorslider.firebaseio.com/"),h=o(b);a.ready=!1,a.colorData=null,a.disableAdd=a.disableRm=!0,h.$loaded().then(function(e){a.colors=e.colors||[],a.selected=e.selected||0,a.colorData=a.colors[a.selected],a.disableAdd=r(),a.disableRm=l(),a.ready=!0})["catch"](function(e){console.error("Error",e)}),a.selectColor=s,a.isSelected=t,a.addColor=n,a.removeColor=i,a.saveColors=d}var o=angular.module("ctiCsDemo",["ctiColorSlider","firebase"]);o.controller("MainCtrl",e),e.$inject=["$scope","$firebaseObject"]}();