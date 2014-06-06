'use strict';

angular.module('planrioApp')
	.service('planrio', function ($http, $filter) {
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
				// Either add or remove the selected game
				var gameIndex = this.selectedGames.indexOf(game);
				if (gameIndex === -1) {
					this.selectedGames.push(game);
				} else {
					this.selectedGames.splice(gameIndex, 1);
				}

				this.routes.length = 0;

				// Clear the directions on the map
				if (this.selectedGames.length < 2) {
					directionsRenderer.setDirections({ routes: [] });
					return;
				}

				// Sort the selected games by id since it is equivalent to chronological order
				var cities = $filter('orderBy')(this.selectedGames, 'id').map(function (game) {
					return game.city;
				});

				var request = {
					origin: cities[0],
					destination: cities[cities.length - 1],
					waypoints: [],
					travelMode: google.maps.TravelMode.DRIVING
				};

				// Need to add waypoints if there are more than two cities
				if (cities.length > 2) {
					for (var i = cities.length - 2; i >= 1; i--) {
						request.waypoints.push({
							location: cities[i],
							stopover: true,
						});
					}
				}

				// Keep a reference to the routes object so the callback can access it
				var routes = this.routes;
				directionsService.route(request, function (response, status) {
					if (status === google.maps.DirectionsStatus.OK) {
						// Save route information for display purposes 
						angular.forEach(response.routes[0].legs, function (leg) {
							routes.push({
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