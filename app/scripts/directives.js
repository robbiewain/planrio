'use strict';

angular.module('planrioApp')
	.directive('game', function () {
		return {
			restrict: 'E',
			templateUrl: '/views/game.html'
		};
	})
	.directive('group', function () {
		return {
			restrict: 'E',
			templateUrl: '/views/group.html'
		};
	})
	.directive('route', function () {
		return {
			restrict: 'E',
			templateUrl: '/views/route.html'
		};
	})
	.directive('brasilTime', function ($filter) {
		function convertToBrasilTime (datetime) {
		    // create Date object for current location
		    var d = new Date(datetime);

		    // convert to msec
		    // add local time zone offset
		    // get UTC time in msec
		    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

		    // create new Date object for Brasil (UTC -0300)
		    // using supplied offset
			return new Date(utc + (3600000*-3));
		}

		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var datetime = convertToBrasilTime(parseInt(attrs.brasilTime));
				var dateText = $filter('date')(datetime, 'short');
				element.html(dateText);
			}
		};
	})
	.directive('flag', function () {
		return {
			restrict: 'E',
			template: '<span class="flagsp flagsp_{{ team.cc }}" title="{{ team.name }}"></span>',
			scope: {
				team: '='
			}
		};
	});
