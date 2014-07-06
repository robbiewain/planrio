app = angular.module 'planrioApp', []

app.controller 'planrioCtrl', ($scope, planrio) ->
	planrio.getFixtures().then (response) ->
		$scope.selectedGames = planrio.selectedGames
		$scope.routes = planrio.routes
		$scope.fixtures = response.data
		$scope.selectedGroup = $scope.fixtures.groups[0]
		$scope.selectGroup = (group) ->
			$scope.selectedGroup = group
		$scope.toggleGame = (game) ->
			planrio.toggleGame game, () ->
				# Need to use scope.apply here since routes is updated on third party library callback
				$scope.$apply planrio.routes

app.directive 'googleMap', (planrio) ->
	restrict: 'E'
	template: '<div class="google-map"></div>'
	link: (scope, element) ->
		mapOptions =
			zoom: 5
			center: new google.maps.LatLng -12.370, -47.285
			zoomControlOptions:
				position: google.maps.ControlPosition.RIGHT_CENTER
				style: google.maps.ZoomControlStyle.DEFAULT
			panControlOptions:
				position: google.maps.ControlPosition.RIGHT_TOP
				style: google.maps.ZoomControlStyle.DEFAULT
		planrio.setMap new google.maps.Map(element.find('div')[0], mapOptions)

app.directive 'game', () ->
	restrict: 'E'
	templateUrl: '/views/game.html'
	scope:
		game: '='

app.directive 'group', () ->
	restrict: 'E'
	templateUrl: '/views/group.html'
	scope:
		group: '='
		clickGame: '&'

app.directive 'route', () ->
	restrict: 'E'
	templateUrl: '/views/route.html'
	scope:
		route: '='

app.directive 'brasilTime', ($filter) ->
	convertToBrasilTime = (datetime) ->
		# get UTC time in msec
		d = new Date datetime
		utc = d.getTime() + (d.getTimezoneOffset() * 60000)

		# create new Date object for Rio de Janeiro, Brasil (UTC -0300)
		new Date utc + (3600000*-3)

	restrict: 'A'
	link: (scope, element, attrs) ->
		datetime = convertToBrasilTime parseInt(attrs.brasilTime)
		dateText = $filter('date')(datetime, 'short')
		element.html dateText

app.directive 'flag', () ->
	restrict: 'E'
	template: '<span class="flagsp flagsp_{{ team.cc }}" title="{{ team.name }}"></span>'
	scope:
		team: '='

app.service 'planrio', ($http, $filter) ->
	directionsService = new google.maps.DirectionsService()
	directionsRenderer = new google.maps.DirectionsRenderer()

	setMap: (map) -> directionsRenderer.setMap map
	getFixtures: () -> $http.get 'data/fixtures.json'
	selectedGames: []
	routes: []
	toggleGame: (game, routesUpdated) ->
		# Reinitialise list of routes
		this.routes = []

		# Either add or remove the selected game
		gameIndex = this.selectedGames.indexOf game
		if gameIndex == -1
			this.selectedGames.push game
		else
			this.selectedGames.splice gameIndex, 1

		# Clear the directions on the map
		if this.selectedGames.length < 2
			directionsRenderer.setDirections routes: this.routes
			return

		# Sort the selected games by id since it is equivalent to chronological order
		cities = ($filter 'orderBy')(this.selectedGames, 'id').map (game) -> game.city

		request =
			waypoints: []
			travelMode: google.maps.TravelMode.DRIVING

		[request.origin, ..., request.destination] = cities

		# Need to add waypoints if there are more than two cities
		for city in cities[1..-2]
			request.waypoints.push
				location: city
				stopover: true

		directionsService.route request, (response, status) =>
			if status == google.maps.DirectionsStatus.OK
				# Save route information for display purposes
				for leg in response.routes[0].legs
					this.routes.push
						'distance': leg.distance.text
						'duration': leg.duration.text
				routesUpdated()
				directionsRenderer.setDirections response
