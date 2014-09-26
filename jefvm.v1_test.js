// jefvm.v1_test.js
///////////////////////////////////////////////////////////////////////////////////////////////
function equal(tag,value,expected){ // asure value is exactly equal to expected
	tests++;
	if(value===expected){ passed++; console.log(tag,'ok'); }
	else
		console.log('???',tag,'value:'+value,'not equal to expected:'+expected);
}
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r1 function(){ LED3.write(1); } end-code r1');
equal('test 1',vm.words[2].xt.toString(),"function () { LED3.write(1); }");
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code g1 function(){ LED2.write(1); } end-code g1');
vm.exec('code y1 function(){ LED1.write(1); } end-code y1');
vm.exec('code b1 function(){ LED4.write(1); } end-code b1');
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r0 function(){ LED3.write(0); } end-code r0');
equal('test 2',vm.words[6].xt.toString(),"function () { LED3.write(0); }");
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code g0 function(){ LED2.write(0); } end-code g0');
vm.exec('code y0 function(){ LED1.write(0); } end-code y0');
vm.exec('code b0 function(){ LED4.write(0); } end-code b0');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('123 4.56 -10 $41');
equal('test 3',vm.dstack.join(' '),"123 4.56 -10 65"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc" "def 123"');
equal('test 4',vm.dstack.join(' '),"abc def 123"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec("'ghi'");
equal('test 5',vm.dstack.join(' '),"ghi"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.addword('type',vm.type);
vm.addword('cr',vm.cr);
vm.exec('code + function(){var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()+b);}end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code . function(){vm.type(), vm.type(" ");} end-code 5 type 2 . 5 .');
equal('test 6',vm.tob,"52 5 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code - function(){var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()-b);}end-code');
vm.exec('code * function(){var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()*b);}end-code');
vm.exec('code / function(){var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()/b);}end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc def" '+"'ghi' + . 1.23 0.23 - .");
equal('test 7',vm.tob,"abc defghi 1 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code hex function(){vm.base=16;} end-code 128 hex .');
equal('test 8',vm.tob,"80 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code decimal function(){vm.base=10;} end-code 100 decimal .');
equal('test 9',vm.tob,"256 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code binary function(){vm.base=2;} end-code 11 binary .');
equal('test 10',vm.tob,"1011 "),vm.cr();
///////////////////////////////////////////////////////////////////////////////////////////////
console.log('total tests', tests, 'passed', passed);