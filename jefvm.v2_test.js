// jefvm.v2_test.js
///////////////////////////////////////////////////////////////////////////////////////////////
function equal(tag,value,expected){ // asure value is exactly equal to expected
	tests++;
	if(value===expected){ passed++; console.log(tag,'ok'); }
	else
		console.log('???',tag,'value:'+value,'not equal to expected:'+expected);
}
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r1 function(){ LED3.write(1); } end-code r1');
equal('test 1',vm.words[5].xt.toString(),"function () { LED3.write(1); }");
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code g1 function(){ LED2.write(1); } end-code g1');
vm.exec('code y1 function(){ LED1.write(1); } end-code y1');
vm.exec('code b1 function(){ LED4.write(1); } end-code b1');
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r0 function(){ LED3.write(0); } end-code r0');
equal('test 2',vm.words[9].xt.toString(),"function () { LED3.write(0); }");
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code g0 function(){ LED2.write(0); } end-code g0');
vm.exec('code y0 function(){ LED1.write(0); } end-code y0');
vm.exec('code b0 function(){ LED4.write(0); } end-code b0');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('123 4.56 -10 $41');
equal('test 3',vm.dStack.join(' '),"123 4.56 -10 65"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc" "def 123"');
equal('test 4',vm.dStack.join(' '),"abc def 123"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec("'ghi'");
equal('test 5',vm.dStack.join(' '),"ghi"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.addWord('type',vm.type);
vm.addWord('cr',vm.cr);
vm.exec('code + function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);}end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code . function(){vm.type(), vm.type(" ");} end-code 5 type 2 . 5 .');
equal('test 6',vm.tob,"52 5 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec(
'code + function(){'										+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);'+
'} end-code '												+
'code - function(){'										+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);'+
'} end-code '												+
'code * function(){'										+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);'+
'} end-code '												+
'code / function(){'										+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);'+
'} end-code');
vm.exec('"abc def" '+"'ghi' + . 2.23 0.23 - 3 * 2 / .");
equal('test 7',vm.tob,"abc defghi 3 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code hex     function(){vm.base=16;} end-code');
vm.exec('code decimal function(){vm.base=10;} end-code');
vm.exec('code binary  function(){vm.base= 2;} end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('128 hex .');
equal('test 8',vm.tob,"80 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('100 decimal .');
equal('test 9',vm.tob,"256 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('11 binary . decimal');
equal('test 10',vm.tob,"1011 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec(
'code .r function(){var m=vm.dStack.pop(), n=""+vm.dStack.pop();'+
'  vm.type("         ".substr(0,m-n.length)+n);} end-code');
vm.exec('5 3 .r 10 3 .r 15 3 .r');
equal('test 11',vm.tob,"  5 10 15"),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.cArea=[ 0,vm.nameWord['doLit'],3,vm.nameWord['.r'],vm.nameWord['exit'] ],vm.addWord('t',1);
setTimeout(function(){ // need 1000 ms delay
	vm.exec('5 t 10 t 15 t');
	equal('test 12',vm.tob,"  5 10 15"),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(
		'code : function colon(){'						+
		'  vm.newName=vm.nextToken(),'					+
		'  vm.newXt=vm.cArea.length,vm.compiling=1;'	+
		'} end-code '									+
		'code immediate function immediate(){'			+
		'  vm.words[vm.words.length-1].immediate=1;'	+
		'} end-code '									+
		'code ; function semicolon(){'					+
		'  vm.compileCode("exit"),vm.compiling=0;'		+
		'  vm.addWord(vm.newName,vm.newXt);'			+
		'} end-code immediate '
    );
	vm.exec(': x 3 .r ; 5 x 10 x 15 x');
	equal('test 13',vm.tob,"  5 10 15"),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	console.log('total tests', tests, 'passed', passed);
},1000);
///////////////////////////////////////////////////////////////////////////////////////////////
