/*  jefvm.v0.js

	--- Javascript easy Forth (jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license

	2014/09/23	and data stack and related operations as version 1 samsuanchen@gmail.com
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
		vm.tob	= '' ;	// initial terminal output buffer
    var tib		= '' ;	// initial terminal  input buffer (source code)
    var ntib	=  0 ;	// offset of tib processed
    var newname	= '' ;	// name of the word under construction
    var newxt	= '' ;	// javascript function under construction
    var error	=  0 ;	// flag to abort source code interpreting
	var words	=[ 0];	// collect all words defined
	var wordid	={  };	// wordid[name]=id
	var dstack	=[  ];	// data stack
	var darea	=[10];	// data area for variable values
	var base	=  0 ;	// id of the cell in data area to keep number converion base 
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
              panic('error execute:\n'+w.name+'w.xt='+x+' ????');	// w.xt is not a function
            }
		} else {
          panic('error execute:\n'+w+' ????');						// w is not a word
		}
    }
    function data(tkn){
		var c=tkn.charAt(0);
		if(c==='"'){
			var L=tib.substr(0,ntib).lastIndexof(c);	// location of current "
			var t=tib.substr(L+1);						// rest tib
			var i=t.indexOf(c);							// location of next    "
			var p=t.charAt(i-1);						// previous char
			var n=t.charAt(i+1);						// next     char
			if(i>=0 && p!=='\\' && (n===' '||n==='\t'||n==='\r'||n==='\n'||n==='')){
				ntib=L+i+2;
				return tib.substr(L+1,i);				// "abc" return string abc ////////////// alow space
			}
		} else if(c==="'" && c===tkn.charAt(tkn.length-1)){
			return tkn.substr(1,tkn.length-2);			// 'abc' return string abc ////////////// no space
		}
		var n = c==='$'		? parseInt(tkn.substr(1),16)// hexa number //////////////////////////
			  :	base!==10	? parseInt(tkn,base)		// special base number //////////////////
			  : parseFloat(tkn);						// normal number ////////////////////////
		if(isNaN(n)) return;							// return undefined
    	return n;										// return number
    }
	var cmds=[];									// for tracing only
    function exec(cmd){		// source code interpreting loop
		cmds.push(cmd);								// for tracing only
		cr('source input '+cmds.length+':\t'+cmd);	// for tracing only
		error=0, tib=cmd, ntib=0;
        do{	var tkn=nexttoken();			// get a token
			if (!tkn) break;				// break if no more
			var id=findword(tkn);			// get id if it's a defined word
			if (id) execute(words[id]);		// execute the word
			else { var d=data(tkn);
				if(d===undefined){
					panic('? '+token+' undefined'); break;
				}
				cr('dstack  push '+n);				// for tracing only
				dstack.push(n);
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
