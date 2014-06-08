angular.module('starter.controllers', [])
.controller('HomeCtrl', function($scope, IdeaService) {
		$scope.ideas = IdeaService.getAll();
})
.controller('EditCtrl', function($scope, IdeaService  , $stateParams) {
	console.log($stateParams.ideaId);
	if($stateParams.ideaId){
		$scope.idea = IdeaService.getById($stateParams.ideaId);
	}else{
		$scope.idea = IdeaService.add();
	}
	//	$scope.onEdit = _.debounce(function(){
	//
	//	},500);
});