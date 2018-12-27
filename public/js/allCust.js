const socket = io(),
    app = angular.module('mathApp-app', ['ui.router', 'ngAnimate', 'ngSanitize','chart.js','ngFileUpload']);

const defaultPic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAACNCAIAAAAPTALlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAANsSURBVHhe7dVRduIwEETR7GkWmK1HhMch9giw1dWyZNf9mZwM2F3vJ1//TM1N9dxUz0313FTPTfVGb/r9Fh8azIhNCbYTXx7AWE3JE8CDDjVEU3pI8egjHN+UBgl4QXdHNmV6Ml7W0WFNWdwFr+zlgKYM7Y7X5+vdlH0H4YhkXZuy7FCckqlfUzYNgIPSdGrKmmFwVo6LNi24LEGPpowYDMclSG/KgiFxotqlmxZcKZXblMMHxqFSiU25enicq+OmN1wsktWUYyfB0SJuesPRIilNuXQqnK7gpuB0BX1TbpwQA8Lc9IkBYW66wIYYcVNOmxYzYtx0gRkxbrrAjBhlU+6aHGMC3HSNMQFuusaYADddY0yAm64xJsBNK9jTStaUc06BSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrWRNCy6aH3tauekaYwLcdI0xAW66xpgAN11jTICbrjEmQNm04K5pMSPGTReYEeOmC8yIcdMFZsSImxZcNyEGhLnpEwPC9E0LbpwKpyu4KThdIaVpwaWT4GgRN73haBE3veFokaymBfcOj3N1EpsWXD0wDpVyU73cpgW3D4kT1dKbFiwYDMcl6NG0YMdIuCzBRZtyVo5OTQvWDICD0vRrWrDpUJySqWvTgmUH4YhkvZsW7OuO1+e7SlPe3cXl/kZxTaZOTRk0Bm5Kk96UHePhvgS5TTl/YBwqldWUk2fAxTopTTl2HtwtIm7KjXNiQ5iyKafNjCUxsqYcNT/2BGiacs5ZsKqVoCmHnAvbmkSbcsIZsXC/UFNefl7s3Km9Ka89O9bu0diUF14DmzdracqrroTl27jpJizfZndTXnI97N9gX1Mef1VU+GRHUx58bbR4y033ocVbW5vySNuQdVNTHmYPdHnBTVvQ5YXPTXmMLVGnxk0bUafmQ1MeYDU0+s+7pnzVXqPUkpuGUGrpZVO+ZJ/Q6w83jaLXH24qQLKHelM+a9tQ7cFNBaj2UGnKB20P2v1yUw3a/Vo35SO2HwXdVIiCbipEwVVT/tNa3TO6qdI9o5sq3TO6qVjJ+GzK7yymlHRTsVLSTcVKSZryC1NwUz031XNTPTfVuzXlRxNxUz031XNTPTfVc1M9N9VzU70v/jWV7+8ffZYE08zo+Y8AAAAASUVORK5CYII=';

Array.prototype.findUser = function(u) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].user == u) {
            return i;
        }
    }
    return -1;
}
let hadDirect = false;
const dcRedirect = ['$location', '$q', '$injector', function($location, $q, $injector) {
    //if we get a 401 response, redirect to login
    let currLoc = '';
    return {
        request: function(config) {
            // console.log('STATE', $injector.get('$state'));
            currLoc = $location.path();
            return config;
        },
        requestError: function(rejection) {
            return $q.reject(rejection);
        },
        response: function(result) {
            return result;
        },
        responseError: function(response) {
            console.log('Something bad happened!', response,currLoc, $location.path())
            hadDirect = true;
            bulmabox.alert(`App Restarting`, `Hi! I've made some sort of change just now to make this app more awesome! Unfortunately, this also means I've needed to restart it. I'm gonna log you out now.`, function(r) {
                fetch('/user/logout')
                    .then(r=>{
                    hadDirect = false;
                    $state.go('appSimp.login', {}, { reload: true })
                    return $q.reject(response);
                })
            })
        }
    }
}];
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/404');
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'layouts/full.html'
            })
            .state('app.dash', {
                url: '/', //default route, if not 404
                templateUrl: 'components/dash.html'
            })
            .state('app.help', {
                url: '/help',
                templateUrl: 'components/help/help.html'
            })
            .state('app.teach', {
                //problem page
                url: '/teach',
                templateUrl: 'components/teach.html'
            })
            .state('app.probs', {
                //problem page
                url: '/probs',
                templateUrl: 'components/probs.html'
            })

            //SIMPLE (login, register, forgot, 404, 500)
            .state('appSimp', {
                abstract: true,
                templateUrl: 'components/layout/simp.html'
            })
            .state('appSimp.login', {
                url: '/login',
                templateUrl: 'components/login.html'
            })
            .state('appSimp.register', {
                url: '/register',
                templateUrl: 'components/register.html'
            })
            //forgot stuff
            .state('appSimp.forgot', {
                url: '/forgot',
                templateUrl: 'components/alt/forgot.html'
            })
            .state('appSimp.reset', {
                url: '/reset',
                templateUrl: 'components/alt/reset.html'
            })
            //unconfirmed usr
            .state('appSimp.unconfirmed', {
                url: '/unconf',
                templateUrl: 'components/alt/unconfirmed.html'
            })
            //and finally, the error-handling routes!
            .state('appSimp.notfound', {
                url: '/404',
                templateUrl: 'components/alt/404.html'
            })
            .state('appSimp.err', {
                url: '/500',
                templateUrl: 'components/alt/500.html'
            })
        //http interceptor stuffs!
        // $httpProvider.interceptors.push(dcRedirect)
    }])
    .directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    const reader = new FileReader(),
                        theFile = changeEvent.target.files[0],
                        tempName = theFile.name;
                    console.log('UPLOADING FILE', theFile);
                    reader.onload = function(loadEvent) {
                        let theURI = loadEvent.target.result;
                        console.log('URI before optional resize', theURI, theURI.length)
                        if (scope.$parent.needsResize) {
                            //needs to resize img
                            resizeDataUrl(scope, theURI, scope.$parent.needsResize, scope.$parent.needsResize, tempName);
                        }else {
                            scope.$apply(function() {
                                scope.$parent.loadingFile = false;
                                scope.$parent.fileName = 'Loaded:' + tempName;
                                scope.fileread = theURI;
                                if (scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI == 'function') {
                                    scope.$parent.saveDataURI(dataURI);
                                }
                            });
                        }
                    }
                    if (!theFile) {
                        scope.$apply(function() {
                            scope.fileread = '';
                            scope.$parent.fileName = false;
                            scope.$parent.loadingFile = false;
                        });
                        return false;
                    }
                    if (theFile.size > 5000000) {
                        bulmabox.alert('File too Large', `Your file ${theFile.name} is larger than 5.0MB. Please upload a smaller file!`)
                        return false;
                    }
                    if(theFile.type.indexOf('audio')<1){
                        //NOT an audio file; likely picture for profile
                        reader.readAsDataURL(theFile);
                    }
                });
            }
        }
    }]);

Array.prototype.rotate = function(n) {
    let arrCop = angular.copy(this);
    for (var i = 0; i < n; i++) {
        arrCop.push(arrCop.shift());
    }
    return arrCop;
};
Date.prototype.dyMo = function() {
    return (this.getMonth() + 1) + '/' + this.getDate();
}
String.prototype.titleCase = function() {
    return this.split(/\s/).map(t => t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
}
Array.prototype.flatMe = function(){
    return [].concat.apply([], this);
}

const resizeDataUrl = (scope, datas, wantedWidth, wantedHeight, tempName) => {
    // We create an image to receive the Data URI
    const img = document.createElement('img');

    // When the event "onload" is triggered we can resize the image.
    img.onload = function() {
        // We create a canvas and get its context.
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // We set the dimensions at the wanted size.
        canvas.width = wantedWidth;
        canvas.height = wantedHeight;

        // We resize the image with the canvas method drawImage();
        ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

        const dataURI = canvas.toDataURL();

        /////////////////////////////////////////
        // Use and treat your Data URI here !! //
        /////////////////////////////////////////
        scope.$apply(function() {
            scope.$parent.loadingFile = false;
            scope.$parent.fileName = 'Loaded:' + tempName;
            scope.fileread = dataURI;
            console.log('checking to see whether parent has saveDataURI')
            if (scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI == 'function') {
                console.log('It does! Savin')
                scope.$parent.saveDataURI(dataURI);
            }
        });
    };

    // We put the Data URI in the image's src attribute
    img.src = datas;
}
const adminApp = angular.module('admin-math-app', [])
    .controller('admin-ctrl', ($scope, $http) => {
        $scope.cols = {
            one: {
                fg: '#f2f2f2',
                bg: '#323232',
                bgHover: '#232323',
                isHovered:false
            },
            two: {
                fg: '#222222',
                bg: '#f2f2f2',
                bgHover: '#d5d5d5',
                isHovered:false
            }
        }
        $scope.stopServer = () => {
            $scope.askStop=true;
            bulmabox.confirm('Shutdown Server', `Are you <i>absolutely</i> sure you wish to shutdown the server? Once shutdown, the server can only be restarted by a professional!`, (resp) => {
                if (resp && resp != null) {
                    $http.get('/admin/stop').then(r => {
                        bulmabox.alert('Server Shut Down', 'The server has been shut down!')
                        $scope.askStop=false;
                    })
                }else{
                    $scope.askStop=false;
                    $scope.$digest();
                }
            })
        }
        $scope.submitCols = () => {
            $http.post('/admin/colors', $scope.cols)
                .then(r => {
                    console.log('color response', r)
                })
        }
        $scope.loadFile = () => {
            $scope.loadingFile = true;
            const fr = new FileReader();
        }
        $scope.sendLogo = () => {
            $http.post('/admin/setLogo', { uri: $scope.logo })
                .then(r => {
                    console.log('logo response', r)
                })
        }
        // console.log('admin scope',$scope)
        // Array.from(document.querySelectorAll('.sample-div')).forEach(sd => {
        //     let col = sd.id.slice(sd.id.indexOf('-') + 1)
        //     sd.addEventListener('mouseover', () => {
        //         // console.log('IN: sd', sd);
        //         $scope.cols[col].isHovered=true;
        //     })
        //     sd.addEventListener('mouseout', () => {
        //         // console.log('OUT: sd', sd);
        //         $scope.cols[col].isHovered=false;
        //     })
        // })
    })
    .directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    const reader = new FileReader(),
                        theFile = changeEvent.target.files[0],
                        tempName = theFile.name;
                    console.log('UPLOADING FILE', theFile);
                    reader.onload = function(loadEvent) {
                        let theURI = loadEvent.target.result;
                        console.log('URI before optional resize', theURI, theURI.length)
                        if (scope.$parent.needsResize) {
                            //needs to resize img
                            resizeDataUrl(scope, theURI, scope.$parent.needsResize, scope.$parent.needsResize, tempName);
                        } else {
                            scope.$apply(function() {
                                scope.$parent.loadingFile = false;
                                scope.$parent.fileName = 'Loaded:' + tempName;
                                scope.fileread = theURI;
                                if (scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI == 'function') {
                                    scope.$parent.saveDataURI(dataURI);
                                }
                            });
                        }
                    }
                    if (!theFile) {
                        scope.$apply(function() {
                            scope.fileread = '';
                            scope.$parent.fileName = false;
                            scope.$parent.loadingFile = false;
                        });
                        return false;
                    }
                    if (theFile.size > 5000000) {
                        bulmabox.alert('File too Large', `Your file ${theFile.name} is larger than 5.0MB. Please upload a smaller file!`)
                        return false;
                    }
                    if (theFile.type.indexOf('audio') < 1) {
                        //NOT an audio file; likely picture for profile
                        reader.readAsDataURL(theFile);
                    }
                });
            }
        }
    }]);
