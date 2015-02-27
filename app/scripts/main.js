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
    var a = new Array(-3.969683028665376e+01,  2.209460984245205e+02,
                      -2.759285104469687e+02,  1.383577518672690e+02,
                      -3.066479806614716e+01,  2.506628277459239e+00);

    var b = new Array(-5.447609879822406e+01,  1.615858368580409e+02,
                      -1.556989798598866e+02,  6.680131188771972e+01,
                      -1.328068155288572e+01 );

    var c = new Array(-7.784894002430293e-03, -3.223964580411365e-01,
                      -2.400758277161838e+00, -2.549732539343734e+00,
                      4.374664141464968e+00,  2.938163982698783e+00);

    var d = new Array (7.784695709041462e-03, 3.224671290700398e-01,
                       2.445134137142996e+00,  3.754408661907416e+00);

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

function nsort(vals) {
  'use strict';
  return vals.sort(function (a, b) { return a - b; });
}

function percentile(vals, ptile) {
  'use strict';
  //vals = numbers(vals)
  if (vals.length === 0 || ptile === null || ptile < 0) {
    return NaN;
}

  // Fudge anything over 100 to 1.0
  if (ptile > 1) {
    ptile = 1;
  }
  vals = nsort(vals);
  var i = (vals.length * ptile) - 0.5;
  if ((i | 0) === i) {
    return vals[i];
  }
  // interpolated percentile -- using Estimation method
  var intPart = i | 0;
  var fract = i - intPart;
  return (1 - fract) * vals[intPart] + fract * vals[intPart + 1];
}

function monteCarlo(initialValue, annualOutflow, monthlyReturn, monthlyStdDev) {
  'use strict';
    var result = [];
    var sims = [];
    // CONVERT MONTHLY TO QUARTERLY
    monthlyStdDev = monthlyStdDev * Math.sqrt(3);
    monthlyReturn = Math.pow(1 + monthlyReturn, 3) - 1;
    
    var percentiles = [0.05, 0.2, 0.8, 0.95];
    
    var timePeriods = 100;
    var timePeriodsPerYear = 4;
    var simulations = 15000;
    var monthlyOutflow = annualOutflow / timePeriodsPerYear;
        
    //ReDim result(1 To timePeriods + 1, 1 To 11)
    //ReDim sims(0 To simulations)
    
    for (var n = 0; n < 4; n++) {
        result[n] = initialValue;
    }
    
    for (n = 0;n  < simulations; n++) {
        sims[n] = initialValue;
    }
    
    for (var m = 0; m < timePeriods; m++) {
        var v = [];

        for (n = 0; n < simulations; n++) {
            sims[n] = sims[n] * (1 + NORMSINV(Math.random()) * monthlyStdDev + monthlyReturn) - monthlyOutflow;
        }
       
        for (n = 0; n < 4; n++) {
            v[n] = percentile(sims, percentiles[n]);
            
            //Call CalculatePercentile(sims, simulations, percentiles(N), V)
            //result(m + 1, N) = V
        }

        result[m] = v;
    }

    // console.log(result);
    return result;

}

/* Set vars for years from DOM */
var pensionSize = document.querySelector('#pension-size');
var pensionAnnual = document.querySelector('#pension-annual');
var pensionSizeText = document.querySelector('#pension-size-text');
var pensionAnnualText = document.querySelector('#pension-annual-text');
var pensionInt;

/* Event listener function for slider on load */
(function(){
  'use strict';
  pensionSize.addEventListener('input', function(){
    pensionInt = parseInt(pensionSize.value);
    pensionSize.setAttribute('value', pensionInt);
    pensionSizeText.setAttribute('value', pensionInt);
  });

  pensionSizeText.addEventListener('keyup', function() {
     pensionInt = parseInt(pensionSizeText.value);
     pensionSize.value = pensionInt;
     pensionSize.setAttribute('value', pensionInt);
  });

  pensionAnnual.addEventListener('input', function(){
    pensionInt = parseInt(pensionAnnual.value);
    pensionAnnual.setAttribute('value', pensionInt);
    pensionAnnualText.setAttribute('value', pensionInt);
  });

  pensionAnnualText.addEventListener('keyup', function() {
     pensionInt = parseInt(pensionAnnualText.value);
     pensionAnnual.value = pensionInt;
     pensionAnnual.setAttribute('value', pensionInt);
  });
})();



var type, getIndex, realRet, stDev, infl, monthlyRet, monthlySd, initialValue, annualDrawdown, thisValue, thisVal;
var monteC = [];
initialValue = 100;
annualDrawdown = 5;
var getValue = 'gilts-portfolio';

