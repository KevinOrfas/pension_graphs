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
// 'use strict';
var pensionSize = document.querySelector('#pension-size');
var pensionAnnual = document.querySelector('#pension-annual');
var pensionSizeText = document.querySelector('#pension-size-text');
var pensionAnnualText = document.querySelector('#pension-annual-text');
var pensionInt,pensionIntAnn;

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
     return pensionInt;
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

// var contr, c;


// var cc = pensionSizeText.addEventListener('focusout', function(){
//     var contr = controllers();
//     var c = parseInt(contr);
//     window.alert(c);
//     return c ;
    
// });

/* Variables for */
var type, 
    realRet,
    stDev,
    infl, 
    monthlyRet,
    monthlySd,
    thisValue,
    thisVal;
// var initialValue = 100,
//     annualDrawdown = 5;

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
        realRet = 0.0;
        stDev = 0.0001;
        break;
      case 'gilts-portfolio':
        type = 'Gilts portfolio';
        realRet = 30.022;
        stDev = 100.0001;
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

var lineChart;
// var timePeriodsPerYear = 4;
// var labs = [];

// for (var i = 1; i <= 25; i++) {
//     if ((i / timePeriodsPerYear) % 5 === 0) {
//         labs[i] = i / timePeriodsPerYear;
//     } else {
//       labs[i] = '';
//     }
// }

// window.alert(labs);


