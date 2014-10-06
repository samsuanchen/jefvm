// jefvm.v2_test.js
///////////////////////////////////////////////////////////////////////////////////////////////
function equal(tag,value,expected){ // asure value is exactly equal to expected
	tests++;
	if(value===expected){ passed++; console.log(tag,'ok'); }
	else{
		var tv=typeof value, te=typeof expected;
		console.log('???',tag,'value:'+value,'not equal to expected:'+expected);
		if(tv==='string')
		console.log('val len '+value.length+': '+value.split('').map(function(c){
				return c.charCodeAt(0).toString(16);
		}).join(' '));
		if(te==='string')
		console.log('exp len '+expected.length+': '+expected.split('').map(function(c){
				return c.charCodeAt(0).toString(16);
		}).join(' '));
	}
}

//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r1 function(){ LED3.write(1); } end-code r1');
equal('test 1',vm.words[4].xt.toString(),"function () { LED3.write(1); }");
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code g1 function(){ LED2.write(1); } end-code g1');
vm.exec('code y1 function(){ LED1.write(1); } end-code y1');
vm.exec('code b1 function(){ LED4.write(1); } end-code b1');
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec('code r0 function(){ LED3.write(0); } end-code r0');
equal('test 2',vm.words[8].xt.toString(),"function () { LED3.write(0); }");
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
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc def" '+"'ghi' + . 2.23 0.23 - 3 * 2 / .");
equal('test 7',vm.tob,"abc defghi 3 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('code hex     function(){vm.base=16;} end-code');
vm.exec('code decimal function(){vm.base=10;} end-code');
vm.exec('code binary  function(){vm.base= 2;} end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('128 hex . decimal');
equal('test 8',vm.tob,"80 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('hex 100 decimal .');
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
vm.showWords=function(){
	var nw=vm.words.length;
	var primitives=[], colons=[];
	vm.words.forEach(function(w,i){
		if(w){	var type=typeof w.xt, name=i+' '+w.name;
			if(type==='function') primitives.push(name);
			else if(type==='number') colons.push(name);
		}
	});
	var np=primitives.length, nc=colons.length, ni=nw-np-nc;
	vm.cr(nw+' words ('+
		np+' primitives '+
		nc+' colons '+
		ni+' ignores');
	vm.type('primitives:');
	primitives.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr();
		vm.type(' '+w);
	});
	if(vm.tob)vm.cr();
	vm.type('colons:');
	colons.forEach(function(w){
		if(vm.tob.length+w.length+1>80)vm.cr();
		vm.type(' '+w);
	});
	if(vm.tob)vm.cr();
};
vm.addWord('words',vm.showWords);
vm.seeColon=function seeColon(addr){
  var ip=addr,prevName='',codeLimit=0;
  do {
    var w=vm.cArea[ip++];
    var t=ip+': ', n=typeof w==='object'?w.name:'';
    if(n){
      t+=n+(typeof w.xt==='function'?' primitive':'');
    } else {
      if((prevName==='branch' || prevName==='zBranch')){
        if(w>0)
          codeLimit=Math.max(codeLimit,ip+w);
        t+='(to '+(ip+w)+') ';
      }
      t+=w;
    }
    console.log(t);
    prevName=n;
  } while((codeLimit && ip<codeLimit) || n!=='exit');
};
vm.addWord('seeColon',vm.seeColon);
vm.seeWord=function seeWord(w){
	var o= typeof o==='string'?vm.nameWord[w]:w;
	if(typeof o==='object'){
      var n=o.name, x=o.xt, t=typeof x, i=o.immediate?'immediate':'';
		if(t==='function'){
			console.log(n+' primitive '+i),console.log(x);
		} else if(t==='number' && x%1===0){
			console.log(n+' colon '+i),vm.seeColon(x);
		}else{
			console.log(n+' xt='+x+' ?????');
		}
	}else{
		console.log(w+' ?????');
	}
};
vm.addWord('seeWord',vm.seeWord);
vm.seeArray=function seeArray(arr){
	var old=vm.cArea; addr=old.length;
	vm.cArea=vm.cArea.concat(arr);
	vm.seeColon(addr);
	vm.cArea=old;
};
vm.addWord('seeArray',vm.seeArray);
vm.see=function see(x){
	var t=typeof x;
	if(t==='number' && x%1===0){
		vm.seeColon(x);
	} else if(t==='object'){
		vm.seeWord(x);
	} else if(t==='string'){
		vm.seeWord(vm.nameWord[x]);
	} else {
		console.log(x+' ?????');
	}
};
vm.addWord('see',vm.see);
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
	vm.exec('code r@		function(){ vm.dStack.push(vm.rStack[vm.rStack.length-1]);} end-code');
	vm.exec('code >r		function(){ vm.rStack.push(vm.dStack.pop()); } end-code ');
	vm.exec('code for		function(){ vm.compileCode(">r"),vm.dStack.push({name:"for",at:vm.cArea.length}); } end-code immediate ');
	vm.exec('code doNext	function(){ i=vm.rStack.pop();if(i)vm.rStack.push(i-1),vm.ip+=vm.cArea[vm.ip]; else vm.ip++; } end-code ');
	vm.exec('code next		function(){ var o=vm.dStack.pop(),t=typeof o; if(t!=="object" || o.name!=="for")vm.panic("there is no for to match next"); var i=o.at; vm.compileCode("doNext",i-vm.cArea.length-1); } end-code immediate ');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': z 9 for r@ . next ; z');
	equal('test 14',vm.tob,'9 8 7 6 5 4 3 2 1 0 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code drop		function(){ vm.dStack.pop(); } end-code');
	vm.exec('code dup		function(){ vm.dStack.push(vm.dStack[vm.dStack.length-1]);} end-code');
	vm.exec('code over		function(){ vm.dStack.push(vm.dStack[vm.dStack.length-2]);} end-code');
	vm.exec('code emit		function(){ vm.type(String.fromCharCode(vm.dStack.pop()));} end-code');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': t1 8 for dup 9 r@ - * 3 .r next drop ; 3 t1');
	equal('test 15',vm.tob,'  3  6  9 12 15 18 21 24 27'),vm.cr();
	vm.exec(': t2 8 for 9 r@ - t1 $d emit $a emit next ; t2 cr');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code branch function(){vm.ip+=vm.cArea[vm.ip];}end-code');
	vm.exec('code zBranch function(){if(vm.dStack.pop())vm.ip++;else vm.ip+=vm.cArea[vm.ip];} end-code');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	var addr=vm.cArea.length;
	var compiled=[
		vm.nameWord['zBranch'],5,
		vm.nameWord['doLit'],1,
		vm.nameWord['branch'],3,
		vm.nameWord['doLit'],0,
		vm.nameWord['exit']
	];
	vm.cArea=vm.cArea.concat(compiled);
	vm.addWord('t16',addr);
	vm.exec('0 t16 . 5 t16 .');
	equal('test 16',vm.tob,'0 1 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code if   function(){vm.compileCode("zBranch",0),vm.dStack.push({name:"if",at:vm.cArea.length-1});}end-code immediate');
	vm.exec('code else function(){var o=vm.dStack.pop(),t=typeof o; if(t!=="object" || o.name!=="if")vm.panic("there is no if to match else"); var i=o.at; vm.compileCode("branch",0),vm.dStack.push({name:"else",at:vm.cArea.length-1}),vm.cArea[i]=vm.cArea.length-i;}end-code immediate');
	vm.exec('code then function(){var o=vm.dStack.pop(),t=typeof o; if(t!=="object" || (o.name!=="if" && o.name!=="else" && o.name!=="aft"))vm.panic("there is no if, else, or aft to match then"); var i=o.at; vm.cArea[i]=vm.cArea.length-i;}end-code immediate');
	vm.exec('code aft  function(){var s=vm.dStack,o=s[s.length-1],t=typeof o; if(t!=="object" || o.name!=="for")vm.panic("there is no for to match aft"); var i=o.at; vm.compileCode("zBranch",0),vm.dStack.push({name:"aft",at:vm.cArea.length-1});}end-code immediate');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	addr=vm.cArea.length;
	vm.exec(': t17 if 1 else 0 then ;');
	equal('test 17',JSON.stringify(vm.cArea.slice(addr)),JSON.stringify(compiled));
	vm.exec(' 0 t17 . 5 t17 .');
	equal('test 18',vm.tob,'0 1 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code ?dup   function(){var s=vm.dStack, d=s[s.length-1]; if(d)s.push(d);}end-code');
	vm.exec('code 1-     function(){vm.dStack[vm.dStack.length-1]--;}end-code');
	vm.exec('code 0=     function(){var s=vm.dStack,m=s.length-1; s[m]=!s[m];}end-code');
	vm.exec('code begin  function(){vm.dStack.push({name:"begin",at:vm.cArea.length-1});}end-code immediate');
	vm.exec('code again  function(){var o=vm.dStack.pop(),t=typeof o; if(t!=="object" || o.name!=="begin")vm.panic("there is begin to match again"); var i=o.at; vm.compileCode( "branch", i-vm.cArea.length);}end-code immediate');
	vm.exec(': t19 begin dup . 1- ?dup 0= if exit then again ;');
	vm.exec(' 9 t19');
	equal('test 19',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code until  function(){var o=vm.dStack.pop(),t=typeof o; if(t!=="object" || o.name!=="begin")vm.panic("there is no begin to match until"); var i=o.at; vm.compileCode("zBranch", i-vm.cArea.length);}end-code immediate');
	vm.exec(': t20 begin dup . 1- ?dup 0= until ; 9 t20');
	equal('test 20',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
	console.log('total tests', tests, 'passed', passed);
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec('code while  function(){var s=vm.dStack,o=s[s.length-1],t=typeof o; if(t!=="object" || o.name!=="begin")vm.panic("there is no begin to match while"); var i=o.at; vm.compileCode("zBranch",0),vm.dStack.push({name:"while",at:vm.cArea.length-1});}end-code immediate');
	vm.exec(
	'code repeat function(){                                                           \n'+
	'	var o=vm.dStack.pop(),t=typeof o;                                              \n'+
	'	if(t!=="object" || o.name!=="while")                                           \n'+
	'		vm.panic("there is no while to match repeat");                             \n'+
	'	var i=o.at; o=vm.dStack.pop(),t=typeof o;                                      \n'+
	'	if(t!=="object" || o.name!=="begin")                                           \n'+
	'		vm.panic("there is no begin to match repeat");                             \n'+
	'	vm.compileCode("branch",o.at-vm.cArea.length), vm.cArea[i]=vm.cArea.length-i;\n'+
	'} end-code immediate                                                              ');
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': t21 begin ?dup while dup . 1- repeat ;');
	vm.exec('9 t21');
	equal('test 21',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	console.log('total tests', tests, 'passed', passed);
},1000);
///////////////////////////////////////////////////////////////////////////////////////////////