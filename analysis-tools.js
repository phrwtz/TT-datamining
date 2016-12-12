//This is where we do all the analysis of the files once the raw data has been parsed
function analyze(rowObjs) {
    for (var i = 0; i < rowObjs.length; i++) {
        var ro = rowObjs[i];
        var ev = ro["event"];
        var type = ro["type"];
        var time = ro["time"];
        switch (ev) {
            case "Joined Group":
                addJoinedGroup(ro);
                break;
            case "Changed circuit":
                switch (type) {
                    case "changed component value":
                        addRChange(ro);
                        break;
                    case "disconnect lead":
                        addDisconnectLead(ro);
                        break;
                    case "connect lead":
                        addConnectLead(ro);
                        break;
                }
                break;
            case "Sent message":
                addMessage(ro);
                break;
            case "Calculation performed":
                addCalculation(ro);
                break;
            case "Submit clicked when all correct":
                addSubmit(ro);
                break;
            case "Unknown Values Submitted":
                addSubmit(ro);
                break;
            case "Attached probe":
                addAttachProbe(ro);
                break;
            case "Detached probe":
                addDetachProbe(ro, i);
                break;
        }
    }
}

//General function for adding a new action. Sets all the parameters the different actions have in common.
function addAction(ro, type) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var myAction = new action;
    myAction.type = type;
    myAction.team = team;
    myAction.level = level;
    myAction.date = ro["date"];
    myAction.time = ro["time"];
    myAction.uTime = ro["unix-time"];
    myAction.pTime = unixTimeConversion(myAction.uTime);
    myAction.board = parseInt(ro["board"]) + 1;
    myAction.actor = findMember(team, po["username"]);
    myAction.currentFlowing = po["currentFlowing"];
    myAction.index = level.actions.length; //The length of the array before the action is pushed. (The index of the action
    //if it is pushed will equal this.)
    return myAction;
}

//Function for detecting duplicate actions by comparing them to previous actions
function duplicate(action) {
    var actions = action.level.actions; //Array of actions for this level
    if (actions.length > 3) {
        dup = []; // Array for storing results of previous actions
        var thisAct = action,
            thisActor = action.actor,
            thisTime = action.uTime,
            thisType = action.type;
        var checkAct,
            checkActor,
            checkTime,
            checkType;
        for (var i = 1; i < 4; i++) { //check three actions back
            checkAct = actions[action.index - i];
            if (checkAct.actor && checkAct.time && checkAct.type) {
                checkActor = checkAct.actor;
                checkTime = checkAct.uTime;
                checkType = checkAct.type;
                dup[i] = ((checkActor == thisActor) && (checkType == thisType) && (Math.abs(checkTime - thisTime) < 0.1))
            } else {
                dup[i] = false;
            }
        }
        return (dup[1] || dup[2] || dup[3]); //If any checked previous action matches, there is a duplicate
    }
}

function addJoinedGroup(ro) {
    var myAction = addAction(ro, "joined-group");
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    } else {
        console.log("Passed over a joined group action at . " + myAction.time);
    }
}

function addConnectLead(ro) {
    var myAction = addAction(ro, "connect-lead");
    myAction.location = ro["location"];
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a connect lead action at . " + myAction.time);
    }
}

function addDisconnectLead(ro) {
    var myAction = addAction(ro, "disconnect-lead");
    myAction.location = ro["location"];
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a disconnect lead action at . " + myAction.time);
    }
}

function addRChange(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var myAction = addAction(ro, "resistorChange");
    var level = myAction.level;
    var newR1 = po["r1"];
    var newR2 = po["r2"];
    var newR3 = po["r3"];
    if ((!isNaN(newR1 + newR2 + newR3)) &&
        ((newR1 != level.oldR1) || (newR2 != level.oldR2) || (newR3 != level.oldR3))) {
        myAction.oldR1 = level.oldR1;
        myAction.oldR2 = level.oldR2;
        myAction.oldR3 = level.oldR3;
        myAction.newR1 = parseInt(newR1);
        myAction.newR2 = parseInt(newR2);
        myAction.newR3 = parseInt(newR3);
        myAction.level.oldR1 = myAction.newR1;
        myAction.level.oldR2 = myAction.newR2;
        myAction.level.oldR3 = myAction.newR3;
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
        myAction.level.actions.push(myAction);
    }
}

function addMessage(ro) {
    var myAction = addAction(ro, "message");
    myAction.msg = ro["event_value"];
    myAction.level.actions.push(myAction);
}

function addCalculation(ro) {
    var myAction = addAction(ro, "calculation");
    myAction.result = ro["result"];
    myAction.calculation = ro["calculation"];
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    }
}

function addSubmit(ro) {
    switch (ro["event"]) {
        case "Submit clicked when all correct":
            var type = "submitCorrect";
            break;
        case "Unknown Values Submitted":
            var type = "submitUnknown";
            break;
        case "Submit clicked":
            var type = "submitClicked";
            break;
    }
    var myAction = addAction(ro, type);
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var newR1 = po["r1"];
    var newR2 = po["r2"];
    var newR3 = po["r3"];
    myAction.newR1 = parseInt(newR1);
    myAction.newR2 = parseInt(newR2);
    myAction.newR3 = parseInt(newR3);
    if (myAction.type == "submitCorrect") {
        if (!level.success) {
            myAction.level.success = true;
            console.log("success at level " + myAction.level.label + "!");
        }
    } else if (myAction.type == "submitUnknown") {
        myAction.rNeed = ro["R: Need"];
        myAction.rHaveValue = ro["R: Have Value"];
        myAction.rHaveUnit = ro["R: Have Unit"];
        myAction.rCorrect = ro["R: Correct"];
        myAction.eNeed = ro["E: Need"];
        myAction.eHaveUnit = ro["E: Have Unit"];
        myAction.eHaveValue = ro["E: Have Value"];
        myAction.eCorrect = ro["E: Correct"];
    }
    myAction.level.actions.push(myAction);
}

function addAttachProbe(ro) {
    var myAction = addAction(ro, "attach-probe");
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    myAction.location = ro["location"];
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over an attach probe action at . " + myAction.time);
    }
}

function addDetachProbe(ro, i) {
    var myAction = addAction(ro, "detach-probe");
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    myAction.location = po["location"];
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a detach probe action at . " + myAction.time);
    }
}