app.controller('dash-cont', function($scope, $http, $state, $filter, musFac) {
        $scope.doUser = function(u) {
            if (!u || !u.user) {
                return false;
            }
            if (!$scope.course) {
                $http.get('/user/getCourse?c=' + u.classes.join(','))
                    .then(r => {
                        console.log('course response is, coarsely', r)
                        $scope.courses = r.data;
                    })
            }
            $scope.user = u;
            $http.get('/user/allUsrs')
                .then(r => {
                    const fData = r.data.filter(t => t.name != $scope.user.user);
                    $scope.modsList = fData.filter(t => !!t.mod);
                    console.log('DATA', r.data, fData, $scope.modsList)
                    $scope.allUsrs = fData;
                })
            console.log($scope.user)
        }
        $scope.needsResize = 65;
        socket.on('msgDashRef', w => {
            if (w.who == $scope.user.user) {
                $http.get('/user/getUsr')
                    .then(r => {
                        $scope.doUser(r.data);
                    })
            }
        })
        $scope.defaultPic = defaultPic;
        $http.get('/user/getUsr')
            .then(r => {
                $scope.doUser(r.data);
            })
        $scope.tabs = [{
            name: 'My Stuff',
            icon: 'user'
        }, {
            name: 'My Finished Exercises',
            icon: 'pencil-square'
        }, {
            name: 'Mail',
            icon: 'envelope'
        }];
        $scope.loadFile = () => {
            $scope.loadingFile = true;
            const fr = new FileReader();
        }
        $scope.saveDataURI = (d) => {
            $http.post('/user/changeAva', {
                    img: d
                })
                .then(r => {
                    $scope.doUser(r.data);
                })
        }
        $scope.showTab = (t) => {
            $scope.currTab = t;
        }
        $scope.currTab = 'My Stuff';
        $scope.outBx = false;
        $scope.describeClass = (c) => {
            bulmabox.alert(c.title, `Teacher:${c.teacher}<br>Description:${c.description}`)
        }
        $scope.newMsg = () => {
            const usrs = $scope.allUsrs.map(t => {
                return `<option value='${t.name}'>${t.name}${t.mod?' (teacher/moderator)':''}</option>`;
            })
            bulmabox.custom('New Message', `
                    <label class="label">To: </label>
                <div class="select">
                        <select id='new-msg-to'>${usrs}</select>
                </div>
                <div class="field">
                    <label class="label">Message</label>
                    <div class="control">
                        <textarea class="textarea" type="text" id='new-msg-msg' placeholder="Write something. Be nice!"></textarea>
                    </div>
                </div>
                `, function() {
                //do things
                const newMsg = {
                    to: document.querySelector('#new-msg-to').value,
                    msg: document.querySelector('#new-msg-msg').value
                }
                if (!newMsg.msg || newMsg.msg == '') {
                    return bulmabox.alert('No message', "If you're gonna send a message, you gotta say something!");
                }
                $http.post('/user/sendMsg', newMsg).then(r => {
                    //do nuffin
                })
            }, `<button class='button is-link' onclick='bulmabox.runCb(bulmabox.params.cb,true)'>Say It!</button><button class='button is-info' onclick='bulmabox.kill("bulmabox-diag")'>Nevermind...</button>`)
        }
        $scope.viewMsg = (m) => {
            const toOrFrom = m.to ? 'to' : 'from';
            bulmabox.alert(`Message ${toOrFrom} ${m.to?m.to:m.from}:`, m.msg);
            if (!m.from) {
                //no set read if outgoing
                return false;
            }
            $http.get('/user/setOneRead?id=' + m._id)
                .then(ro => {
                    $scope.doUser(ro.data);
                })
        }
        $scope.replyMsg = (m) => {
            // console.log('User wishes to reply to message',m)
            if (m.from == 'SYSTEM') {
                return false;
            }
            bulmabox.custom('Reply to Message', `
                <label class="label">To: </label>
                <div class="control">
                        <input class="input" type="text" value = '${m.from}' readonly title="Who you're replying to">
                    </div>
                <div class="field">
                    <label class="label">Message</label>
                    <div class="control">
                        <textarea class="textarea" type="text" id='repl-msg-msg' placeholder="Reply to this message! Be nice!"></textarea>
                    </div>
                </div>
                `, function() {
                //do things
                const replMsg = {
                    from: m.from,
                    msg: document.querySelector('#repl-msg-msg').value
                }
                console.log("Message", replMsg, 'original', m)
                $http.post('/user/replyMsg', replMsg)
                    .then(ro => {
                        $scope.doUser(ro.data)
                    })
            }, `<button class='button is-link' onclick='bulmabox.runCb(bulmabox.params.cb,true)'>Reply!</button><button class='button is-info' onclick='bulmabox.kill("bulmabox-diag")'>Nevermind...</button>`)
        }
        $scope.delMsg = (m) => {
            bulmabox.confirm('Delete Message', 'Are you sure you wish to delete this message?', r => {
                if (r && r !== null) {
                    $http.post('/user/delMsg', m)
                        .then(r => {
                            bulmabox.alert('Deleted Message', 'Your message has been deleted!')

                            $scope.doUser(r.data);
                        })
                }
            })
        }
        $scope.repMsg = (m) => {
            console.log('user mite wanna report', m)
            const opts = $scope.modsList.map(md => `<option value='${md.name}'>${md.name}</option>`).join('');
            bulmabox.confirm('Report Message', `Reporting this message will let your teacher know something's wrong!<br>Which teacher do you wanna let know?<br><div class='select'><select id='picked-mod'>${opts}</select></div>`, r => {
                if (r && r !== null) {
                    m.theMod = document.querySelector('#picked-mod').value;
                    $http.post('/user/repMsg', m)
                        .then(r => {
                            bulmabox.alert('Message Reported', `Your message was reported to ${m.theMod}!`);
                            $scope.doUser(r.data);
                        })
                }
            })
        }
        $scope.refreshExercises = () => {
            $http.get('/user/allDone')
                .then(r => {
                    console.log('Userz done probls', r)
                    $scope.exercises = r.data;
                })
        }
        $scope.numCorrect = r => {
            if (!r || !r.probs || !r.probs.length) return 0;
            return r.probs.filter(t => !!t.isCorrect).length;
        }
        $scope.numCorPerc = r => Math.floor(r * 1000) / 10;
        $scope.getCorrectColor = (r) => {
            const corPerc = Math.max(0.5,r.probs.filter(t => !!t.isCorrect).length / r.probs.length)-.5,
                hue = 240*corPerc;
            return `hsl(${hue},40%,40%)`;
        }
        $scope.refreshExercises();
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
app.controller('forgot-cont', function($scope, $http, $state) {
    console.log("usr forgot stuffs")
    $scope.makeChoice = isEmail=>{
    	$scope.choice = isEmail?'email':'teacher';
    }
    $scope.switchChoice = ()=>{
    	if($scope.choice=='email'){
    		return $scope.choice='teacher';
    	}
    	return $scope.choice='email';
    }
    $http.get('/user/allMods')
        .then(r=>{
            $scope.mods= r.data;
        })
    $scope.sendChoice = c=>{
    	if(!$scope.user){
    		return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Username',`We gotta know who you are before we can recover your password! <br>Please enter a username.`)
    	}
    	if(c=='email'){
    		const origin = `${window.location.protocol}//${window.location.host}`;
    		$http.get(`/user/forgotEmail?user=${$scope.user}&origin=${origin}`)
    		.then(r=>{
    			console.log('RESPONSE IS',r)
    			if(r.data=='noUsr'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;User Not Found',`We couldn't find a user by that name. Are you sure you spelled it correctly?`)
    			}
    			if(r.data=='noEmail'){
    				return bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Email',`We found your account, but sadly it doesn't have an email linked to it! You can always ask a teacher to reset your account instead.`,r=>{
    					if(r && r!=null){
    						$scope.choice='teacher';
    						$scope.$digest();
    					}
    				})
    			}
    			if(r.data=='google'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Google Account',`It looks like this account is a Google account. We're not Google (sadly), so we can't reset your password.`)
    			}
    			bulmabox.alert('<i class="fa fa-envelope-o"></i>&nbsp;Email Sent!',`We've sent an email to the address linked to your account! Check your email for a password reset link.`)
    		})
    	}else{
    		if(!$scope.teacherChoice){
    			return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Teacher',`Please pick a teacher to ask to reset your password!`)
    		}
    		const origin = `${window.location.protocol}//${window.location.host}`;
    		$http.get(`/user/forgotMsg?user=${$scope.user}&teacher=${$scope.teacherChoice}&origin=${origin}`)
    		.then(r=>{
    			console.log('RESPONSE IS',r)
    			if(r.data=='noUsr'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;User Not Found',`We couldn't find a user by that name. Are you sure you spelled it correctly?`)
    			}
    			if(r.data=='google'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Google Account',`It looks like this account is a Google account. We're not Google (sadly), so we can't reset your password.`)
    			}
    			if(r.data=='noTeacher'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Teacher Not Found',`Somehow we can't find a teacher with that name. You can try picking a different teacher if you want!`)
    			}
    			if(r.data=='dup'){
    				return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;User Same as Teacher',`You can't reset your own password!`)
    			}
    			bulmabox.alert('<i class="fa fa-envelope-o"></i>&nbsp;Message Sent!',`We've sent message to ${$scope.teacherChoice} to reset the password for ${$scope.user}!`)
    		})
    	}
    }
})

app.controller('log-cont', function($scope, $http, $state, $q, userFact) {
    $scope.noWarn = false;
    $scope.nameOkay = true;
    delete localStorage.brethUsr;
    //check if we have the 'wrong school' opt
    if(window.location.href.indexOf('wrongSchool')>-1){
        bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Wrong School', "It looks like you're on the wrong school's website. Check the URL above and make sure you're using your school's website!")
    }
    $scope.checkTimer = false;
    $scope.goReg = () => {
        $state.go('appSimp.register')
    };
    $scope.goLog = () => {
        $state.go('appSimp.login')
    };
    $scope.forgot = () => {
        // if (!$scope.user) {
        //     return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Forgot Password', 'To receive a password reset email, please enter your username!');
        // }
        bulmabox.alert('Forgot Password',`Forgot your password? <br/>No problem! We'll take you over to recover it now!`,function(){
            $state.go('appSimp.forgot')
        })
    }
    $scope.signin = () => {
        $http.post('/user/login', { user: $scope.user, pass: $scope.pwd })
            .then((r) => {
                console.log(r);
                if (!r.data) {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Incorrect Login', 'Either your username or password (or both!) are wrong. \nClick "Forgot your password?" if you can\'t remember it!\nIf you still can\'t login, make sure you\'re at the correct school\'s website.');
                } else {
                    // delete r.data.msgs;
                    // console.log(io)
                    socket.emit('chatMsg', { msg: `${$scope.user} logged in!` })
                    localStorage.brethUsr = JSON.stringify(r.data);
                    $state.go('app.dash');
                }
            })
            .catch(e => {
                if(e.data=='banned'){
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Banned', "You've been banned! Better talk with your teacher!")
                }else if(e.data=='unconfirmed'){
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Unconfirmed', "Hi!<br>Your account isn't confirmed yet!<br>We need to make sure it's really you, so go tell your teacher to confirm your account.")
                }else if(e.data=='wrongSchool'){
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Wrong School', "It looks like you're on the wrong school's website. Check the URL above and make sure you're using your school's website!")
                }
                console.log(e);
            })
    }
    $scope.checkUser = () => {
        if ($scope.checkTimer) {
            clearTimeout($scope.checkTimer);
        }
        $scope.checkTimer = setTimeout(function() {
            $http.get('/user/nameOkay?name=' + $scope.user)
                .then((r) => {
                    $scope.nameOkay = r.data;
                })
        }, 500)
    }
    $scope.register = () => {
        if (!$scope.pwd || !$scope.pwdDup || !$scope.user) {
            bulmabox.alert('Missing Information', 'Please enter a username, and a password (twice).')
        } else if ($scope.pwd != $scope.pwdDup) {
            console.log('derp')
            bulmabox.alert('Password Mismatch', 'Your passwords don\'t match, or are missing!');
        } else {
            $http.post('/user/new', {
                    user: $scope.user,
                    pass: $scope.pwd
                })
                .then((r) => {
                    console.log('now logging in with',$scope.user,$scope.pwd)
                    $http.post('/user/login', { user: $scope.user, pass: $scope.pwd })
                        .then((r) => {
                            // we shouldnt ever be here, since the user will by default be unconfirmed
                            // $state.go('appSimp.unconfirmed')
                        })
                        .catch(e=>{
                            console.log('ERROR WUZ',e,'WE WUZ ERRS N SHIET')
                            $state.go('appSimp.unconfirmed')
                        })
                })
        }
    }
    $scope.googLog = () => {
        // $http.get('/user/google')
        //     .then(r => {
        //         console.log("You shouldnt be here!")
        //     })
        window.location.href='./user/google';
        // $scope.loading=true;

        // window.open('/user/google', "Google Sign In", "location=1,status=1,scrollbars=1, width=800,height=800");
        // let listener = window.addEventListener('message', (message) => {
        //     //stuff
        // });
    }
    window.addEventListener('message',function(r){
        console.log(r);
        // $scope.user = r.data.user;
        $state.go('app.dash')
    })
});
String.prototype.capMe = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}
app.controller('main-cont', function($scope, $http, $state,userFact,musFac) {
    $scope.appTitle = 'MathApp'
    musFac.createMus();
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
const randSort = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // eslint-disable-line no-param-reassign
    }
    return arr;
}

