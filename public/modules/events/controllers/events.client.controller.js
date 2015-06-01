'use strict';

// Events controller
angular.module('events').controller('EventsController', ['$scope', '$stateParams', '$location', 'Socket', 'Authentication', 'Events',
	function($scope, $stateParams, $location, Socket, Authentication, Events) {
		$scope.authentication = Authentication;

		// Create new Event
		$scope.create = function() {
			// Create new Event object
			var event = new Events({
				date: this.date,
				title: this.title,
				content: this.content
			});

			// Redirect after save
			event.$save(function(response) {
				$location.path('events/' + response._id);

				// Clear form fields
				$scope.date = '';
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Event
		$scope.remove = function(event) {
			if (event) {
				event.$remove();

				for (var i in $scope.events) {
					if ($scope.events[i] === event) {
						$scope.events.splice(i, 1);
					}
				}
			} else {
				$scope.event.$remove(function() {
					$location.path('events');
				});
			}
		};

		// Update existing Event
		$scope.update = function() {
			var event = $scope.event;

			event.$update(function() {
				$location.path('events/' + event._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Events
		$scope.find = function() {
			$scope.events = Events.query();
		};

		// Find existing Event
		$scope.findOne = function() {
			$scope.event = Events.get({
				eventId: $stateParams.eventId
			});
		};

		// push method
		Socket.on('event.created', function(event) {
			if ($scope.events) {
				$scope.events.push(event);
			}
		});

		Socket.on('event.updated', function(event) {

			if (Authentication.user._id !== event.user._id) {
				if ($scope.events) {
					var events = $scope.events,
							index = events.map(function (x) { return x._id; }).indexOf(event._id);
					events[index] = event;
				}
				
				if ($scope.event) {
					var currentEvent = $scope.event;
					if (currentEvent._id === event._id) {
						$scope.event = angular.copy(event);
					}
				}
			}
		});

		Socket.on('event.deleted', function(event) {
			if ($scope.events) {
				var events = $scope.events,
						index = events.map(function (x) { return x._id; }).indexOf(event._id);
				events.splice(index, 1);
			}
		});
	}
]);