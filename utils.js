function highlight(act, text) { //Highlights the variable names, if any, in chats
    var newText = text.toString();
    var pattern = new RegExp(/([0-9]+\.?[0-9]*)|(\.[0-9]+)/g);
    while ((match = pattern.exec(text)) != null) {
        newText = newText.replace(match[0], match[0] + " <mark>" + compareNumbers(act, match[0]) + "</mark>");
    }
    return newText;
}

function compareNumbers(act, numStr) { //Takes extracted number string, converts it, and compares to known numbers.
    //Returns the variable label if a match is found.
    var num = parseFloat(numStr);
    var level = act.level;
    if (level.label == "B") {
        var stop = "stop";
    };
    var returnStr = "";
    var E = level.E,
        R0 = level.R0,
        goalV1 = level.goalV1,
        goalV2 = level.goalV2,
        goalV3 = level.goalV3,
        R1 = level.oldR1,
        R2 = level.oldR2,
        R3 = level.oldR3,
        I = E / (R0 + R1 + R2 + R3);
    switch (num) {
        case E:
            return "[E]";
            break;
        case R0:
            return "[R0]";
            break;
        case I:
            return "[I]";
            break;
        case R1:
            return "[R1]";
            break;
        case R2:
            return "[R2]";
            break;
        case R3:
            return "[R3]";
            break;
        case goalV1:
            return "[gV1]";
            break;
        case goalV2:
            return "[gV2]";
            break;
        case goalV3:
            return "[gV3]";
            break;
    }
    return ""; //Return empty string if no match found
}

function makeTeams(rowObjs) { //parse the row objects array looking for and populating teams
    try {
        for (i = 0; i < rowObjs.length; i++) {
            var ro = rowObjs[i];
            if (ro["event"] == "model values") {
                addTeam(ro, teams);
            }
        }
        return teams;
    } catch (err) {
        console.log("In makeTeams, error = " + err);
    }
}

function addTeam(ro, teams) { //construct a new team from ro and add it to teams
    var inTeams = false;
    try {
        if (!teams) { //if we don't have a teams array yet
            teams = []; //make one
        }
        //check to see whether we already have a team with this name
        for (j = 0; j < teams.length; j++) {
            if (teams[j].name == ro["groupname"]) {
                inTeams = true;
                myTeam = teams[j]; //set myTeam to be the one we found in the array
            }
        }
        if (!inTeams) { //a team with this name is not in the teams array
            myTeam = new team; //make a new one
            myTeam.name = ro["groupname"];
        }
        addLevel(myTeam, ro); //add level, if new
        addMember(myTeam, ro); //add member, if new
        if (!inTeams) { //add it to the array if it's new
            teams.push(myTeam);
        }
    } catch (err) {
        console.log("In addTeam " + err);
    }
}

function addLevel(myTeam, ro) { //construct a new level from ro and add it to levels
    try {
        var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
        var number = po["levelName"].charAt(po["levelName"].length - 1);
        var inLevels = false;
        // if levels array doesn't yet exist
        if (!myTeam.levels) {
            myTeam.levels = []; //set it up
        }
        //Check to see whether we already have a level with this number
        for (j = 0; j < myTeam.levels.length; j++) {
            if (myTeam.levels[j].number == number) {
                inLevels = true;
            }
        }
        if (!inLevels) { //if not, add this level
            myLevel = new level;
            myLevel.startTime = ro["time"];
            myLevel.startPTime = unixTimeConversion(myLevel.startTime);
            myLevel.number = number;
            myLevel.label = getAlphabeticLabel(number);
            myLevel.team = myTeam;
            myLevel.E = parseInt(po["E"]);
            myLevel.R0 = parseInt(po["R"]);
            myLevel.initR1 = parseInt(po["R1"]);
            myLevel.initR2 = parseInt(po["R2"]);
            myLevel.initR3 = parseInt(po["R3"]);
            myLevel.oldR1 = parseInt(po["R1"]);
            myLevel.oldR2 = parseInt(po["R2"]);
            myLevel.oldR3 = parseInt(po["R3"]);
            myLevel.goalR1 = parseInt(po["GoalR1"]);
            myLevel.goalR2 = parseInt(po["GoalR2"]);
            myLevel.goalR3 = parseInt(po["GoalR3"]);
            myLevel.goalV1 = parseFloat(po["V1"]);
            myLevel.goalV2 = parseFloat(po["V2"]);
            myLevel.goalV3 = parseFloat(po["V3"]);
            myLevel.actions = [];
            myTeam.levels.push(myLevel);

        }

    } catch (err) {
        console.log("In addLevel " + err);
    }
}

function addMember(myTeam, ro) { //construct a new member from ro and add it to members
    try {
        var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
        var name = po["username"];
        // if members array doesn't yet exist
        if (!myTeam.members) {
            myTeam.members = []; //set it up
        }
        //Check to see whether we already have a member with this name
        inMembers = false;
        for (j = 0; j < myTeam.members.length; j++) {
            if (myTeam.members[j].name == name) {
                inMembers = true;
            }
        }
        if (!inMembers) { //if not, add this level
            myMember = new member;
            myMember.startTime = ro["time"];
            myMember.startPTime = unixTimeConversion(myMember.startTime);
            myMember.board = parseInt(po["board"]) + 1;
            myMember.name = po["username"];
            myTeam.members.push(myMember);
        }
    } catch (err) {
        console.log("in addMember " + err)
    }
}

//Check to see whether the team at this row is in the teams array
function findTeam(teams, ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var teamName = po["groupname"];
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].name == teamName) {
            return teams[i];
        } else {
            //            console.log("No such team!" + teamName);
        }
    }
}

//Check to see whether the level at this row is in the levels array for this team
function findLevel(team, ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var number = po["levelName"].charAt(po["levelName"].length - 1);
    for (var i = 0; i < team.levels.length; i++) {
        if (team.levels[i].number == number) {
            return team.levels[i];
        } else {
            //            console.log("No such level!" + number);
        }
    }
}


//Check to see whether name is in members array for this team
function findMember(team, name) {
    for (var i = 0; i < team.members.length; i++) {
        if (team.members[i].name == name) {
            return team.members[i].name;
        } else {
            //        console.log("no such member!" + name);
        }
    }
}

function unixTimeConversion(uTime) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(uTime * 1000);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();

    var formattedTime = month + "/" + day + "/" + year + " " +
        hours + ':' + minutes + ":" + seconds + "." + milliseconds;
    return (formattedTime);
}

function arrayToObjects(rows) {
    var headers = rows[0];

    function rowObj() {};
    var rowObjs = [];
    for (i = 1; i < rows.length; i++) {
        currentRow = new rowObj;
        var row = rows[i];
        if (row.length == headers.length) {
            for (j = 0; j < row.length; j++) {
                currentRow[headers[j]] = row[j];
            }
        }
        rowObjs.push(currentRow);
    }
    return rowObjs;
}

//returns A for level 2, B for level 3, and so forth
function getAlphabeticLabel(index) {
    var alphaArray = ["A", "B", "C", "D"];
    if ((index >= 2) && (index <= 5)) {
        return alphaArray[index - 2];
    } else {
        alert("Alphabetic label array index out of range." + index)
    }
}

function computeVoltages(level, R1, R2, R3) {
    var voltages = [];
    var Rtot = level.R0 + R1 + R2 + R3;
    var E = level.E;
    var R0 = level.R0;

    voltages[0] = E * R0 / Rtot;
    voltages[1] = E * R1 / Rtot;
    voltages[2] = E * R2 / Rtot;
    voltages[3] = E * R3 / Rtot;
    return voltages;
}
