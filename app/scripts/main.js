/* jshint devel:true */
/*jslint bitwise: true */

/**** Lower tail quantile for standard normal distribution function.
    This function returns an approximation of the inverse cumulative
    standard normal distribution function.  I.e., given P, it returns
    an approximation to the X satisfying P = Pr{Z <= X} where Z is a
    random variable from the standard normal distribution.
    The algorithm uses a minimax approximation by rational functions
    and the result has a relative error whose absolute value is less
    than 1.15e-9.
    Author:      Peter John Acklam
    (Javascript version by Alankar Misra @ Digital Sutras (alankar@digitalsutras.com))
    Time-stamp:  2003-05-05 05:15:14
    E-mail:      pjacklam@online.no
    WWW URL:     http://home.online.no/~pjacklam

    An algorithm with a relative error less than 1.15*10-9 in the entire region.
***/

function NORMSINV(p) {
  'use strict';
    // Coefficients in rational approximations
    var a = [-3.969683028665376e+01,  2.209460984245205e+02,
                      -2.759285104469687e+02,  1.383577518672690e+02,
                      -3.066479806614716e+01,  2.506628277459239e+00];

    var b = [-5.447609879822406e+01,  1.615858368580409e+02,
                      -1.556989798598866e+02,  6.680131188771972e+01,
                      -1.328068155288572e+01];

    var c = [-7.784894002430293e-03, -3.223964580411365e-01,
                      -2.400758277161838e+00, -2.549732539343734e+00,
                      4.374664141464968e+00,  2.938163982698783e+00];

    var d = [7.784695709041462e-03, 3.224671290700398e-01,
                       2.445134137142996e+00,  3.754408661907416e+00];

    // Define break-points.
    var plow  = 0.02425;
    var phigh = 1 - plow;
    var q;
    // Rational approximation for lower region:
    if ( p < plow ) {
             q  = Math.sqrt(-2*Math.log(p));
             return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                             ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    }

    // Rational approximation for upper region:
    if ( phigh < p ) {
             q  = Math.sqrt(-2*Math.log(1-p));
             return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                                    ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    }

    // Rational approximation for central region:
    q = p - 0.5;
    var r = q*q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
                             (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

// function nsort(vals) {
//   'use strict';
//   return vals.sort(function (a, b) { return a - b; });
// }

// function percentile(vals, ptile) {
//   'use strict';
//   //vals = numbers(vals)
//   if (vals.length === 0 || ptile === null || ptile < 0) {
//     return NaN;
// }

//   // Fudge anything over 100 to 1.0
//   if (ptile > 1) {
//     ptile = 1;
//   }
//   vals = nsort(vals);
//   var i = (vals.length * ptile) - 0.5;
//   if ((i | 0) === i) {
//     return vals[i];
//   }
//   // interpolated percentile -- using Estimation method
//   var intPart = i | 0;
//   var fract = i - intPart;
//   return (1 - fract) * vals[intPart] + fract * vals[intPart + 1];
// }

function monteCarlo(initialValue, annualOutflow, monthlyReturn, monthlyStdDev) {
    'use strict';
    var result = [];
    var sims = [];

    var maxBucketValue = 10000;
    var granularity = 2;

    // CONVERT MONTHLY TO QUARTERLY
    monthlyStdDev = monthlyStdDev * Math.sqrt(3);
    monthlyReturn = Math.pow(1 + monthlyReturn, 3) - 1;
    
    var percentiles = [0.05, 0.2, 0.5, 0.8, 0.95];
    
    var timePeriods = 100;
    var timePeriodsPerYear = 4;
    var simulations = 20000;
    var monthlyOutflow = annualOutflow / timePeriodsPerYear;
    
    for (var n = 0; n < 5; n++) {
        result[1, n] = initialValue * granularity;
    }
    
    for (n = 0; n < simulations; n++) {
        sims[n] = initialValue;
    }
    
    for (var m = 0; m < timePeriods; m++) {
        var v = [];
        var buckets = [];
        for (n = 0; n < simulations; n++) {
          var val = sims[n] * (1 + NORMSINV(Math.random()) * monthlyStdDev + monthlyReturn) - monthlyOutflow;
          sims[n] = val;
          
            if (val < 0) {
              val = 0;
            } else {
              val = (val * granularity) | 0;
            }

            if(isNaN(buckets[val])) {
              buckets[val] = 1;
            } else {
              buckets[val] = buckets[val] + 1;
            }
        }

        var sum = 0;
        var i = 0;

        for (n = 0; n < maxBucketValue; n++) {
          var threshold = simulations * percentiles[i];
        
          if (!isNaN(buckets[n])) {
            sum += buckets[n];
          }
          
          while (sum > threshold) {
            v[i] = n / granularity;
            i++;
            threshold = simulations * percentiles[i];
          }
        }

        while (i < 5) {
          v[i++] = maxBucketValue / granularity;
        }

        result[m] = v;
    }

    console.log(result);
    return result;
}

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
var yearsFromNow = document.querySelector('.year-form-now');

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

  yearsInput.value = yearsRemaining;
  yearsInput.setAttribute('value', yearsRemaining);
  yearsText.setAttribute('value', yearsRemaining);
};

var addClass = function(el,className){
  if (el.classList){
     el.classList.add(className);
  }
  else {
    el.className += ' ' + className;
  }
};

timeframe.addEventListener('click', function(){
  'use strict';
  timeFrame();
  addClass(yearsFromNow, 'display');
});

/* Event listener function for slider on load */
  yearsInput.addEventListener('input', function(){
    'use strict';
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
    'use strict';
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
    // return yearsInt;
  });


/* Set vars for years from DOM */
// 'use strict';
var pensionSize = document.querySelector('#pension-size');
var pensionAnnual = document.querySelector('#pension-annual');
var pensionSizeText = document.querySelector('#pension-size-text');
var pensionAnnualText = document.querySelector('#pension-annual-text');
var pensionInt,pensionIntAnn;
var initialValue = 100,
    annualDrawdown = 5;

/* Event listener function for slider on load */

  pensionSize.addEventListener('input', function(){
    'use strict';
    pensionInt = parseInt(pensionSize.value);
    pensionSize.setAttribute('value', pensionInt);
    pensionSizeText.setAttribute('value', pensionInt);
    // console.log(pensionInt);
  });

  pensionSizeText.addEventListener('keyup', function() {
     'use strict';
     pensionInt = parseInt(pensionSizeText.value);
     pensionSize.value = pensionInt;
     pensionSize.setAttribute('value', pensionInt);
     initialValue = parseFloat(pensionSizeText.value.replace(',','')) / 1000;
     window.alert(initialValue);
     if (initialValue <= 2000 && initialValue >= 20) {
          // updateChart();
      }
     return initialValue;
     // updateChart();
  });

  pensionAnnual.addEventListener('input', function(){
    'use strict';
    pensionIntAnn = parseInt(pensionAnnual.value);
    pensionAnnual.setAttribute('value', pensionIntAnn);
    pensionAnnualText.setAttribute('value', pensionIntAnn);
  });

  pensionAnnualText.addEventListener('keyup', function() {
     'use strict';
     pensionIntAnn = parseInt(pensionAnnualText.value);
     pensionAnnual.value = pensionIntAnn;
     pensionAnnual.setAttribute('value', pensionIntAnn);
     return pensionIntAnn;
  });


/* Variables for */
var type, 
    realRet,
    stDev,
    infl, 
    monthlyRet,
    monthlySd,
    thisValue,
    thisVal;


var riskText = document.getElementById('riskText');
var legendText = document.getElementById('legendText');

var dropdown = function() {
  'use strict';
  var select = document.getElementById('portfolio-type');
  if(select.addEventListener){
     select.addEventListener('change',dropdown,false);
  }
  else {
     select.attachEvent('onchange',dropdown,false);
  }

  if(select.value) {
    thisValue = select.value;

    // window.alert(select.value);
    thisVal = thisValue.toString();
    //window.alert(thisVal);
   
    var message = '';

    // Check what risk category is selected
    switch(thisVal) {
      case 'cash-portfolio':
      case 'gilts-portfolio':
        message = message + 'A <b>low risk</b> portfolio would typically have a large amount invested in bonds with a smaller allocation to equities. ';
        break;
      case 'moderate-investment-risk':
      case 'low-investment-risk':
      case 'high-investment-risk':
        message = message + 'A <b>medium risk</b> portfolio would typically have a large amount invested in equities with a smaller allocation to bonds. ';
        break;
      case 'uk-equity-portfolio':
      case 'global-equity-portfolio':
        message = message + 'A <b>high risk</b> portfolio would typically be almost entirely invested in equities. ';
        break;
       default: 
        message = 'Risk risky';
    }

    riskText.innerHTML = message;

    switch (thisVal) {
      case 'cash-portfolio':
        type = 'Cash portfolio';
        realRet = 0.022;
        stDev = 0.0001;
        break;
      case 'gilts-portfolio':
        type = 'Gilts portfolio';
        realRet = 0.0425;
        stDev = 0.052;
        break;
      case 'low-investment-risk':
        type = 'Portfolio with very low investment risk';
        realRet = 0.0745;
        stDev = 0.137;
        break;
      case 'moderate-investment-risk':
        type = 'Portfolio with moderate investment risk';
        realRet = 0.0507;
        stDev = 0.071;
        break;
      case 'high-investment-risk':
        type = 'Portfolio with high investment risk';
        realRet = 0.0563;
        stDev = 0.086;
        break;
      case 'uk-equity-portfolio':
        type = 'UK equity portfolio';
        realRet = 0.0618;
        stDev = 0.103;
        break;
      case  'global-equity-portfolio':
        type = 'Global equity portfolio';
        realRet = 0.0688;
        stDev = 0.122;
        break;
      case  'buy-to-let':
        type = 'Buy to let';
        realRet = 0.0745;
        stDev = 0.137;
        break;
    }

      infl = 0.02;
      monthlyRet = Math.pow((1 + realRet - infl), 1/12) - 1;
      monthlySd = stDev / Math.sqrt(12);
      
      var params = [monthlyRet, monthlySd];
      return params;
  }
};

function legend(parent, data) {
    'use strict';
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

    // remove possible children of the parent
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }

    datas.forEach(function(d) {
        if (d.label !== 'Median') {
            var title = document.createElement('span');
            title.className = 'title';
            parent.appendChild(title);

            var colorSample = document.createElement('div');
            colorSample.className = 'color-sample';
            colorSample.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
            colorSample.style.borderColor = d.hasOwnProperty('fillColor') ? d.fillColor : d.color;
            title.appendChild(colorSample);

            var text = document.createTextNode(d.label);
            title.appendChild(text);
        }
    });
}


