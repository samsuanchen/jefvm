#jefvm

**jefvm** is a **jef** (javascript easy forth or jeforth) **vm** (virtual machine) implemented under [espruino web ide](https://chrome.google.com/webstore/search/Espruino") for [STM32F4 Discovery board](http://www.st.com/web/catalog/tools/FM116/SC959/SS1532/PF252419?sc=internet/evalboard/product/252419.jsp ""). We could use javascript (even [in line assembly](http://www.espruino.com/Assembler#line=145 "")) to define jef words, the instructions, to execute.

---------
##version 0

Once **jefvm.v0.js** is loaded via [espruino web ide](https://www.google.com.tw/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCEQFjAA&url=https%3AFFchrome.google.comFwebstoreFdetailFespruino-web-ideFbleoifhkdalbjfbobjackfdifdneehpo&ei=3ngfVIa7Mc3q8AX884CIAQ&usg=AFQjCNHyNk_XkpLYJ6DNByefI7znAP5lgg&sig2=XZR5mUsyb8sJv3U7rR9YkQ "%3"), we have **vm**, an instance of jefvm. **vm.words** is implemented as a collecting list of all jef words. Each jef word is an object having atributes at leaset **name**, **id**, and **xt**. **name** is a string including any kind of characters except space. **id** is a positive integer which is actually the index of **vm.words**. **xt** is the javascript function to be executed. Initially, this list had only the jef word **code** as **vm.words[1]**. Then we could call its function **vm.exec** to interpret a string executing **code** to define many more jef words in javascript (even [in line assembly](http://www.espruino.com/Assembler#line=145 "")) to execute.

1. For example, we could **define** a jef word **r1** to turn on red led on discovery board as follows (**test 1**).
    ```
    vm.exec('code r1 function(){ LED3.write(1); } end-code');
    ```

2. we could then **execute** the jef word **r1** to turn on red led on discovery board as follows.
    ```
    vm.exec('r1');
    ```

3. In the same way, we could define other jef words g1, b1, y1 to turn on green, blue, yellow leds.
    ```
    vm.exec('code g1 function(){LED2.write(1);}end-code');
    vm.exec('code b1 function(){LED4.write(1);}end-code');
    vm.exec('code y1 function(){LED1.write(1);}end-code');
    ```
    
4. In the same way, **r0** cound be defined (**test 2**) to turn off red led. And other jef words g0, b0, y0 could be defined, to turn off green, blue, yellow leds as follows.
    ```
    vm.exec('code r0 function(){LED3.write(0);}end-code');
    vm.exec('code g0 function(){LED2.write(0);}end-code');
    vm.exec('code b0 function(){LED4.write(0);}end-code');
    vm.exec('code y0 function(){LED1.write(0);}end-code');
    ```

---------
##version 1

**jefvm.v1** implemented **vm.dstack** as data stack passing numbers and strings to be processed among words. **vm.clear()** could be used to clear vm.dstack. Many jef words could be defined to compute, to convert, and to print the data. Also, jefvm.v1 implemented **vm.tob**, the terminal output buffer, to print data. While printing, **vm.type()** is used to pop the top of vm.dstack and append it to vm.tob. Latter, **vm.cr()** is used to print vm.tob and clear vm.tob. As well, jefvm.v1 implemented **vm.base** for number conversion.

1. For example, we could put **numbers**, such as 123, 4.56, -10, and hexadecimal 41, on data stack as follows (**test 3**).
    ```
    vm.exec('123 4.56 -10 $41');
    ```

2. we could put **strings** using **double quotes**, such as "abc" and "def 123", on data stack as follows (**test 4**).
    ```
    vm.exec('"abc" "def 123"');
    ```

3. another way to put a **string** using **single quotes** (but without space) on data stack, such as 'ghi' (**test 5**).
    ```
    vm.exec("'ghi'");
    ```

4. We could take **vm.type** as a new jef word **type** to pop string or number (automatically converted to string) and append it to vm.tob, the terminal output buffer. In the same way, we could take **vm.cr** as a new jef word **cr** to print out vm.tob and clear vm.tob.
    ```
    vm.addword('type',vm.type);
    vm.addword('cr'  ,vm.cr  );
    ```

5. We could define a new jef word **.** (**dot**) to type top of data stack and one more space as follows.
    ```
    vm.exec('code . function(){vm.type(), vm.type(" ");} end-code');
    ```

6. Then, we could test the jef words **type** and **.** (**dot**) sending the string '52 5 ' to vm.tob as follows (**test 6**).
    ```
    vm.exec('5 type 2 . 5 .');
    ```

7. We could define **arithmatic operations** +, -, *, and / as jef words. Each of them pops two items (numbers or strings) from data stack and push back the computational result to data stack.
    ```
    vm.exec(
    'code + function(){'+
    '  var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()+b);'+
    '} end-code '+
    'code - function(){'+
    '  var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()-b);'+
    '} end-code '+
    'code * function(){'+
    '  var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()*b);'+
    '} end-code '+
    'code / function(){'+
    '  var b=vm.dstack.pop();vm.dstack.push(vm.dstack.pop()/b);'+
    '} end-code');
    ```

8. We could test the **arithmatic operations** as follows to get 'abc defghi 3' as vm.tob (**test 7**).
    ```
    vm.exec('"abc def" '+"'ghi' + . 2.23 0.23 - 3 * 2 / .");
    ```
   
9. We could define **hex**, **decimal**, **binary** as jef words to change **vm.base**, the number convertion base, so that hexadecimal or bainary numbers could be entered or printed easily.
    ```
    vm.exec('code hex     function(){vm.base=16;} end-code');
    vm.exec('code decimal function(){vm.base=10;} end-code');
    vm.exec('code binary  function(){vm.base= 2;} end-code');
    ```
   
10. We could test conversion of decimal 128 to get hexadecimal string '80' (**test 8**).
    ```
    vm.exec('128 hex .');
    ```

11. We could test conversion of hexadecimal 100 to get decimal string '256' (**test 9**).
    ```
    vm.exec('100 decimal .');
    ```

12. We could test conversion of decimal 11 to get binary string '1011' (**test 10**).
    ```
    vm.exec('11 binary .');
    ```

13. We could define a new jef word **.r** (called 'dot r') to pop m and n from data stack and print n **right aligned** in a field of m characters wide.
    ```
    vm.exec(
    'code .r function(){'							+
    '  var w=vm.dStack.pop(), n=""+vm.dStack.pop();'+
    '  vm.type("         ".substr(0,w-n.length)+n)'	+
    '} end-code');
    ```

14. We could try **.r** as follows to get '  5 10 15' as vm.tob (**test 11**).
    ```
    vm.exec('5 3 .r 10 3 .r 15 3 .r');
    ```

---------
##version 2

**jefvm.v2** implemented **vm.cArea** as code area, a list to hold all the compiled codes of high level colon definitions, in which all jef words are called just by names. Also it implemented **vm.ip** and **vm.rStack** as instrction pointer and return stack for inner interpreting to execute the compiled codes of jef words in high level colon definitions. **vm.call(addr)** is used to call the compiled codes at **addr** in vm.cArea (previous vm.ip will be pushed onto return stack first, then vm.ip will be set to addr).

1. For example, **compiled codes** doing '3 .r' could be set at 1 in **vm.cArea** as follows, where **vm.nameWord['doLit']** is used to get the jef word of **doLit**, which will push its following 3 onto data stack at run time, **vm.nameWord['.r']**  is used to get the jef word of **.r**, **vm.nameWord['exit']** is used to get the jef word of **exit** which will finish high level calling and pop back previous vm.ip from return stack.

    ```
    vm.cArea=[ 0,vm.nameWord['doLit'],3,vm.nameWord['.r'],vm.nameWord['exit'] ];
    ```
 and defined as high level word t as follows.

    ```
    vm.addWord('t',1);
    ```
2. We could then try **t** (**test 12**) as follows to get the same result as previous test.
    ```
    vm.exec('5 t 10 t 15 t');
    ```

3. Actually, we could defined **:** (colon) and **;** (semicolon) to define high level definition in which any existig word could be called just by name. In the following, the word **immediate** is defined as well. It is used to declare the word **;** (semicolon) as an immediate word so that it will not be compiled but compile **exit** and close the high level definition of **x** as follows.
    ```
    vm.exec(
	    'code : function colon(){						' +
	    '  vm.newName=vm.nextToken(),					' +
	    '  vm.newXt=vm.cArea.length,vm.compiling=1;    	' +
	    '} end-code    									' +
	    'code immediate function immediate(){			' +
	    '  vm.words[vm.words.length-1].immediate=1;		' +
	    '} end-code    									' +
	    'code ; function semicolon(){					' +
	    '  vm.compileCode("exit"),vm.compiling=0,		' +
	    '  vm.addWord(vm.newName,vm.newXt);    			' +
	    '} end-code immediate                           '
    );
    vm.exec(': x 3 .r ;');
    ```

4. The compiled code of **x** is exactly the same as **t**. So we could try **x** (**test 13**) as follows to get the same result as previous test.
    ```
    vm.exec('5 x 10 x 15 x');
    ```



