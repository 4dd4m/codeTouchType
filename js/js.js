class Cursor{
    constructor(){
        this.cursor = true;
        this.blink();
    }

    blink(){
        setInterval(function(){
            if(this.cursor){
                $('.cursor').css('background', '#ccc');
                //$('.cursor').css('border', '1px solid gray');
                this.cursor = false;
            }else{
                $('.cursor').css('background', 'none');
                //$('.cursor').css('border', 'none');
                this.cursor = true;
            }
        },500);
    }
}

let cursor = new Cursor();



class Type{
    constructor(){
        this.cursorPosition = 0;          //stores the current cursor position
        this.prevCurosrPosition = -1;
        this.errorArray = [];               //stores the errors position
        this.excercise = this.preExcercise();   //preCompile the text
        this.displayText = this.initializeText(); //create span tags, replace a couple of things
        this.convertedExcercise = this.transerExcerciseToKeyCodes(this.excercise);
        //ignore arrows, tab, caps lock, altgr, etc
        this.IgnoredKeys = [8,9,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46];
        this.spantags;                      //list of spantags (typeable characters)
        this.updateErrorCounter();          //updates the errorcounter
    }

    updateErrorCounter(){//updates the errorcounter below the text
        $('#errorcount').text(this.errorArray.length);
    }

    preExcercise(){//handles the raw String, coverts endlines etc.
        var text = "";
        $.ajax({                //ajax query to load the text
            type : "GET",
            url : "r.html",
            async : false,
            dataType : "text",
            converters : {"text html" : true},
            success: function (data){
                text =  data;
            }});
        //console.log(text);
        //var reg = /\s{1}$/;
        //text = text.replace(reg,"");
        return text;
    }


    moveRight(keycode){ //if the letter is valid and we can move to the right
        var p = this.cursorPosition;            //get cursor posish
        var charformtext = this.convertedExcercise[p];  //get the valid keycode
        console.log(`Curosr posish: ${p}. Needed Char ${charformtext}`);
        if(charformtext == keycode && p <= this.excercise.length){
            //if the key is what we want and we have more text left
            this.prevCurosrPosition = p-1;
            this.spantags[p].className = "okay";
            this.spantags[p+1].className = "cursor";
            this.spantags[p+1].style="background: #ccc;";
            this.cursorPosition += 1;
            console.log("Cursor:" + this.excercise[p]
                + " ["+this.excercise[p+1]+"]" + this.excercise[p+2]);
        }else{
            //still text left but user mispelled
            //store the location of the error
            this.errorArray.push(this.cursorPosition);
            //make the next character a cursor class
            this.spantags[p + 1].className = "cursor";
            //mark this is an error
            this.spantags[p].className = "error";
            //keep this position as prevCursorPosish
            this.prevCurosrPosition = p;
            //step the cursor posish over
            this.cursorPosition += 1;
        }
    }

    transerExcerciseToKeyCodes(text){
        //this sends the text through a dictionary
        //build a [] of them and return
        var encodedArray = [];

        for(var i=0;i < text.length ;i++){
            if(text[i] == "\\" && text[i+1]  == "n"){ // \n char
                encodedArray.push(13);
                i = i + 2;
                continue;
            }
            else if(text[i] == "\\" && text[i+1]  == "t"){ // \t char
                i = i + 1;
                continue;
            }else{ //if not above, we are good
                encodedArray.push(this.transferCharToSendCode(text[i]));
            }
        }
        console.log(encodedArray);
        return encodedArray;
    }