var paramss = [];
var labs = [], data1 = [], data2 = [], data3 = [], data4 =[], median = [];
var lineChart;

var createChart = function() {
    'use strict';
    var timePeriodsPerYear = 4;
    var infl = 0.02;

    var monthlyRet = Math.pow((1 + 0.0618 - infl), 1/12) - 1;
    var monthlySd = 0.103 / Math.sqrt(12);

    var monteC = monteCarlo(initialValue,annualDrawdown,monthlyRet,monthlySd);
    

    labs[0] = 0;
    data1[0] = initialValue;
    data2[0] = initialValue;
    median[0] = initialValue;
    data3[0] = initialValue;
    data4[0] = initialValue;

    for (var i = 1; i <= 100; i++) {
      if ((i / timePeriodsPerYear) % 5 === 0){
         labs[i] = i / timePeriodsPerYear;
      }
      else {
        labs[i] = '';
        data1[i] = monteC[i - 1][4];
        data2[i] = monteC[i - 1][3];
        median[i] = monteC[i - 1][2];
        data3[i] = monteC[i - 1][1];
        data4[i] = monteC[i - 1][0];
     }
  }

  var numeric_array1 = [];
  for ( var item in data1 ) {
    numeric_array1.push( data1[ item ] );
  }

  console.log(numeric_array1);

  var numeric_array2 = [];
  for ( var item in data2 ) {
    numeric_array2.push( data2[ item ] );
  }

  var numeric_median = [];
  for ( var item in median ) {
    numeric_median.push( median[ item ] );
  }

  var numeric_array3 = [];
  for ( var item in data3 ) {
    numeric_array3.push( data3[ item ] );
  }

  var numeric_array4 = [];
  for ( var item in data4 ) {
    numeric_array4.push( data4[ item ] );
  }

  console.log(numeric_array1);

  var barData = {
    labels : labs,
    datasets : [
      {
        label: 'Good - 15%',
        fillColor: '#59902B',
        strokeColor: '#59902B',
        pointColor: '#59902B',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220,220,220,1)',
        data: numeric_array1
      },
      {
        label: 'Expected - 60%',
        fillColor: '#712F66',
        strokeColor: '#712F66',
        pointColor: 'rgba(50,240,80,0.9)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: numeric_array2
      },
      {
        label: 'Median',
        fillColor: 'rgba(151,151,151,0)',
        strokeColor: '#396B87',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: numeric_median
      },
      {
        label: 'Poor - 15%',
        fillColor: '#D18230',
        strokeColor: '#D18230',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: numeric_array3
      },
      {
        label: 'Very Poor 5%',
        fillColor: 'rgba(255,255,255,0.9)',
        strokeColor: '#A31E2E',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: numeric_array4
      }
    ]
  };

  var cht = document.getElementById('trChart');
  var ctx = cht.getContext('2d');
  lineChart = new Chart(ctx).Line(barData, {
          bezierCurve: false,
          pointDot : false,
          multiTooltipTemplate: '',
          scaleStartValue: 0
      });

  legend(legendText, barData);

  return lineChart;
};