var barData = {
    labels : ['0','5','10','15','20','25'],
    datasets : [
      {
        label: 'Good - 15%',
        fillColor: 'rgba(50,200,80,0.9)',
        strokeColor: 'rgba(50,200,80,0.9)',
        pointColor: 'rgba(50,200,80,0.9)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220,220,220,1)',
        data : [100,108,111.5,114.5,117,119,121,122.5,124.5,126.5,127.5,129,130.5,131.5,133,134,136,137,138,139.5,140.5,142,143,144.5,145.5,146.5,148,149,150,151,152,153.5,154.5,155.5,156.5,158.5,158.5,160.5,162,162.5,164,164,165.5,166,167.5,168.5,169.5,171.5,172.5,173.5,174.5,175.5,176.5,178,179,180.5,181,182,184,184.5,185.5,186,188.5,189,190,190.5,193,193.5,194.5,195.5,197,199,199.5,200.5,202,203,203.5,206,206,208,208.5,210,211.5,212.5,214,214,215,216.5,218.5,219.5,220.5,221.5,223.5,224,226,225,227,228,230.5,232.5,234]
      },
      {
        label: 'Expected - 60%',
        fillColor: 'rgba(50,240,80,0.9)',
        strokeColor: 'rgba(50,240,80,0.9)',
        pointColor: 'rgba(50,240,80,0.9)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data : [100,104,105.5,106.5,107.5,108.5,109,110,110.5,111,111.5,112,112.5,113,113.5,113.5,114,114,114.5,114.5,115,115.5,115,116,116,116,116.5,116.5,117,116.5,117,117,117.5,117.5,118,118,118,118,118.5,118.5,119,119,119,119,119,119,119,119.5,119,119,119,120,120,120,120,120,120,120.5,120,120,120,120,120.5,120.5,120.5,120,120,120.5,120.5,120.5,121,121,120.5,120.5,120.5,120.5,120.5,120.5,120.5,120,120.5,120,120,120,120.5,120.5,120,120,119.5,119.5,119.5,119.5,119.5,119.5,119,119.5,119.5,118.5,119,118.5,118]
      },
      {
        label: 'Median',
        fillColor: 'rgba(151,151,151,0)',
        strokeColor: 'rgba(180,180,200,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: [100,99.5,99,99,98.5,98,98,97.5,97,96.5,96,96,95.5,95,94.5,94,94,93.5,92.5,92.5,92,92,91.5,91,90.5,90,89.5,89,88.5,88,87.5,87,86.5,86.5,85.5,85,84.5,84,83.5,83,82.5,82,81.5,81,80.5,80,79.5,78.5,78,77.5,77.5,76.5,76,75,75,74,73,72.5,72,71.5,71,70.5,69.5,69,68,67.5,67,66.5,65.5,65,64.5,63.5,62.5,62,61,60.5,60,59,58.5,57.5,57,56,55,54.5,53.5,53,51.5,51,50.5,49.5,48.5,47.5,47,46,45,44,43.5,42.5,41.5,41,40]
      },
      {
        label: 'Poor - 15%',
        fillColor: 'rgba(151,151,151,1.0)',
        strokeColor: 'rgba(151,151,151,1.0)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: [100,95,93,91.5,90,88.5,87.5,86.5,85,84,83,82,81,80,79,78,77,76.5,75.5,74.5,73.5,72.5,71.5,70.5,70,69,68,67,66.5,65.5,64.5,64,62.5,62,61,60,59,58,57.5,56.5,55.5,54.5,54,52.5,52,51,50,49,48,47,46.5,45.5,44.5,43.5,42.5,41.5,40.5,39.5,38.5,37.5,36.5,35.5,34.5,34,32.5,31.5,30.5,29.5,28.5,27.5,26.5,25.5,24.5,23.5,22,21,20,19,18,17,15.5,14.5,13.5,12.5,11,10,9,7.5,6.5,5,4,3,1.5,0.5,0,0,0,0,0,0,0]
      },
      {
        label: 'Very Poor 5%',
        fillColor: 'rgba(255,255,255,0.9)',
        strokeColor: 'rgba(250,70,80,1)',
        pointColor: 'rgba(151,187,205,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(151,187,205,1)',
        data: [100,91,87.5,84.5,82,80.5,78,76.5,75,73.5,72,70,68.5,67.5,66,64.5,63.5,62,60.5,59.5,58,57,56,55,54,53,52,50.5,49.5,48.5,47.5,46.5,45,43.5,42.5,41.5,40.5,39.5,38.5,37.5,36.5,35.5,34,33,32,31,29.5,28.5,27.5,26.5,25.5,24,23,22,21,19.5,18.5,17.5,16.5,15,14,13,12,10.5,9.5,8,7,6,5,3.5,2.5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      }
    ]
  };

var graphDom = function(gData){
    'use strict';
    var cht = document.getElementById('trChart');
    var ctx = cht.getContext('2d');
    lineChart = new Chart(ctx);
    lineChart.Line(gData,{
                bezierCurve: false,
                pointDot : false,
                multiTooltipTemplate: '',
                scaleStartValue: 0
    });

   
    console.log(lineChart);
    
};

// var graphDel = function(){
//     'use strict';
//     var cht = document.getElementById('trChart');
//     var ctx = cht.getContext('2d');
//     lineChart = new Chart(ctx);
//     lineChart.removeData();
//     console.log(lineChart);
    
// };


var createChart = function(oldData) {
    'use strict';
    legend(legendText, oldData);
    graphDom(oldData);
};

window.onload = function(){
  'use strict';
  createChart(barData);
  console.log(barData);
};

console.log(barData);
var paramss;
var updateData = function(oldData){
    'use strict';
    var dataSetA = oldData.datasets[0].data;
    var dataSetB = oldData.datasets[1].data;
    var dataSetM = oldData.datasets[2].data;
    var dataSetC = oldData.datasets[3].data;
    var dataSetD = oldData.datasets[4].data;
    // tt = controllers();
    console.log(pensionInt);
    console.log(pensionIntAnn);
    var monteC = monteCarlo(pensionInt,pensionIntAnn,paramss[0],paramss[1]);
    console.log(monteC);
    // window.alert(monteC);
    // var newDataA = [1,12,23,34,45, 21,3];
    // var newDataB = [34,45,63,12,19,3,43];
    for (var i = 1; i <= 100; i++) {
       dataSetA[i] = monteC[i - 1][3];
       dataSetB[i] = monteC[i - 1][3];
       dataSetM[i] = monteC[i - 1][2];
       dataSetC[i] = monteC[i - 1][1];
       dataSetD[i] = monteC[i - 1][0];
    }
    
    console.log(dataSetA);
    console.log(dataSetB);
    console.log(barData);
    // return oldData;
  };


var updateButton = document.getElementById('update-chart');
updateButton.addEventListener('click', function(){
  'use strict';
   paramss = dropdown();
   console.log(paramss);
   // graphDel();
   updateData(barData);
   graphDom(barData);
});
