function highlight(act, t) { //Highlights the variable names, if any, in chats and calculations
    var text = (typeof(t) === "string" ? t : t.toString());
    var textWithoutSpaces = text.replace(/\s/g, '');
    var pattern = new RegExp(/([[0-9]+\.?[0-9]*)|(\.[0-9]+)/g);
    m = textWithoutSpaces.match(pattern) //Find all the numbers
    if (m) {
        for (var i = 0; i < m.length; i++) {
            text = text.replace(m[i], m[i] + " <mark>" + compareNumbers(act, m[i]) + "</mark>");
        }
    }
    return text;
}

function compareNumbers(act, numStr) { //Takes extracted number string, converts it, and compares to known numbers.
    //Returns the variable label if a match is found.
    var num = parseFloat(numStr);
    var level = act.level;
    var returnStr = "";
    var E = level.E,
        R0 = level.R0,
        goalV1 = level.goalV[0],
        goalV2 = level.goalV[1],
        goalV3 = level.goalV[2],
        goalV0 = E - goalV1 - goalV2 - goalV3,
        goalR1 = level.goalR[0],
        goalR2 = level.goalR[1],
        goalR3 = level.goalR[2],
        goalIA = E / (R0 + goalR1 + goalR2 + goalR3),
        goalImA = 1000 * goalIA,
        R1 = act.R[0],
        R2 = act.R[1],
        R3 = act.R[2],
        V1 = act.V[0],
        V2 = act.V[1],
        V3 = act.V[2],
        Rtot = R0 + R1 + R2 + R3,
        V0 = E * R0 / Rtot,
        IA = E / Rtot,
        ImA = 1000 * IA,
        tol = .01; //How close two numbers have to be to considered "about equal"
    //Note: we compare tol to |x - y| / (x + y) so it's a relative value
    if (about(num, E, tol)) {
        return "[E]";
    } else if (about(num, R0, tol)) {
        return "[R0]";
    } else if (about(num, R1, tol)) {
        return "[R1]";
    } else if (about(num, R2, tol)) {
        return "[R2]";
    } else if (about(num, R3, tol)) {
        return "[R3]";
    } else if (about(num, V0, tol)) {
        return "[V0]";
    } else if (about(num, V1, tol)) {
        return "[V1]";
    } else if (about(num, V2, tol)) {
        return "[V2]";
    } else if (about(num, V3, tol)) {
        return "[V3]";
    } else if (about(num, goalR1, tol)) {
        return "[goalR1]";
    } else if (about(num, goalR2, tol)) {
        return "[goalR2]";
    } else if (about(num, goalR3, tol)) {
        return "[goalR3]";
    } else if (about(num, goalV0, tol)) {
        return "[goalV0]";
    } else if (about(num, goalV1, tol)) {
        return "[goalV1]";
    } else if (about(num, goalV2, tol)) {
        return "[goalV2]";
    } else if (about(num, goalV3, tol)) {
        return "[goalV3]";
    } else if (about(num, IA, tol)) {
        return "[I(A)]";
    } else if (about(num, ImA, tol)) {
        return "[I(mA)]";
    } else if (about(num, goalIA, tol)) {
        return "[goalI(A)]";
    } else if (about(num, goalImA, tol)) {
        return "[goalI(mA)]";
    } else {
        return ""; //Return empty string if no match found
    }
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

function about(num, target, tolerance) {
    if (Math.abs((num - target) / (num + target)) < tolerance) {
        return true;
    } else {
        return false;
    }
}

function addTeam(ro, teams) { //construct a new team from ro and add it to teams array.
    //If we already have a team with that name, use it.
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
            myTeam.levels = [];
            myTeam.members = [];
        }
        addLevel(myTeam, ro); //add level, if new
        addMember(myTeam, ro); //add member, if new
        if (!inTeams) { //add the team to the teams array if it's new
            teams.push(myTeam);
        }
    } catch (err) {
        console.log("In addTeam " + err);
    }
}

function addLevel(myTeam, ro) { //construct a new level from ro and add it to levels array.
    //If we already have a level with that number, use it.
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
            myLevel.initR = [parseInt(po["R1"]), parseInt(po["R2"]), parseInt(po["R3"])];
            myLevel.R = [parseInt(po["R1"]), parseInt(po["R2"]), parseInt(po["R3"])];
            var Rtot = myLevel.R0 + myLevel.R[0] + myLevel.R[1] + myLevel.R[2];
            myLevel.I = Math.round((myLevel.E / Rtot) * 100000) / 100000;
            myLevel.V = [Math.round(((myLevel.E * myLevel.R[0]) / Rtot) * 100) / 100,
                Math.round(((myLevel.E * myLevel.R[1]) / Rtot) * 100) / 100,
                Math.round(((myLevel.E * myLevel.R[2]) / Rtot) * 100) / 100
            ];
            myLevel.goalR = [parseInt(po["GoalR1"]), parseInt(po["GoalR2"]), parseInt(po["GoalR3"])];
            myLevel.goalV = [parseFloat(po["V1"]), parseFloat(po["V2"]), parseFloat(po["V3"])];
            myLevel.actions = [];
            myLevel.success = false;
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
            var colIndex = myTeam.members.length // will be 0, 1, or 2
            var colorArray = ["DarkTurquoise", "Gold", "GreenYellow"];
            myMember = new member;
            myMember.startTime = ro["time"];
            myMember.startPTime = unixTimeConversion(myMember.startTime);
            myMember.board = parseInt(po["board"]) + 1;
            myMember.color = colorArray[colIndex];
            myMember.name = name;
            myMember.styledName = "<span style= \"background-color: " + myMember.color + "\">" + name + "</span>";
            myMember.team = myTeam;
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
    var levelFound = false;
    for (var i = 0; i < team.levels.length; i++) {
        if (team.levels[i].number == number) {
            levelFound = true;
            return team.levels[i];
        }
    }
    if (!levelFound) {
        console.log("Level not found! team = " + team + ", level number " + number);
    }
}


//Check to see whether name is in members array for this team. If so, return the member.
function findMember(team, name) {
    for (var i = 0; i < team.members.length; i++) {
        if (team.members[i].name == name) {
            return team.members[i];
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
