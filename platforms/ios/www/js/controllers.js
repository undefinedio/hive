angular.module('starter.controllers', [])

//home controller, shows all ideas
.controller('HomeCtrl', function($scope, IdeaService ) {
		$scope.ideas = IdeaService.getAll();
        console.log($scope.ideas);
})

//edit controller, for editing existing or new ideas
.controller('EditCtrl', function($scope, IdeaService  , $stateParams) {
	if($stateParams.ideaId){
		$scope.idea = IdeaService.getById($stateParams.ideaId);
	}else{
		$scope.idea = {content: ""};
	}

    $scope.onEdit = _.debounce(function(){

        if(!$scope.idea._id) $scope.idea = IdeaService.add($scope.idea.content);

        $scope.idea.updated = new Date();
        $scope.idea.synced = false;

        $(".saved").show(function(){
            setTimeout(function(){
                $(".saved").hide();
            });
        });

    },700);
});