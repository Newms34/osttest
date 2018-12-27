String.prototype.capMe = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}
app.controller('main-cont', function($scope, $http, $state) {
    $scope.appTitle = 'Opensponsorship Athlete App';
    console.log('main controller registered!');
})
