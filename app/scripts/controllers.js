'use strict';

angular.module('planrioApp')
	.controller('MainCtrl', function ($scope, planrio) {
		planrio.getFixtures().then(function (response) {
			$scope.fixtures = response.data;
			$scope.selectedGroup = $scope.fixtures[0];
		});
		$scope.selectedGames = planrio.selectedGames;
		$scope.map = planrio.map;
		$scope.toggleGame = planrio.toggleGame;
		$scope.routes = planrio.routes;
		$scope.selectGroup = function (group) {
			$scope.selectedGroup = group;
		};
	});
