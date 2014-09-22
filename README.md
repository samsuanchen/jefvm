jefvm
=====

javascript easy forth (jeforth) virtual machine (vm) implementation (tutorial)

version 0
---------

For example, in [espruino web ide](https://www.google.com.tw/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCEQFjAA&url=https%3AFFchrome.google.comFwebstoreFdetailFespruino-web-ideFbleoifhkdalbjfbobjackfdifdneehpo&ei=3ngfVIa7Mc3q8AX884CIAQ&usg=AFQjCNHyNk_XkpLYJ6DNByefI7znAP5lgg&sig2=XZR5mUsyb8sJv3U7rR9YkQ "%3"), once **jefvm.v0.js** is loaded into the cpu of [STM32F4 Discovery board](http://www.st.com/web/catalog/tools/FM116/SC959/SS1532/PF252419?sc=internet/evalboard/product/252419.jsp ""), we can use javascript (even [in line assembly](http://www.espruino.com/Assembler#line=145 "")) to define new jeforth words to execute.

1. we can define  jeforth word r1 to turn on  red led on discovery board as follows.

    ```
    vm.exec('code r1 function(){ LED3.write(1); } end-code');
    ```

2. we can execute jeforth word r1 to turn on  red led on discovery board as follows.

    ```
    vm.exec('r1');
    ```

03. In the same way, we can define other forth word g1, b1, y1 to turn on green, blue, yellow leds.

    ```
    vm.exec('code g1 function(){LED2.write(1);}end-code');
    vm.exec('code b1 function(){LED4.write(1);}end-code');
    vm.exec('code y1 function(){LED1.write(1);}end-code');
    ```
    
04. In the same way, for other words r0, g0, b0, y0 to turn off red, green, blue, yellow leds.

    ```
    vm.exec('code r0 function(){LED3.write(0);}end-code');
    vm.exec('code g0 function(){LED2.write(0);}end-code');
    vm.exec('code b0 function(){LED4.write(0);}end-code');
    vm.exec('code y0 function(){LED1.write(0);}end-code');
    ```