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
        $scope.socMedProfs = ['facebook', 'twitter', 'instagram', 'youtube', 'twitch', 'snapchat']
        $scope.view = i=>{
        	window.location.href=`./edit?id=${i}`;
        }
        $scope.remove = a=>{
        	bulmabox.confirm('Remove Athlete',`Are you sure you wish to delete ${a.name}?`,function(r){
        		if(r && r!==null){
        			$http.delete('/aths/one?id='+a._id).then(r=>{
        				$state.go($state.current, {}, {reload: true});
        			})
        		}
        	})
        }
    })