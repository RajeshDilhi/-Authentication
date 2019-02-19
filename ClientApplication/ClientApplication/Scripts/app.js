var myApp = angular.module('myApp', ['ui.router', 'LocalStorageModule']);
//app config
myApp.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('');
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '/Templates/home.html',
            controller: 'homeCtrl'
        })
        .state('authenticated', {
            url: '/authenticated',
            templateUrl: '/Templates/authenticated.html',
            controller: 'authenticatedCtrl'
        })
        .state('authorized', {
            url: '/authorized',
            templateUrl: '/Templates/authorized.html',
            controller: 'authorizedCtrl',
        })
        .state('login', {
            url: '/login',
            templateUrl: '/Templates/login.html',
            controller: 'loginCtrl'
        })
        .state('unauthorized', {
            url: '/unauthorized',
            templateUrl: '/Templates/unauthorized.html',
            controller: 'unauthorizedCtrl'
        });
});
myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

myApp.run(function ($location, authService) {
    
    if (authService.authentication.isAuth) {
        authService.saveAttemptUrl();
        $location.path('/login');
    }
});


//Global variable for store service base path
myApp.constant('serviceBasePath', 'http://localhost:51722/');

myApp.value('redirectToUrlAfterLogin', { url: '/' });
//Controllers
'use strict';
myApp.controller('indexController', ['$scope', '$location', 'localStorageService', 'authService', function ($scope, $location, localStorageService, authService) {

    authService.fillAuthData();
     $scope.logOut = function () {
         authService.logOut();
         authService.fillAuthData();
        $location.path('/home');
    }
    $scope.authentication = authService.authentication
}]);

myApp.controller('homeCtrl', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = '';
    dataService.getAnonymousData().then(function () {
        $scope.data = dataService.fac[0];
    })
}]);

myApp.controller('authenticatedCtrl', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = '';
    dataService.getAutenticatedData().then(function () {
        $scope.data = dataService.fac[0];
    })
}]);

myApp.controller('authorizedCtrl', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.data = '';
    dataService.getAuthorizeData().then(function () {
        $scope.data = dataService.fac[0];
    })

}]);

myApp.controller('loginCtrl', ['$scope', '$location', 'authService', function ($scope, $location, authService){
    $scope.account = {
        username: '',
        password: ''
    }
    $scope.message = '';
    $scope.login = function () {
        authService.login($scope.account).then(function (response) {
            authService.fillAuthData();
            authService.redirectToAttemptedUrl();

        },
        function (err) {
            $scope.message = err.error_description;
        });
    };

}]);

myApp.controller('unauthorizedCtrl', ['$scope', '$location', 'dataService', 'authService', function ($scope, $location, dataService, authService) {
    $scope.data = "Sorry you are not authorized to access this page"; 4

    $scope.Admin_login = function () {
        authService.logOut();
        authService.fillAuthData();
        $location.path('/home');
    } 

}]);

//Services
myApp.factory('dataService', ['$q','$http', 'serviceBasePath', function ($q,$http, serviceBasePath) {
    var _fac = [];


    var _getAnonymousData = function () {
        var deferred = $q.defer();
        $http.get(serviceBasePath + '/api/data/forall').then(function (res) {
            _fac.pop();
            _fac.push(res.data);
            deferred.resolve();
        }, function (err) {
            deferred.reject();
        });
        return deferred.promise;
    };

    var _getAutenticatedData = function () {
        var deferred = $q.defer();
        $http.get(serviceBasePath + '/api/data/autenticated').then(function (res) {
            _fac.pop();
            _fac.push(res.data);
            deferred.resolve();
        }, function (err) {
            deferred.reject();
        });
        return deferred.promise;
    };
    var _getAuthorizeData = function () {
        var deferred = $q.defer();
        $http.get(serviceBasePath + '/api/data/Authorize').then(function (res) {
            _fac.pop();
            _fac.push(res.data);
            deferred.resolve();
        }, function (err) {
            deferred.reject();
        });
        return deferred.promise;
    };
    return {
        getAnonymousData: _getAnonymousData,
        getAutenticatedData: _getAutenticatedData,
        getAuthorizeData: _getAuthorizeData,
        fac: _fac
    }

}]);
myApp.factory('authService', ['$http', '$q', '$location', 'redirectToUrlAfterLogin', 'serviceBasePath', 'localStorageService', function ($http, $q, $location, redirectToUrlAfterLogin, serviceBasePath, localStorageService) {
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        username: ""
    };

    var _login = function (loginData) {

        var data = "grant_type=password&username=" + loginData.username + "&password=" + loginData.password;

        var deferred = $q.defer();
        
        $http.post(serviceBasePath + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function (response) {

            localStorageService.set('authorizationData', { token: response.data.access_token, username: response.data.userName, Role: response.data.RoleType, fullName: response.data.fullName});

            _authentication.isAuth = true;
            _authentication.userName = response.data.fullName;

            deferred.resolve(response);

        },function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.username = "";

    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.username = authData.username;
        };

    }

    var _saveAttemptUrl = function () {
        if ($location.path().toLowerCase() != '/login') {
            console.log("hello");
            redirectToUrlAfterLogin.url = $location.path();
        }
        else {
            redirectToUrlAfterLogin.url = '/';
        }
    }

    var _isLoggedIn = function () {
        return _authentication.isAuth //convert value to bool
    }

    var _redirectToAttemptedUrl = function () {
            $location.path(redirectToUrlAfterLogin.url);
    }

    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.isLoggedIn = _isLoggedIn;
    authServiceFactory.redirectToAttemptedUrl = _redirectToAttemptedUrl;
    authServiceFactory.saveAttemptUrl = _saveAttemptUrl
    return authServiceFactory;
}]);

myApp.factory('authInterceptorService', ['$q', '$location', 'localStorageService', function ($q, $location, localStorageService) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            $location.path('/login');
        }
        if (rejection.status === 403) {
            $location.path('/unauthorized');
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);



