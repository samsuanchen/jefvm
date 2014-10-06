/*  jefvm.v2.js

	--- Javascript easy Forth (jef or jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license
	2014/10/06	add ms as version 3 by samsuanchen@gmail.com
	2014/10/06	add ?dup 0= 1- 
				if...then, if...else...then,
				for...next, for aft...then next,
				begin...again, begin..until, begin...while...repeat by samsuanchen@gmail.com
	2014/09/26	add ip, data area, and return stack as version 2 by samsuanchen@gmail.com
	2014/09/25	add data stack and number conversion as version 1 by samsuanchen@gmail.com
	2014/09/22	simplifiy to have only code as version 0 by samsuanchen@gmail.com
    2014/09/04  New Version For Espruino Hardware by yapcheahshen@gmail.com
    2012/02/17	add example and modify kernel to be more friendly for education.
    2011/12/23  initial version by yapcheahshen@gmail.com
                equiv to http://tutor.ksana.tw/ksanavm lesson1~8
    TODO: complete eForth core word set
          interface to HTML5 canvas
          port C.H.Ting flag demo for kids
    this is merely a kick off, everyone is welcome to enhance it. */

function JeForthVM() {
	var vm		=this;
	vm.tob		=''	;	// initial terminal output buffer
    var tib		=''	;	// initial terminal  input buffer (source code)
    var nTib	= 0	;	// offset of tib processed
    var error	= 0	;	// flag to abort source code interpreting
	var words	=[0];	// collect all words defined
	var nameWord={ };	// nameWord[name]=word
	vm.rTimes	= 0 ;	// resume times													//	v3
	vm.waiting	= 0 ;	// flag of   waiting mode										//	v3
	vm.compiling= 0 ;	// flag of compiling mode										//	v2
	var ip		= 0 ;	// instruction pointer to run high level colon definition		//	v2
	var cArea	=[0];	// code area to hold high level colon definition				//	v2
	var rStack	=[ ];	// return stack to return from high level colon definition		//	v2
	var dStack	=[ ];	// data stack													//	v1
		vm.base	=10 ;	// number conversion base										//	v1
	var clear=vm.clear=function(){ // clear data stack									//	v1
		dStack=vm.dStack=[];															//	v1
	};																					//	v1
	var cr=vm.cr=function(msg){ var t=msg;			// get t=msg to print
		if(t===undefined) t=vm.tob, vm.tob='';		// if no msg, get t=tob and clear tob
		console.log(t);								// print t
	};
	var type=vm.type=function(msg){	// send msg to terminal output buffer
		var t=msg||dStack.pop();					// pop from data stack if no msg
		if(typeof t==='number' && n%1===0 && vm.base!==10) t=t.toString(vm.base);		//	v1
		vm.tob+=t;									// append t to terminal output buffer
    };
	function panic(msg){ cr(),cr(msg),error=msg,vm.compiling=0; }	// clear tob, show error msg, and abort
    function nextChar(){	// get a char  from tib
        return nTib<tib.length ? tib.charAt(nTib++) : '';	// get null if nTib>=tib.length
    }
    function nextToken(){	// get a token from tib
		var  token='', c=nextChar();
        while (c===' '||c==='\t'||c==='\r') c=nextChar();	// skip white-space
        while (c){
			if(c===' '||c==='\t'||c==='\r'||c==='\n')break;	// break if white-space
			token+=c, c=nextChar();							// pick up none-white-space
		}
        return token;
    }
    function compile(v) {	// compile v to code area									//	v2
		var c= v===undefined ? vm.cArea[vm.ip++] : v;									//	v2
		console.log('compile '+JSON.stringify(c));			// for tracing only			//	v2
		vm.cArea.push(c);																//	v2
    }																					//	v2
    function compileCode(name,v) {	// compile named word to code area					//	v2
		var n= name===undefined ? nextToken() : name;									//	v2
		var w=vm.nameWord[n];															//	v2
		compile(w);																		//	v2
		if(v!==undefined)vm.compile(v);                                                 //	v2
    }																					//	v2
    function call(addr) {	// inner loop interpreting compiled code at addr of cArea	//	v2
	//	console.log(vm.ip+' --> rStack '+vm.rStack.length+': '+vm.rStack.join());		//	v2
		vm.rStack.push(vm.ip), vm.ip=addr;												//	v2
		while(vm.ip){																	//	v2
			w=vm.cArea[vm.ip];															//	v2
		//	console.log(vm.ip+': '+w.name,vm.dStack);									//	v2
			vm.ip++;																	//	v2
			execute(w);																	//	v2
		}																				//	v2
    }																					//	v2
    function exit() {	// return from colon definition									//	v2
		vm.ip=vm.rStack.pop();// pop ip from return stack								//	v2
	//	console.log(vm.ip+' <-- rStack '+vm.rStack.length+': '+vm.rStack.join());		//	v2
    }																					//	v2
    function execute(w){            // execute or compile a word
		var immediate=w.immediate, compiling=immediate?0:vm.compiling;					//	v2
	//	var s=(compiling?'compile':'execute')+' word ';	// for tracing only				//	v2
		if(typeof w==='object'){
			if(compiling){																//	v2
			//	console.log('compile '+w.name); 		// for tracing only             //	v2
				compile(w);																//	v2
			} else {																	//	v2
				var x=w.xt, t=typeof x;
			//	s+=w.id+':\t'+w.name;					// for tracing only
				if(t==="function"){
				//	cr(s+' primitive');					// for tracing only
					x();				// execute function x directly
				} else if(t==="number"){												//	v2
				//	cr(s+' colon at '+x);				// for tracing only				//	v2
					call(x);			// execute colon definition at x				//	v2
				} else {
					panic('error execute:\t'+w.name+' w.xt='+x+' ????');// xt undefined
				}
			}																			//	v2
		} else {
          panic('error execute:\t'+w+' ????');						// w is not a word
		}
    }
    function data(tkn){																	//	v1
		var c=tkn.charAt(0), n, t;														//	v1
		if(c==='"'){																	//	v1
			t=tib.substr(0,nTib-1);														//	v1
			var L=Math.max(t.lastIndexOf(' '),t.lastIndexOf('\t'))+1;	// current "	//	v1
			t=tib.substr(L+1);											// rest tib		//	v1
			var i=t.indexOf(c);											// next    "	//	v1
			var p=t.charAt(i-1);										// prev char	//	v1
			n=t.charAt(i+1);											// next char	//	v1
			if(i>=0 && p!=='\\' && (n===' '||n==='\t'||n==='\r'||n==='\n'||n==='')){	//	v1
				nTib=L+i+2, t=tib.substr(L+1,i);										//	v1
				return t;				// "abc" return string abc ( alow space	)		//	v1
			}																			//	v1
		}																				//	v1
		if(c==="'" && c===tkn.charAt(tkn.length-1)){									//	v1
			return tkn.substr(1,tkn.length-2);		// 'abc' return string abc no space //	v1
		}																				//	v1
		n = c==='$'		? parseInt(tkn.substr(1),16)// hexa number ///////////////////////	v1
          :	vm.base!==10	? parseInt(tkn,vm.base)	// special base number ///////////////	v1
          : parseFloat(tkn);						// normal number /////////////////////	v1
		if(isNaN(n)) return;						// return undefined					//	v1
		return n;									// return number					//	v1
    }																					//	v1
	var cmds=[],T=0;								// for tracing only                 //	v1
    function resumeExec(){		// outer source code interpreting loop					//	v3
        vm.waiting=0;                                                                   //  v3
        console.log('resume times',++vm.rTimes);	// for tracing only                 //	v3
        do{	var token=nextToken();			// get a token
			if (!token) break;				// break if no more
			var w=nameWord[token];			// get word if token is already defined
			if (w) execute(w);				// execute or compile the word
			else {
				var n=data(token);														//	v1
				if(n===undefined){														//	v1
					panic("? "+token+" undefined"); break; // token undefined
				}																		//	v1
				if(vm.compiling){														//	v2
				//	console.log('compile doLit '+n);
					compileCode('doLit',n);												//	v2
                }else																	//	v2
					dStack.push(n);														//	v1
			}
		//	console.log('dStack ===> '+dStack.length+':\t['+dStack.join()+']');			//	v1
        } while(!vm.waiting && !error && nTib<tib.length);								//	v3
    }
    function exec(cmd){		// source code interpreting
		cmds.push(cmd);								// for tracing only
		cr('source input '+cmds.length+':\t'+cmd);	// for tracing only
		error=0, tib=cmd, nTib=0;
		resumeExec();																	//	v3
        return error || "ok";				// return error or ok
	}
	function addWord(name,xt){	// 
		var id=words.length, w={name:name,xt:xt,id:id}; words.push(w), nameWord[name]=w;
		cr('define  word '+id+':\t'+name+(typeof xt==='function'? ' as primitive' : ''));
	}
	var endCode='end-code';
	function code(){ // code <name> d( -- )	// low level definition as a new word
		var i,t;
		vm.newName=nextToken();
		t=tib.substr(nTib),i=t.indexOf(endCode),nTib+=i+endCode.length;
		if(i<0){
			panic("missing end-code for low level "+token+" definition");
			return;
		}
		var txt='('+t.substr(0,i)+')';
		var newXt=eval(txt);//eval(txt);
		addWord(vm.newName,newXt);
	}
	addWord('code',code);
	function doLit(){ // doLit ( -- n ) //												//	v2
		vm.dStack.push(vm.cArea[vm.ip++]);												//	v2
	}																					//	v2
	addWord('doLit',doLit);																//	v2
	addWord('exit' ,exit );																//	v2
	vm.panic=panic        ;																//	v2
	vm.nextToken=nextToken;																//	v2
	vm.compileCode=compileCode;															//	v2
	vm.compile=compile    ;																//	v2
	vm.nameWord=nameWord  ;																//	v2
	vm.ip=ip              ;																//	v2
	vm.cArea=cArea        ;																//	v2
	vm.rStack=rStack      ;																//	v2
	vm.dStack=dStack      ;																//	v1
	vm.resumeExec=resumeExec;                                                           //  v3
	vm.exec	=exec         ;
	vm.words=words        ;
	vm.addWord=addWord    ;
}
var vm=new JeForthVM(), tests=0, passed=0;
//  vm is now creaded and ready to test.
//////////////////////////////////////////////////////////////////////////////////////// tools
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
//////////////////////////////////////////////////////////////////////////////////////// tools
vm.seeColon=function seeColon(addr){
  var ip=addr,prevName='',codeLimit=0;
  do {
    var w=vm.cArea[ip++];
    var s=ip+': ', n=typeof w==='object'?w.name:'';
    if(n){ var x=w.xt, t=typeof x;
      s+=n+(t==='function'?' primitive':t==='number'?(' colon at '+x):'');
    } else {
      if((prevName==='branch' || prevName==='zBranch')){
        if(w>0)
          codeLimit=Math.max(codeLimit,ip+w);
        s+='(to '+(ip+w)+') ';
      }
      s+=w;
    }
    console.log(s);
    prevName=n;
  } while((codeLimit && ip<codeLimit) || n!=='exit');
};
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
vm.seeArray=function seeArray(arr){
	var old=vm.cArea; addr=old.length;
	vm.cArea=vm.cArea.concat(arr);
	vm.seeColon(addr);
	vm.cArea=old;
};
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
//////////////////////////////////////////////////////////////////////////////////////////// v0
vm.exec(
'code r1		function(){									\n'+
'  LED3.write(1);											\n'+
'} end-code');
vm.exec(
'code r0		function(){									\n'+
'  LED3.write(0);											\n'+
'} end-code');
vm.exec(
'code g1		function(){									\n'+
'  LED2.write(1);											\n'+
'} end-code');
vm.exec(
'code y1		function(){									\n'+
'  LED1.write(1);											\n'+
'} end-code');
vm.exec(
'code b1		function(){									\n'+
'  LED4.write(1);											\n'+
'} end-code');
vm.exec(
'code g0		function(){									\n'+
'  LED2.write(0);											\n'+
'} end-code');
vm.exec(
'code y0		function(){									\n'+
'  LED1.write(0);											\n'+
'} end-code');
vm.exec(
'code b0		function(){									\n'+
'  LED4.write(0);											\n'+
'} end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.addWord('type',vm.type);
vm.addWord('cr',vm.cr);
vm.exec(
'code .			function(){									\n'+
'  vm.type(), vm.type(" ");									\n'+
'} end-code');
vm.exec(
'code +			function(){									\n'+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);	\n'+
'} end-code');
vm.exec(
'code -			function(){									\n'+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);	\n'+
'} end-code');
vm.exec(
'code *			function(){									\n'+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);	\n'+
'} end-code');
vm.exec(
'code /			function(){									\n'+
'  var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);	\n'+
'} end-code');
vm.exec(
'code hex		function(){									\n'+
'  vm.base=16;												\n'+
'} end-code');
vm.exec(
'code decimal	function(){									\n'+
'  vm.base=10;												\n'+
'} end-code');
vm.exec(
'code binary	function(){									\n'+
'  vm.base= 2;												\n'+
'} end-code');
vm.exec(
'code .r		function(){									\n'+
'  var m=vm.dStack.pop(), n=""+vm.dStack.pop();				\n'+
'  vm.type("         ".substr(0,m-n.length)+n);				\n'+
'} end-code');
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.exec(
'code :			function(){									\n'+
'  vm.newName=vm.nextToken(),								\n'+
'  vm.newXt=vm.cArea.length,vm.compiling=1;					\n'+
'} end-code');
vm.exec(
'code immediate function(){									\n'+
'  vm.words[vm.words.length-1].immediate=1;					\n'+
'} end-code');
vm.exec(
'code ;			function(){									\n'+
'  vm.compileCode("exit"),vm.compiling=0;					\n'+
'  vm.addWord(vm.newName,vm.newXt);							\n'+
'} end-code immediate');
vm.exec(
'code r@		function(){									\n'+
'  vm.dStack.push(vm.rStack[vm.rStack.length-1]);			\n'+
'} end-code');
vm.exec(
'code >r		function(){									\n'+
'  vm.rStack.push(vm.dStack.pop());							\n'+
'} end-code');
vm.exec(
'code for		function(){									\n'+
'  vm.compileCode(">r");									\n'+
'  vm.dStack.push({name:"for",at:vm.cArea.length});			\n'+
'} end-code immediate');
vm.exec(
'code doNext	function(){									\n'+
'  i=vm.rStack.pop();										\n'+
'  if(i)vm.rStack.push(i-1),vm.ip+=vm.cArea[vm.ip];			\n'+
'  else vm.ip++;											\n'+
'} end-code');
vm.exec(
'code next		function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o;						\n'+
'  if(t!=="object" || o.name!=="for"){						\n'+
'		vm.panic("there is no for to match next");return;	\n'+
'  }														\n'+
'  var i=o.at;												\n'+
'  vm.compileCode("doNext",i-vm.cArea.length-1);			\n'+
'} end-code immediate');
vm.exec(
'code drop		function(){									\n'+
'  vm.dStack.pop();											\n'+
'} end-code');
vm.exec(
'code dup		function(){									\n'+
'  vm.dStack.push(vm.dStack[vm.dStack.length-1]);			\n'+
'} end-code');
vm.exec(
'code over		function(){									\n'+
'  vm.dStack.push(vm.dStack[vm.dStack.length-2]);			\n'+
'} end-code');
vm.exec(
'code emit		function(){									\n'+
'  vm.type(String.fromCharCode(vm.dStack.pop()));			\n'+
'} end-code');
vm.exec(
'code branch	function(){									\n'+
'  vm.ip+=vm.cArea[vm.ip];									\n'+
'}end-code');
vm.exec(
'code zBranch	function(){									\n'+
'  if(vm.dStack.pop())vm.ip++;								\n'+
'  else vm.ip+=vm.cArea[vm.ip];								\n'+
'} end-code');
vm.exec(
'code if		function(){									\n'+
'  vm.compileCode("zBranch",0);								\n'+
'  vm.dStack.push({name:"if",at:vm.cArea.length-1});		\n'+
'} end-code immediate');
vm.exec(
'code else		function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o;						\n'+
'  if(t!=="object" || o.name!="if"){						\n'+
'		vm.panic("there is no if to match else");return;	\n'+
'  }														\n'+
'  var i=o.at; vm.compileCode("branch",0);					\n'+
'  vm.dStack.push({name:"else",at:vm.cArea.length-1});		\n'+
'  vm.cArea[i]=vm.cArea.length-i;							\n'+
'} end-code immediate');
vm.exec(
'code then		function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o, n=o.name;				\n'+
'  if(t!=="object" || (n!="if" && n!="else" && n!="aft")){	\n'+
'		vm.panic("no if, else, aft to match then");return;	\n'+
'  }														\n'+
'  var i=o.at; vm.cArea[i]=vm.cArea.length-i;				\n'+
'} end-code immediate');
vm.exec(
'code aft		function(){									\n'+
'  var s=vm.dStack,o=s[s.length-1],t=typeof o;				\n'+
'  if(t!=="object" || o.name!=="for"){						\n'+
'		vm.panic("no for to match aft");return;				\n'+
'  }														\n'+
'  var i=o.at;												\n'+
'  vm.compileCode("zBranch",0);								\n'+
'  vm.dStack.push({name:"aft",at:vm.cArea.length-1});		\n'+
'} end-code immediate');
vm.exec(
'code ?dup      function(){									\n'+
'  var s=vm.dStack, d=s[s.length-1]; if(d)s.push(d);		\n'+
'}end-code');
vm.exec(
'code 1-		function(){									\n'+
'  vm.dStack[vm.dStack.length-1]--;							\n'+
'}end-code');
vm.exec(
'code 0=        function(){									\n'+
'  var s=vm.dStack,m=s.length-1; s[m]=!s[m];				\n'+
'}end-code');
vm.exec(
'code begin     function(){									\n'+
'  vm.dStack.push({name:"begin",at:vm.cArea.length-1});		\n'+
'} end-code	immediate');
vm.exec(
'code again		function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o;						\n'+
'  if(t!=="object" || o.name!=="begin"){					\n'+
'		vm.panic("no begin to match again");return;			\n'+
'  }														\n'+
'  var i=o.at; vm.compileCode( "branch", i-vm.cArea.length);\n'+
'} end-code immediate');
vm.exec(
'code until		function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o;						\n'+
'  if(t!=="object" || o.name!=="begin"){					\n'+
'		vm.panic("no begin to match until");return;			\n'+
'  }														\n'+
'  var i=o.at; vm.compileCode("zBranch", i-vm.cArea.length);\n'+
'} end-code immediate');
vm.exec(
'code while     function(){									\n'+
'  var s=vm.dStack,o=s[s.length-1],t=typeof o;				\n'+
'  if(t!=="object" || o.name!=="begin"){					\n'+
'		vm.panic("no begin to match while");return;	\n'+
'  }														\n'+
'  var i=o.at; vm.compileCode("zBranch",0);					\n'+
'  vm.dStack.push({name:"while",at:vm.cArea.length-1});		\n'+
'} end-code immediate');
vm.exec(
'code repeat	function(){									\n'+
'  var o=vm.dStack.pop(),t=typeof o;						\n'+
'  if(t!=="object" || o.name!=="while"){					\n'+
'		vm.panic("no while to match repeat");return;		\n'+
'  }														\n'+
'  var i=o.at; o=vm.dStack.pop(),t=typeof o;				\n'+
'  if(t!=="object" || o.name!=="begin"){					\n'+
'		vm.panic("no begin to match repeat");return;		\n'+
'  }														\n'+
'  vm.compileCode("branch",o.at-vm.cArea.length);			\n'+
'  vm.cArea[i]=vm.cArea.length-i;							\n'+
'} end-code immediate');
//////////////////////////////////////////////////////////////////////////////////////////// v3
vm.exec(
'code ms		function(n){								\n'+
'  var m= n===undefined ? vm.dStack.pop() : n; vm.waiting=1;\n'+
'  vm.timestamp=setTimeout(vm.resumeExec,m);				\n'+
'} end-code');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////