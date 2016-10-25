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

function findTeam(teams, ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var name = po["groupname"];
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].name == name) {
            return teams[i]
        } else {
            alert("No such team!")
        }
    }
}

function findLevel(team, ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var number = po["levelName"].charAt(po["levelName"].length - 1);
    for (var i = 0; i < team.levels.length; i++) {
        if (team.levels[i].number == number) {
            return team.levels[i];
        } else {
            alert("No such level!")
        }
    }
}

function findMember(team, name) {
    for (var i = 0; i < team.members.length; i++) {
        if (team.members[i].name == name) {
            return team.members[i].name;
        } else {
            alert("no such member!")
        }
    }
}

function generateReport(rowObjs) {
    try {
        for (i = 0; i < rowObjs.length; i++) {
            var ro = rowObjs[i];
            var ev = ro["event"];
            var gn = ro["groupname"]
            var eval = ro["event_value"];
            var time = ro["time"];
            var pTime = unixTimeConversion(time);
            // if ((ev == "Changed circuit") && (gn == "Dogs")) {
            //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
            //     if ((po["type"] == "changed component value") && (po["currentFlowing"])) {
            //         console.log(po["username"] + " (board " + (parseInt(po["board"]) + 1) + ") " + po["type"] + " at row " + (i + 2) +
            //             ". r1 = " + po["r1"] + ", r2 = " + po["r2"] + ", r3 = " + po["r3"] +
            //             ", time = " + time + ", type = " + po["type"] + ", current flowing " + po["currentFlowing"]);
            //     }
            // }
            if (ev == "model values") {
                var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
                if (gn == "Dogs") {
                    console.log(pTime + ", " + gn + ", level " + po["levelName"].charAt(po["levelName"].length - 1) + " formed at row " + i +
                        ". E = " + po["E"] + ", R0 = " + po["R"] + ", username " + po["username"]);
                }

            }
        }
    } catch (err) {
        console.log(err + ", i = " + i + ", parameters = " + p2);
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
