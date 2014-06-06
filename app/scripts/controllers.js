'use strict';

angular.module('planrioApp')
	.controller('MainCtrl', function ($scope, planrio) {
		planrio.getFixtures().then(function (response) {
			$scope.selectedGames = planrio.selectedGames;
			$scope.routes = planrio.routes;
			$scope.fixtures = response.data;
			$scope.selectedGroup = $scope.fixtures.groups[0];
			$scope.selectGroup = function (group) {
				$scope.selectedGroup = group;
			};
			$scope.toggleGame = function (game) {
				planrio.toggleGame(game, function () {
					$scope.$apply($scope.routes);
				});
			};
		});
	});
