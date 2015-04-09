var jsTag = angular.module('jsTag');

// TODO: Maybe add A to 'restrict: E' for support in IE 8?
jsTag.directive('jsTag', ['$templateCache', function($templateCache) {
  return {
    restrict: 'E',
    scope: true,
    controller: 'JSTagMainCtrl',
    templateUrl: function($element, $attrs) {
      var mode = $attrs.jsTagMode || "default";
      return 'jsTag/source/templates/' + mode + '/js-tag.html';
    }
  }
}]);

jsTag.directive('onlyDigits', function () {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel || attrs.onlyDigits !== 'true') return;
      ngModel.$parsers.unshift(function (inputValue) {
        var digits = inputValue.split('').filter(function (s) { return (!isNaN(s) && s != ' '); }).join('');
        ngModel.$viewValue = digits;
        ngModel.$render();
        return digits;
      });
    }
  };
});

jsTag.directive("limitTo", [function() {
  return {
    restrict: "A",
    require: '?ngModel',
    link: function(scope, elem, attrs, ngModel) {
      var limit = parseInt(attrs.limitTo);
      if (!ngModel) return;
      ngModel.$parsers.unshift(function (inputValue) {
        if (inputValue && inputValue.length > limit) {
          inputValue = inputValue.slice(0, 5);
        }
        ngModel.$viewValue = inputValue;
        ngModel.$render();
        return inputValue;
      });
    }
  }
}]);


// Notice that focus me also sets the value to false when blur is called
// TODO: Replace this custom directive by a supported angular-js directive for focus
// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
jsTag.directive('focusMe', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if (value === true) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });

      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function() {
        scope.$apply(model.assign(scope, false));
      });
    }
  };
}]);

// focusOnce is used to focus an element once when first appearing
// Not like focusMe that binds to an input boolean and keeps focusing by it
jsTag.directive('focusOnce', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].select();
      });
    }
  };
}]);

// auto-grow directive by the "shadow" tag concept
jsTag.directive('autoGrow', ['$timeout', function($timeout) {
  return {
    link: function(scope, element, attr){
      var paddingLeft = element.css('paddingLeft'),
          paddingRight = element.css('paddingRight');
   
      var minWidth = 60;
   
      var $shadow = angular.element('<span></span>').css({
        'position': 'absolute',
        'top': '-10000px',
        'left': '-10000px',
        'fontSize': element.css('fontSize'),
        'fontFamily': element.css('fontFamily'),
        'white-space': 'pre'
      });
      element.after($shadow);
   
      var update = function() {
        var val = element.val()
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&/g, '&amp;')
        ;
        
        // If empty calculate by placeholder
        if (val !== "") {
          $shadow.html(val);
        } else {
          $shadow.html(element[0].placeholder);
        }
        
        var newWidth = ($shadow[0].offsetWidth + 10) + "px";
        element.css('width', newWidth);
      }
   
      var ngModel = element.attr('ng-model');
      if (ngModel) {
        scope.$watch(ngModel, update);
      } else {
        element.bind('keyup keydown', update);
      }
      
      // Update on the first link
      // $timeout is needed because the value of element is updated only after the $digest cycle
      // TODO: Maybe on compile time if we call update we won't need $timeout
      $timeout(update);
    }
  }
}]);

// Small directive for twitter's typeahead
jsTag.directive('jsTagTypeahead', function () {
  return {
    restrict: 'A', // Only apply on an attribute or class  
    require: '?ngModel',  // The two-way data bound value that is returned by the directive
    link: function (scope, element, attrs, ngModel) {
      
      element.bind('jsTag:breakcodeHit', function(event) {

        /* Do not clear typeahead input if typeahead option 'editable' is set to false
         * so custom tags are not allowed and breakcode hit shouldn't trigger any change. */
        if (scope.$eval(attrs.options).editable === false) {
          return;
        }

        // Tell typeahead to remove the value (after it was also removed in input)
        $(event.currentTarget).typeahead('val', '');
      });
      
    }
  };
});
