/*  jefvm.v0.js

	--- Javascript easy Forth (jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license

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
    var ntib	= 0	;	// offset of tib processed
    var newname	=''	;	// name of the word under construction
    var newxt	=''	;	// javascript function under construction
    var error	= 0	;	// flag to abort source code interpreting
	var words	=[0];	// collect all words defined
	var wordid	={ };	// wordid[name]=id
	var cr=vm.cr=function(msg){ var t=msg;			// get t=msg to print
		if(t===undefined) t=vm.tob, vm.tob='';		// if no msg, get t=tob and clear tob
		console.log(t);								// print t
	};
	var type=vm.type=function(t){ vm.tob+=t; };		// append t to tob
	function panic(msg){ cr(),cr(msg),error=msg; }	// clear tob, show error msg, and abort
    function nextchar(){	// get a char  from tib
        return ntib<tib.length ? tib.charAt(ntib++) : '';	// get null if ntib>=tib.length
    }
    function nexttoken(){	// get a token from tib
		var  token='', c=nextchar();
        while (c===' '||c==='\t'||c==='\r') c=nextchar();	// skip white-space
        while (c){
			if(c===' '||c==='\t'||c==='\r'||c==='\n')break;	// break if white-space
			token+=c, c=nextchar();							// pick up none-white-space
		}
        return token;
    }
    function findword(name) {		// find word id of given name
		return wordid[name];		// undefined if not found
    }
    function execute(w){            // execute a word
		var s='execute word ';						// for tracing only
		if(typeof w==='object'){
			var x=w.xt, t=typeof x;
			s+=w.id+':\t'+w.name;					// for tracing only
			if(t==="function"){
				cr(s+' primitive');					// for tracing only
				x();				// execute function x directly
            } else {
              panic('error execute:\n'+w.name+'w.xt='+x+' ????');	// x is not a function
            }
		} else {
          panic('error execute:\n'+w+' ????');						// w is not a word
		}
    }
	var cmds=[];									// for tracing only
    function exec(cmd){		// source code interpreting loop
		cmds.push(cmd);								// for tracing only
		cr('source input '+cmds.length+':\t'+cmd);	// for tracing only
		error=0, tib=cmd, ntib=0;
        do{	var token=nexttoken();			// get a token
			if (!token) break;				// break if no more
			var id=findword(token);			// get id if it's a defined word
			if (id) execute(words[id]);		// execute the word
			else {
				panic("? "+token+" undefined"); break; // token undefined
			}
        } while(!error && ntib<tib.length);	// loop back if no error and tib not finished
        return error || "ok";				// return error or ok
	}
	function addword(name,xt){	// 
		var id=words.length, w={name:name,xt:xt,id:id}; words.push(w), wordid[name]=id;
		cr('define  word '+id+':\t'+name+(typeof xt==='function'? ' as primitive' : ''));
	}
	var endCode='end-code';
	function code(){ // code <name> d( -- )	// open low level definition for newname as a word
		var i,t;
		newname=nexttoken();
		t=tib.substr(ntib),i=t.indexOf(endCode),ntib+=i+endCode.length;
		if(i<0){
			panic("missing end-code for low level "+token+" definition");
			return;
		}
		var txt='('+t.substr(0,i)+')';
		var newxt=eval(txt,this);
		addword(newname,newxt);
	}
	addword('code',code);
	vm.words=words		;
	vm.exec	=exec		;
}
// Create vm and ready to test
var vm=new JeForthVM(), tests=0, passed=0;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
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