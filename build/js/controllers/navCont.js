app.controller('nav-cont',function($scope,$http,$state){
	$scope.logout = function() {
        bulmabox.confirm('Logout','Are you sure you wish to logout?', function(resp) {
            if (!resp || resp == null) {
                return true;
            } else {
                $http.get('/user/logout').then(function(r) {
                    $state.go('appSimp.login');
                })
            }
        })
    }
    $http.get('/user/getUsr')
        .then(r=>{
        // console.log('navbar')
        $scope.user= r.data;
        $scope.$digest();
    })
})