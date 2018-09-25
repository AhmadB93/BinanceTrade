var aKey = 'D20RACtrATmMoPa9VXCZgZw2ruNfGfx6Mir9HYWYc2qXOcBKtooHk5NvLyBcxoAW';
        var sKey = 'VPrdbV8vTUoLMMHPt5NxLGThVcdbTFG3cGCoH8i66y5qLReBsDL3vgsN4joxhuc9';
        var bUrl= 'https://api.binance.com';
        
        var endPointAccount = '/api/v1/klines';
        ///////////////////////type//////////////////////////
        var open;
        var close;
        var high;
        var low;
        //////////////////////global/////////////////////////
        var limit = 1000;
        var type;
        ///////////////////////SMA///////////////////////////
        var SMAPeriod = 50;
        var SMAoffset = 1;
        ///////////////////////EMA///////////////////////////
        var EMAPeriod = 50;
        var EMASampleSize = 0;
        var EMAoffset = 0;
        var EMAarray = [];
        var EMAx2Array = [];
        var EMAx3Array = [];
        ///////////////////////DEMA//////////////////////////
        var DEMAPeriod = 50;
        var DEMASampleSize = 0;
        var DEMAarray = [];
        ///////////////////////TEMA//////////////////////////
        var TEMAPeriod = 83;
        var TEMASampleSize = 0;
        var TEMAarray = [];
        /////////////////////////////////////////////////////
        var dataStringAccount = 'symbol=BNBUSDT&interval=30m&limit='+limit;
        var counter =0;
        
        var signatureAccount =CryptoJS.HmacSHA256(dataStringAccount,sKey).toString(CryptoJS.enc.Hex);
        var urlAccount = bUrl+endPointAccount+'?'+dataStringAccount;//+'&signature='+signatureAccount;
        
        var requestAccount = new XMLHttpRequest();
        requestAccount.open('GET',urlAccount,true);
        requestAccount.setRequestHeader('X-MBX-APIKEY',aKey);

        requestAccount.onload = function(){
            ourData1 = JSON.parse(requestAccount.responseText);
            //console.log(ourData1[0][0]);
            //console.log(ourData1);
            //////////////////////////////////////////////////////////////////
            open = openF(ourData1);
            console.log("open");
            console.log(open);
            close = closeF(ourData1);
            console.log("close");
            console.log(close);
            high = highF(ourData1);
            console.log("high");
            console.log(high);
            low = lowF(ourData1);
            console.log("low");
            console.log(low);
            type= close;
            console.log("----------------------------------------------------------------------");
            console.log("SMA_"+SMAPeriod+"="+SMA(type,SMAPeriod)+"  from:"+parseFloat(limit-SMAPeriod-SMAoffset)+"->to:"+parseFloat(limit-1-SMAoffset)+" with SMAoffset:"+parseFloat(SMAoffset));
            console.log("----------------------------------------------------------------------");
            EMASampleSize = ourData1.length-EMAPeriod;
            console.log("EMA_"+EMAPeriod+"="+EMA(type,EMASampleSize,EMAPeriod,"EMA")+"  from:"+parseFloat(limit-1-EMAoffset)+"->to:"+parseFloat(limit-EMAPeriod-EMAoffset));
            console.log("----------------------------------------------------------------------");
            console.log("DEMA_"+DEMAPeriod+"="+financial((DiEMA(type,EMASampleSize,DEMAPeriod))));
            console.log(DEMAarray);
            console.log("----------------------------------------------------------------------");
            console.log("TEMA_"+TEMAPeriod+"="+TriEMA(type,TEMASampleSize,TEMAPeriod));
            console.log(TEMAarray);
        }
        requestAccount.send();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                       //////////////
                                                                       /////SMA//////
                                                                       //////////////
        function SMA(data,timePeriods) {
            var names = 0;
            var count = 0;
            for (var i = data.length-1; i > data.length-1-timePeriods; i--) {
                names += parseFloat(data[i]);
                count++;
            }
            names /= timePeriods;
            return names;
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                        //////////////
                                                                        /////EMA//////
                                                                        //////////////
        function SMAforEMA(dataObjArray,timePeriods,type){
            var names = 0;
            if(type=="EMA"){
                start = EMAPeriod;
            }else if(type=="DEMA"){
                start = DEMAPeriod;
            }else if(type=="TEMA"){
                start = TEMAPeriod;
            }
            var end = 0;
            for(var i = start-1; i >= end; i--){
                names += parseFloat(dataObjArray[i]);
            }
            
            names /= timePeriods;
            if(type=="EMA"){
                EMAarray[0]=names;
            }else if(type=="DEMA"){
                EMAx2Array[0]=names;
            }else if(type=="TEMA"){
                EMAx3Array[0]=names;
            }
            
            return names;
        }
        
        function EMA(dataObjArray,sampleSize,timePeriods,type){
            var result = false;
            var alpha = parseFloat(2.0 / (1 + timePeriods));
            if(sampleSize==0){
                result=SMAforEMA(dataObjArray,timePeriods,type);
                return result;
            }else {
                EMAData = EMA(dataObjArray,sampleSize-1,timePeriods,type);
                result = (parseFloat(dataObjArray[sampleSize+timePeriods-1])-EMAData)*alpha + EMAData;
                if(type=="EMA"){
                    EMAarray[sampleSize] = result;
                }else if(type=="DEMA"){
                    EMAx2Array[sampleSize] = result;
                }else if(type=="TEMA"){
                    EMAx3Array[sampleSize] = result;
                }
                return result;
            }
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                          ///////////////
                                                                          /////DEMA//////
                                                                          ///////////////     
        function DiEMA(data,sampleSize,timePeriods) {
            var result = false;
            EMAPeriod=DEMAPeriod;
            EMA(data,sampleSize,timePeriods,"EMA");//1st Function
            DEMASampleSize = EMAarray.length-timePeriods;
            EMA(EMAarray,DEMASampleSize,timePeriods,"DEMA");//2nd Function
            for(var i=0;i<DEMASampleSize;i++){
                DEMAarray[i]=2*EMAarray[i+timePeriods-1]-EMAx2Array[i];
                result=DEMAarray[i];
            }
            return result;
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                            ///////////////
                                                                            /////TEMA//////
                                                                            ///////////////        
        function TriEMA(data,sampleSize,timePeriods) {
            var result = false;
            EMAarray = [];
            EMAx2Array = [];
            EMAPeriod=TEMAPeriod;
            DEMAPeriod=TEMAPeriod;
            TEMASampleSize =ourData1.length-timePeriods;
            EMA(data,TEMASampleSize,timePeriods,"EMA");
            TEMASampleSize1 = EMAarray.length-timePeriods;
            EMA(EMAarray,TEMASampleSize1,timePeriods,"DEMA");//2nd Function
            TEMASampleSize2 = EMAx2Array.length-timePeriods;
            EMA(EMAx2Array,TEMASampleSize2,timePeriods,"TEMA");//3nd Function
            for(var i=0;i < TEMASampleSize2; i++){
                TEMAarray[i]=(3*EMAarray[i+2*timePeriods-2]-3*EMAx2Array[i+timePeriods-1])+EMAx3Array[i];
                result = TEMAarray[i];
            }
            return result;
        }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                            ///////////////
                                                                            /////Types/////
                                                                            ///////////////  
        function openF(array){
            var openPrice = [];
            for(i=array.length-1;i>=0;i--){
                openPrice[i] = array[i][1];
            }
            return openPrice;
        }
        
        function closeF(array){
            var closePrice = [];
            for(i=array.length-1;i>=0;i--){
                closePrice[i] = array[i][4];
            }
            return closePrice;
        }
        
        function highF(array){
            var highPrice = [];
            for(i=array.length-1;i>=0;i--){
                highPrice[i] = array[i][2];
            }
            return highPrice;
        }
        
        function lowF(array){
            var lowPrice = [];
            for(i=array.length-1;i>=0;i--){
                lowPrice[i] = array[i][3];
            }
            return lowPrice;
        }
        
        function financial(x) {
            return Number.parseFloat(x).toFixed(2);
        }