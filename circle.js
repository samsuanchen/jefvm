var V=[0, 0, 0, 0]; 	// 預設 4 個 LED 藍 綠 黃 紅 燈號 狀態值 皆為 0 (熄滅)
function toggle(i){ 	// 改變 當前 i 所對應 LED 燈號 (點亮 turn on 或者 熄滅 turn off)
  var v=V[i]=!V[i]; 	// 改變 當前 i 所對應 LED 燈號 狀態值 v (從 1 變 0 或 從 0 變 1)
  var L;				// 設定 L 為 i 所對應 LED 燈號 變數
  switch(i) { case 0: L=LED4; break; // L 對應 為 下方 藍燈 Blue   LED
              case 1: L=LED2; break; // L 對應 為 左方 綠燈 Green  LED
              case 2: L=LED1; break; // L 對應 為 上方 黃燈 Yellow LED
              case 3: L=LED3; break; // L 對應 為 右方 紅燈 Red    LED
            }
  L.write(v);			// 以 v 設定 當前 i 所對應 LED 燈號
}
var i=0; 				// 預設 i=0
var toggle(i);			// 點亮 turn on 藍燈 Blue LED
function action(i){
	toggle(i	  ); 	// 改變 當前 i 所對應的 燈號狀態
	toggle(i=++i%4); 	// 改變 下個 i 所對應的 燈號狀態
}
var t=setInterval( function(){
	action(i);
}, 1000);				// 每秒 輪流 藍 綠 黃 紅 閃其中一個 LED