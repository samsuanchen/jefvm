// jefvm.v0_test.js
function equal(value,expected){
	tests++;
	if(value===expected) passed++;
	else
		console.log('test'+tests,'value:'+value,'not equal to expected:'+expected);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
vm.exec('code r1 function(){ LED3.write(1); } end-code r1');
equal(vm.words[2].xt.toString(),"function () { LED3.write(1); }");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
vm.exec('code g1 function(){ LED2.write(1); } end-code g1');
vm.exec('code y1 function(){ LED1.write(1); } end-code y1');
vm.exec('code b1 function(){ LED4.write(1); } end-code b1');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
vm.exec('code r0 function(){ LED3.write(0); } end-code r0');
equal(vm.words[6].xt.toString(),"function () { LED3.write(0); }");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
vm.exec('code g0 function(){ LED2.write(0); } end-code g0');
vm.exec('code y0 function(){ LED1.write(0); } end-code y0');
vm.exec('code b0 function(){ LED4.write(0); } end-code b0');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log('total tests', tests, 'passed', passed);