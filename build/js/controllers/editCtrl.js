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
                $http.put('/aths/edit',$scope.editUser).then(r=>{
                    bulmabox.alert('Updated!','Your athlete has been updated!',function(r){
                        $state.go('app.view')
                    })
                })
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