app.controller('prob-cont', function($scope, $http, $state, $filter, $sce, $window, Upload, musFac) {
    //controller for problem pages
    //this takes the user, then gets active problems they're on
    $scope.doUser = function(u) {
        if (!u || !u.user) {
            return false;
        }
        $scope.user = u;
        $scope.getClasses();
        console.log($scope.user)
    };
    $scope.currClass = null;
    $http.get('/user/getUsr')
        .then(r => {
            $scope.doUser(r.data);
        });
    $scope.story = (p) => {
        bulmabox.alert('Story Exercise', p.desc);
    }
    $scope.playedSound = false;
    $scope.playSound = (fn) => {
        $scope.playedSound = true;
        $scope.playing = true;
        // console.log(musFac.getMusic(fn).success)
        musFac.getMusic(fn).then(r => {
            $scope.probSet.waitForAudio = false;
            $scope.playing = false;
        });
    }
    $scope.stopSound = () => {
        musFac.musOff();
    }
    socket.on('soundDone', function(r) {
        console.log('Sound finished for', r)
    })
    $scope.courseId = null;
    $scope.getCurrProbs = () => {
        $http.get('/probSet?c=' + $scope.courseId)
            .then(r => {
                $scope.pSet = r.data;
            })
    }
    $scope.getClasses = () => {
        $http.get('/user/getCourses')
            .then(r => {
                $scope.classes = r.data;
            })
    }
    $scope.pickClass = (c) => {
        console.log('compare classes', c._id, $scope.currClass)
        if ($scope.currClass && $scope.questions) {
            let oldClass = $scope.classes.find(cl => $scope.currClass == cl._id);
            bulmabox.confirm('Change Active Class', `Hey! You're about to change your active class from ${oldClass.title} to ${c.title}. <br>That's gonna erase your progress on any current work in ${oldClass.title}! <br>Are you sure you wanna continue?`, function(r) {
                if (r && r != null) {
                    $scope.currClass = c._id;
                    $scope.getAndParseProbs(c._id);
                    $scope.$digest();
                } else {
                    return false;
                }
            })
        } else {
            $scope.currClass = c._id;
            $scope.getAndParseProbs(c._id);
        }
    }
    $scope.getAndParseProbs = (id) => {
        //get problem set via this user and current class id.
        console.log('getting problems for current exercise for course with id', id)
        $http.get('/prob/probSetByClass?c=' + id)
            .then(r => {
                console.log('CLASS RESPONSE:', r)
                if (r.data == 'noclass') {
                    $scope.probSet = { title: '(No assignments for this class)' };
                    $scope.questions = null;
                    $scope.noRedoWarn = false;
                    return false;
                }
                $scope.noRedoWarn = !!r.data.ps.theresNoGoinBack;
                $scope.sortProbs(r.data.ps, r.data.qs);
                // $scope.probSet = $scope.sortProbs(r.data.ps);
                // $scope.questions = r.data.qs;
                $scope.probSet.startTime = Date.now();
            })
    }
    $scope.togglePickAns = q => {
        q.pickedAns == "yes" ? q.pickedAns = "no" : q.pickedAns = "yes";
    }
    $scope.sortProbs = (ps, qs) => {
        //ps is problem SET (meta-info-ish), qs are the individual questions
        $scope.probSet = ps;
        if (ps.kind == 'probFillin' || ps.kind == 'probSimple') {
            $scope.questions = qs.map(q => {
                q.pickedAns = null;
                return q;
            });
        } else if (ps.kind == 'probPick') {
            $scope.questions = qs.map(q => {
                q.pickedAns = 'no';
                return q;
            });
        } else {
            $scope.questions = {
                que: randSort(qs.map(q => {
                    q.pickedAns = null;
                    q.ansIdx = null;
                    q.line = { start: null, dist: null, ang: null }
                    return q;
                })),
                ans: randSort(qs.map(q => {
                    return q;
                })),
                currPickQ: {
                    idx: null,
                    el: null
                }
            };
        }
    }
    $scope.matchPick = (idx, ev, reset) => {
        const lineBoxDims = document.querySelector('#match-lines').getBoundingClientRect();
        if (reset) {
            // if we clicked a question, reset this pick 'round'.
            console.log('Reset! question is now number', idx)
            $scope.questions.currPickQ.idx = idx;
            $scope.questions.currPickQ.el = ev.currentTarget;
        } else if (!$scope.questions.currPickQ.idx && $scope.questions.currPickQ.idx !== 0) {
            //clicked an answer before a question.
            bulmabox.alert('No Question Selected', 'Please pick a question first!')
        } else {
            isAlreadyPicked = $scope.questions.que.filter(t => t.ansIdx === idx).length;
            if (isAlreadyPicked) {
                return bulmabox.alert('Already Picked', "You've already picked this answer. Remember: each question has an answer!")
            }
            $scope.questions.que[$scope.questions.currPickQ.idx].pickedAns = $scope.questions.ans[idx].ans;
            const startEl = $scope.questions.currPickQ.el.getBoundingClientRect(),
                endEl = ev.currentTarget.getBoundingClientRect(),
                start = {
                    x: $scope.questions.currPickQ.el.offsetLeft + startEl.width,
                    y: $scope.questions.currPickQ.el.offsetTop + (startEl.height / 2) + document.body.scrollTop
                },
                end = {
                    x: ev.currentTarget.offsetLeft,
                    y: ev.currentTarget.offsetTop + (startEl.height / 2) + document.body.scrollTop
                },
                dist = Math.sqrt(Math.pow(Math.abs(start.x - end.x), 2) + Math.pow(Math.abs(start.y - end.y), 2)),
                ang = Math.atan((end.y - start.y) / (end.x - start.x)) * 180 / Math.PI;
            $scope.questions.que[$scope.questions.currPickQ.idx].line = {
                start: start,
                dist: dist,
                ang: ang
            };
            console.log('Added line at index:', $scope.questions.currPickQ.idx, 'is', $scope.questions.que[$scope.questions.currPickQ.idx].line)
            $scope.questions.que[$scope.questions.currPickQ.idx].ansIdx = idx;
            $scope.questions.currPickQ.idx = null;
            console.log($scope.questions.currPickQ.el, ev.currentTarget, startEl, endEl, start, end)
        }

    }
    $scope.checkUndone = () => {

        let hasUnfinished = null;
        if ($scope.probSet.kind !== 'probMatch') {
            hasUnfinished = $scope.questions.filter(q => !q.pickedAns && q.pickedAns !== 0).length;
            console.log('submitting answers', $scope.questions.map(t => t.pickedAns))
        } else {
            hasUnfinished = $scope.questions.que.filter(q => !q.pickedAns && q.pickedAns !== 0).length;
            console.log('submitting answers', $scope.questions.que.map(t => t.pickedAns))
        }
        if (hasUnfinished) {
            bulmabox.confirm("You're not done!", "You've still got some unanswered problems! <br>You can submit now, but you might lose points!<br>Continue anyway?", (r) => {
                if (r && r != null) {
                    $scope.submitProbs();
                } else {
                    return false;
                }
            })
        } else {
            bulmabox.confirm('Submit Answers', "Are you sure you're done?", (r) => {
                if (r && r != null) {
                    $scope.submitProbs();
                } else {
                    return false;
                }
            })
        }
    }
    $scope.submitProbs = () => {
        $scope.probSet.endTime = Date.now();
        let sendObj = { pSet: $scope.probSet, cid: $scope.currClass };
        if ($scope.probSet.kind !== 'probMatch') {
            sendObj.qs = $scope.questions;
        } else {
            sendObj.qs = $scope.questions.que;
        }
        $http.post('/user/submit', sendObj)
            .then(r => {
                $scope.getAndParseProbs($scope.currClass)
            })
    }
    $scope.setupAutoSubmit = () => {
        //this submits this problem on ANY close/exit action, in addition to clicking 'submit'.
        console.log('PROB SET for SETUP AUTO SUBMIT', $scope.probSet)
        if (!$scope.probSet.theresNoGoinBack) {
            console.log('no tngb')
            return $scope.noRedoWarn = false;
        }
        $scope.noRedoWarn=false;
        window.addEventListener('beforeunload', (event) => {
            event.returnValue  = prompt('You sure?');
        });
    }
})
app.controller('reset-cont', function($scope, $http, $state) {
    console.log('reset ctrl stoof', window.location.search.slice(3))
    $scope.resetCode = window.location.search.slice(3)
    $http.get('/user/reset?k=' + $scope.resetCode)
        .then(r => {
            console.log('response from reset code check', r)
            if (!r.data) {
                return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Incorrect Reset Code', `The reset code you've provided isn't correct. Please check it and try again`, () => {
                    $state.go('appSimp.login')
                })
            }
            $scope.user = r.data;
        })
    $scope.sendReset = () => {
        if (!$scope.pwd || !$scope.pwdDup || $scope.pwd != $scope.pwdDup) {
            return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Invalid Passwords', 'Please provide two identical passwords.')
        }
        $http.post('/user/resetPwd', { key: $scope.resetCode, pass: $scope.pwd })
            .then(r => {
                //do something
                if (r.data && r.data == 'done') {
                    bulmabox.alert('Password Reset', 'Your password has been reset! Keep it in a safe place!', () => {
                        $state.go('appSimp.login')
                    })
                } else {
                	bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Reset Error','There was a problem resetting your password. Sorry!')
                }
            })
    }
})
app.controller('teach-cont', function($scope, $http, $state, Upload, $q, musFac) {
        $scope.secTim = null;
        $scope.tab = 'create'; //show manage students tab?
        $scope.pickedCourse = null;
        $scope.defaultPic = defaultPic;
        $scope.sampleProb = {
            show: false,
            secondNum: 3,
            op: 'x',
            firstNum: 1,
            ans: 3,
            vert: false,
            simpleOnly: true
        }
        $scope.redoSample = (reqs) => {
            console.log('REDO SAMPLE', reqs);
            //NOTE: for DIVISION problems SECOND comes FIRST
            $scope.sampleProb.firstNum = reqs.needs.find(t => t.title == 'Associated number').val;
            $scope.sampleProb.op = reqs.op;
            let hasSetAns = false;
            if ($scope.sampleProb.op == '-' && $scope.sampleProb.simpleOnly) {
                $scope.sampleProb.secondNum = Math.ceil(Math.random() * $scope.sampleProb.firstNum);
            } else if ($scope.sampleProb.op == '/' && $scope.sampleProb.simpleOnly) {
                $scope.sampleProb.ans = Math.ceil(Math.random() * 12);
                hasSetAns = true;
                $scope.sampleProb.secondNum = $scope.sampleProb.ans * $scope.sampleProb.firstNum;
            } else {
                $scope.sampleProb.secondNum = Math.ceil(Math.random() * 12);
            }

            if (!hasSetAns) {
                switch ($scope.sampleProb.op) {
                    case '+':
                        $scope.sampleProb.ans = $scope.sampleProb.firstNum + $scope.sampleProb.secondNum;
                        break;
                    case '-':
                        $scope.sampleProb.ans = $scope.sampleProb.firstNum - $scope.sampleProb.secondNum;
                        break;
                    case '/':
                        $scope.sampleProb.ans = $scope.sampleProb.secondNum / $scope.sampleProb.firstNum;
                        break;
                    default:
                        $scope.sampleProb.ans = $scope.sampleProb.firstNum * $scope.sampleProb.secondNum;

                }
            }
            $scope.sampleProb.show = true;
        }
        $scope.probTypes = [{
            lng: 'Guided Fill-In/Word Problems',
            sht: 'probFillin',
            desc: 'Fill-in style problems in which two numbers and an operation are provided, and the student must fill in the final number to complete the problem. May include descriptive bits to make a word problem.'
        }, {
            lng: 'Simple Fill-In/Word Problems',
            sht: 'probSimple',
            desc: 'Fill-in style problems in which only a blank is provided (which the student must then fill in). Must include descriptive bits to make a word problem (and to tell the student what to write!).'
        }, {
            lng: 'Matching',
            sht: 'probMatch',
            desc: 'Matching style problem in which the student must match each question to its correct answer.'
        }, {
            lng: 'Pick Correct',
            sht: 'probPick',
            desc: 'Student must pick correct answers out of a batch of correct and incorrect ones.'
        }]
        $scope.viewStuEx = {
            active: false,
            title: null,
            desc: null,
            usr: null,
            probs: [],
            kind: null
        }
        $scope.newCourse = {
            title: null,
            desc: null
        }
        $scope.newProbSet = {
            kind: 'probFillin',
            kindDesc: 'Fill-in style problems in which two numbers and an operation are provided, and the student must fill in the final number to complete the problem. May include descriptive bits to make a word problem.',
            probs: [],
            sound: null,
            audMode: 'No Audio',
            tags: [],
            theresNoGoinBack: false,
            picture: {
                pic: null
            }

        };
        $scope.checkGenerate = () => {
            if ($scope.newProbSet && $scope.newProbSet.kind == 'probSimple') {
                return bulmabox.alert('Cannot Auto-Generate', 'Unfortunately, Simple Fill-In/Word Problems cannot be auto-generated, as they require an explanatory paragraph to inform the student <i>what</i> to put in the blank.')
            }
            $scope.tab = "generate";
            $scope.regetAll();
        }
        $scope.cancelAddClass = () => {
            $scope.addingClass = false;
            $scope.newCourse.title = null;
            $scope.newCourse.desc = null;
        }
        $scope.doAddClass = () => {
            if (!$scope.newCourse.title || !$scope.newCourse.desc) {
                return bulmabox.alert('Missing Info', 'Your course needs to have both a title and a description!')
            }
            console.log("User wishes to create new course", $scope.newCourse)
            $http.post('/user/newCourse', $scope.newCourse).then(r => {
                console.log('after adding course, response is', r)
                $scope.regetAll();
                $scope.cancelAddClass();
                $http.get('/user/getUsr').then(q => {
                    $scope.doUser(q.data)
                })
            })
        }
        $scope.regetTags = () => {
            return $http.get('/prob/tags').then(r => {
                $scope.filtTags(r.data.map(t => t.tag));
            })
        };
        $scope.doUser = function(u) {
            if (!u || !u.user) {
                return false;
            }
            if (!$scope.secTim) {
                $scope.secTim = setInterval(function() {
                    if (!$scope.user.mod) {
                        //redirect (probly student) to dashboard if they're trying to access teacher page.
                        //this runs every 500 ms to prevent student from having time to access this page, change vars, and thus halt app
                        $state.go('app.dash')
                    }
                }, 500)
            }
            $scope.user = u;
            $scope.regetAll(false);
        };
        $scope.setCourse = (c, oldId) => {
            console.log('SETTING COURSE TO', c, $scope.pickedCourse)
            if (!c) { return false }
            $scope.courseId = oldId || c._id.toString();
            if ($scope.psetClassSort && $scope.psetClassSort.isin && $scope.studClassSort && $scope.studClassSort.isin) {
                $scope.studClassSort.isin = $scope.getAssignList($scope.studClassSort.isin, $scope.psetClassSort.isin)
            }
            $scope.regetAll();
        }
        $scope.regetCourses = (stu, crs) => {
            return $http.get('/user/getCourses').then(r => {
                console.log('Course response', r)
                $scope.tClasses = r.data;
                $scope.originalClasses = angular.copy(r.data);
            })
        }
        $scope.regetStudents = (stu, crs) => {
            return $http.get('/user/getStudents').then(r => {
                console.log('student response', r)
                $scope.students = r.data;
                $scope.sortStudents(crs || null);
            })
        }
        $scope.regetPsets = (stu, crs) => {
            console.log('Trying to get psets! course id is', $scope.courseId)
            return $http.get('/prob/all?c=' + $scope.courseId)
                .then(r => {
                    console.log('PSET results', r, 'PC', crs)
                    $scope.psets = r.data;
                    $scope.sortPsets(crs);
                })
        }
        $scope.sortStudents = (pc) => {
            console.log('pickedCourse (in sortstudents)', $scope.pickedCourse, pc, $scope.students)
            if (!pc && !$scope.pickedCourse) {
                return false;
            } else if (!pc) {
                pc = { _id: $scope.pickedCourse._id }
            }
            $scope.studClassSort = {
                isin: $scope.students.filter(t => t.classes.indexOf(pc._id) > -1),
                isout: $scope.students.filter(t => t.classes.indexOf(pc._id) < 0)
            }
            console.log('At end of sort', $scope.studClassSort, pc, pc._id, $scope.students)
            if ($scope.psetClassSort && $scope.psetClassSort.isin) {
                $scope.studClassSort.isin = $scope.getAssignList($scope.studClassSort.isin, $scope.psetClassSort.isin)
            }
        }
        $scope.sortPsets = (pc) => {
            if ((!pc && !$scope.pickedCourse) || !$scope.psets) {
                return false;
            } else if (!pc) {
                pc = { _id: $scope.pickedCourse._id }
            }
            if (pc._id) {
                pc = pc._id;
            }
            console.log('pset', $scope.psets, 'pc', pc)
            $scope.psetClassSort = {
                isin: $scope.psets.filter(t => t.courses.indexOf(pc) > -1),
                isout: $scope.psets.filter(t => t.courses.indexOf(pc) < 0)
            }
            setTimeout(function() {
                $scope.positionChainMap($scope.psetClassSort.isin);
            }, 200)
            console.log('pickedCourse', $scope.pickedCourse, pc, 'psetClassSort', $scope.psetClassSort)
            if ($scope.studClassSort && $scope.studClassSort.isin) {
                $scope.studClassSort.isin = $scope.getAssignList($scope.studClassSort.isin, $scope.psetClassSort.isin)
            }
        }
        $http.get('/user/getUsr')
            .then(r => {
                $scope.doUser(r.data);
            });
        $scope.exerciseDetails = t => {
            let wfa = t.sound && t.waitForAudio ? `<i>Students must wait for audio to finish before answering problems</i><br/>` : '',
                tagEls = t.tags.map(t => `<div class='tag is-dark'>${t}</div>`).join('');
            bulmabox.alert(t.title, `
                    <strong>Description:</strong> ${t.text}<br/>
                    <strong>Audio:</strong> ${t.sound||'none'}<br/>
                    ${wfa}
                    <strong>Tag(s):</strong>${tagEls}
                    `)
        }
        $scope.loadFile = () => {
            $scope.loadingFile = true;
            const fr = new FileReader();
        }
        $scope.submitAudio = function(fl) {
            console.log('gonna try to upload', fl)
            $scope.fl = fl;
            // if ($scope.file) { //check if from is valid
            $scope.upload($scope.fl); //call upload function
            // }
        }
        $scope.regetAll = () => {
            const crs = $scope.pickedCourse,
                stu = null;
            $scope.courseId = $scope.pickedCourse && $scope.pickedCourse._id;
            console.log('regetting everything', crs, stu, $scope.courseId, this);
            let els = ['Students', 'Courses', 'Psets', 'Tags'];
            if (crs || $scope.courseId) {
                els = ['Students', 'Psets', 'Tags'];

            }
            const proms = els.map(t => {
                console.log(`Trying to run function reget${t}:`, $scope['reget' + t])
                return $scope['reget' + t](crs, stu);
            })
            $q.all(proms).then(r => {
                console.log('AFTER?', r)
                if (crs || $scope.courseId) {
                    $scope.sortPsets(crs)
                }
            })
        }
        $scope.attemptKindChange = p => {
            console.log('AKC', p)
            if ($scope.newProbSet && p.sht == $scope.newProbSet.kind) return false; //no change
            if ($scope.newProbSet && $scope.newProbSet.probs.length) {
                return bulmabox.alert(`Can't Change Problem Type`, `Hey! Because of how MathApp works, you can't mix multiple exercise types within a single exercise set. Please delete all of the exercises in this set <i>before</i> you change the exercise type!`)
            }
            $scope.newProbSet.kind = p.sht;
            $scope.newProbSet.kindDesc = p.desc;
        };
        $scope.changeStudentStatus = (st, crs, mode) => {
            const title = mode == true ? 'Add Student' : 'Remove Student',
                desc = mode == true ? 'Are you sure you wish to add this student? Adding them will make them a member of this class and give them access to all current exercises!' : "Are you sure you wish to remove this student from this class? Doing so will erase all of their current scores!";
            bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;' + title, desc, function(r) {
                if (!r || r == null) {
                    return false;
                } else {
                    console.log('INPUT DATA TO changeStudentStatus', st, crs, mode)
                    $http.post('/user/changeClassStatus', {
                            course: crs,
                            student: st,
                            mode: !!mode
                        })
                        .then(r => {
                            console.log('R from changeClassStatus is', r)
                            // $scope.regetCourses();
                            $scope.pickedCourse = crs;
                            // $scope.regetStudents(crs);
                            // $scope.sortStudents(crs);
                            // $scope.$digest();
                            // $scope.regetAll();
                        })
                }
            })
        }
        $scope.changeCourseStatus = (ps, crs, mode) => {
            const title = mode == true ? 'Add Exercise Set' : 'Remove Exercise Set',
                desc = mode == true ? 'Are you sure you wish to add this Exercise Set? Adding it will make it available for you to use in your course!' : "Are you sure you wish to remove this exercise from this class? Doing so will erase any current student scores on this exercise!";
            bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;' + title, desc, function(r) {
                if (!r || r == null) {
                    return false;
                } else {
                    $http.post('/prob/changePsetClassStatus', {
                            course: crs,
                            pset: ps,
                            mode: !!mode
                        })
                        .then(r => {
                            // $scope.pickedCourse = crs;
                            $scope.regetAll();
                            // $scope.psetClassSort()
                        })
                }
            })
        }
        $scope.upload = function(file) {
            // return console.log('UPLOAD',file);
            Upload.upload({
                url: 'audio/setAudio',
                data: { file: file }
            }).then(function(resp) {
                if (!!resp.data.error_code) {
                    console.log('Something went wrong!');
                } else {
                    console.log('Uploaded', resp.config.data.file.name);
                }
                // console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data,resp);
            }, function(resp) {
                console.log('Error status: ' + resp.status);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };
        $scope.checkOldAud = () => {
            $scope.oldFile = null;
            if ($scope.newProbSet.audMode == 'Pick File') {
                $http.get('/audio/getAudio').then(r => {
                    $scope.oldAudioFiles = r.data;
                })
            }
        }
        $scope.opOpts = [{
            desc: '+ (Addition)',
            shrt: '+'
        }, {
            desc: '- (Subtraction)',
            shrt: '-'
        }, {
            desc: 'x (Multiplication)',
            shrt: 'x'
        }, {
            desc: '/ (Division)',
            shrt: '/'
        }];
        $scope.audOpts = [{
            name: 'Upload File',
            icon: 'plus',
        }, {
            name: 'Pick File',
            icon: 'list'
        }, {
            name: 'No Audio',
            icon: 'times'
        }]
        $scope.newExercise = {
            op: '+',
            termOne: 0,
            termTwo: 0,
            ans: 0
        };
        $scope.clearExercise = (ap) => {
            $scope.newExercise = {
                op: '+',
                termOne: 0,
                termTwo: 0,
                ans: 0
            };
            if (ap) {
                $scope.addProb = true;
            }
            console.log('cleared prob set! addProbs now', $scope.addProb)
        }
        $scope.makinProbs = false;
        $scope.addProb = false;
        $scope.cancelAdd = () => {
            $scope.newProbSet = {
                kind: 'probFillin',
                probs: [],
                sound: null,
                audMode: 'No Audio',
                tags: [],
                theresNoGoinBack: false,
                picture: {
                    pic: null
                }
            };
            $scope.clearExercise();
            $scope.addProb = false;
        }
        $scope.isCorrect = () => {
            let isCorrect = $scope.newExercise.termOne;
            if ($scope.newExercise.op == '+') {
                isCorrect += $scope.newExercise.termTwo;
            } else if ($scope.newExercise.op == '-') {
                isCorrect -= $scope.newExercise.termTwo;
            } else if ($scope.newExercise.op == '/') {
                isCorrect /= $scope.newExercise.termTwo;
            } else {
                isCorrect *= $scope.newExercise.termTwo;
            }
            return isCorrect === $scope.newExercise.ans;
        }
        $scope.refProbs = () => {
            return false;
        };
        $scope.submitProb = () => {
            //for adding one PROBLEM to the current newProbSet
            $scope.newExercise.kind = $scope.newProbSet.kind;
            //match and story MUST have correct answers. Pick, not. however, we should get correct/incorrect status for all 3
            console.log('user wishes to submit:', $scope.newExercise);
            //error catching!
            $scope.newExercise.isCorrect = ($scope.newExercise.kind == 'probSimple' || $scope.newExercise.kind == 'probPick' || $scope.isCorrect())
            if (!$scope.newExercise.isCorrect) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Incorrect Answer', `Your selected exercise type (either Fill-In or Matching) requires a correct answer. Please re-check your numbers and try again!`)
                return false;
            }
            if ($scope.newExercise == 'probSimple' && !$scope.newExercise.desc) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Needs Description', `Your selected exercise type (Simple Fill-In) requires a descriptive paragraph. Otherwise your students won't know what to do!`)
                return false;
            }
            $scope.newProbSet.probs.push(angular.copy($scope.newExercise))
            $scope.clearExercise();
            $scope.addProb = false;
        }
        $scope.readFile = (f) => {
            console.log('FILE', f)
        }
        $scope.submitSet = () => {
            console.log('full scope is', $scope);
            if (!$scope.newProbSet.probs.length) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Exercises', 'Sorry, but your exercise set must include at least <i>some</i> exercises!')
                return false;
            } else if (!$scope.newProbSet.title) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Title', 'Your exercise set must include a title. Otherwise no one will know what it is!')
            } else if ($scope.newProbSet.audMode == 'Pick File' && !$scope.oldFile) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Invalid File', "If you're gonna pick an already existing file, you've gotta actually pick a file! Otherwise, please choose another audio option.")
                return false;
            } else if (!$scope.newProbSet.tags.length) {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;No Tags', "Your exercise set must include at least some tags! Please either:<br><ul class='content'><li>Pick from already included tags</li><li>Or create your own</li></ul>")
                return false;
            }
            bulmabox.confirm(`Submit Exercise Set`, `Are you sure you wish to submit this exercise set?`, function(resp) {
                console.log('optional file data', $scope.file)
                console.log('trying to submit', $scope.newProbSet);
                if (!resp || resp == null) {
                    return false; //usr sez no thx
                }
                if ($scope.fl && !$scope.oldFile) {
                    $scope.newProbSet.sound = $scope.fl.name;
                    // $scope.upload($scope.file);
                } else if ($scope.oldFile) {
                    $scope.newProbSet.sound = $scope.oldFile.filename;
                }
                // return false;
                $http.post('/prob/newProbSet', $scope.newProbSet)
                    .then(r => {
                        console.log('SUBMIT SET RESPONSE', r)
                        if (r.data == 'dup') {
                            return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Title Already Used', "Sorry, but that exercise set title is already being used. Please use a different title.")
                        }
                        $scope.makinProbs = false;
                        bulmabox.alert('<i class="fa fa-check is-size-3"></i>&nbsp;Created Exercise Set', `The exercise set ${$scope.newProbSet.title} has been created!<br> You can now add this to one or more courses!`)
                        $scope.cancelAdd();
                        $scope.regetAll();
                    })
            })
        }
        //auto-generator stuff!
        $scope.gen = {
            kind: 'probFillin'
        };
        $scope.genTypes = [{
            name: 'Multiplication Tables',
            subType: 'table',
            needs: [{
                type: 'number',
                title: 'Associated number',
                desc: 'Number this table is based around. <br> Example: <br>If you pick <strong>2</strong>, this will generates multiplication tables for the number 2 (2x1,2x2,2x3, etc.).',
                val: 1
            }, {
                type: 'checkbox',
                title: 'Simple only',
                desc: 'If left checked, only whole-number positive problems will be created. That means no 7/6 = 1.666667, or 2-5 = -3.',
                val: true
            }, {
                type: 'checkbox',
                title: 'In Order',
                desc: 'If checked, problems will be created in ascending numerical order (i.e., 1+1, 1+2, 1+3, etc.). This is <i>not</i> available for division and subtraction if "Simple only" is checked.',
                val: false
            }, {
                type: 'number',
                title: 'Number of exercises',
                desc: 'Number of exercises in this exercises set.',
                val: 25
            }],
            desc: 'Series of multiplication exercises',
            op: 'x'
        }, {
            name: 'Division Tables',
            subType: 'table',
            needs: [{
                type: 'number',
                title: 'Associated number',
                desc: 'Number this table is based around. <br> Example: <br>If you pick <strong>2</strong>, this will generates division tables for the number 2 (1/2,2/2,3/2, etc.).',
                val: 1
            }, {
                type: 'checkbox',
                title: 'Simple only',
                desc: 'If left checked, only whole-number positive problems will be created. That means no 7/6 = 1.666667, or 2-5 = -3.',
                val: true
            }, {
                type: 'checkbox',
                title: 'In Order',
                desc: 'If checked, problems will be created in ascending numerical order (i.e., 1+1, 1+2, 1+3, etc.). This is <i>not</i> available for division and subtraction if "Simple only" is checked.',
                val: false
            }, {
                type: 'number',
                title: 'Number of exercises',
                desc: 'Number of exercises in this exercises set.',
                val: 25
            }],
            desc: 'Series of division exercises',
            op: '/'
        }, {
            name: 'Addition Tables',
            subType: 'table',
            needs: [{
                type: 'number',
                title: 'Associated number',
                desc: 'Number this table is based around. <br> Example: <br>If you pick <strong>2</strong>, this will generates addition tables for the number 2 (2+1,3+1,5+1, etc.).',
                val: 1
            }, {
                type: 'checkbox',
                title: 'Simple only',
                desc: 'If left checked, only whole-number positive problems will be created. That means no 7/6 = 1.666667, or 2-5 = -3.',
                val: true
            }, {
                type: 'checkbox',
                title: 'In Order',
                desc: 'If checked, problems will be created in ascending numerical order (i.e., 1+1, 1+2, 1+3, etc.). This is <i>not</i> available for division and subtraction if "Simple only" is checked.',
                val: false
            }, {
                type: 'number',
                title: 'Number of exercises',
                desc: 'Number of exercises in this exercises set.',
                val: 25
            }],
            desc: 'Series of addition exercises',
            op: '+'
        }, {
            name: 'Subtraction Tables',
            subType: 'table',
            needs: [{
                type: 'number',
                title: 'Associated number',
                desc: 'Number this table is based around. <br> Example: <br>If you pick <strong>2</strong>, this will generates subtraction tables for the number 2 (5-2,4-2,3-2, etc.).',
                val: 1
            }, {
                type: 'checkbox',
                title: 'Simple only',
                desc: 'If left checked, only whole-number positive problems will be created. That means no 7/6 = 1.666667, or 2-5 = -3.',
                val: true
            }, {
                type: 'checkbox',
                title: 'In Order',
                desc: 'If checked, problems will be created in ascending numerical order (i.e., 1+1, 1+2, 1+3, etc.). This is <i>not</i> available for division and subtraction if "Simple only" is checked.',
                val: false
            }, {
                type: 'number',
                title: 'Number of exercises',
                desc: 'Number of exercises in this exercises set.',
                val: 25
            }],
            desc: 'Series of subtraction exercises',
            op: '-'
        }];
        $scope.noOrder = n => {
            // console.log('NO ORDER VAL',n,$scope.newProbSet.gen.subj.needs.find(t => t.title == 'Simple only').val,$scope.newProbSet.gen.subj);
            return n.title == 'In Order' && !!$scope.newProbSet.gen.subj.needs.find(t => t.title == 'Simple only').val && ($scope.newProbSet.gen.subj.op == '-' || $scope.newProbSet.gen.subj.op == '/');
            // return false;
        }
        $scope.genProbs = () => {
            console.log('new problems!', $scope.newProbSet)
            $scope.newProbSet.probs = [];
            $scope.newProbSet.tags = [];
            const trans = {
                'x': 'multiplication',
                '/': 'division',
                '+': 'addition',
                '-': 'subtraction',
                'probFillin': 'fill-in',
                'probPick': 'pick-correct',
                'probMatch': 'matching'
            }
            if ($scope.newProbSet.gen.subj.subType === 'table') {
                const safeOp = $scope.newProbSet.gen.subj.op == 'x' ? '*' : $scope.newProbSet.gen.subj.op;
                //make the probs
                $scope.newProbSet.gen.numProbs = $scope.newProbSet.gen.subj.needs.find(t => t.title == 'Number of exercises').val; //number of problems we want
                for (let i = 0; i < $scope.newProbSet.gen.numProbs; i++) {
                    let tmOne, tmTwo, correctAns, tmOneWg, tmTwoWg, isCorrect, givenAns;
                    //note: we ignore 'in order' if op is div or sub.
                    isCorrect = ($scope.newProbSet.kind != 'probPick' || Math.random() < 0.5);
                    if (safeOp == '/' && !!$scope.newProbSet.gen.subj.needs.find(t => t.title == 'Simple only').val) {
                        tmTwo = Number($scope.newProbSet.gen.subj.needs[0].val);
                        correctAns = Math.ceil(Math.random() * 12);
                        tmOne = tmTwo * correctAns;
                        givenAns = isCorrect ? correctAns : Math.ceil(Math.random() * 12);
                    } else if (safeOp == '-' && !!$scope.newProbSet.gen.subj.needs.find(t => t.title == 'Simple only').val) {
                        tmOne = Number($scope.newProbSet.gen.subj.needs[0].val);
                        tmTwo = Math.ceil(Math.random() * tmOne);
                        correctAns = tmOne - tmTwo;
                        tmTwoWg = Math.ceil(Math.random() * tmOne);
                        givenAns = isCorrect ? correctAns : tmOne - tmTwoWg;
                    } else {
                        //addition and multiplication (allows 'in order');
                        //generate TWO random whole numbers
                        if (!!$scope.newProbSet.gen.subj.needs.find(t => t.title == 'In Order').val && safeOp != '-' && safeOp !== '-' && safeOp != '/') {
                            //if 'inOrder' checkbox is checked, we do multi tables in order (i.e., 1x2,2x2)
                            tmOne = i + 1;
                            tmTwo = Number($scope.newProbSet.gen.subj.needs.find(t => t.title == 'Associated number').val)
                        } else {
                            tmOne = Math.ceil(Math.random() * 10);
                            tmTwo = Math.ceil(Math.random() * 10);
                            //pick which one will be our 'target num'
                            //Associated number
                            if (Math.random() > 0.5) {
                                tmOne = Number($scope.newProbSet.gen.subj.needs.find(t => t.title == 'Associated number').val);
                            } else {
                                tmTwo = Number($scope.newProbSet.gen.subj.needs.find(t => t.title == 'Associated number').val);
                            }
                        }
                        correctAns = eval(`${tmOne}${safeOp}${tmTwo}`);
                        //wrong answer stuff
                        tmOneWg = tmOne + Math.floor(Math.random() * 10);
                        tmTwoWg = tmTwo + Math.floor(Math.random() * 10);
                        if (Math.random() > 0.5) {
                            tmOneWg = tmOne;
                        } else {
                            tmTwoWg = tmTwo;
                        }
                        givenAns = isCorrect ? correctAns : eval(`${tmOneWg}${safeOp}${tmTwoWg}`);
                    }
                    console.log('Q DATA', tmOne, tmTwo, isCorrect, $scope.newProbSet.kind, correctAns, givenAns)
                    $scope.newProbSet.probs.push({
                        op: $scope.newProbSet.gen.subj.op,
                        termOne: tmOne,
                        termTwo: tmTwo,
                        ans: givenAns,
                        isCorrect: isCorrect,
                        eq: `${tmOne}${safeOp}${tmTwo}`,
                        kind: $scope.newProbSet.kind,
                        vertical: !!$scope.newProbSet.gen.subj.needs[1].val,
                    })
                }
                //tags
                $scope.newProbSet.tags = ['table', 'arithmetic', 'math'];
                $scope.newProbSet.tags.push(trans[$scope.newProbSet.gen.subj.op], trans[$scope.newProbSet.kind])
                // console.log('And now its', $scope.newProbSet)
                $scope.newProbSet.tags.push('Number: ' + Number($scope.newProbSet.gen.subj.needs[0].val))
                bulmabox.alert("Exercises Created", `${$scope.newProbSet.gen.numProbs} exercises have been created for you!`);
            } else {
                bulmabox.alert('Generator Not Written', "Unfortunately, an auto-generator for this exercise type has not been written yet! <br>You'll have to write your own exercises.");
                return false;
            }
        }
        $scope.describeNeed = (n) => {
            bulmabox.alert(n.title, n.desc);
        }
        $scope.explainNext = () => {
            bulmabox.alert('Next Assignment', 'This is the next assignment that this student is expected to complete.');
        }
        $scope.removeProb = (idx) => {
            console.log('attempt to remove problem(s)', idx)
            if (!idx && idx !== 0) {
                return bulmabox.confirm('Clear All Exercises', 'Are you sure you wish to clear all exercises?', (t) => {
                    if (t && t !== null) {
                        $scope.newProbSet.probs = [];
                        $scope.$digest();
                    }
                })
            } else {
                $scope.newProbSet.probs.splice(idx, 1);
            }
        }
        $scope.removeTag = (n) => {
            $scope.newProbSet.tags.splice(n, 1);
        };

        $scope.addTag = (t, m) => {
            console.log('trying to add tag', t)
            if (!t || $scope.newProbSet.tags.indexOf(t) > -1) {
                return false;
            }
            $scope.newProbSet.tags.push(t);
            // $scope.regetAll();
            $scope.pckTag = null;
            $scope.newTag = null;
        }
        $scope.filtTags = (tgs) => {
            // filter OUT any tags we've already used from current 'available' tags
            $scope.tags = tgs.filter(t => $scope.newProbSet.tags.indexOf(t) < 0);
        }
        $scope.alreadyDone = (st) => {
            return function(ps) {
                console.log('STOODNT', st, 'PSET', ps)
                return true;
            }
        }
        $scope.hasDoneAssign = (st, asn) => {
            return st.pSetDone.indexOf(asn._id.toString()) > -1;
        }
        $scope.getAssignList = (studs, assigns) => {
            //asn = ALL assignments for this class
            //stud = this student (including their array of done assignments)
            console.log('STUDENTS', studs, 'ASSIGNS', assigns)
            return studs.map(st => {
                // console.log('Trying to find pset', $scope.courseId, 'in', st.nextPSet)
                st.nextPSetForClass = st.nextPSet.find(np => np.cid == $scope.courseId);
                console.log('st now', st)
                if (st.nextPSetForClass && assigns.find(t => t._id == st.nextPSetForClass.pid)) {
                    st.nextPSetForClass.title = assigns.find(t => t._id == st.nextPSetForClass.pid).title;
                } else {
                    st.nextPSetForClass = { title: '(Not Assigned)' }
                }
                st.assignedEx = assigns.map(asn => {
                    //first, we find if this in the list of completed, recorded assignments
                    let hasDone = st.pSetDone.find(stpd => {
                        return stpd.setId == asn._id;
                    });
                    console.log('ASSIGNMENT', asn, 'FOR STUDENT', st, 'HASDONE', hasDone)
                    if (!!hasDone) {
                        //student's done this
                        hasDone.duration = hasDone.endTime - hasDone.startTime;
                        hasDone.numProbs = hasDone.probs.length;
                        hasDone.numGud = hasDone.probs.filter(p => p.isCorrect).length;
                        hasDone.tags = asn.tags;
                        hasDone.title = asn.title;
                        return hasDone;
                    } else if (st.nextPSetForClass && st.nextPSetForClass.pid == asn._id) {
                        return {
                            title: asn.title,
                            setId: asn._id,
                            msg: '(Current Assignment)',
                            tags: asn.tags
                        }
                    } else {
                        return {
                            title: asn.title,
                            setId: asn._id,
                            msg: '(Not Assigned)',
                            tags: asn.tags
                        }
                    }
                })
                console.log('This student now', st)
                return st;
            })
        }
        $scope.setAssign = (a, s) => {
            console.log('User wishes to assign', a, 'to', s, 'with class id', $scope.courseId);
            // return false;
            if (s.nextPSet.find(np => np.cid == $scope.courseId) && s.nextPSet.find(np => np.cid == $scope.courseId).pid && s.nextPSet.find(np => np.cid == $scope.courseId).pid != a._id) {
                bulmabox.confirm('Cancel Current Exercise Set', `Student ${s.user} is currently working on an assignment. Are you sure you wish to reassign them?<br>Note: This will wipe out any progress on their current assignment!`, function(r) {
                    if (r && r != null) {
                        $http.post('/user/assign', {
                                user: s._id,
                                assign: a._id,
                                course: $scope.courseId
                            })
                            .then(r => {
                                $scope.regetAll();
                            })
                    }
                })
            } else {
                $http.post('/user/assign', {
                        user: s._id,
                        assign: a._id,
                        course: $scope.courseId
                    })
                    .then(r => {
                        $scope.regetAll();
                    })
            }
        }
        $scope.hasNotDone = (stu) => {
            return function(a) {
                return !stu.pSetDone.find(stf => {
                    stf.setId == a._id.toString();
                })
            }
        }
        $scope.playSound = (fn) => {
            $scope.playing = true;
            console.log(fn)
            musFac.getMusic(fn.filename).then(r => {
                $scope.playing = false;
            });
        }
        $scope.stopSound = () => {
            musFac.musOff();
        }
        $scope.tabDescs = {
            'audio': {
                title: 'Audio',
                desc: 'Pick an audio option. You can either:<ul class=""><li> - Upload a new audio file</li><li> - Pick from already-uploaded files</li><li> - Choose <i>not</i> to include an audio file.</li></ul>',
            },
            'generate': {
                title: 'Exercise Auto-Generation',
                desc: "Select some options, and we'll auto-generate some exercises for you!",
            },
            'create': {
                title: 'Custom Exercise Creation',
                desc: 'Wanna make your own exercises? Do that here!',
            },
            'tags': {
                title: 'Tags',
                desc: 'Tags help others find your particular exercise set. When you use the auto-generator, certain tags will automatically be added.',
            },
            'redo': {
                title: 'Disallow Redo',
                desc: 'If set to "Yes", this will PREVENT students from revisiting this exercises set after leaving it. The problem set will be "submitted" on the student either clicking submit OR leaving the page in any format.'
            },
            'orient': {
                title: 'Change Problem Orientation',
                desc: 'Setting the orientation to horizontal will create problems like:<br> <img src="./img/hrex.png"><br/>Setting the orientation to vertical will create problems like:<br> <img src="./img/vtex.png">'
            }
        }
        $scope.explTabs = (t) => {
            bulmabox.alert($scope.tabDescs[t].title, $scope.tabDescs[t].desc);
        }
        //tag filter search stuff
        $scope.classSearch = {
            out: { active: false, term: null },
            in: { active: false, term: null }
        }
        $scope.toggleClassSearch = which => {
            if ($scope.classSearch[which].active) {
                $scope.classSearch[which].term = null;
            }
            $scope.classSearch[which].active = !$scope.classSearch[which].active;
        }
        $scope.classTagFilter = which => {
            return function(itm) {
                if (!$scope.classSearch[which].term) {
                    return true;
                }
                let theTags = $scope.classSearch[which].term.split(',').map(r => r.trim()).filter(t => !!t),
                    foundMatch = false;
                theTags.forEach(stg => {
                    itm.tags.forEach(itg => {
                        if (itg.toLowerCase().indexOf(stg.toLowerCase()) > -1) {
                            foundMatch = true;
                        }
                    })
                })
                return foundMatch;
            }
        }

        //chainmap stuffs
        $scope.chainMap = {
            currSel: null,
            positions: [],
            mapDims: null,
            firstExDims: { width: 180, height: 90 },
            maxDims: {},
            canv: null,
            ctx: null,
            connecting: {
                start: null,
                end: null
            }

        }
        document.querySelector('#chain-map').addEventListener('mousemove', function(e) {
            // console.log(e);
            let foundInt = null;
            if ($scope.chainMap.pickingNext) {
                return false;
            }
            $scope.chainMap.positions.forEach(t => {
                // console.log('el',t,'mouse info',e.offsetX,e.offsetY,e)
                t.on = t.isTarg;
                if (e.offsetX > t.x && e.offsetX < (t.x + t.w) && e.offsetY > t.y && e.offsetY < (t.y + t.h) && !t.isTarg) {
                    foundInt = t;
                    t.on = true;
                }
            });
            $scope.chainMap.connecting.mousePos = { x: e.offsetX, y: e.offsetY }
            if ($scope.chainMap.currSel || $scope.chainMap.currSel === 0) {
                $scope.chainMap.positions[$scope.chainMap.currSel].x = e.offsetX - ($scope.chainMap.positions[$scope.chainMap.currSel].w / 2);
                $scope.chainMap.positions[$scope.chainMap.currSel].y = e.offsetY - (20);
            }
            $scope.drawChainMap();
        })
        document.querySelector('#chain-map').addEventListener('contextMenu', function(e) {
            return false;
        });
        document.querySelector('#chain-map').addEventListener('mousedown', function(e) {
            let prevPick = $scope.chainMap.positions.findIndex(t => t.on);
            console.log(e, $scope.chainMap.currSel, prevPick)
            //connection stuff
            if (e.which == 3) {
                e.preventDefault();
                $scope.chainMap.currSel === null;
                $scope.chainMap.connecting.start = null;
                return $scope.drawChainMap();
            }
            if ($scope.chainMap.currSel === null && !e.shiftKey && prevPick > -1 && !$scope.chainMap.connecting.start && $scope.chainMap.connecting.start !== 0) {
                //curr selection is not a number
                //pick our 'starting' (i.e., prev) member
                console.log('picking start', prevPick)
                $scope.chainMap.connecting.start = prevPick;
            } else if ($scope.chainMap.currSel === null && !e.shiftKey && prevPick > -1) {
                $scope.chainMap.connecting.end = prevPick;
            }
            if ($scope.chainMap.currSel === null && ($scope.chainMap.connecting.start || $scope.chainMap.connecting.start === 0) && ($scope.chainMap.connecting.end || $scope.chainMap.connecting.end === 0)) {
                let currNext = $scope.getPset($scope.psetClassSort.isin[$scope.chainMap.connecting.start]._id).next,
                    nextId = $scope.psetClassSort.isin[$scope.chainMap.connecting.end]._id;
                if (currNext == nextId || nextId == null) {
                    $scope.getPset($scope.psetClassSort.isin[$scope.chainMap.connecting.start]._id).next = null;
                } else {
                    $scope.getPset($scope.psetClassSort.isin[$scope.chainMap.connecting.start]._id).next = $scope.psetClassSort.isin[$scope.chainMap.connecting.end]._id;
                }
                $scope.chainMap.connecting = {
                    start: null,
                    end: null,
                    mousePos: { x: null, y: null }
                }
                $scope.drawChainMap();
            }
            //movement stuff
            if ($scope.chainMap.currSel || $scope.chainMap.currSel === 0) {
                // console.log('SCT A')
                //already got selection
                $scope.chainMap.currSel = null;
            } else if (e.shiftKey) {
                // console.log('SCT B')
                //find the el we're clicking (if any!)
                let foundEl = false;
                $scope.chainMap.positions.forEach((t, i) => {
                    // console.log('el',t,'mouse info',e.offsetX,e.offsetY,e)
                    // t.on = false;
                    if (e.offsetX > t.x && e.offsetX < (t.x + t.w) && e.offsetY > t.y && e.offsetY < (t.y + t.h)) {
                        foundEl = t;
                        // t.isTarg = true;
                        $scope.chainMap.currSel = i;
                    }
                })
            }
        })
        $scope.positionChainMap = (itms) => {
            $scope.chainMap.canv = document.querySelector('#chain-map');
            $scope.chainMap.ctx = $scope.chainMap.canv.getContext("2d");
            let prnt = {
                x: document.querySelector('#chain-map').parentNode.offsetWidth,
                y: document.querySelector('#chain-map').parentNode.offsetHeight
            };
            $scope.chainMap.canv.width = Math.floor(prnt.x * 0.95);
            $scope.chainMap.canv.height = Math.floor(prnt.y * 0.95);
            $scope.chainMap.canv.style.width = Math.floor(prnt.x * 0.95) + 'px';
            $scope.chainMap.canv.style.height = Math.floor(prnt.y * 0.95) + 'px';
            $scope.chainMap.mapDims = document.querySelector('#chain-map').getBoundingClientRect();
            $scope.chainMap.maxDims = {
                y: ($scope.chainMap.mapDims.height - $scope.chainMap.firstExDims.height) * 0.9,
                x: ($scope.chainMap.mapDims.width - $scope.chainMap.firstExDims.width) * 0.9
            };
            $scope.chainMap.positions = itms.map(t => {
                return {
                    x: Math.floor(Math.random() * $scope.chainMap.maxDims.x),
                    y: Math.floor(Math.random() * $scope.chainMap.maxDims.y),
                    w: null,
                    h: 30,
                    on: false,
                    isTarg: false
                }
            })
            $scope.drawChainMap();
        }
        $scope.getPset = (id) => {
            return $scope.tClasses.find(t => t._id == $scope.courseId).pSets.find(q => q.pSet == id);
        }
        $scope.saveMap = () => {
            const crsObjs = $scope.tClasses.find(t => t._id == $scope.courseId).pSets.map(t => {
                return {
                    pidOne: t.pSet,
                    pidTwo: t.next,
                    cid: $scope.courseId
                }
            })
            console.log('user wishes to save', crsObjs)
            crsObjs.forEach(t => {
                $http.post('/prob/setNextLesson', t)
                    .then(rq => {
                        $http.get('/user/getCourses').then(r => {
                            $scope.originalClasses = r.data;
                            $scope.regetAll();
                        })
                    })
            })
        }
        $scope.compareOrig = () => {
            let foundUnmatch = false;
            if (!$scope.originalClasses) {
                return false;
            }
            $scope.originalClasses.forEach(oc => {
                let newCrs = $scope.tClasses.find(t => t._id == oc._id);
                if (!newCrs || !oc.pSets || !oc.pSets.length) {
                    return false;
                }
                // console.log('old (unmod) course',oc,'new (maybe mod) course',newCrs)
                oc.pSets.forEach(os => {
                    let ns = newCrs.pSets.find(t => t.pSet == os.pSet)
                    // console.log('comparing',os,'to',ns)
                    if (os.next != ns.next) {
                        foundUnmatch = true;
                    }
                })
            })
            return foundUnmatch
        }
        $scope.drawChainMap = () => {
            $scope.chainMap.ctx.fillStyle = '#333';
            $scope.chainMap.ctx.fillRect(0, 0, $scope.chainMap.canv.width, $scope.chainMap.canv.height);
            $scope.chainMap.ctx.strokeStyle = '#ccf'
            $scope.chainMap.ctx.lineWidth = 3;
            $scope.chainMap.ctx.font = 'normal 14pt comic sans MS'
            $scope.psetClassSort.isin.forEach((el, i) => {
                //draw each box
                $scope.chainMap.ctx.fillStyle = $scope.chainMap.positions[i].on ? '#fff' : '#ccc';
                // console.log('DRAWING element', el, 'which is number', i, 'at', $scope.chainMap.positions[i].x, $scope.chainMap.positions[i].y, ' text has width of ', $scope.chainMap.ctx.measureText(el.title + 10))
                $scope.chainMap.positions[i].w = $scope.chainMap.ctx.measureText(el.title).width + 10;
                if ($scope.getPset(el._id).next) {
                    //this element has a 'followup', so we wanna draw a chain from THIS element to THAT element.
                    let start = {
                            x: $scope.chainMap.positions[i].x + (0.5 * $scope.chainMap.positions[i].w),
                            y: $scope.chainMap.positions[i].y + (0.5 * $scope.chainMap.positions[i].h)
                        },
                        ei = $scope.psetClassSort.isin.findIndex(t => t._id == $scope.getPset(el._id).next),
                        end = {
                            x: $scope.chainMap.positions[ei].x + ($scope.chainMap.positions[ei].w),
                            y: $scope.chainMap.positions[ei].y + ($scope.chainMap.positions[ei].h)
                        };
                    if ($scope.chainMap.positions[ei].x > $scope.chainMap.positions[i].x) {
                        end = {
                            x: $scope.chainMap.positions[ei].x,
                            y: $scope.chainMap.positions[ei].y
                        }
                    }
                    $scope.chainMap.ctx.beginPath();
                    $scope.chainMap.ctx.moveTo(start.x, start.y);
                    $scope.chainMap.ctx.lineTo(end.x, end.y);
                    $scope.chainMap.ctx.stroke();
                    $scope.drawArrow($scope.chainMap.ctx, start, end)
                }
                //if we're currently pickin a new end
                if ($scope.chainMap.connecting.start || $scope.chainMap.connecting.start === 0) {
                    $scope.chainMap.ctx.beginPath();
                    $scope.chainMap.ctx.moveTo($scope.chainMap.positions[$scope.chainMap.connecting.start].x, $scope.chainMap.positions[$scope.chainMap.connecting.start].y);
                    $scope.chainMap.ctx.lineTo($scope.chainMap.connecting.mousePos.x, $scope.chainMap.connecting.mousePos.y);
                    $scope.chainMap.ctx.stroke();
                }

                $scope.chainMap.ctx.fillRect($scope.chainMap.positions[i].x, $scope.chainMap.positions[i].y, $scope.chainMap.positions[i].w, 30)
                $scope.chainMap.ctx.fillStyle = '#333';
                $scope.chainMap.ctx.fillText(el.title, $scope.chainMap.positions[i].x + 5, $scope.chainMap.positions[i].y + 20);
            })
            $scope.$apply();
        }
        $scope.drawArrow = (c, s, e) => {
            //draw an arrow at the 'to' end of the line
            const m = (e.y - s.y) / (e.x - s.x),
                baseAng = Math.atan(m),
                topAng = baseAng - 0.5,
                botAng = baseAng + 0.5,
                multip = e.x < s.x ? 1 : -1;
            topTo = {
                    x: e.x + (multip * 20 * Math.cos(topAng)),
                    y: e.y + (multip * 20 * Math.sin(topAng))
                },
                botTo = {
                    x: e.x + (multip * 20 * Math.cos(botAng)),
                    y: e.y + (multip * 20 * Math.sin(botAng))
                };
            c.beginPath();
            c.moveTo(topTo.x, topTo.y);
            c.lineTo(e.x, e.y);
            c.lineTo(botTo.x, botTo.y);
            c.stroke();
        }
        $scope.loadFile = () => {
            $scope.loadingFile = true;
            const fr = new FileReader();
        }
        //indiv exercise stuff
        $scope.viewExercise = (student, exercise) => {
            console.log("USER wishes to view exercise", exercise, 'for student', student, 'psetclass', $scope.psetClassSort)
            const pSetInfo = $scope.psetClassSort.isin.find(t => t._id == exercise.setId);
            $scope.viewStuEx.active = true;
            $scope.viewStuEx.usr = student.user;
            $scope.viewStuEx.title = pSetInfo.title;
            $scope.viewStuEx.desc = pSetInfo.text;
            $scope.viewStuEx.probs = exercise.probs.map(t => {
                let theProb = pSetInfo.probs.find(q => q._id == t.pid);
                console.log('psetInfo', pSetInfo, theProb)
                t.desc = theProb.desc || null;
                t.isSimp = pSetInfo.kind == 'probSimple'
                t.op = theProb.op;
                t.termOne = theProb.termOne;
                t.termTwo = theProb.termTwo;
                t.ans = theProb.ans;
                t.pickedAns = t.pickedAns || t.answer || '(no answer)';
                return t;
            });
            console.log('FINAL OBJ', $scope.viewStuEx)
            $scope.viewStuEx.kind = pSetInfo.kind;
        }
        $scope.emailExercise = (student, exercise) => {
            bulmabox.confirm('Send Message?', `Sending a message will notify the student that you wish to speak with them about this assignment. Are you sure you wish to do this?`, function(r) {
                if (r && r != null) {

                    $http.post('/user/emailAboutProblem', {
                            userId: student._id,
                            courseId: $scope.courseId,
                            setId: exercise.setId
                        })
                        .then(r => {
                            console.log('response from prob set emailer', r)
                            bulmabox.alert('Sent!', `You've sent a message to user ${student.user} regarding this exercise set.`)
                        })
                }
            })
        }
        //BEGIN DRAWING STUFF
        $scope.drawStuff = {};
        $scope.drawStuff.canv = document.querySelector('#math-draw-canv');
        $scope.drawStuff.ctx = $scope.drawStuff.canv.getContext('2d');
        $scope.drawStuff.setUpCanv = () => {
            $scope.drawStuff.canv.width = 800;
            $scope.drawStuff.canv.height = 800;
            $scope.drawStuff.canv.style.width = 800 + 'px';
            $scope.drawStuff.canv.style.height = 800 + 'px';
            $scope.drawStuff.canvHistory = [];
            $scope.drawStuff.canvHistoryNum = 0;
            $scope.drawStuff.canvDrawMode = 'esc';
            $scope.drawStuff.ctx.fillStyle = '#fff';
            $scope.drawStuff.canvScale = { num: 1, unit: 'inch(es)', units: ['inch(es)', 'mile(s)', 'meter(s)', 'parsec(s)', 'angstrom(s)', 'centimeter(s)', 'milimeter(s)'] }
            $scope.drawStuff.ctx.fillRect(0, 0, 800, 800)
            $scope.drawStuff.modes = ['c', 'l', 'a', 't', 'f', 'm', 'Esc', 'x'];
            $scope.drawStuff.otherControl = [{
                name: ['Z'],
                desc: 'Undo'
            }, {
                name: ['R'],
                desc: 'Redo'
            }, {
                name: ['['],
                desc: 'Decrease brush width'
            }, {
                name: [']'],
                desc: 'Increase brush width'
            }, {
                name: ['Shift', '['],
                desc: 'Decrease font size'
            }, {
                name: ['Shift', ']'],
                desc: 'Increase font size'
            }, {
                name: ['X'],
                desc: 'Crop Image'
            }]
            $scope.drawStuff.viewModes = {
                inst: true,
                cont: true
            }
            $scope.drawStuff.drawFns = {
                'c': {
                    fnName: 'drawCircle',
                    name: 'Circle',
                    desc: [
                        'Click to pick a center point',
                        'Move the pointer to pick a radius',
                        'Click again to draw the circle',
                    ]

                },
                'l': {
                    fnName: 'drawLine',
                    name: 'Line',
                    desc: [
                        'Click to pick a starting point',
                        'Click to pick an ending point and draw your line!',
                    ]

                },
                'a': {
                    fnName: 'drawAngle',
                    name: 'Angle',
                    desc: [
                        'Click to pick the center of the angle',
                        'Click to place the FIRST leg',
                        'Click to place the SECOND leg (Hold SHIFT to snap to 15-degree increments)',
                        // '(Hold SHIFT to snap to 15-degree increments)',
                        'An angle measure will be included with your angle'
                    ]

                },
                't': {
                    fnName: 'drawText',
                    name: 'Text',
                    desc: [
                        'Pick a font size and color (optional!)',
                        'Click somewhere to draw your text',
                    ]

                },
                'Esc': {
                    name: 'None',
                    desc: []
                },
                'f': {
                    name: 'Freeform',
                    desc: [
                        'Pick a line width and color (optional!)',
                        'Just draw!'
                    ]
                },
                'm': {
                    name: 'Measure',
                    fnName: 'drawMeasure',
                    desc: [
                        'Click to pick a start point',
                        'Click to pick an end point',
                        'A line will be created with the measured distance on it. '
                    ]
                },
                'x': {
                    name: 'Crop',
                    fnName: 'cropImg',
                    desc: ['Click where you want the UPPER LEFT corner of your image to be',
                        'Click where you want the BOTTOM RIGHT corner of your image to be',
                        'Everything outside this retangle will be cropped out!'
                    ]
                }
            };
            $scope.drawStuff.drawingText = false;
            $scope.drawStuff.canvLineWidth = 3;
            $scope.drawStuff.canvFontSize = 14;
            $scope.drawStuff.canvFreeformHistory = [];
            $scope.drawStuff.canvDrawColor = '#000000'
            $scope.drawStuff.drawAngle = {
                start: null,
                end: null
            }
            $scope.drawStuff.noInstaDraw = ['xderp', 'a', 't', 'f', 'escape'];
            console.log($scope.drawStuff)
        }
        $scope.drawStuff.setUpCanv();
        $scope.drawStuff.cropImg = (d, noSave) => {
            const TL = {
                    x: Math.min(d.x, $scope.drawStuff.mousePos.x),
                    y: Math.min(d.y, $scope.drawStuff.mousePos.y)
                },
                BR = {
                    x: Math.max(d.x, $scope.drawStuff.mousePos.x) - TL.x,
                    y: Math.max(d.y, $scope.drawStuff.mousePos.y) - TL.y
                }
            $scope.drawStuff.reloadCanv().then(r => {
                $scope.drawStuff.ctx.strokeStyle = '#555';
                $scope.drawStuff.ctx.lineWidth = 2;
                $scope.drawStuff.ctx.setLineDash([5, 15]);
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.rect(TL.x, TL.y, BR.x, BR.y)
                $scope.drawStuff.ctx.stroke();
                if (!noSave) {
                    const imageObj = new Image();
                    imageObj.onload = function() {
                        // draw cropped image
                        const destWidth = BR.x,
                            destHeight = BR.y,
                            destX = 0,
                            destY = 0;
                        $scope.drawStuff.canv.width = BR.x;
                        $scope.drawStuff.canv.height = BR.y;
                        $scope.drawStuff.canv.style.width = BR.x + 'px';
                        $scope.drawStuff.canv.style.height = BR.y + 'px';
                        $scope.drawStuff.ctx.fillStyle = '#fff';
                        $scope.drawStuff.ctx.fillRect(0, 0, BR.x, BR.y)
                        $scope.drawStuff.ctx.drawImage(imageObj, TL.x, TL.y, BR.x, BR.y, destX, destY, destWidth, destHeight);
                        $scope.drawStuff.updCanv();
                    };
                    imageObj.src = $scope.drawStuff.canv.toDataURL();
                }
            })
        }
        $scope.drawStuff.updCanv = () => {
            //some action has been performed, so we wanna update the current semi-permanent canvas iteration
            $scope.drawStuff.canvHistory = $scope.drawStuff.canvHistory.slice(0, $scope.drawStuff.canvHistoryNum + 1)
            $scope.drawStuff.canvHistory.push({ data: $scope.drawStuff.canv.toDataURL(), w: $scope.drawStuff.canv.width, h: $scope.drawStuff.canv.height });
            if ($scope.drawStuff.canvHistory.length > 50) $scope.drawStuff.canvHistory.shift();
            $scope.drawStuff.canvHistoryNum = $scope.drawStuff.canvHistory.length - 1;
        }
        $scope.drawStuff.updCanv();
        $scope.drawStuff.canv.addEventListener('mousemove', (e) => {
            // console.log('mousemove', e)
            $scope.drawStuff.ctx.strokeStyle = $scope.drawStuff.canvDrawColor;
            $scope.drawStuff.ctx.lineWidth = 2;
            //draw the target reticle
            $scope.drawStuff.mousePos = { x: e.offsetX, y: e.offsetY };
            if ($scope.drawStuff.drawingText) {
                //if we are drawing text, DONT clear the board
                return false;
            }
            $scope.drawStuff.reloadCanv().then(() => {
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.moveTo($scope.drawStuff.mousePos.x - 10, $scope.drawStuff.mousePos.y);
                $scope.drawStuff.ctx.lineTo($scope.drawStuff.mousePos.x + 10, $scope.drawStuff.mousePos.y);
                $scope.drawStuff.ctx.moveTo($scope.drawStuff.mousePos.x, $scope.drawStuff.mousePos.y - 10);
                $scope.drawStuff.ctx.lineTo($scope.drawStuff.mousePos.x, $scope.drawStuff.mousePos.y + 10)
                $scope.drawStuff.ctx.stroke()
                if ($scope.drawStuff.drawing && !$scope.drawStuff.noInstaDraw.includes($scope.drawStuff.canvDrawMode)) {
                    //drawing has 'old' data and we're drawing either circle or line
                    $scope.drawStuff[$scope.drawStuff.drawFns[$scope.drawStuff.canvDrawMode].fnName]($scope.drawStuff.drawing, true)
                } else if ($scope.drawStuff.drawAngle.start && $scope.drawStuff.canvDrawMode == 'a') {
                    if ($scope.drawStuff.drawAngle.end) {

                        $scope.drawStuff.doDrawAngle($scope.drawStuff.drawAngle.start, $scope.drawStuff.drawAngle.end, $scope.drawStuff.mousePos, e.shiftKey, true);
                    } else {
                        $scope.drawStuff.drawLine($scope.drawStuff.drawAngle.start, true);

                    }
                }
                if ($scope.drawStuff.canvDrawMode == 'f') {
                    $scope.drawStuff.drawFreeForm($scope.drawStuff.mousePos, $scope.drawStuff.canvFreeformDrawing);
                }
            })
        })
        document.body.addEventListener('keydown', (e) => {
            // console.log('EVENT', e)
            const modes = ['l', 'c', 'a', 't', 'x', 'f', 'm', 'escape'];
            //keys to change modes
            let changedHist = false;
            //history navigation (forward/back)
            if (e.key == 'z') {
                let oldNum = $scope.drawStuff.canvHistoryNum;
                $scope.drawStuff.canvHistoryNum--;
                changedHist = true;
            } else if (e.key == 'r') {
                let oldNum = $scope.drawStuff.canvHistoryNum;
                $scope.drawStuff.canvHistoryNum++;
                changedHist = true;
            }
            if (changedHist) {
                $scope.drawStuff.canvHistoryNum = Math.max(0, Math.min($scope.drawStuff.canvHistoryNum, $scope.drawStuff.canvHistory.length - 1))
                $scope.drawStuff.reloadCanv();
            }
            //size keez
            if (e.key == '[' && !e.shiftKey && $scope.drawStuff.canvLineWidth > 1) {
                $scope.drawStuff.canvLineWidth--;
                return $scope.$digest();
            }
            if (e.key == ']' && !e.shiftKey && $scope.drawStuff.canvLineWidth < 100) {
                $scope.drawStuff.canvLineWidth++;
                return $scope.$digest();
            }
            if (e.key == '[' && e.shiftKey && $scope.drawStuff.canvFontSize > 1) {
                $scope.drawStuff.canvFontSize--;
                return $scope.$digest();
            }
            if (e.key == ']' && e.shiftKey && $scope.drawStuff.canvFontSize < 100) {
                $scope.drawStuff.canvFontSize++;
                return $scope.$digest();
            }
            //not a valid mode (or otherwise) key
            if (!modes.includes(e.key.toLowerCase())) {
                return false;
            }
            //mode key
            $scope.drawStuff.canvDrawMode = e.key.toLowerCase();
            $scope.$digest();
        })
        $scope.drawStuff.canv.addEventListener('click', (e) => {
            if (!$scope.drawStuff.drawing && !$scope.drawStuff.noInstaDraw.includes($scope.drawStuff.canvDrawMode)) {
                //have not started drawing ANYthing
                $scope.drawStuff.drawing = {
                    x: $scope.drawStuff.mousePos.x,
                    y: $scope.drawStuff.mousePos.y
                };
                return false;
            } else if (!$scope.drawStuff.noInstaDraw.includes($scope.drawStuff.canvDrawMode) && $scope.drawStuff.canvDrawMode != 'a') {
                $scope.drawStuff[$scope.drawStuff.drawFns[$scope.drawStuff.canvDrawMode].fnName]($scope.drawStuff.drawing);
            } else if ($scope.drawStuff.canvDrawMode == 't') {
                console.log('triggering drawText fn')
                $scope.drawStuff.drawText({
                    x: $scope.drawStuff.mousePos.x,
                    y: $scope.drawStuff.mousePos.y
                });
            } else if ($scope.drawStuff.canvDrawMode == 'a') {
                //angle stuff
                if (!$scope.drawStuff.drawAngle.start) {
                    //placing 1st of 3 points
                    return $scope.drawStuff.drawAngle.start = {
                        x: $scope.drawStuff.mousePos.x,
                        y: $scope.drawStuff.mousePos.y
                    }
                } else if ($scope.drawStuff.drawAngle.start && !$scope.drawStuff.drawAngle.end) {
                    //placing 2nd of 3 points (end of baseline)
                    $scope.drawStuff.drawLine($scope.drawStuff.drawAngle.start, true)
                    return $scope.drawStuff.drawAngle.end = {
                        x: $scope.drawStuff.mousePos.x,
                        y: $scope.drawStuff.mousePos.y
                    }
                } else {
                    $scope.drawStuff.doDrawAngle($scope.drawStuff.drawAngle.start, $scope.drawStuff.drawAngle.end, $scope.drawStuff.mousePos, e.shiftKey);
                }
            }
            $scope.drawStuff.drawing = null;
        })
        $scope.drawStuff.canv.addEventListener('mousedown', (e) => {
            $scope.drawStuff.canvFreeformDrawing = $scope.drawStuff.canvDrawMode == 'f';
        });
        $scope.drawStuff.canv.addEventListener('mouseup', (e) => {
            $scope.drawStuff.canvFreeformDrawing = false;
            $scope.drawStuff.canvFreeformHistory = [];
            if ($scope.drawStuff.canvDrawMode === 'f') $scope.drawStuff.updCanv();
        })
        $scope.drawStuff.reloadCanv = () => {
            const defr = $q.defer();
            let canvHistImg = new Image;
            canvHistImg.src = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].data;
            if ($scope.drawStuff.canv.width != $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].w || $scope.drawStuff.canv.height != $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].h) {
                $scope.drawStuff.canv.width = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].w;
                $scope.drawStuff.canv.height = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].h;
                $scope.drawStuff.canv.style.width = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].w + 'px';
                $scope.drawStuff.canv.style.height = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].h + 'px';
            }
            // console.log('SRC',canvHistImg.src)
            canvHistImg.onload = () => {
                $scope.drawStuff.ctx.drawImage(canvHistImg, 0, 0)
                defr.resolve();
            }
            return defr.promise;
        }
        $scope.drawStuff.drawFreeForm = (p, s) => {
            if (s) {
                $scope.drawStuff.canvFreeformHistory.push(p);
                $scope.drawStuff.reloadCanv().then(r => {
                    $scope.drawStuff.ctx.fillStyle = $scope.drawStuff.canvDrawColor;
                    $scope.drawStuff.canvFreeformHistory.forEach(op => {
                        $scope.drawStuff.ctx.beginPath();
                        $scope.drawStuff.ctx.arc(op.x, op.y, $scope.drawStuff.canvLineWidth / 2, 0, Math.PI * 2);
                        $scope.drawStuff.ctx.fill();
                    })
                })
            }
        }
        $scope.drawStuff.drawCircle = (d, noSave) => {
            // console.log('circle drawing fn! From', d, 'to', $scope.drawStuff.mousePos)
            const dist = $scope.drawStuff.pythag($scope.drawStuff.mousePos, d)
            $scope.drawStuff.reloadCanv().then(r => {
                $scope.drawStuff.ctx.strokeStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.lineWidth = $scope.drawStuff.canvLineWidth;
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.arc(d.x, d.y, dist, 0, Math.PI * 2);
                $scope.drawStuff.ctx.stroke();
                if (!noSave) $scope.drawStuff.updCanv();
            })
        }
        $scope.drawStuff.drawLine = (d, noSave, e) => {
            // console.log('line drawing fn! From', d, 'to', $scope.drawStuff.mousePos)
            $scope.drawStuff.reloadCanv().then(r => {
                $scope.drawStuff.ctx.strokeStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.lineWidth = $scope.drawStuff.canvLineWidth;
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.moveTo(d.x, d.y)
                if (e && e.x) {
                    $scope.drawStuff.ctx.lineTo(e.x, e.y)
                } else {
                    $scope.drawStuff.ctx.lineTo($scope.drawStuff.mousePos.x, $scope.drawStuff.mousePos.y);
                }
                $scope.drawStuff.ctx.stroke();
                if (!noSave) $scope.drawStuff.updCanv();
            })
        }
        $scope.drawStuff.drawMeasure = (d, noSave) => {
            console.log('measure drawing fn! From', d, 'to', $scope.drawStuff.mousePos)
            $scope.drawStuff.reloadCanv().then(r => {
                $scope.drawStuff.ctx.strokeStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.lineWidth = 2;
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.setLineDash([5, 15]);
                $scope.drawStuff.ctx.moveTo(d.x, d.y)
                $scope.drawStuff.ctx.lineTo($scope.drawStuff.mousePos.x, $scope.drawStuff.mousePos.y);
                $scope.drawStuff.ctx.stroke();
                $scope.drawStuff.ctx.setLineDash([]);
                $scope.drawStuff.ctx.fillStyle = 'rgba(255,255,255,.8)';
                const mzr = {
                        l: (1 / $scope.drawStuff.canvScale.num) * Math.floor($scope.drawStuff.pythag(d, $scope.drawStuff.mousePos) * 100) / 100,
                        x: (d.x + $scope.drawStuff.mousePos.x) / 2,
                        y: (d.y + $scope.drawStuff.mousePos.y) / 2,
                    },
                    tWid = $scope.drawStuff.ctx.measureText(mzr.l).width,
                    tHei = 2 + $scope.drawStuff.canvFontSize / (72 / 96);
                $scope.drawStuff.ctx.fillRect(mzr.x - (tWid / 2), mzr.y - (tHei / 2), tWid, tHei)
                $scope.drawStuff.ctx.fillStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.font = `normal ${$scope.drawStuff.canvFontSize}pt serif`;
                $scope.drawStuff.ctx.fillText(mzr.l + ' ' + $scope.drawStuff.canvScale.unit, mzr.x - (tWid * 0.9 / 2), mzr.y - (tHei * 0.9 / 2));
                if (!noSave) $scope.drawStuff.updCanv();
            })
        }
        $scope.drawStuff.drawText = (d) => {
            $scope.drawStuff.drawingText = true;
            bulmabox.prompt('Draw Text', 'Enter something to say!', (r) => {
                $scope.drawStuff.reloadCanv().then(q => {
                    if (!r) {
                        return false;
                    }
                    console.log('drawing', r, 'at', d)
                    $scope.drawStuff.ctx.fillStyle = $scope.drawStuff.canvDrawColor;
                    $scope.drawStuff.ctx.font = $scope.drawStuff.canvFontSize + 'pt serif';
                    $scope.drawStuff.ctx.fillText(r, d.x, d.y)
                    $scope.drawStuff.updCanv();
                    $scope.drawStuff.drawingText = false;
                    $scope.drawStuff.canv.focus()
                })
            })
        }
        $scope.drawStuff.pythag = (a, b) => {
            return Math.sqrt(Math.pow(Math.abs(a.x - b.x), 2) + Math.pow(Math.abs(a.y - b.y), 2));
        }
        $scope.drawStuff.findAngle = (p0, p1, p2) => {
            const a = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2),
                b = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2),
                c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);
            return Math.acos((a + b - c) / Math.sqrt(4 * a * b));
        }
        $scope.drawStuff.doDrawAngle = (s, e, m, l, noSave) => {
            $scope.drawStuff.reloadCanv().then(r => {
                $scope.drawStuff.ctx.strokeStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.lineWidth = $scope.drawStuff.canvLineWidth;
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.moveTo(e.x, e.y)
                $scope.drawStuff.ctx.lineTo(s.x, s.y)
                $scope.drawStuff.ctx.lineTo(m.x, m.y);
                $scope.drawStuff.ctx.stroke();
                let angOne = Math.atan((e.y - s.y) / (e.x - s.x)) + Math.PI,
                    angTwo = Math.atan((m.y - s.y) / (m.x - s.x)) + Math.PI;
                // $scope.drawStuff.ctx.fillStyle = '#f00';
                // $scope.drawStuff.ctx.fillText('(S)', s.x + 5, s.y + 5);
                // $scope.drawStuff.ctx.fillText('(E)', e.x + 5, e.y + 5);
                // $scope.drawStuff.ctx.fillText('(M)', m.x + 5, m.y + 5);
                const theAngle = $scope.drawStuff.findAngle(e, s, m);
                let theAngleDeg = Math.floor(theAngle * 18000 / Math.PI) / 100;
                if (l) {
                    theAngleDeg = Math.round(theAngleDeg / 15) * 15;
                }
                console.log('ANGLE', theAngle, theAngleDeg, 'original line angles', angOne, angTwo, '(', angOne * 180 / Math.PI, angTwo * 180 / Math.PI, ')')
                $scope.drawStuff.ctx.beginPath();
                $scope.drawStuff.ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
                $scope.drawStuff.ctx.stroke();
                $scope.drawStuff.ctx.fillStyle = 'rgba(255,255,255,.8)';
                $scope.drawStuff.ctx.fillRect(s.x + 8, s.y + 1, $scope.drawStuff.ctx.measureText(theAngleDeg + ' \xB0').width, 2 + $scope.drawStuff.canvFontSize / (72 / 96))
                $scope.drawStuff.ctx.fillStyle = $scope.drawStuff.canvDrawColor;
                $scope.drawStuff.ctx.font = `normal ${$scope.drawStuff.canvFontSize}pt serif`;
                $scope.drawStuff.ctx.fillText(theAngleDeg + ' \xB0', s.x + 10, s.y + 2 + $scope.drawStuff.canvFontSize / (72 / 96));
                if (!noSave) {
                    $scope.drawStuff.updCanv();
                    $scope.drawStuff.drawAngle = { start: null, end: null }
                }
            })
        }
        $scope.drawStuff.downloadPic = () => {
            let lnk = document.createElement('a'),
                e;

            /// the key here is to set the download attribute of the a tag
            lnk.download = 'mathApp_img_' + Math.floor(Math.random() * 9999999).toString(32) + '.png';

            /// convert canvas content to data-uri for link. When download
            /// attribute is set the content pointed to by link will be
            /// pushed as "download" in HTML5 capable browsers
            lnk.href = $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].data;

            /// create a "fake" click-event to trigger the download
            if (document.createEvent) {
                e = document.createEvent("MouseEvents");
                e.initMouseEvent("click", true, true, window,
                    0, 0, 0, 0, 0, false, false, false,
                    false, 0, null);

                lnk.dispatchEvent(e);
            } else if (lnk.fireEvent) {
                lnk.fireEvent("onclick");
            }
            bulmabox.alert('Downloaded', 'Your picture has been downloaded! Feel free to upload it and use it in a lesson.')
        }
        $scope.drawStuff.copyPic = () => {
            $scope.newProbSet.picture = {
                pic: $scope.drawStuff.canvHistory[$scope.drawStuff.canvHistoryNum].data,
                isTop: false
            }
            bulmabox.alert('Copied', 'Your picture has been copied to the Exercise Set Creation tabs!')
        }
        //END DRAWING STUFF
        $scope.doStuRep = st => {
            console.log('Student is', st)
            let asmtList = st.assignedEx.map(t => {
                    let theAsmt = $scope.psetClassSort.isin.find(q => t.setId == q._id),
                        theGrade = '(none)';
                    if (t.numGud && t.numProbs) {
                        switch (true) {
                            case (t.numGud / t.numProbs) > .95:
                                theGrade = 'A';
                                break;
                            case (t.numGud / t.numProbs) > .90:
                                theGrade = 'A-';
                                break;
                            case (t.numGud / t.numProbs) > .85:
                                theGrade = 'B';
                                break;
                            case (t.numGud / t.numProbs) > .80:
                                theGrade = 'B-';
                                break;
                            case (t.numGud / t.numProbs) > .75:
                                theGrade = 'C';
                                break;
                            case (t.numGud / t.numProbs) > .70:
                                theGrade = 'C-';
                                break;
                            case (t.numGud / t.numProbs) > .65:
                                theGrade = 'D';
                                break;
                            case (t.numGud / t.numProbs) > .60:
                                theGrade = 'D-';
                                break;
                            default:
                                theGrade = 'F'
                        }
                    }
                    console.log('assignment', theAsmt)
                    return `<tr><td><strong>${theAsmt.title}</strong><br>${theAsmt.text}</td>
                <td>${t.numGud||0}</td>
                <td>${t.numProbs||theAsmt.probs.length}</td>
                <td>${t.duration?Math.floor(t.duration/1000)+'sec':'(Not completed)'}</td>
                <td>${theGrade}</td></tr>`
                }).join(''),
                htmlString = `
            <html>
            <head>
                <title>Student Progress Report: ${st.user}</title>
                <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
            </head>
            <body class='content'>
                <h3>Student Progress Report</h3>
                <h4>Student: ${st.user}</h4>
                <h4>Email: ${st.email||'(none given)'}</h4>
                <br>
                <table class='table'>
                    <thead>
                        <tr>
                            <th>Exercise Set</th>
                            <th title='Number of exercises the student answered correctly.'>Correct #</th>
                            <th title='Total number of exercises in this exercise set.'>Total #</th>
                            <th title='Time taken for student to complete the exeercise.'>Time Taken (sec)</th>
                            <th title='The standardized grade, based on a 95+ = A, 90 = A-. 85 = B+, etc. schema'>Grade (Standardized)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${asmtList}
                    </tbody>
                </table>
            </body>
            </html>`

            const pRepWin = window.open('', '')
            pRepWin.document.write(htmlString);
            pRepWin.print();
            pRepWin.document.close();
        }
        $scope.tempChartTest = {
            data: [
                [1, 3, 5, 4, 8, 6, 4, 8, 9, 1],
                [1, 5, 8, 2, 9, 6, 3, 5, 2, 5]
            ],
            series: ['Multiplication', 'Things with Numbers'],
            labels: ['Data Point 1', 'Data Point 2', 'Data Point 3', 'Data Point 4', 'Data Point 5', 'Data Point 6', 'Data Point 7', 'Data Point 8', 'Data Point 9', 'Data Point 10']
        }
        $scope.progressChart = {
            data: [],
            active: false,
            student: null,
            items: [],
            series: [],
            options: {
                scales: {
                    yAxes: [{
                        display: true,
                        ticks: {
                            suggestedMin: 0, // minimum will be 0, unless there is a lower value.
                            // OR //
                            beginAtZero: true // minimum value will be 0.
                        }
                    }]
                }
            }
        }
        $scope.showProgRep = st => {
            console.log('STUDENT we would wanna use is', st)
            $scope.progressChart.student = st;
            $scope.progressChart.active = true;
            $scope.progressChart.data = [];
            $scope.progressChart.series = [];
            $scope.progressChart.labels = [];
            $scope.switchProgMode();
        }
        $scope.switchProgMode = m => {
            $scope.progressChart.tagMode = !!m;
            if (m) {
                //tagMode
                $scope.progressChart.items = [];
                let i = 0;
                $scope.progressChart.student.assignedEx.filter(q => q.startTime && q.endTime).map(qt => {
                    return qt.tags;
                }).forEach(sta => {
                    // console.log('STA',sta)
                    for (i = 0; i < sta.length; i++) {
                        if (!$scope.progressChart.items.find(t => t.name == sta[i])) {
                            $scope.progressChart.items.push({
                                name: sta[i],
                                active: false
                            });
                        }
                    }
                });
                // console.log()
            } else {
                $scope.progressChart.items = $scope.progressChart.student.assignedEx.filter(t => t.startTime).map(q => {
                    return { name: q.title, probs: q.probs, active: false }
                });
            }
            console.log('after mode switch', $scope.progressChart)
        }
        $scope.doProgChart = () => {
            //make it!
            if ($scope.progressChart.tagMode) {
                //tag mode
                const allActiveTags = $scope.progressChart.items.filter(ta => !!ta.active);
                $scope.progressChart.series = ['Percent Correct'];
                $scope.progressChart.data = [
                    []
                ];
                $scope.progressChart.labels = []
                if (!allActiveTags.length) {
                    return false;
                }

                allActiveTags.forEach(tg => {
                    let totalProbs = 0,
                        totalCorrect = 0;
                    $scope.progressChart.student.assignedEx.filter(ae => ae.tags.indexOf(tg.name) > -1 && ae.startTime).forEach(aet => {
                        totalProbs += aet.probs.length;
                        totalCorrect += aet.probs.filter(aep => !!aep.isCorrect).length;
                    });
                    $scope.progressChart.labels.push(tg.name);
                    $scope.progressChart.data[0].push(Math.round(1000 * totalCorrect / totalProbs) / 10);
                })
                console.log('Tag mode!', $scope.progressChart)
            } else {
                //lesson mode
                const allActiveLessons = $scope.progressChart.items.filter(ta => !!ta.active);
                $scope.progressChart.series = ['Percent Correct'];
                $scope.progressChart.data = [
                    []
                ];
                $scope.progressChart.labels = []
                if (!allActiveLessons.length) {
                    return false;
                }

                allActiveLessons.forEach(lsn => {
                    // let totalProbs = 0,
                    // totalCorrect = 0;
                    // allAcit.forEach(aet => {
                    //     totalProbs += aet.probs.length;
                    //     totalCorrect += aet.probs.filter(aep => !!aep.isCorrect).length;
                    // });
                    $scope.progressChart.labels.push(lsn.name);
                    $scope.progressChart.data[0].push(Math.round(1000 * lsn.probs.filter(aep => !!aep.isCorrect).length / lsn.probs.length) / 10);
                })
                console.log('Tag mode!', $scope.progressChart)
            }
            $scope.progressChart.colors = $scope.progressChart.data[0].map(q => {
                return { backgroundColor: `rgb(${128-(q*1.28)},${q*1.28},0)` }
            })
        }
        $scope.getUnconf = () => {
            $http.get('/user/unconfirmed')
                .then(r => {
                    console.log('unconf response', r)
                    $scope.unconf = r.data;
                })
        };
        $scope.confStu = (st,mode)=>{
            console.log('wishes to confirm or ban student',st,'status',mode)
            let title = !!mode?'Confirm Student':'Deny Student',
                msg = !!mode?`Are you sure you wish to Confirm the student ${st.name}? This will allow you to add them to lessons and exercises.`:`Are you sure you wish to Deny the student ${st.name}? This will delete their account from the system. <br>WARNING:<br>This process is not reversable!`;
            bulmabox.confirm(title,msg,(r)=>{
                if(r && r!==null && !!mode){
                    $http.get('/user/confirm?u='+st.id).then(r=>{
                        $scope.getUnconf();
                    })
                }else if(r && r!==null){
                    //ban (delete);
                    $http.get('/user/denyConfirm?u='+st.id).then(r=>{
                        $scope.getUnconf();
                    })
                }
            })
        }
        $scope.getUnconf();
    })
    .filter('timeElapsed', function() {
        return function(num) {
            //convert a number of milliseconds (num) to (hrs:)(min:)sec
            if (isNaN(num)) {
                return 'unknown';
            }
            let seconds = parseInt((num / 1000) % 60),
                minutes = parseInt((num / (1000 * 60)) % 60),
                hours = parseInt((num / (1000 * 60 * 60)) % 24);
            // hours = (hours < 10) ? "0" + hours : hours;
            console.log(hours, minutes, seconds)
            switch (true) {
                case hours > 0:
                    minutes = (minutes < 10) ? "0" + minutes : minutes;
                    seconds = (seconds < 10) ? "0" + seconds : seconds;
                    return hours + ":" + minutes + ":" + seconds;
                    break;
                case minutes > 0:
                    seconds = (seconds < 10) ? "0" + seconds : seconds;
                    return minutes + ":" + seconds + ' min';
                    break;
                default:
                    return seconds + ' sec';

            }
            // return hours + ":" + minutes + ":" + seconds;
        };
    })
    .filter('perc', function() {
        return function(num) {
            //convert a number of milliseconds (num) to (hrs:)(min:)sec
            if (isNaN(num)) {
                return '0%';
            }
            return Math.floor(num * 1000) / 10 + '%';
        };
    })