    transferCharToSendCode(char){
        //this is the dictionary for the acceptable keycodes
        //takes a char and sends back the correspondig keyCode
        let dictionary ={
            'a':'65','A':'965','.':'190','1':'49',
            'b':'66','B':'966',',':'188','2':'50',
            'c':'67','C':'967','/':'191','3':'51',
            'd':'68','D':'968',';':'59', '4':'52',
            'e':'69','E':'969',"'":'222','5':'53',
            'f':'70','F':'970','#':'163','6':'54',
            'g':'71','G':'971','[':'219','7':'55',
            'h':'72','H':'972',']':'221','8':'56',
            'i':'73','I':'973','{':'9219','9':'57',
            'j':'74','J':'974','}':'9221','0':'58',
            'k':'75','K':'975','-':'173','↵':'13',
            'l':'76','L':'976','=':'61','\n':'13',
            'm':'77','M':'977','+':'961','"':'950',
            'n':'78','N':'978','_':'9173',
            'o':'79','O':'979','!':'949',
            'p':'80','P':'980','£':'951',
            'q':'81','Q':'981','$':'952',
            'r':'82','R':'982','%':'953',
            's':'83','S':'983','^':'954',
            't':'84','T':'984','&':'955',
            'u':'85','U':'985','*':'956',
            'v':'86','V':'986','(':'957',
            'w':'87','W':'987',')':'958',
            'x':'88','X':'988','<':'9188',
            'z':'90','Z':'990','>':'9190',
            ' ':'32','y':'89','Y':'989',"\\":'220'}
        var codedChar =parseInt(dictionary[char]);

        if(Number.isInteger(codedChar) == false){
            console.log("Could convert this char: '" + char + "'");
        }

        return codedChar;
    }


    initializeText(){
        //This make the text ready for diaplay (make span of chars), add tabs
        //and new line chars
        var log = ""; //just to store the log in case we need it
        var htmlText = ""; //final var of text
        var encodedKeys = [];
        for(var i=0;i < this.excercise.length;i++){
            if(this.excercise[i] == "\\" && this.excercise[i+1]  == "t"){ // \t
                //insert the tab as a <div>
                htmlText += "<div class=\"tab\"></div>";
                log += "tab inserted\n";
                i = i + 1; //skip the letter 't'
                continue;
            }
            else if(this.excercise[i] == "\\" && this.excercise[i+1]  == "n"){ // \n
                //insert the newline character
                htmlText += "<span id="+ i + " class=\"\">↵</span>";
                log += "new line  inserted\n";
                i = i + 1; //skip the letter 'n'
                encodedKeys.push(13);
                continue;
            }
            else if(this.cursorPosition == i){ //just add .cursor class
                htmlText += "<span id="+ i + " class=\"cursor\">" + this.excercise[i] + "</span>";
                log += "tag addedwith cursor\n";
                log += "new line added";
                encodedKeys.push(this.transferCharToSendCode(this.excercise[i]));
                continue;
            }
            else if(this.excercise[i] == "\n"){ //adds a <br> to any \n
                htmlText += "</br>";
                log += "br added ";
                continue;
            }else{
                htmlText += "<span id="+ i + " class=\"\">" + this.excercise[i] + "</span>";
                encodedKeys.push(this.transferCharToSendCode(this.excercise[i]));
                continue;
            }
        }
        $('#code').html(htmlText); //update the tag on the page
        this.spantags = $('span'); //update the taglist
        //console.log(log);
        encodedKeys.push(13);
        //this.convertedExcercise = encodedKeys; just a thought
        return htmlText;
    }
}
app = new Type();

$('html').keydown(function(event){ //if the user pressed any key
    var log = "";
    if(app.IgnoredKeys.indexOf(event.keyCode) != -1){
        //this will be ignored by the ignoredKeys
        log += "---------------------";
        log += "Char Does no count: " + event.keyCode;
        log += "---------------------";
    }else{
        if(event.shiftKey){ //valid letter with shift
            log += "Shift Sent char: " + 9 + event.keyCode;
            app.moveRight("9" + event.keyCode);
        }else{//normal letter without a shift
            app.moveRight(event.keyCode);
            log += "Sent char: " + event.keyCode;
        }
        app.updateErrorCounter();
    }
    console.log(log);
});
document.documentElement.addEventListener('keydown', function (e) {
    //prevent the space to scroll down
    if ( ( e.keycode || e.which ) == 32) {
        e.preventDefault();
    }
}, false);