window.onload = function(){
  'use strict';
  createChart();
};

var updateChart = function(){
    'use strict';
    paramss = dropdown();
    var monteC = monteCarlo(initialValue,annualDrawdown,paramss[0],paramss[1]);
    createChart();
    var ds = lineChart.datasets;
    console.log(initialValue);
    ds[0].points[0].value = initialValue;
    ds[1].points[0].value = initialValue;
    ds[2].points[0].value = initialValue;
    ds[3].points[0].value = initialValue;
    ds[4].points[0].value = initialValue;

    for (var i = 1; i <= 100; i++) {
      ds[0].points[i].value = monteC[i - 1][4];
      ds[1].points[i].value = monteC[i - 1][3];
      ds[2].points[i].value = monteC[i - 1][2];
      ds[3].points[i].value = monteC[i - 1][1];
      ds[4].points[i].value = monteC[i - 1][0];
    }
    
    lineChart.update();
};

var updateButton = document.getElementById('update-chart');

updateButton.addEventListener('click', function(){
  'use strict';
   updateChart();
});

// var chart = new Chartist.Line('.ct-chart', {
//       labels: [1, 2, 3, 4, 5, 6, 7, 8],
//       series: [
//         [105, 9, 7, 8, 5, 3, 5, 4]
//       ]
//     }, {
//       low: 0,
//       showArea: true
//   });