const timezoneList = [
   {
      "value": -12,
      "text": "(GMT -12:00) Eniwetok, Kwajalein"
   },
   {
      "value": -11,
      "text": "(GMT -11:00) Midway Island, Samoa"
   },
   {
      "value": -10,
      "text": "(GMT -10:00) Hawaii"
   },
   {
      "value": -9,
      "text": "(GMT -9:00) Alaska"
   },
   {
      "value": -8,
      "text": "(GMT -8:00) Pacific Time (US & Canada)"
   },
   {
      "value": -7,
      "text": "(GMT -7:00) Mountain Time (US & Canada)"
   },
   {
      "value": -6,
      "text": "(GMT -6:00) Central Time (US & Canada), Mexico City"
   },
   {
      "value": -5,
      "text": "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima"
   },
   {
      "value": -4,
      "text": "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"
   },
   {
      "value": -3.5,
      "text": "(GMT -3:30) Newfoundland"
   },
   {
      "value": -3,
      "text": "(GMT -3:00) Brazil, Buenos Aires, Georgetown"
   },
   {
      "value": -2,
      "text": "(GMT -2:00) Mid-Atlantic"
   },
   {
      "value": -1,
      "text": "(GMT -1:00) Azores, Cape Verde Islands"
   },
   {
      "value": 0,
      "text": "(GMT) Western Europe Time, London, Lisbon, Casablanca"
   },
   {
      "value": 1,
      "text": "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"
   },
   {
      "value": 2,
      "text": "(GMT +2:00) Kaliningrad, South Africa"
   },
   {
      "value": 3,
      "text": "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"
   },
   {
      "value": 3.5,
      "text": "(GMT +3:30) Tehran"
   },
   {
      "value": 4,
      "text": "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"
   },
   {
      "value": 4.5,
      "text": "(GMT +4:30) Kabul"
   },
   {
      "value": 5,
      "text": "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"
   },
   {
      "value": 5.5,
      "text": "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"
   },
   {
      "value": 5.75,
      "text": "(GMT +5:45) Kathmandu"
   },
   {
      "value": 6,
      "text": "(GMT +6:00) Almaty, Dhaka, Colombo"
   },
   {
      "value": 7,
      "text": "(GMT +7:00) Bangkok, Hanoi, Jakarta"
   },
   {
      "value": 8,
      "text": "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"
   },
   {
      "value": 9,
      "text": "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"
   },
   {
      "value": 9.5,
      "text": "(GMT +9:30) Adelaide, Darwin"
   },
   {
      "value": 10,
      "text": "(GMT +10:00) Eastern Australia, Guam, Vladivostok"
   },
   {
      "value": 11,
      "text": "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"
   },
   {
      "value": 12,
      "text": "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"
   }
]
app.controller('unconf-cont', function($scope, $http, $state) {
    // $scope.usr = JSON.parse(localStorage.brethUsr).user;
    $scope.logout = function() {
        $http.get('/user/logout').then(function(r) {
            console.log(r);
            $state.go('appSimp.login');
        })
    }
})
app.factory('musFac', function($http,$q) {
    return {
        musOff:function(){
            if (window.source){
                window.source.stop(); //stahp currently playing soundtrack
            }
        },
    	createMus:function(){
    		//done once each page load to generate the audiocontext
    		window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.context = new AudioContext();
            window.gain = context.createGain();
            gain.gain.value = 0.5;
    	},
        getMusic: function(id) {
            //get a random musical selection from a particular category
            if (window.context && window.source){
            	window.source.stop(); //stop currently playing soundtrack
            }
            let prom = $q.defer();
            function process(Data) {
                window.source = window.context.createBufferSource(); // Create Sound Source
                window.context.decodeAudioData(Data, function(buffer) {
                    window.source.buffer = buffer;
                    window.source.connect(gain);
                    window.gain.connect(context.destination);
                    window.source.start(context.currentTime);
                })
                window.source.addEventListener('ended',function(e){
                    console.log('ENDED?',e)
                    prom.resolve('DONE');
                });
            }
            const request = new XMLHttpRequest();
            request.open("GET", "./audio/getAudio?filename="+id, true);
            request.responseType = "arraybuffer";
            request.onload = function() {
                // console.log('HEDDURZ!',request.response.headers);
                const Data = request.response;
                process(Data);
            };
            request.send();
            return prom.promise;
        },
        toggleMus: function(){
        	//switch on/off a music val
        	if (window.gain && window.gain.gain.value && window.gain.gain.value>0 ){
        		//mute
        		window.gain.gain.value=0;
        	}else if (window.gain && window.gain.gain.value==0 ){
        		window.gain.gain.value=.5;
        	}
        }
    }
})
app.factory('socketFac', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () { 
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
app.run(['$rootScope', '$state', '$stateParams', '$transitions', '$q','userFact', function($rootScope, $state, $stateParams, $transitions, $q,userFact) {
    $transitions.onBefore({ to: 'app.**' }, function(trans) {
        let def = $q.defer();
        console.log('TRANS',trans)
        const usrCheck = trans.injector().get('userFact')
        usrCheck.getUser().then(function(r) {
            console.log('response from login chck',r)
            if (r.data && r.data.confirmed) {
                // localStorage.twoRibbonsUser = JSON.stringify(r.user);
                def.resolve(true)
            } else if(r.data){
                def.resolve($state.target('appSimp.unconfirmed',undefined, {location:true}))
            }else{
                // User isn't authenticated. Redirect to a new Target State
                def.resolve($state.target('appSimp.login', undefined, { location: true }))
            }
        }).catch(e=>{
            def.resolve($state.target('appSimp.login', undefined, { location: true }))
        });
        return def.promise;
    });
    // $transitions.onFinish({ to: '*' }, function() {
    //     document.body.scrollTop = document.documentElement.scrollTop = 0;
    // });
}]);
app.factory('userFact', function($http) {
    return {
        getUser: function() {
            return $http.get('/user/getUsr').then(function(s) {
                return s;
            })
        }
    };
});