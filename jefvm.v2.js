/*  jefvm.v2.js

	--- Javascript easy Forth (jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license

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
		vm.tob	=''	;	// initial terminal output buffer
    var tib		=''	;	// initial terminal  input buffer (source code)
    var nTib	= 0	;	// offset of tib processed
    var error	= 0	;	// flag to abort source code interpreting
	var words	=[0];	// collect all words defined
	var nameWord={ };	// nameWord[name]=word
		vm.compiling=0;	// flag of compiling mode										//	v2
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
	function panic(msg){ cr(),cr(msg),error=msg; }	// clear tob, show error msg, and abort
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
		vm.cArea.push(c);																//	v2
    }																					//	v2
    function compileCode(name,v) {	// compile named word to code area					//	v2
		var n= name===undefined ? nextToken() : name;									//	v2
		var w=vm.nameWord[n];															//	v2
		compile(w);																		//	v2
		if(v!==undefined) compile(v);													//	v2
    }																					//	v2
    function call(addr) {	// inner compiled code interpreting loop					//	v2
	//	console.log(vm.ip+' --> rStack '+vm.rStack.length+': '+vm.rStack.join());		//	v2
		vm.rStack.push(vm.ip), vm.ip=addr;												//	v2
		while(vm.ip){																	//	v2
			w=vm.cArea[vm.ip];															//	v2
		//	console.log(vm.ip+': '+w.name);												//	v2
			vm.ip++;																	//	v2
			execute(w);																	//	v2
		}																				//	v2
    }																					//	v2
    function exit() {	// return from colon definition									//	v2
		vm.ip=vm.rStack.pop();// pop ip from return stack								//	v2
	//	console.log(vm.ip+' <-- rStack '+vm.rStack.length+': '+vm.rStack.join());
    }																					//	v2
    function execute(w){            // execute or compile a word
		var immediate=w.immediate, compiling=immediate?0:vm.compiling;					//	v2
		var s=(compiling?'compile':'execute')+' word ';	// for tracing only				//	v2
		if(typeof w==='object'){
			if(compiling){																//	v2
				console.log('compile '+w.name);
				compile(w);																//	v2
			} else {																	//	v2
				var x=w.xt, t=typeof x;
				s+=w.id+':\t'+w.name;					// for tracing only
				if(t==="function"){
					cr(s+' primitive');					// for tracing only
					x();				// execute function x directly
				} else if(t==="number"){												//	v2
					cr(s+' colon at '+x);				// for tracing only				//	v2
					call(x);			// execute colon definition at x				//	v2
				} else {
					panic('error execute:\t'+w.name+' w.xt='+x+' ????');// x is not a function
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
				return t;				// "abc" return string abc /// alow space		//	v1
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
	var cmds=[];									// for tracing only					//	v1
    function exec(cmd){		// outer source code interpreting loop
		cmds.push(cmd);								// for tracing only
		cr('source input '+cmds.length+':\t'+cmd);	// for tracing only
		error=0, tib=cmd, nTib=0;
        do{	var token=nextToken();			// get a token
			if (!token) break;				// break if no more
			var w=nameWord[token];			// get word if token is a defined
			if (w) execute(w);				// execute or compile the word
			else {
				var n=data(token);														//	v1
				if(n===undefined){														//	v1
					panic("? "+token+" undefined"); break; // token undefined
				}																		//	v1
				if(vm.compiling){														//	v2
					console.log('compile doLit '+n);
					compileCode('doLit',n);												//	v2
                }else																	//	v2
					dStack.push(n);														//	v1
			}
			console.log('dStack ===> '+dStack.length+':\t['+dStack.join()+']');			//	v1
        } while(!error && nTib<tib.length);	// loop back if no error and tib not finished
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
	vm.nextToken=nextToken;																//	v2
	vm.compileCode=compileCode;															//	v2
	vm.compile=compile    ;																//	v2
	vm.nameWord=nameWord  ;																//	v2
	vm.ip=ip              ;																//	v2
	vm.cArea=cArea        ;																//	v2
	vm.rStack=rStack      ;																//	v2
	vm.dStack=dStack      ;																//	v1
	vm.exec	=exec         ;
	vm.words=words        ;
	vm.addWord=addWord    ;
}
var vm=new JeForthVM(), tests=0, passed=0;
//  vm is now creaded and ready to test.