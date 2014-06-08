angular.module('starter.controllers', [])
.controller('HomeCtrl', function($scope, IdeaService) {
		$scope.ideas = IdeaService.getAll();
})
.controller('EditCtrl', function($scope, IdeaService  , $stateParams) {
	if($stateParams.ideaId){
		$scope.idea = IdeaService.getById($stateParams.ideaId);
		$scope.onEdit = _.debounce(function(){
			console.log($scope.idea);
			$scope.idea.updated = new Date();
			$scope.idea.synced = false;
			$(".saved").show(function(){
				setTimeout(function(){
					$(".saved").hide();
				});
			});
		},700);
	}else{
		$scope.idea = {content: ""};
		$scope.onEdit = _.debounce(function(){
			if(!$scope.idea._id) $scope.idea = IdeaService.add($scope.idea.content);
			$scope.idea.updated = new Date();
			$scope.idea.synced = false;
		},700);
	}

});