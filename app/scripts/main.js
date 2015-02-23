/* jshint devel:true */
/*jslint bitwise: true */
console.log('Allo');

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

monteCarlo(500,20,0.0002, 0.02);