var headPos = 1;
var i = 0;
curHeadName = "head1"
var curHead;
var headMemory = "";
var defaultCellCount = 25;
const BLANK = "_";
var stringLoaded = false;
var runStatus = "Not Running";
var output;
var cellHolder;
const runningMsg = "Running";
var hasSetStatus = false;

const delayTime = 1.5;

const MARKED = "rgba(166, 218, 211, 0.5)";



function loadCells(){

    var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    cellHolder = document.getElementById("cellHolder");
    //defaultCellCount = pageWidth / 90;

    let i = 0;

    for(i = 0; i < defaultCellCount; i++){
        cellHolder.innerHTML += "<p class='tapeCell' id='cell" + i.toString() + "'>_</p>";

    }
    
    //document.getElementById("head1").style.left = (document.getElementById("cell0").getBoundingClientRect().left + 12) + "px";
    //document.getElementById("head1").style.top = (document.getElementById("cell0").getBoundingClientRect().top - 40) + "px";

    output = document.getElementById("outputBox");
}

async function runTM(){

    hasSetStatus = false;

    curHead = document.getElementById(curHeadName);
    curHead.style.left = window.getComputedStyle(curHead).getPropertyValue("left");

    output.value = "";

    if(getStatus() == "Running"){
        return;
    }

    setStatus(runningMsg);

    let code = document.getElementById("codeBox").value;

    let lines = code.split("\n");

    for(i = 0; i < lines.length; i++){

        lines[i] = lines[i].trim();
        let subLines = lines[i].split(" ");

        for(var q = 0; q < subLines.length; q++){
            subLines[q] = subLines[q].trim();
        }

        var toContinue = await runSingleCommand(lines, subLines);

        if(!toContinue){
            setStatus("Crashed");
            break;
        }

    }

    if(!hasSetStatus){
        setStatus("Halted without Accepting or Rejecting")
    }

    stringLoaded = false;

}

