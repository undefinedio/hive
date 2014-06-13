angular.module('starter.services', [])
	.factory('common' , function(){
		return {
            apiUrl : "http://hive-app-mind.herokuapp.com",
            deviceId : "simon"
        };
	})
	.provider('Idea', function () {
		this.$get = function ($resource, common) {
			var Idea = $resource( common.apiUrl +'/ideas/device/'+ common.deviceId +'/:_id', {}, {
				update: {
					method: 'PUT'
				},
				own: {
					method: 'GET'
				}
			});
			return Idea;
		};
	}).factory('IdeaService' , function(Idea, $http, common){
		localStorage.clear();

		var ideas = [];

		if(localStorage.getItem("ideas")) {
			ideas = JSON.parse(localStorage.getItem("ideas"));
		}

		if(!ideas.length){
			ideas = Idea.query();
			ideas.$promise.then(function(){
				localStorage.setItem("ideas", JSON.stringify(ideas));
			});
		}

		moment.lang('en', {
			relativeTime : {
				s:  "S",
				m : "1M",
				mm: "%dM",
				h : "1H",
				hh: "%dH",
				d:  "1D",
				dd: "%dD",
				M:  "1M",
				MM: "%dMONTHS",
				yy: "%dY"
			}
		});

		ideas.$promise.then(function(){
			ideas.forEach(function(idea){
				if(moment(idea.expire_date).diff(moment()) < 0){
					idea.public = true;
				}else{
					idea.public = false;
				}
				idea.expire_date_formatted =  moment(idea.expire_date).fromNow(true);

			});
		});

		var syncing = false;
		//save every 2 seconds
		setInterval(function(){
			if(ideas) localStorage.setItem("ideas", JSON.stringify(ideas));
			if(syncing) return false;
			var nonSynced = ideas.filter(function(idea){
				return !idea.synced;
			});
			if(nonSynced.length){
				$http.post(
					common.apiUrl+"/ideas/synchronize/"+common.deviceId,
					{
						data : JSON.stringify(nonSynced)
					}
				).success(function(data){
						syncing = false;
						nonSynced.forEach(function(item){
							if(data.data){
								data.data.forEach(function(newIds){
									if(item._id == newIds.frontID) item._id = newIds.mongoID;
								});
							}
							item.synced = true;
							item.new = false;
						});
					});

				nonSynced.forEach(function(item){
					item.synced = true;
					item.new = false;
				});

			}
		}, 2000);

		return {
			getAll : function(){
				return ideas;
			},
			getById : function(ideaId){
				return ideas.filter(function(idea){
					return idea._id == ideaId;
				})[0];
			},
			add : function(content){
				var expire_date = new Date();
				expire_date.setDate(expire_date.getDate() + 30);
				var newIdea = {
					content : content,
					synced : false,
					_id : Date.now(),
					device : common.deviceId,
					expire_date : expire_date,
					created_on : new Date(),
					public : false,
					expire_date_formatted  :  moment(expire_date).fromNow(true),
					new : true
				};
				ideas.unshift(newIdea);
				return newIdea;
			}
		};
	});