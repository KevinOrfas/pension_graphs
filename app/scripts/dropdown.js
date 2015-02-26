// // var marginalTaxRate, 
// // 	longTermReturn,
// // 	longTermInflation,
// // 	inflationAdjustRerurn, 
// // 	annualVolatility;
// var type, getIndex, getValue, realRet, stDev, infl, monthlyRet, monthlySd, initialValue, annualDrawdown;

// initialValue = 100;
// annualDrawdown = 5;
// // var lineChart;


// function portfolioOptions() {
// 	'use strict';
//     getIndex = document.getElementById('portfolio-type').selectedIndex;
//     getValue = document.getElementsByTagName('option')[getIndex].value;
//     switch (getValue) {
// 	    case 'cash-portfolio':
// 	        type = 'Cash portfolio';
// 	        realRet = 0.2;
//             stDev = 0.6;
// 	        break;
// 	    case 'gilts-portfolio':
// 	        type = 'Gilts portfolio';
// 	        realRet = 0.7;
//             stDev = 5.1;
// 	        break;
// 	    case 'low-investment-risk':
// 	        type = 'Portfolio with very low investment risk';
// 	        realRet = 2.25;
//             stDev = 5.1;
// 	        break;
// 	    case 'moderate-investment-risk':
// 	        type = 'Portfolio with moderate investment risk';
// 	        realRet = 4.2;
//             stDev = 10.0;
// 	        break;
// 	    case 'high-investment-risk':
// 	        type = 'Portfolio with high investment risk';
// 	        realRet = 5.45;
//             stDev = 13.6;
// 	        break;
// 	    case 'uk-equity-portfolio':
// 	        type = 'UK equity portfolio';
// 	        realRet = 6.40;
//             stDev = 14.2;
// 	        break;
// 	    case  'global-equity-portfolio':
// 	        type = 'Global equity portfolio';
// 	        realRet = 4.70;
//             stDev = 15.2;
// 	        break;
// 	    case  'buy-to-let':
// 	        type = 'Buy to let';
// 	        realRet = 1.00;
//             stDev = 0.0;
// 	        break;
// 	}

// 	infl = 0.02;
//  	monthlyRet = Math.pow((1 + realRet - infl), 1/12) - 1;
//  	monthlySd = stDev / Math.sqrt(12);
	
// 	var r = [initialValue, annualDrawdown, monthlyRet, monthlySd];
// 	console.log(r);
// 	return r;
// }



// monteCarlo(portfolioOptions());
