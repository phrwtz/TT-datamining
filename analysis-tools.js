//This is where we do all the analysis of the files once the raw data has been parsed
function analyze(rowObjs) {
    for (var i = 0; i < rowObjs.length; i++) {
        try {
            var ro = rowObjs[i];
            var ev = ro["event"];
            switch (ev) {
                case "Changed circuit":
                    addComponentChange(ro);
                    break;
                case "Sent message":
                    addMessage(ro);
                    break;
                case "Calculation performed":
                    addCalculation(ro);
                    break;
                case ("Submit clicked when all correct"):
                    addSubmit(ro);
                    break;
                case ("Unknown Values Submitted"):
                    addSubmit(ro);
                    break;
                case ("Attached probe"):
                    addAttachProbe(ro);
                    break;
                case ("Detached probe"):
                    addDetachProbe(ro);
                    break;
            }
        } catch (err) {
            console.log("In analyze " + err);
        }
    }
}

function addComponentChange(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var type = po["type"];
    if (type == "changed component value") {
        addRChanges(ro);
    } else {
        return;
    }
}

function addRChanges(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    try {
        if (findTeam(teams, ro)) {
            var team = findTeam(teams, ro);
            var level = findLevel(team, ro);
            var newR1 = po["r1"];
            var newR2 = po["r2"];
            var newR3 = po["r3"];
            if ((!isNaN(newR1 + newR2 + newR3)) &&
                ((newR1 != level.oldR1) || (newR2 != level.oldR2) || (newR3 != level.oldR3))) {
                var myAction = new action;
                myAction.type = "resistorChange"
                myAction.actor = findMember(team, po["username"]);
                myAction.board = parseInt(po["board"]) + 1;
                myAction.time = ro["time"];
                myAction.pTime = unixTimeConversion(myAction.time);
                myAction.level = level;
                myAction.team = team;
                myAction.currentFlowing = po["currentFlowing"];
                myAction.oldR1 = level.oldR1;
                myAction.oldR2 = level.oldR2;
                myAction.oldR3 = level.oldR3;
                myAction.newR1 = parseInt(newR1);
                myAction.newR2 = parseInt(newR2);
                myAction.newR3 = parseInt(newR3);
                level.oldR1 = myAction.newR1;
                level.oldR2 = myAction.newR2;
                level.oldR3 = myAction.newR3;
                switch (myAction.board) {
                    case 1:
                        myAction.changedRName = "R1";
                        myAction.changedROld = myAction.oldR1;
                        myAction.changedRNew = myAction.newR1;
                        break;
                    case 2:
                        myAction.changedRName = "R2";
                        myAction.changedROld = myAction.oldR2;
                        myAction.changedRNew = myAction.newR2;
                        break;
                    case 3:
                        myAction.changedRName = "R3";
                        myAction.changedROld = myAction.oldR3;
                        myAction.changedRNew = myAction.newR3;
                        break;
                }
                level.actions.push(myAction);
            }
        }
    } catch (err) {
        console.log("in addRChanges " + err);
    }
}

function addMessage(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    try {
        var team = findTeam(teams, ro);
        var level = findLevel(team, ro);
        var myAction = new action;
        myAction.type = "message";
        myAction.actor = findMember(team, po["username"]);
        myAction.board = parseInt(po["board"]) + 1;
        myAction.time = ro["time"];
        myAction.pTime = unixTimeConversion(myAction.time);
        myAction.level = level;
        myAction.team = team;
        myAction.msg = ro["event_value"];
        level.actions.push(myAction);
    } catch (err) {
        console.log("in addMessage " + err);
    }
}

function addCalculation(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var myAction = new action;
    myAction.type = "calculation";
    myAction.team = team;
    myAction.level = level;
    myAction.time = ro["time"];
    myAction.pTime = unixTimeConversion(myAction.time);
    myAction.board = parseInt(po["board"]) + 1;
    myAction.actor = findMember(team, po["username"]);
    myAction.result = ro["result"];
    myAction.calculation = ro["calculation"];
    level.actions.push(myAction);
}

function addSubmit(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var newR1 = po["r1"];
    var newR2 = po["r2"];
    var newR3 = po["r3"];
    var myAction = new action;
    myAction.team = team;
    myAction.level = level;
    myAction.time = ro["time"];
    myAction.pTime = unixTimeConversion(myAction.time);
    myAction.board = parseInt(po["board"]) + 1;
    myAction.actor = findMember(team, po["username"]);
    myAction.newR1 = parseInt(newR1);
    myAction.newR2 = parseInt(newR2);
    myAction.newR3 = parseInt(newR3);
    if (ro["event"] == "Submit clicked when all correct") {
        myAction.type = "submitCorrect";
        if (!level.success) {
            level.actions.push(myAction);
            level.success = true;
        }
    } else if (ro["event"] == "Unknown Values Submitted") {
        myAction.type = "submitUnknown";
        myAction.rNeed = ro["R: Need"];
        myAction.rHaveValue = ro["R: Have Value"];
        myAction.rHaveUnit = ro["R: Have Unit"];
        myAction.rCorrect = ro["R: Correct"];
        myAction.eNeed = ro["E: Need"];
        myAction.eHaveUnit = ro["E: Have Unit"];
        myAction.eHaveValue = ro["E: Have Value"];
        myAction.eCorrect = ro["E: Correct"];
        level.actions.push(myAction);
    } else if (ro["event"] == "Submit clicked") {
        myAction.type = "submitClicked";
        level.actions.push(myAction);
    }
}

function addAttachProbe(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var myAction = new action;
    myAction.type = "attach-probe";
    myAction.team = team;
    myAction.level = level;
    myAction.time = ro["time"];
    myAction.pTime = unixTimeConversion(myAction.time);
    myAction.board = parseInt(ro["board"]) + 1;
    myAction.actor = findMember(team, po["username"]);
    myAction.location = po["location"];
    myAction.currentFlowing = ro["currentFlowing"]
    level.actions.push(myAction);
}

function addDetachProbe(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var myAction = new action;
    myAction.type = "detach-probe";
    myAction.team = team;
    myAction.level = level;
    myAction.time = ro["time"];
    myAction.pTime = unixTimeConversion(myAction.time);
    myAction.board = parseInt(ro["board"]) + 1;
    myAction.actor = findMember(team, po["username"]);
    myAction.location = po["location"];
    myAction.currentFlowing = ro["currentFlowing"]
    level.actions.push(myAction);
}