var handler = function() {
    'use strict';
    var select = document.getElementById('portfolio-type');
      if(select.addEventListener){
        select.addEventListener('change',handler,false);
      }
      else {
        select.attachEvent('onchange',handler,false);
      }

    if(select.value) {
      thisValue = select.value;

      // window.alert(select.value);
      thisVal = thisValue.toString();
      // window.alert(thisVal);
      return thisVal;
    }

};

function updateRiskText() {
    'use strict';
    var message = '';

    // Check what risk category is selected
  switch(parseInt(pensionSize.value)) {
    case 10:
     message = message + 'A <b>low risk</b> portfolio would typically have a large amount invested in bonds with a smaller allocation to equities. ';
     break;
    case 0:
     message = message + 'A <b>medium risk</b> portfolio would typically have a large amount invested in equities with a smaller allocation to bonds. ';
     break;
    case 'high-investment-risk':
     message = message + 'A <b>high risk</b> portfolio would typically be almost entirely invested in equities. ';
     break;
  }



  var riskText = document.getElementById('riskText');
  riskText.innerHTML = message;
}

updateRiskText();


function portfolioOptions() {
  'use strict';
    getIndex = document.getElementById('portfolio-type').selectedIndex;
    getValue = document.getElementsByTagName('option')[getIndex].value;
    switch (handler()) {
      case 'cash-portfolio':
          type = 'Cash portfolio';
          realRet = 0.0;
            stDev = 0.0001;
          break;
      case 'gilts-portfolio':
          type = 'Gilts portfolio';
          realRet = 0.022;
            stDev = 0.0001;
          break;
      case 'low-investment-risk':
          type = 'Portfolio with very low investment risk';
          realRet = 0.0425;
            stDev = 0.052;
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
  
  var params = [initialValue, annualDrawdown, monthlyRet, monthlySd];
  console.log(params);

  return params;
}

var paramss = portfolioOptions();
console.log(paramss[3]);



var labs = [], data1 = [], data2 = [], median = [], data3 = [], data4 = [];
var timePeriodsPerYear = 4;

var barData = {
    labels : labs,
    datasets : [
        {
            label: 'Good - 15%',
            fillColor: 'rgba(50,200,80,0.9)',
            strokeColor: 'rgba(50,200,80,0.9)',
            pointColor: 'rgba(50,200,80,0.9)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data : [100, 1152.1436781613267, 1186.84974774212745, 2116.26193143784303, 2145.966277717634, 275.83573752893443, 307.0785804335355, 337.81627674305366, 3270.6481312058703, 4206.37355090253385, 4230.15192782255076, 4271.33280973281785, 4299.44246741691677]
        },
        {
            label: 'Expected - 60%',
            fillColor: 'rgba(50,240,80,0.9)',
            strokeColor: 'rgba(50,240,80,0.9)',
            pointColor: 'rgba(50,240,80,0.9)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(151,187,205,1)',
            data : [100,200,4000, 5000, 55000]
        },
        {
              label: 'Median',
              fillColor: 'rgba(151,151,151,0)',
              strokeColor: 'rgba(180,180,200,1)',
              pointColor: 'rgba(151,187,205,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(151,187,205,1)',
              // data: median
          },
          {
              label: 'Poor - 15%',
              fillColor: 'rgba(151,151,151,1.0)',
              strokeColor: 'rgba(151,151,151,1.0)',
              pointColor: 'rgba(151,187,205,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(151,187,205,1)',
              // data: data3
          },
          {
              label: 'Very Poor 5%',
              fillColor: 'rgba(255,255,255,0.9)',
              strokeColor: 'rgba(250,70,80,1)',
              pointColor: 'rgba(151,187,205,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(151,187,205,1)',
              // data: data4
          }
    ]
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


function createChart() {
      'use strict';
      labs[0] = 0;
      data1[0] = initialValue;
      data2[0] = initialValue;
      median[0] = initialValue;
      data3[0] = initialValue;
      data4[0] = initialValue;

      monteC = monteCarlo(paramss[0],paramss[1], paramss[2], paramss[3]);

      for (var i = 1; i <= 100; i++) {
         if ((i / timePeriodsPerYear) % 5 === 0) {
            labs[i] = i / timePeriodsPerYear;
         } else {
            labs[i] = '';
            data1[i] = monteC[i - 1][3];
            data2[i] = monteC[i - 1][3];
            median[i] = monteC[i - 1][2];
            data3[i] = monteC[i - 1][1];
            data4[i] = monteC[i - 1][0];
          }
      }

      console.log(data1);
      console.log(data2);
      console.log(median);
      console.log(data3);
      console.log(data4);

    var graphData = [data1, data2, data3];
    legend(document.getElementById('legendText'), barData);

    return graphData;
}

var datas = createChart();
console.log(datas[0]);
 


console.log(barData);



