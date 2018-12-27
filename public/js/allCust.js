const app = angular.module('os-app', ['ui.router']);

const defaultPic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAACNCAIAAAAPTALlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAANsSURBVHhe7dVRduIwEETR7GkWmK1HhMch9giw1dWyZNf9mZwM2F3vJ1//TM1N9dxUz0313FTPTfVGb/r9Fh8azIhNCbYTXx7AWE3JE8CDDjVEU3pI8egjHN+UBgl4QXdHNmV6Ml7W0WFNWdwFr+zlgKYM7Y7X5+vdlH0H4YhkXZuy7FCckqlfUzYNgIPSdGrKmmFwVo6LNi24LEGPpowYDMclSG/KgiFxotqlmxZcKZXblMMHxqFSiU25enicq+OmN1wsktWUYyfB0SJuesPRIilNuXQqnK7gpuB0BX1TbpwQA8Lc9IkBYW66wIYYcVNOmxYzYtx0gRkxbrrAjBhlU+6aHGMC3HSNMQFuusaYADddY0yAm64xJsBNK9jTStaUc06BSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrWRNCy6aH3tauekaYwLcdI0xAW66xpgAN11jTICbrjEmQNm04K5pMSPGTReYEeOmC8yIcdMFZsSImxZcNyEGhLnpEwPC9E0LbpwKpyu4KThdIaVpwaWT4GgRN73haBE3veFokaymBfcOj3N1EpsWXD0wDpVyU73cpgW3D4kT1dKbFiwYDMcl6NG0YMdIuCzBRZtyVo5OTQvWDICD0vRrWrDpUJySqWvTgmUH4YhkvZsW7OuO1+e7SlPe3cXl/kZxTaZOTRk0Bm5Kk96UHePhvgS5TTl/YBwqldWUk2fAxTopTTl2HtwtIm7KjXNiQ5iyKafNjCUxsqYcNT/2BGiacs5ZsKqVoCmHnAvbmkSbcsIZsXC/UFNefl7s3Km9Ka89O9bu0diUF14DmzdracqrroTl27jpJizfZndTXnI97N9gX1Mef1VU+GRHUx58bbR4y033ocVbW5vySNuQdVNTHmYPdHnBTVvQ5YXPTXmMLVGnxk0bUafmQ1MeYDU0+s+7pnzVXqPUkpuGUGrpZVO+ZJ/Q6w83jaLXH24qQLKHelM+a9tQ7cFNBaj2UGnKB20P2v1yUw3a/Vo35SO2HwXdVIiCbipEwVVT/tNa3TO6qdI9o5sq3TO6qVjJ+GzK7yymlHRTsVLSTcVKSZryC1NwUz031XNTPTfVuzXlRxNxUz031XNTPTfVc1M9N9VzU70v/jWV7+8ffZYE08zo+Y8AAAAASUVORK5CYII=';

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/404');
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'layouts/full.html'
            })
            .state('app.view', {
                url: '/', //default route, if not 404
                templateUrl: 'components/view.html'
            })
            .state('app.create', {
                url: '/create',
                templateUrl: 'components/create.html'
            })
            .state('app.edit', {
                //problem page
                url: '/edit',
                templateUrl: 'components/edit.html'
            })
            //and finally, the error-handling routes!
            .state('app.notfound', {
                url: '/404',
                templateUrl: 'components/404.html'
            })
            .state('app.err', {
                url: '/500',
                templateUrl: 'components/500.html'
            })
        //http interceptor stuffs!
        // $httpProvider.interceptors.push(dcRedirect)
    }]);
//some helper fns
String.prototype.titleCase = function() {
    return this.split(/\s/).map(t => t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
}
Array.prototype.flatMe = function(){
    return [].concat.apply([], this);
}

app.controller('create-cont', function($scope, $http, $state) {
        
    })
    .filter('numToDate', function() {
        return function(num) {
            if (isNaN(num)) {
                return 'Invalid date!';
            }
            const theDate = new Date(num);
            console.log(theDate.getMinutes())
            return `${theDate.toLocaleDateString()} ${theDate.getHours()%12}:${theDate.getMinutes().toString().length<2?'0'+theDate.getMinutes():theDate.getMinutes()} ${theDate.getHours()<13?'AM':'PM'}`;
        };
    })
app.controller('edit-cont', function($scope, $http, $state) {
        
    })
    .filter('numToDate', function() {
        return function(num) {
            if (isNaN(num)) {
                return 'Invalid date!';
            }
            const theDate = new Date(num);
            console.log(theDate.getMinutes())
            return `${theDate.toLocaleDateString()} ${theDate.getHours()%12}:${theDate.getMinutes().toString().length<2?'0'+theDate.getMinutes():theDate.getMinutes()} ${theDate.getHours()<13?'AM':'PM'}`;
        };
    })

String.prototype.capMe = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}
app.controller('main-cont', function($scope, $http, $state) {
    $scope.appTitle = 'Opensponsorship Athlete App';
    console.log('main controller registered!');
})

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
app.controller('view-cont', function($scope, $http, $state) {
        
    })