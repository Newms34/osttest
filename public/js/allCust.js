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

app.controller('create-cont', function($scope, $http, $state, demoFact) {
        $scope.newUser = {
            name: { data: null, category: 'demog', required: true },
            dob: { data: null, category: 'demog', required: true },
            gender: { data: 0, category: 'demog', required: false }, //0 male, 1 female, 2 other
            nationality: { data: 'US', category: 'demog', required: true },
            about: { data: null, category: 'misc', required: false },
            married: { data: 0, category: 'demog', required: false },
            sports: { data: [], category: 'sports', required: true },
            association: { data: null, category: 'sports', required: true },
            team: { data: null, category: 'sports', required: true },
            facebook: { data: null, category: 'socMed', required: false },
            twitter: { data: null, category: 'socMed', required: false },
            instagram: { data: null, category: 'socMed', required: false },
            youtube: { data: null, category: 'socMed', required: false },
            twitch: { data: null, category: 'socMed', required: false },
            snapchat: { data: null, category: 'socMed', required: false },
            pets: { data: [], category: 'misc', required: false },
            interests: { data: null, category: 'misc', required: false },
            charities: { data: null, category: 'misc', required: false },
            profileImage: { data: null, category: 'misc', required: false },
            alcohol: { data: 0, category: 'misc', required: false },
        }
        $scope.socMedProfs = ['facebook', 'twitter', 'instagram', 'youtube', 'twitch', 'snapchat']
        $scope.catDescs = {
            demog: 'First, some basic information',
            sports: 'Now some information about the sports this athlete plays',
            socMed: "The athlete's social media information",
            misc: "And finally, any other important information!"

        }
        $scope.states = demoFact.allStates();
        $scope.sports = demoFact.allSports();
        $scope.userProps = Object.keys($scope.newUser);
        $scope.currCat = 'demog';
        $scope.getPropPos = () => {
            return $scope.cats.indexOf($scope.currCat);
        }
        $scope.subNewSp = e => {
            if (e.keyCode == 13) {
                e.preventDefault();
                // console.log('someone pressed enter. was it u?')
                $scope.newUser.sports.data.push($scope.newSport);
            }
            // console.log('NEW SPORT EVENT',e)
        }
            $scope.cats = ['demog', 'sports', 'socMed', 'misc'],
        $scope.changeProp = (m) => {
                pos = $scope.cats.indexOf($scope.currCat);
            console.log('m', m, 'pos', pos, 'currCat', $scope.currCat, $scope.userProps)
            if (!m && !!pos) {
                // if($scope.currCat=='charities') pos++;//skip over 
                $scope.currCat = $scope.cats[pos-1];
            } else if (m && pos < $scope.cats.length - 1) {
                $scope.currCat = $scope.cats[pos + 1];
            }
        }
        $scope.updateDob = d => {
            $scope.newUser.dob.data = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        }
        window.onkeyup = e => {
            if (e.code == 'ArrowLeft' && e.shiftKey) {
                $scope.changeProp(false);
                $scope.$digest();
            } else if (e.code == 'ArrowRight' && e.shiftKey) {
                $scope.changeProp(true);
                $scope.$digest();
            }
        }
        //pet stuff
        $scope.newPet = {};
        $scope.addPet = p => {
            if (!unicodePetIcons[p.species.toLowerCase()]) {
                // console.log('find best match!',)
                let suggestion = findBestMatch(p.species, Object.keys(unicodePetIcons)).bestMatch.target;
                bulmabox.confirm('Unknown Pet', `We haven't heard of a ${p.species} before. Did you perhaps mean ${suggestion}? Press Okay too accept this suggestion, or Cancel to keep your pet as ${p.species}.`, r => {
                    if (r && r !== null) {
                        p.species = suggestion;
                    }
                    $scope.newUser.pets.data.push(angular.copy(p));
                    $scope.newPet = {};
                    $scope.$digest();
                })
            } else {
                $scope.newUser.pets.data.push(angular.copy(p));
                $scope.newPet = {};
                $scope.$digest();
            }
        }
        const unicodePetIcons = {
            dog: '🐕',
            cat: '🐈',
            rat: '🐀',
            mouse: '🐁',
            rabbit: '🐇',
            monkey: '🐒',
            snake: '🐍',
            bird: '🐦',
            parrot: '🐦',
            fish: '🐟',
            'hermit crab': '🐚',
            tyrannosaurus: '🦖',
            dinosaur: '🦕 ',
        }
        $scope.getPetIcon = p => {
            return unicodePetIcons[p] || '';
        }
        $scope.submitAthlete = ()=>{
            let stillNeed = $scope.userProps.filter(t=>{
                let tp = $scope.newUser[t];
                return tp.required && (tp.data===null || !tp.data.length);
            });
            console.log(stillNeed)
            if(stillNeed.length){
                bulmabox.alert('Missing Information',`You're still missing some information. Please double-check all fields`)
            }else{
                $http.post('/aths/new',$scope.newUser)
            }
        }
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
app.controller('edit-cont', function($scope, $http, $state,demoFact) {
        let theId = window.location.search.slice(4);
        $http.get('/aths/one?id=' + theId)
            .then(r => {
                console.log(r)
                if(r.data=='notFound'){
                    return bulmabox.alert('Not Found','The chosen athlete ID was not found. Taking you back to the the athlete list...',function(r){
                        $state.go('app.view')
                    })
                }else{

                $scope.userProps.forEach(t=>{
                    $scope.editUser[t].data = r.data[t];
                    if(t==='dob'){
                        let di = r.data[t].split('/')
                        $scope.tempBd = new Date(di[2],di[0]-1,di[1])
                    }
                })
                }
            })
        $scope.editUser = {
            name: { data: null, category: 'demog', required: true },
            dob: { data: null, category: 'demog', required: true },
            gender: { data: 0, category: 'demog', required: false }, //0 male, 1 female, 2 other
            nationality: { data: 'US', category: 'demog', required: true },
            about: { data: null, category: 'misc', required: false },
            married: { data: 0, category: 'demog', required: false },
            sports: { data: [], category: 'sports', required: true },
            association: { data: null, category: 'sports', required: true },
            team: { data: null, category: 'sports', required: true },
            facebook: { data: null, category: 'socMed', required: false },
            twitter: { data: null, category: 'socMed', required: false },
            instagram: { data: null, category: 'socMed', required: false },
            youtube: { data: null, category: 'socMed', required: false },
            twitch: { data: null, category: 'socMed', required: false },
            snapchat: { data: null, category: 'socMed', required: false },
            pets: { data: [], category: 'misc', required: false },
            interests: { data: null, category: 'misc', required: false },
            charities: { data: null, category: 'misc', required: false },
            profileImage: { data: null, category: 'misc', required: false },
            alcohol: { data: 0, category: 'misc', required: false },
        }
        $scope.socMedProfs = ['facebook', 'twitter', 'instagram', 'youtube', 'twitch', 'snapchat']
        $scope.catDescs = {
            demog: 'First, some basic information',
            sports: 'Now some information about the sports this athlete plays',
            socMed: "The athlete's social media information",
            misc: "And finally, any other important information!"

        }
        $scope.states = demoFact.allStates();
        $scope.sports = demoFact.allSports();
        $scope.userProps = Object.keys($scope.editUser);
        $scope.currCat = 'demog';
        $scope.getPropPos = () => {
            return $scope.cats.indexOf($scope.currCat);
        }
        $scope.subNewSp = e => {
            if (e.keyCode == 13) {
                e.preventDefault();
                // console.log('someone pressed enter. was it u?')
                $scope.editUser.sports.data.push($scope.newSport);
            }
            // console.log('NEW SPORT EVENT',e)
        }
        $scope.cats = ['demog', 'sports', 'socMed', 'misc'],
            $scope.changeProp = (m) => {
                pos = $scope.cats.indexOf($scope.currCat);
                console.log('m', m, 'pos', pos, 'currCat', $scope.currCat, $scope.userProps)
                if (!m && !!pos) {
                    // if($scope.currCat=='charities') pos++;//skip over 
                    $scope.currCat = $scope.cats[pos - 1];
                } else if (m && pos < $scope.cats.length - 1) {
                    $scope.currCat = $scope.cats[pos + 1];
                }
            }
        $scope.updateDob = d => {
            $scope.editUser.dob.data = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        }
        window.onkeyup = e => {
            if (e.code == 'ArrowLeft' && e.shiftKey) {
                $scope.changeProp(false);
                $scope.$digest();
            } else if (e.code == 'ArrowRight' && e.shiftKey) {
                $scope.changeProp(true);
                $scope.$digest();
            }
        }
        //pet stuff
        $scope.newPet = {};
        $scope.addPet = p => {
            if (!unicodePetIcons[p.species.toLowerCase()]) {
                // console.log('find best match!',)
                let suggestion = findBestMatch(p.species, Object.keys(unicodePetIcons)).bestMatch.target;
                bulmabox.confirm('Unknown Pet', `We haven't heard of a ${p.species} before. Did you perhaps mean ${suggestion}? Press Okay too accept this suggestion, or Cancel to keep your pet as ${p.species}.`, r => {
                    if (r && r !== null) {
                        p.species = suggestion;
                    }
                    $scope.editUser.pets.data.push(angular.copy(p));
                    $scope.newPet = {};
                    $scope.$digest();
                })
            } else {
                $scope.editUser.pets.data.push(angular.copy(p));
                $scope.newPet = {};
                $scope.$digest();
            }
        }
        const unicodePetIcons = {
            dog: '🐕',
            cat: '🐈',
            rat: '🐀',
            mouse: '🐁',
            rabbit: '🐇',
            monkey: '🐒',
            snake: '🐍',
            bird: '🐦',
            parrot: '🐦',
            fish: '🐟',
            'hermit crab': '🐚',
            tyrannosaurus: '🦖',
            dinosaur: '🦕 ',
        }
        $scope.getPetIcon = p => {
            return unicodePetIcons[p] || '';
        }

        $scope.submitAthlete = ()=>{
            let stillNeed = $scope.userProps.filter(t=>{
                let tp = $scope.editUser[t];
                return tp.required && (tp.data===null || !tp.data.length);
            });
            console.log(stillNeed)
            if(stillNeed.length){
                bulmabox.alert('Missing Information',`You're still missing some information. Please double-check all fields`)
            }else{
                $scope.editUser.id=theId;
                $http.put('/aths/edit',$scope.editUser)
            }
        }
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

})
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
const states = [
{"name": "Afghanistan", "code": "AF"},
{"name": "Åland Islands", "code": "AX"},
{"name": "Albania", "code": "AL"},
{"name": "Algeria", "code": "DZ"},
{"name": "American Samoa", "code": "AS"},
{"name": "AndorrA", "code": "AD"},
{"name": "Angola", "code": "AO"},
{"name": "Anguilla", "code": "AI"},
{"name": "Antarctica", "code": "AQ"},
{"name": "Antigua and Barbuda", "code": "AG"},
{"name": "Argentina", "code": "AR"},
{"name": "Armenia", "code": "AM"},
{"name": "Aruba", "code": "AW"},
{"name": "Australia", "code": "AU"},
{"name": "Austria", "code": "AT"},
{"name": "Azerbaijan", "code": "AZ"},
{"name": "Bahamas", "code": "BS"},
{"name": "Bahrain", "code": "BH"},
{"name": "Bangladesh", "code": "BD"},
{"name": "Barbados", "code": "BB"},
{"name": "Belarus", "code": "BY"},
{"name": "Belgium", "code": "BE"},
{"name": "Belize", "code": "BZ"},
{"name": "Benin", "code": "BJ"},
{"name": "Bermuda", "code": "BM"},
{"name": "Bhutan", "code": "BT"},
{"name": "Bolivia", "code": "BO"},
{"name": "Bosnia and Herzegovina", "code": "BA"},
{"name": "Botswana", "code": "BW"},
{"name": "Bouvet Island", "code": "BV"},
{"name": "Brazil", "code": "BR"},
{"name": "British Indian Ocean Territory", "code": "IO"},
{"name": "Brunei Darussalam", "code": "BN"},
{"name": "Bulgaria", "code": "BG"},
{"name": "Burkina Faso", "code": "BF"},
{"name": "Burundi", "code": "BI"},
{"name": "Cambodia", "code": "KH"},
{"name": "Cameroon", "code": "CM"},
{"name": "Canada", "code": "CA"},
{"name": "Cape Verde", "code": "CV"},
{"name": "Cayman Islands", "code": "KY"},
{"name": "Central African Republic", "code": "CF"},
{"name": "Chad", "code": "TD"},
{"name": "Chile", "code": "CL"},
{"name": "China", "code": "CN"},
{"name": "Christmas Island", "code": "CX"},
{"name": "Cocos (Keeling) Islands", "code": "CC"},
{"name": "Colombia", "code": "CO"},
{"name": "Comoros", "code": "KM"},
{"name": "Congo", "code": "CG"},
{"name": "Congo, The Democratic Republic of the", "code": "CD"},
{"name": "Cook Islands", "code": "CK"},
{"name": "Costa Rica", "code": "CR"},
{"name": "Cote D'Ivoire", "code": "CI"},
{"name": "Croatia", "code": "HR"},
{"name": "Cuba", "code": "CU"},
{"name": "Cyprus", "code": "CY"},
{"name": "Czech Republic", "code": "CZ"},
{"name": "Denmark", "code": "DK"},
{"name": "Djibouti", "code": "DJ"},
{"name": "Dominica", "code": "DM"},
{"name": "Dominican Republic", "code": "DO"},
{"name": "Ecuador", "code": "EC"},
{"name": "Egypt", "code": "EG"},
{"name": "El Salvador", "code": "SV"},
{"name": "Equatorial Guinea", "code": "GQ"},
{"name": "Eritrea", "code": "ER"},
{"name": "Estonia", "code": "EE"},
{"name": "Ethiopia", "code": "ET"},
{"name": "Falkland Islands (Malvinas)", "code": "FK"},
{"name": "Faroe Islands", "code": "FO"},
{"name": "Fiji", "code": "FJ"},
{"name": "Finland", "code": "FI"},
{"name": "France", "code": "FR"},
{"name": "French Guiana", "code": "GF"},
{"name": "French Polynesia", "code": "PF"},
{"name": "French Southern Territories", "code": "TF"},
{"name": "Gabon", "code": "GA"},
{"name": "Gambia", "code": "GM"},
{"name": "Georgia", "code": "GE"},
{"name": "Germany", "code": "DE"},
{"name": "Ghana", "code": "GH"},
{"name": "Gibraltar", "code": "GI"},
{"name": "Greece", "code": "GR"},
{"name": "Greenland", "code": "GL"},
{"name": "Grenada", "code": "GD"},
{"name": "Guadeloupe", "code": "GP"},
{"name": "Guam", "code": "GU"},
{"name": "Guatemala", "code": "GT"},
{"name": "Guernsey", "code": "GG"},
{"name": "Guinea", "code": "GN"},
{"name": "Guinea-Bissau", "code": "GW"},
{"name": "Guyana", "code": "GY"},
{"name": "Haiti", "code": "HT"},
{"name": "Heard Island and Mcdonald Islands", "code": "HM"},
{"name": "Holy See (Vatican City State)", "code": "VA"},
{"name": "Honduras", "code": "HN"},
{"name": "Hong Kong", "code": "HK"},
{"name": "Hungary", "code": "HU"},
{"name": "Iceland", "code": "IS"},
{"name": "India", "code": "IN"},
{"name": "Indonesia", "code": "ID"},
{"name": "Iran, Islamic Republic Of", "code": "IR"},
{"name": "Iraq", "code": "IQ"},
{"name": "Ireland", "code": "IE"},
{"name": "Isle of Man", "code": "IM"},
{"name": "Israel", "code": "IL"},
{"name": "Italy", "code": "IT"},
{"name": "Jamaica", "code": "JM"},
{"name": "Japan", "code": "JP"},
{"name": "Jersey", "code": "JE"},
{"name": "Jordan", "code": "JO"},
{"name": "Kazakhstan", "code": "KZ"},
{"name": "Kenya", "code": "KE"},
{"name": "Kiribati", "code": "KI"},
{"name": "Korea, Democratic People'S Republic of", "code": "KP"},
{"name": "Korea, Republic of", "code": "KR"},
{"name": "Kuwait", "code": "KW"},
{"name": "Kyrgyzstan", "code": "KG"},
{"name": "Lao People'S Democratic Republic", "code": "LA"},
{"name": "Latvia", "code": "LV"},
{"name": "Lebanon", "code": "LB"},
{"name": "Lesotho", "code": "LS"},
{"name": "Liberia", "code": "LR"},
{"name": "Libyan Arab Jamahiriya", "code": "LY"},
{"name": "Liechtenstein", "code": "LI"},
{"name": "Lithuania", "code": "LT"},
{"name": "Luxembourg", "code": "LU"},
{"name": "Macao", "code": "MO"},
{"name": "Macedonia, The Former Yugoslav Republic of", "code": "MK"},
{"name": "Madagascar", "code": "MG"},
{"name": "Malawi", "code": "MW"},
{"name": "Malaysia", "code": "MY"},
{"name": "Maldives", "code": "MV"},
{"name": "Mali", "code": "ML"},
{"name": "Malta", "code": "MT"},
{"name": "Marshall Islands", "code": "MH"},
{"name": "Martinique", "code": "MQ"},
{"name": "Mauritania", "code": "MR"},
{"name": "Mauritius", "code": "MU"},
{"name": "Mayotte", "code": "YT"},
{"name": "Mexico", "code": "MX"},
{"name": "Micronesia, Federated States of", "code": "FM"},
{"name": "Moldova, Republic of", "code": "MD"},
{"name": "Monaco", "code": "MC"},
{"name": "Mongolia", "code": "MN"},
{"name": "Montserrat", "code": "MS"},
{"name": "Morocco", "code": "MA"},
{"name": "Mozambique", "code": "MZ"},
{"name": "Myanmar", "code": "MM"},
{"name": "Namibia", "code": "NA"},
{"name": "Nauru", "code": "NR"},
{"name": "Nepal", "code": "NP"},
{"name": "Netherlands", "code": "NL"},
{"name": "Netherlands Antilles", "code": "AN"},
{"name": "New Caledonia", "code": "NC"},
{"name": "New Zealand", "code": "NZ"},
{"name": "Nicaragua", "code": "NI"},
{"name": "Niger", "code": "NE"},
{"name": "Nigeria", "code": "NG"},
{"name": "Niue", "code": "NU"},
{"name": "Norfolk Island", "code": "NF"},
{"name": "Northern Mariana Islands", "code": "MP"},
{"name": "Norway", "code": "NO"},
{"name": "Oman", "code": "OM"},
{"name": "Pakistan", "code": "PK"},
{"name": "Palau", "code": "PW"},
{"name": "Palestinian Territory, Occupied", "code": "PS"},
{"name": "Panama", "code": "PA"},
{"name": "Papua New Guinea", "code": "PG"},
{"name": "Paraguay", "code": "PY"},
{"name": "Peru", "code": "PE"},
{"name": "Philippines", "code": "PH"},
{"name": "Pitcairn", "code": "PN"},
{"name": "Poland", "code": "PL"},
{"name": "Portugal", "code": "PT"},
{"name": "Puerto Rico", "code": "PR"},
{"name": "Qatar", "code": "QA"},
{"name": "Reunion", "code": "RE"},
{"name": "Romania", "code": "RO"},
{"name": "Russian Federation", "code": "RU"},
{"name": "RWANDA", "code": "RW"},
{"name": "Saint Helena", "code": "SH"},
{"name": "Saint Kitts and Nevis", "code": "KN"},
{"name": "Saint Lucia", "code": "LC"},
{"name": "Saint Pierre and Miquelon", "code": "PM"},
{"name": "Saint Vincent and the Grenadines", "code": "VC"},
{"name": "Samoa", "code": "WS"},
{"name": "San Marino", "code": "SM"},
{"name": "Sao Tome and Principe", "code": "ST"},
{"name": "Saudi Arabia", "code": "SA"},
{"name": "Senegal", "code": "SN"},
{"name": "Serbia and Montenegro", "code": "CS"},
{"name": "Seychelles", "code": "SC"},
{"name": "Sierra Leone", "code": "SL"},
{"name": "Singapore", "code": "SG"},
{"name": "Slovakia", "code": "SK"},
{"name": "Slovenia", "code": "SI"},
{"name": "Solomon Islands", "code": "SB"},
{"name": "Somalia", "code": "SO"},
{"name": "South Africa", "code": "ZA"},
{"name": "South Georgia and the South Sandwich Islands", "code": "GS"},
{"name": "Spain", "code": "ES"},
{"name": "Sri Lanka", "code": "LK"},
{"name": "Sudan", "code": "SD"},
{"name": "Suriname", "code": "SR"},
{"name": "Svalbard and Jan Mayen", "code": "SJ"},
{"name": "Swaziland", "code": "SZ"},
{"name": "Sweden", "code": "SE"},
{"name": "Switzerland", "code": "CH"},
{"name": "Syrian Arab Republic", "code": "SY"},
{"name": "Taiwan, Province of China", "code": "TW"},
{"name": "Tajikistan", "code": "TJ"},
{"name": "Tanzania, United Republic of", "code": "TZ"},
{"name": "Thailand", "code": "TH"},
{"name": "Timor-Leste", "code": "TL"},
{"name": "Togo", "code": "TG"},
{"name": "Tokelau", "code": "TK"},
{"name": "Tonga", "code": "TO"},
{"name": "Trinidad and Tobago", "code": "TT"},
{"name": "Tunisia", "code": "TN"},
{"name": "Turkey", "code": "TR"},
{"name": "Turkmenistan", "code": "TM"},
{"name": "Turks and Caicos Islands", "code": "TC"},
{"name": "Tuvalu", "code": "TV"},
{"name": "Uganda", "code": "UG"},
{"name": "Ukraine", "code": "UA"},
{"name": "United Arab Emirates", "code": "AE"},
{"name": "United Kingdom", "code": "GB"},
{"name": "United States", "code": "US"},
{"name": "United States Minor Outlying Islands", "code": "UM"},
{"name": "Uruguay", "code": "UY"},
{"name": "Uzbekistan", "code": "UZ"},
{"name": "Vanuatu", "code": "VU"},
{"name": "Venezuela", "code": "VE"},
{"name": "Viet Nam", "code": "VN"},
{"name": "Virgin Islands, British", "code": "VG"},
{"name": "Virgin Islands, U.S.", "code": "VI"},
{"name": "Wallis and Futuna", "code": "WF"},
{"name": "Western Sahara", "code": "EH"},
{"name": "Yemen", "code": "YE"},
{"name": "Zambia", "code": "ZM"},
{"name": "Zimbabwe", "code": "ZW"}
],
sports = ["Golf","Tennis","Cricket","Basketball","Baseball","American Football","Aquatics","Archery","Automobile Racing","Badminton","Beach Volleyball","Bobsleigh","Body Building","Boxing","Cross Country Running","Cross Country Skiing","Curling","Cycling","Darts","Decathlon","Down Hill Skiing","Equestrianism","eSports","Fencing","Field Hockey","Figure Skating","Gymnastics","Ice Hockey","Martial Arts","Mixed Martial Arts","Modern Pentathlon","Motorcycle Racing","Netball","Polo","Racquetball","Rowing","Rugby","Sailing","Softball","Shooting","Skateboarding","Skeet Shooting","Skeleton","Snow Boarding","Soccer (Football)","Squash","Surfing","Swimming","Track and Field"];

app.factory('demoFact', function($http) {
    return {
        allStates: function() {
            return states;
        },
        allSports:function() {
        	return sports;
        }
    };
});