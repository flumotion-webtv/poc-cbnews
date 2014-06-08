'use strict';

// listen song selection to update metadatas
angular.module('app', ['fmt'])

  .controller('MainCtrl', function ($rootScope, $scope, $location, $filter, $http, Url) {

    // Flumotion OVRP base URL to load the content
    window.fmtBaseUrl = $location.search().fmtBaseUrl || '';

    $scope.content = Url.joinUrl(window.fmtBaseUrl, 'api', 'channels', $location.search().channel, 'pods', {
      active: true,
      extended: true
    });

    var getFieldValue = function (pod, key) {
      var fields = $filter('filter')(pod.extra_fields, {name: key});
      return (fields && fields.length) ? fields[0].value : null;
    };

    var updateUrl = function (url, shortUrl) {
      $scope.emailUrl = $scope.sharingUrl = shortUrl || url;
      $scope.sharingIframe = '<iframe src="' + $location.absUrl() + '" scrolling="no" frameborder="0" width="640px" height="264px"></iframe>';
    };

    $scope.like = function () {
      $scope.likeDisabled = true;
      var data = {vote: 5};
      var url = Url.joinUrl(window.fmtBaseUrl, 'api', 'video', $scope.pod.id, 'vote');
      $http.post(url, data).then(function () {
        $scope.pod.total_rates++;
      }, function () {
        // ignore if rate fails
      });
    };

    $rootScope.$on('fmtPodSelected', function (event, pod) {

      // Keep pod
      $scope.pod = pod;

      // Create link to CulturePub website
      $scope.fields = {
        produit: getFieldValue(pod, 'produit'),
        marque: getFieldValue(pod, 'marque'),
        pays: getFieldValue(pod, 'pays')
      };
      var title = $filter('slug')($scope.fields.marque + ' ' + $scope.fields.produit + ' ' + pod.title);
      $scope.url = 'http://www.culturepub.fr/videos/' + title;

      // Make URL short using Bit.ly
      var bitlyUrl = Url.joinUrl('https://api-ssl.bitly.com/v3/shorten', {
        access_token: 'a849b0d5aa6d017b04843097b122a59b6d1f5413',
        longUrl: $scope.url
      });
      $http.get(bitlyUrl).success(function (response) {
        // success: use short URL
        updateUrl($scope.url, response.data.url);
      }).error(function () {
        // error: use original URL
        updateUrl($scope.url);
      });
    });
  });