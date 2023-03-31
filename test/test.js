(function () {
  var app = angular.module("chatApp", []);

  app.controller("MessageCtrl", function ($scope) {
    $scope.messages = [
      {
        Name: "Ben Marcus",
        Message: "Hi  : )",
      },
      {
        Name: "Michelle Pepe",
        Message: "What's up?",
      },
      {
        Name: "Ben Marcus",
        Message: "Nothing much, You?",
      },
      {
        Name: "Maelyn Pepe",
        Message: "Huh?",
      },
      {
        Name: "Jack Angular",
        Message: "What?",
      },
    ];
  });
})();
