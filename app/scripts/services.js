'use strict';

angular.module('planrioApp')
	.factory('planrio', function ($http, $filter) {
		var directionsService = new google.maps.DirectionsService();
		var directionsRenderer = new google.maps.DirectionsRenderer();

		return {
			setMap: function (map) {
				directionsRenderer.setMap(map);
			},
			getFixtures: function () {
				return $http.get('data/fixtures.json');
			},
			selectedGames: [],
			routes: [],
			toggleGame: function (game, routesUpdated) {
				var gameIndex = this.selectedGames.indexOf(game);
				if (gameIndex === -1) {
					this.selectedGames.push(game);
				} else {
					this.selectedGames.splice(gameIndex, 1);
				}

				this.routes.length = 0;

				if (this.selectedGames.length < 2) {
					directionsRenderer.setDirections({ routes: [] });
					return;
				}

				var sortedGames = $filter('orderBy')(this.selectedGames, 'id');
				var origin = sortedGames[0].city;
				var destination = sortedGames[sortedGames.length - 1].city;
				var waypoints = [];

				if (sortedGames.length > 2) {
					for (var i = sortedGames.length - 2; i >= 1; i--) {
						waypoints.push({
							location: sortedGames[i].city,
							stopover: true,
						});
					}
				}

				var request = {
					origin: origin,
					destination: destination,
					travelMode: google.maps.TravelMode.DRIVING,
					waypoints: waypoints
				};
				
				var me = this;
				directionsService.route(request, function (response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						angular.forEach(response.routes[0].legs, function (leg) {
							me.routes.push({
								'distance': leg.distance.text,
								'duration': leg.duration.text
							});
							routesUpdated();
						});

						directionsRenderer.setDirections(response);
					}
				});
			}
		};
	});