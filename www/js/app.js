angular.module('starter', ['ionic', 'ngResource' , 'starter.controllers', 'starter.services'])
	.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	})
	.config(function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			})
			.state('new', {
				url: '/edit',
				templateUrl: 'templates/edit.html',
				controller: 'EditCtrl'
			})
			.state('edit', {
				url: '/edit/:ideaId',
				templateUrl: 'templates/edit.html',
				controller: 'EditCtrl'
			});
		$urlRouterProvider.otherwise('/home');
	});

