/* Prompts for age and age of retirement */
var age;
var ageOfRetirment;
var yearsRemaining;
var yearsRemainingString;

/* Set vars */
var yearsInt, yearsString, futureYear, futureAge, future, futureString;

/* Get current year and convert to integer */
var currentTime = new Date().getFullYear();
var currentYear = parseInt(currentTime);

/* Set vars for years from DOM */
var yearsInput = document.querySelector('#years');
var yearsOutput = document.querySelector('#yearsOutput');
var until = document.querySelector('#until');
var yearsText = document.querySelector('#years-text');
var timeframe = document.querySelector('#timeframe');

/* Set vars for ages */
var futureAge = document.querySelector('#futureAge');

/* Set initial values from prompts */
var timeFrame = function(){
  'use strict';
  /* Prompts for age and age of retirement */
  age = parseInt(window.prompt('Your age', 35));
  ageOfRetirment = parseInt(window.prompt('Age of retirement', 65));
  yearsRemaining = ageOfRetirment - age;
  yearsRemainingString = yearsRemaining.toString();
  window.alert(yearsRemainingString + ' ' + 'from now');

  yearsOutput.textContent =  yearsRemainingString;
  futureYear = currentYear + yearsRemaining;
  until.textContent = futureYear;
  future = yearsRemaining + age;
  futureAge.textContent = future;
  yearsInput.setAttribute('value', yearsRemaining);
  yearsText.setAttribute('value', yearsRemaining);
};

timeframe.addEventListener('click', function(){
  'use strict';
  timeFrame();
});

/* Event listener function for slider on load */
function years(){
  'use strict';
  yearsInput.addEventListener('input', function(){
    yearsInt = parseInt(yearsInput.value);
    yearsString = yearsInt.toString();
    yearsOutput.textContent =  yearsString;

    futureYear = currentYear + yearsInt;
    until.textContent = futureYear;

    future = yearsInt + age;
    futureString = future.toString();
    futureAge.textContent = futureString;

    yearsInput.setAttribute('value', yearsInt);
    yearsText.setAttribute('value', yearsInt);
  });

  yearsText.addEventListener('keyup', function(){
    yearsInt = parseInt(yearsText.value);
    yearsString = yearsInt.toString();
    yearsOutput.textContent =  yearsString;

    futureYear = currentYear + yearsInt;
    until.textContent = futureYear;

    future = yearsInt + age;
    futureString = future.toString();
    futureAge.textContent = futureString;

    
    yearsInput.value = yearsInt;
    yearsInput.setAttribute('value', yearsInt);
  });
}


years();

