angular.module('starter.services', [])
	.provider('Idea', function () {
		this.$get = ['$resource', function ($resource) {
			var Idea = $resource('http://192.168.0.226:4000/ideas/:_id', {}, {
				update: {
					method: 'PUT'
				},
				own: {
					method: 'GET'
				}
			});
			return Idea;
		}];
	}).factory('IdeaService' , function(Idea){
		var ideas = [];
		return {
			getAll : function(){
				if(!ideas.length) ideas = Idea.query();
				return ideas;
			},
			getById : function(ideaId){
				return ideas.filter(function(idea){
					return idea.id == ideaId;
				})[0];
			},
			add : function(){
				var newIdea = {
					id : Date.now(),
					local : true
				};
				ideas.unshift(newIdea);
				return newIdea;
			}
		};
	});