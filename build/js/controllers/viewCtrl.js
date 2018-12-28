app.controller('view-cont', function($scope, $http, $state,demoFact) {
        $http.get('/aths/all').then(r=>{
        	$scope.allAths = r.data;
        	console.log('ALLATHS now',$scope.allAths)
        	// $scope.$digest();
        })
        $scope.gc = function(cc){
        	return demoFact.allStates().find(cd=>cd.code==cc).name;
        }
        $scope.ms = ['Single','Married','Divorced','Widowed']
    })