if(window.cordova){
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady(){
        angular.bootstrap(document, ['starter']);
    }
}else{
    angular.bootstrap(document, ['starter']);
}