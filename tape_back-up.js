var headPos = 0;
var i = 0;
var curHead = "head1"
var defaultCellCount = 19;
const BLANK = "_";
var stringLoaded = false;
var runStatus = "Not Running";


function loadCells(){

    var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    defaultCellCount = pageWidth / 90;

    let i = 0;

    for(i = 0; i < defaultCellCount; i++){
        document.getElementById("cellHolder").innerHTML += "<p class='tapeCell' id='cell" + i.toString() + "'>_</p>";
    }

    document.getElementById("head1").style.left = (document.getElementById("cell0").getBoundingClientRect().left + 12) + "px";
    document.getElementById("head1").style.top = (document.getElementById("cell0").getBoundingClientRect().top - 40) + "px";



}

async function runTM(){

    if(getStatus() == "Running"){
        return;
    }

    setStatus("Running");

    let code = document.getElementById("codeBox").value;

    let lines = code.split("\n");

    for(i = 0; i < lines.length; i++){

        let subLines = lines[i].split(" ");

        if(subLines[0] == "load"){
            if(!stringLoaded){
                loadString(subLines[1]);
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

            if(subLines.length == 2){
                if(subLines[1] == "right"){

                    headPos += 1;
                    moveHead(document.getElementById(curHead), currentCell());
                }
                else if(subLines[1] == "left"){
    
                    headPos -= 1;
                    moveHead(document.getElementById(curHead), currentCell());
                }

            }
            else if(subLines.length == 3){
                if(subLines[1] == "right"){

                    headPos += parseInt(subLines[2]);
                    moveHead(document.getElementById(curHead), currentCell());
                }
                else if(subLines[1] == "left"){
    
                    headPos -= parseInt(subLines[2]);
                    moveHead(document.getElementById(curHead), currentCell());
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
                        continue;
                    }

                }

                headPos += dir;
                moveHead(document.getElementById(curHead), currentCell());

                let endPoints = [subLines[3], BLANK];
                while(!endPoints.includes(currentCell().innerHTML)){
                    
                    headPos += dir;
                    moveHead(document.getElementById(curHead), currentCell());
                }

            }
        }
        else if(subLines[0] == "blackout"){
            
            currentCell().style.backgroundColor = "black";
            currentCell().innerHTML = "**";
        }
        else if(subLines[0] == "write"){

            if(currentCell().style.backgroundColor = "black"){
                currentCell().style.backgroundColor = "white";
            }

            currentCell().innerHTML = subLines[1][0];
        }
        else if(subLines[0] == "mark"){
            currentCell().style.backgroundColor = "rgba(166, 218, 211, 0.5)";
        }
        else if(subLines[0] == "unmark"){
            currentCell().style.backgroundColor = "white";
        }
        else if(subLines[0] == "record"){
            document.getElementById(curHead + "mem").innerHTML = "Head Memory: " + currentCell().innerHTML;
        }
        else if(subLines[0] == "accept"){
            setStatus("Halted and Accepted");
            break;
        }
        else if(subLines[0] == "reject"){
            setStatus("Halted and Rejected");
            break;
        }
        else if(subLines[0] == "if"){

            if(subLines[1] == "match"){
                if(currentCell().innerHTML == document.getElementById(curHead + "mem").innerHTML.slice(13)){  
    
                    runSingleCommand(lines,subLines.slice(2));
                }
                else{
                    if(subLines.indexOf("else") > -1){

                        runSingleCommand(lines, subLines.slice(subLines.indexOf("else")));
                    }
                }
            }
            else if(subLines[1] == "mismatch"){
                if(currentCell().innerHTML != document.getElementById(curHead + "mem").innerHTML.slice(13)){  
    
                    runSingleCommand(lines, subLines.slice(2));
                }
                else{
                    if(subLines.indexOf("else") > -1){

                        runSingleCommand(lines, subLines.slice(subLines.indexOf("else")));
                    }
                }
            }
            else if(subLines[1] == "blank"){
                if(currentCell().innerHTML == "_"){
                    runSingleCommand(lines, subLines.slice(2));
                }
                else{
                    if(subLines.indexOf("else") > -1){

                        runSingleCommand(lines, subLines.slice(subLines.indexOf("else")));
                    }
                }
            }
            else{
                if(currentCell().innerHTML == subLines[1]){
                    runSingleCommand(lines, subLines.slice(2));
                }
                else{
                    if(subLines.indexOf("else") > -1){

                        runSingleCommand(lines, subLines.slice(subLines.indexOf("else")));
                    }
                }
            }
        }

        await delay(2);

    }

    stringLoaded = True;

}

function runSingleCommand(lines, subLines){

    if(subLines[0] == "load"){
        if(!stringLoaded){
            loadString(subLines[1]);
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

        if(subLines.length == 2){
            if(subLines[1] == "right"){

                headPos += 1;
                moveHead(document.getElementById(curHead), currentCell());
            }
            else if(subLines[1] == "left"){

                headPos -= 1;
                moveHead(document.getElementById(curHead), currentCell());
            }

        }
        else if(subLines.length == 3){
            if(subLines[1] == "right"){

                headPos += parseInt(subLines[2]);
                moveHead(document.getElementById(curHead), currentCell());
            }
            else if(subLines[1] == "left"){

                headPos -= parseInt(subLines[2]);
                moveHead(document.getElementById(curHead), currentCell());
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
                    return;
                }

            }

            headPos += dir;
            moveHead(document.getElementById(curHead), currentCell());

            let endPoints = [subLines[3], BLANK];
            while(!endPoints.includes(currentCell().innerHTML)){
                
                headPos += dir;
                moveHead(document.getElementById(curHead), currentCell());
            }

        }
    }
    else if(subLines[0] == "blackout"){
        
        currentCell().style.backgroundColor = "black";
        currentCell().innerHTML = "**";
    }
    else if(subLines[0] == "write"){

        if(currentCell().style.backgroundColor = "black"){
            currentCell().style.backgroundColor = "white";
        }

        currentCell().innerHTML = subLines[1][0];
    }
    else if(subLines[0] == "mark"){
        currentCell().style.backgroundColor = "rgba(166, 218, 211, 0.5)";
    }
    else if(subLines[0] == "unmark"){
        currentCell().style.backgroundColor = "white";
    }
    else if(subLines[0] == "record"){
        document.getElementById(curHead + "mem").innerHTML = "Head Memory: " + currentCell().innerHTML;
    }
    else if(subLines[0] == "accept"){
        setStatus("Halted and Accepted");
        return;
    }
    else if(subLines[0] == "reject"){
        setStatus("Halted and Rejected");
        return;
    }
        
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

function currentCell(){

    return document.getElementById("cell" + headPos.toString());
}

function loadString(string){
    
    for(var i = 0; i < string.length; i++){
        document.getElementById("cell" + (i + 1).toString()).innerHTML = string[i];
    }
}

function moveHead(head, cell){

    head.style.left = (cell.getBoundingClientRect().left + 12) + "px";
    head.style.top = (cell.getBoundingClientRect().top - 40) + "px";
}

function setStatus(newStatus){
    document.getElementById("status").innerHTML = "Status: " + newStatus;
    runStatus = newStatus;
}

function getStatus(){

    return runStatus;
}

// Ensuring the onPageLoad function runs when the document is fully loaded
document.addEventListener("DOMContentLoaded", loadCells);

