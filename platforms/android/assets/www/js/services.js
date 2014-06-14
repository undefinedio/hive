angular.module('starter.services', [])
    //setup thirdparty plugins
    .factory('thirdParty' , function(){
        return {
            setup : function(){
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
            }
        };
    })
    //this is a shared object
	.factory('common' , function($cordovaDevice){
        var deviceId;
        if(!window.cordova){
            deviceId = "development";
        }else{
            deviceId = $cordovaDevice.getUUID();
        }

        console.log(deviceId);

        return {
            apiUrl : "http://hive-app-mind.herokuapp.com",
            deviceId : deviceId
        };
	})

    //this is the resource provider for all ideas
	.provider('IdeaResource', function () {
        this.$get = function ($resource, common) {
            var Idea = $resource(common.apiUrl + '/ideas/device/' + common.deviceId + '/:_id', {}, {
                update: {
                    method: 'PUT'
                },
                own: {
                    method: 'GET'
                }
            });
            return Idea;
        };
    }).factory('IdeaCache', function(IdeaResource){
        return {
            getAll : function(){
                if(localStorage.getItem("ideas")) {
                    return JSON.parse(localStorage.getItem("ideas"));
                }else{
                    var ideas = IdeaResource.query();
                    ideas.$promise.then(function(){
                        localStorage.setItem("ideas", JSON.stringify(ideas));
                    });
                    return ideas;
                }
            },
            saveLocalStorage : function(ideas){
                setInterval(function(){
                    if(ideas) localStorage.setItem("ideas", JSON.stringify(ideas));
                },1000);
            }
        };
    }).factory('IdeaSync', function(common , $http){
        var interval;
        return {
            startSync : function(ideas){
                var syncing = false;
                //save every 2 seconds
                interval = setInterval(function(){
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
            },
            stopSync : function(){
                interval.stopSync();
            }
        };
    //this is the service that the controller communcates with
	}).factory('IdeaService' , function( IdeaCache , IdeaSync , $http, common){

        localStorage.clear();

        var ideas = IdeaCache.getAll();

		var api =  {
            init : function(){
                console.log(ideas);
                IdeaCache.saveLocalStorage(ideas);
                if(ideas.$promise){
                    ideas.$promise.then(this.checkExpire);
                }else{
                    this.checkExpire();
                }
                IdeaSync.startSync(ideas);
            },
            checkExpire : function(){
                console.log(ideas);
                ideas.forEach(function(idea){
                    if(moment(idea.expire_date).diff(moment()) < 0){
                        idea.public = true;
                    }else{
                        idea.public = false;
                    }
                    idea.expire_date_formatted =  moment(idea.expire_date).fromNow(true);

                });
            },
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
        api.init();
        return api;
	});