async function runSingleCommand(lines, subLines){

    console.log(subLines);

    if(subLines[0] == "load"){
        if(!stringLoaded){
            loadString(subLines[1]);
            stringLoaded = true;
        }
    }
    else if(subLines[0].slice(-1) == ":"){
        //nothing is done for these, they are for goto's
    }
    else if(subLines[0] == "goto"){

        i = 0;

        while(lines[i] != subLines[1] + ":"){
            i++;
        }

        i--;
    }
    else if(subLines[0] == "move"){

        var prevHeadPos = headPos;

        try{

            if(subLines.length == 2){
                if(subLines[1] == "right"){

                    headPos += 1;
                    moveHead(curHead, currentCell());
                }
                else if(subLines[1] == "left"){

                    headPos -= 1;
                    moveHead(curHead, currentCell());
                }

            }
            else if(subLines.length == 3){

                var toAdd = parseInt(subLines[2]);

                if(isNaN(toAdd)){
                    output.value += "Expected Number, got: " + subLines[2] + "\n";
                    return false;
                }
                if(subLines[1] == "right"){

                    headPos += toAdd;
                    moveHead(curHead, currentCell());
                }
                else if(subLines[1] == "left"){

                    headPos -= toAdd;
                    moveHead(curHead, currentCell());
                }
                else{

                    output.value += "Expected 'left' or 'right', got: " + subLines[1] + "\n";
                }
            }
            else{
                let dir = 0;
                if(subLines[1] == "right"){
                    dir = 1;
                }
                else if(subLines[1] == "left"){
                    dir = -1;
                }

                if(currentCell().innerHTML == BLANK){
                    if((headPos && dir > 0) || (!headPos && dir < 1) ||(!dir)){
                        return true;
                    }

                }

                headPos += dir;
                moveHead(curHead, currentCell());

                let endPoints = [subLines[3], BLANK];
                while(!endPoints.includes(currentCell().innerHTML)){
                    
                    headPos += dir;
                    moveHead(curHead, currentCell());
                }

            }

            output.value += "Moved From Cell " + prevHeadPos.toString() + " To " + headPosStr() + "\n";
        }

        catch(error){

            output.value += "head crashed\n";
            return false;

        }
    }
    else if(subLines[0] == "blackout"){
        
        if(isBlack()){
            output.value += "Cell " + headPosStr() + " is already blacked out";
            return;
        }
        currentCell().style.backgroundColor = "black";
        currentCell().innerHTML = "**";

    }
    else if(subLines[0] == "write"){

        if(subLines.length == 1){
            output.value += "Expected value after 'write'\n";
            return false;
        }
        else if(subLines.length > 2){
            output.value += "No values expected after " + subLines[1] + "\n";
            return false;
        }

        if(!isBlack()){
            if(subLines[1].length > 1){
                output.value += subLines[1][0] + " is more than one character\n";
                return false;
            }
            currentCell().innerHTML = subLines[1][0];
            output.value += subLines[1][0] + " written to cell " + headPosStr() + "\n";
            return true;
        }
        else{
            output.value += "Cannot write to a blacked out cell\n";
            return false;
        }

        
    }
    else if(subLines[0] == "mark"){

        if(isBlack()){
            output.value += "Cannot mark a blacked out cell\n";
            return false;
        }
        currentCell().style.backgroundColor = MARKED;
        output.value += "Marked Cell " + headPosStr() + "\n";
        return true;
    }
    else if(subLines[0] == "unmark"){
        if(isBlack()){
            output.value += "Cannot unmark a blacked out cell\n";
            return false;
        }
        currentCell().style.backgroundColor = "white";
        output.value += "Unmarked Cell " + headPosStr() + "\n";
        return true;
    }
    else if(subLines[0] == "record"){
        if(isBlack()){
            output.value += "Cannot record a blacked out cell\n";
            return false;
        }
        document.getElementById(curHead + "mem").innerHTML = "Head Memory: " + currentCell().innerHTML;
        headMemory = currentCell().innerHTML;
        output.value += "Recorded " + headMemory + " to the head\n";
        return true;

    }
    else if(subLines[0] == "accept"){
        setStatus("Halted and Accepted");
        return false;
    }
    else if(subLines[0] == "reject"){
        setStatus("Halted and Rejected");
        return false;
    }
    else if(subLines[0] == "if"){

        if(subLines[1] == "match"){
            if(currentCell().innerHTML == document.getElementById(curHead + "mem").innerHTML.slice(13)){  

                return await runSingleCommand(lines,subLines.slice(2));
            }
            else{
                if(subLines.indexOf("else") > -1){

                    return await runSingleCommand(lines, subLines.slice(subLines.indexOf("else") + 1));
                }
            }
        }
        else if(subLines[1] == "mismatch"){
            if(currentCell().innerHTML != document.getElementById(curHead + "mem").innerHTML.slice(13) + 1){  

                return await runSingleCommand(lines, subLines.slice(2));
            }
            else{
                if(subLines.indexOf("else") > -1){

                    return await runSingleCommand(lines, subLines.slice(subLines.indexOf("else") + 1));
                }
            }
        }
        else if(subLines[1] == "blank"){
            if(currentCell().innerHTML == "_"){
                return await runSingleCommand(lines, subLines.slice(2));
            }
            else{
                if(subLines.indexOf("else") > -1){

                    return await runSingleCommand(lines, subLines.slice(subLines.indexOf("else") + 1));
                }
            }
        }
        else{
            if(currentCell().innerHTML == subLines[1]){
                return await runSingleCommand(lines, subLines.slice(2));
            }
            else{
                if(subLines.indexOf("else") > -1){

                    return await runSingleCommand(lines, subLines.slice(subLines.indexOf("else") + 1));
                }
            }
        }
    }

    await delay(delayTime);

    return true;
 
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

function currentCell(){

    return document.getElementById("cell" + headPosStr());
}

function loadString(string){
    
    for(var i = 0; i < string.length; i++){
        document.getElementById("cell" + (i + 1).toString()).innerHTML = string[i];
    }
}

function moveHead(head, cell){

    
    head.style.left = (cell.getBoundingClientRect().left) + "px";
    
    /*
    var parent = cellHolder;
    var child =  curHead; // Select the 4th child element
    var childTop = child.offsetTop;
    parent.scrollTo({
        top: childTop, 
        behavior: 'smooth'
    });
    */
}

function setStatus(newStatus){
    document.getElementById("status").innerHTML = "Status: " + newStatus;
    runStatus = newStatus;

    if(newStatus != runningMsg){
        hasSetStatus = true;
    }
}

function getStatus(){

    return runStatus;
}

// Ensuring the onPageLoad function runs when the document is fully loaded
document.addEventListener("DOMContentLoaded", loadCells);


function printCurrentTime() {
    const now = new Date();
    const seconds = Math.round(now.getSeconds() + now.getMilliseconds() / 1000);
    const formattedTime = `${now.getHours()}:${now.getMinutes()}:${seconds < 10 ? '0' : ''}${seconds}`;
    console.log(formattedTime);
}


function isBlack(head = 0){
    return (currentCell().style.backgroundColor == "black");
}

function isMarked(head = 0){
    return (currentCell.style.background == MARKED);
}

function headPosStr(head = 0){

    return headPos.toString();
}