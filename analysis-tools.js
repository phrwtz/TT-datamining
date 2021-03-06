//This is where we do all the analysis of the files once the raw data has been parsed
function analyze(rowObjs) {
    for (var i = 0; i < rowObjs.length; i++) {
        var ro = rowObjs[i];
        var ev = ro["event"];
        var type = ro["type"];
        var time = ro["time"];
        switch (ev) {
            case "Activity Settings":
                addActivitySettings(ro);
                break;
            case "model values":
                addModelValues(ro);
                break;
            case "Joined Group":
                addJoinedGroup(ro);
                break;
            case "Opened Zoom View":
                addOpenedZoom(ro);
                break;
            case "Closed Zoom View":
                addClosedZoom(ro);
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
            case "Submit clicked":
                addSubmit(ro);
                break;
            case "Unknown Values Submitted":
                addSubmitER(ro);
                break;
            case "Attached probe":
                addAttachProbe(ro);
                break;
            case "Detached probe":
                addDetachProbe(ro, i);
                break;
            case "DMM measurement":
                addMeasurement(ro, i);
                break;

            case "Moved DMM dial":
                addMovedDial(ro, i);
                break;
        }
    }
}

//General function for adding a new action. Sets all the parameters the different actions have in common.
function addAction(ro, type) {
    var teamFound = false;
    var teamName = ro["groupname"];
    for (var k = 0; k < teams.length; k++) {
        if (teams[k].name == teamName) {
            teamFound = true;
            myTeam = teams[k];
            break;
        }
    }
    if (!teamFound) {
        // console.log("looking in vain for team " + teamName + " in action " + type + " at " + ro["time"]);
        return;
    }
    var levelFound = false;
    var number = ro["levelName"].charAt(ro["levelName"].length - 1);
    for (var i = 0; i < myTeam.levels.length; i++) {
        if (myTeam.levels[i].number == number) {
            myLevel = myTeam.levels[i];
            levelFound = true;
            break;
        }
    }
    if (!levelFound) {
        // console.log("No level found in add action. Team = " + myTeam.name + ", level number = " + number);
        return;
    }
    var memberID = ro["username"].slice(0, 5);
    var memberFound = false;
    for (var j = 0; j < myTeam.members.length; j++) {
        if (myTeam.members[j].id == memberID) {
            memberFound = true;
            myMember = myTeam.members[j];
            break
        }
    }
    if (!memberFound) {
        console.log("No member. Team = " + myTeam.name + ", level number = " + number +
            ", id = " + memberID + ", action type = " + type + ", time = " + ro["time"]);
        for (i = 0; i < teams.length; i++) {
            for (j = 0; j < teams[i].members.length; j++) {
                if (teams[i].members[j].id == memberID) {
                    matchingTeamName = teams[i].name;
                }
            }
        }
        console.log("That member is in team " + matchingTeamName);
        return;
    }
    var myAction = new action;
    myAction.R = [];
    myAction.V = [];
    myAction.goalR = [];
    myAction.goalRIndex = [];
    myAction.goalV = [];
    myAction.E = myLevel.E;
    myAction.R0 = myLevel.R0;
    for (var j = 0; j < 3; j++) {
        myAction.R[j] = myLevel.R[j];
        myAction.V[j] = myLevel.V[j];
        myAction.goalR[j] = myLevel.goalR[j]; //goal values may change during the level if something goes wrong
        grStr = myAction.goalR[j].toString();
        myAction.goalRIndex[j] = resIndex[grStr];
        myAction.goalV[j] = myLevel.goalV[j];
    }
    myAction.type = type;
    myAction.team = myTeam;
    myAction.level = myLevel;
    myAction.actor = myMember;
    myAction.uTime = ro["time"];
    myAction.eTime = Math.round(myAction.uTime - myLevel.startUTime);
    var eMins = String(Math.floor(myAction.eTime / 60));
    var eSecs = myAction.eTime % 60 > 9 ? String(myAction.eTime % 60) : "0" + String(myAction.eTime % 60);
    myAction.eMinSecs = eMins + ":" + eSecs;
    myAction.pTime = unixTimeConversion(myAction.uTime);
    myAction.board = parseInt(ro["board"]);
    myAction.index = myLevel.actions.length; //The length of the array before the action is pushed. (The index of the action
    //if it is pushed will equal this.)
    myAction.id = myMember.id;
    myAction.currentFlowing = false;
    if ((ro["currentFlowing"] == "true") || ro["currentFlowing"] == "TRUE") {
        myAction.currentFlowing = true;
    }
    myLevel.endUTime = myAction.uTime;
    return myAction;
}

//Find resistance values from row; return resistance matrix. If no value found, return the old value.
function findRValues(ro, oldR) {
    var newR = [];
    newR = oldR;
    if ((ro["r1"] != "") && (ro["r1"] != "unknown")) {
        newR[0] = parseInt(ro["r1"])
    }
    if ((ro["r2"] != "") && (ro["r2"] != "unknown")) {
        newR[1] = parseInt(ro["r2"])
    }
    if ((ro["r3"] != "") && (ro["r3"] != "unknown")) {
        newR[0] = parseInt(ro["r3"])
    }
    return newR;
}

function findVValues(E, R0, R) { //Computes V given E, R0 and current R values. Returns V values.
    var Rtot;
    var V = [];
    Rtot = R0 + R[0] + R[1] + R[2];
    for (var i = 0; i < 3; i++) {
        V[i] = Math.round(100 * (E * R[i] / Rtot)) / 100;
    }
    return V;
}

//Function for detecting duplicate actions by comparing them to previous actions
function duplicate(action) {
    if (!action) {
        return true; //If action is undefined we want to do nothing with it.
    }
    var actions = action.level.actions; //Array of actions for this level
    var dup = false;
    var thisAct = action,
        thisID = thisAct.actor.id,
        thisTime = thisAct.uTime,
        thisType = thisAct.type,
        thisTeam = thisAct.team;
    var checkAct,
        checkID,
        checkTime,
        checkType,
        checkTeam,
        checkbackLength = 5;
    for (var i = 1; (actions[thisAct.index - i] && i < checkbackLength); i++) { //check five actions back or as far back as there are actions in the list
        //or fewer if there aren't that many actions on the stack
        checkAct = actions[thisAct.index - i];
        if (checkAct.id && checkAct.uTime && checkAct.type) {
            checkID = checkAct.actor.id
            checkTime = checkAct.uTime;
            checkType = checkAct.type;
            checkTeam = checkAct.team;
            if ((checkID == thisID) && (checkType == thisType) && (checkTeam == thisTeam) && (Math.abs(thisTime - checkTime) < 1)) {
                dup = true;
            }
        }
    }
    return dup //If any of the checked previous action matches, there is a duplicate
}

function addActivitySettings(ro) {
    var myAction = addAction(ro, "activity-settings");
    if (!(duplicate(myAction))) {
        if (!(duplicate(myAction))) {
            myLevel = myAction.level;
            myLevel.E = parseInt(ro["E"]);
            myLevel.R0 = parseInt(ro["R0"]);
            myAction.R0 = parseInt(ro["R0"]);
            myAction.E = parseInt(ro["E"]);
            myLevel.actions.push(myAction);
        }
    }
}

function addModelValues(ro) {
    var myAction = addAction(ro, "model-values");
    if (!(duplicate(myAction))) {
        myLevel.E = parseInt(ro["E"]);
        myLevel.goalV[0] = parseFloat(ro["V1"]);
        myLevel.goalV[1] = parseFloat(ro["V2"]);
        myLevel.goalV[2] = parseFloat(ro["V3"]);
        myLevel.goalR[0] = parseInt(ro["GoalR1"]);
        myLevel.goalR[1] = parseInt(ro["GoalR2"]);
        myLevel.goalR[2] = parseInt(ro["GoalR3"]);
        myAction.E = myLevel.E;
        for (var i = 9; i < 3; i++) {
            myAction.goalV[i] = myLevel.goalV[i];
            myAction.goalR[i] = myLevel.goalR[i];
        }
        myAction.level.actions.push(myAction);
    }
}

function addJoinedGroup(ro) {
    var myAction = addAction(ro, "joined-group");
    if (!(duplicate(myAction)) && (ro["event_value"] === ro["groupname"])) { //There's at least one examnple in the data where this condition is not satisfied: a joined group action is reported for two different teams by groupname and event_value. We're going to ignore such events for the time being.
        myLevel.members++;
        if (myLevel.members == 3) {
            myLevel.lastJoinedTime = myAction.eMinSecs;
            myLevel.lastJoinedUTime = myAction.uTime;
        }
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addOpenedZoom(ro) {
    var myAction = addAction(ro, "opened-zoom");
    if (!(duplicate(myAction))) {
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addClosedZoom(ro) {
    var myAction = addAction(ro, "closed-zoom");
    if (!(duplicate(myAction))) {
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addConnectLead(ro) {
    var myAction = addAction(ro, "connect-lead");
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a connect lead action at . " + myAction.time);
    }
}

function addDisconnectLead(ro) {
    var myAction = addAction(ro, "disconnect-lead");
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addRChange(ro) {
    var myAction = addAction(ro, "resistorChange");
    if (!(duplicate(myAction))) {
        myAction.oldR = [];
        myAction.newR = [];
        var myLevel = myAction.level,
            bd = myAction.board,
            bdA = (bd + 1) % 3,
            bdB = (bd + 2) % 3,
            oldGoalDifference,
            newGoalDifference;
        for (var i = 0; i < 3; i++) {
            myAction.oldR[i] = myLevel.R[i];
            myAction.newR[i] = myAction.oldR[i]; // Only one R is going to change
        }
        myAction.newR[bd] = parseInt(ro["value"]); //Then set the value for the changed R
        myAction.oldV = findVValues(myAction.E, myAction.R0, myAction.oldR);
        myAction.newV = findVValues(myAction.E, myAction.R0, myAction.newR)

        if ((!(isNaN(myAction.newR[0])) && !(isNaN(myAction.newR[1])) && !(isNaN(myAction.newR[2]))) &&
            ((myAction.newR[0] != myAction.oldR[0]) || (myAction.newR[1] != myAction.oldR[1]) || (myAction.newR[2] != myAction.oldR[2]))) {
            oldGoalDifference = myAction.oldV[bd] - myAction.goalV[bd];
            newGoalDifference = myAction.newV[bd] - myAction.goalV[bd];
            totalGoalDifference = Math.abs(myAction.newV[0] - myAction.goalV[0]) + Math.abs(myAction.newV[1] - myAction.goalV[1]) + Math.abs(myAction.newV[2] - myAction.goalV[2]);
            myAction.attainedVsMsg = (totalGoalDifference < .01 ? ", goal voltages attained, " : ", goal voltages not attained, ");
            if (Math.abs(totalGoalDifference) < .01) {
                if (!myLevel.attainedVs) { //only record time the first time
                    myLevel.attainedVsTime = myAction.eTime;
                    myLevel.attainedVseMinSecs = myAction.eMinSecs;
                }
                myLevel.attainedVs = true;
            } else if ((myLevel.attainedVs) && (!myLevel.movedAwayFromVs)) {
                myLevel.movedAwayFromVs = true;
                myLevel.movedAwayFromVsTime = myAction.eTime;
                myLevel.movedAwayFromVsMinSecs = myAction.eMinSecs;
            }
            if (Math.abs(newGoalDifference) < .01) {
                myAction.goalMsg = ". Local goal met";
            } else if (Math.sign(oldGoalDifference) != Math.sign(newGoalDifference) &&
                (newGoalDifference > 0)) {
                myAction.goalMsg = ". Goal overshot";
            } else if (Math.sign(oldGoalDifference) != Math.sign(newGoalDifference) &&
                (newGoalDifference < 0)) {
                myAction.goalMsg = ". Goal undershot";
            } else if (Math.abs(newGoalDifference) < Math.abs(oldGoalDifference)) {
                myAction.goalMsg = ". Goal closer";
            } else if (Math.abs(newGoalDifference) > Math.abs(oldGoalDifference)) {
                myAction.goalMsg = ". Goal farther";
            }
            for (var jk = 0; jk < 3; jk++) {
                myAction.R[jk] = myAction.newR[jk];
                myLevel.R[jk] = myAction.newR[jk]; //Save the new values in the level (they will become the old values for the next resistor change event)
                myAction.V[jk] = myAction.newV[jk];
                myLevel.V[jk] = myAction.newV[jk]; //Save the new values in the level (they will become the old values for the next resistor change event)
            };
            var oldRIndex = resIndex[myAction.oldR[bd].toString()];
            var newRIndex = resIndex[myAction.newR[bd].toString()];
            myAction.resJump = newRIndex - oldRIndex;
            myAction.resDist = resDist(myAction); // The number of resistances we are away from the closest approach to the goal V
            myAction.level.actions.push(myAction); //and push the action onto the level
        }
    }
}

function addMessage(ro) {
    var myAction = addAction(ro, "message");
    if (!(duplicate(myAction))) {
        myAction.msg = ro["event_value"];
        myAction.varRefs = getVarRefs(myAction, myAction.msg);
        myAction.score = scoreAction(myAction);
        myAction.highlightedMsg = highlightMessage(myAction, myAction.msg);
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addCalculation(ro) {
    myAction = addAction(ro, "calculation");
    if (!(duplicate(myAction))) {
        myAction.cMsg = ro["calculation"];
        myAction.rMsg = ro["result"];
        myAction.msg = myAction.cMsg + " = " + myAction.rMsg
        myAction.cvarRefs = getVarRefs(myAction, myAction.cMsg);
        myAction.rvarRefs = getVarRefs(myAction, myAction.rMsg);
        myAction.varRefs = myAction.cvarRefs.concat(myAction.rvarRefs);
        myAction.highlightedMsg = highlightMessage(myAction, myAction.msg);
        myAction.score = scoreAction(myAction);
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addMeasurement(ro, i) {
    var myAction = addAction(ro, "measurement");
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    if (!(duplicate(myAction))) {
        myAction.dialPosition = ro["dial_position"];
        myAction.measurementType = ro["measurement"];
        myAction.blackPosition = ro["black_probe"];
        myAction.redPosition = ro["red_probe"];
        if (myAction.blackPosition.slice(1) === myAction.redPosition.slice(1) && //same column
            (myAction.blackPosition[0] !== myAction.redPosition[0])) { //and different row
            myAction.gapMeasurement = true; //means measurement across a gap
        } else {
            myAction.gapMeasurement = false;
        }
        myAction.currentFlow = (ro["currentFlowing"] == "True" ? true : false);
        myAction.board = ro["board"];
        myAction.msg = ro["result"].replace(/\s/g, '');
        myAction.varRefs = getVarRefs(myAction, myAction.msg);
        myAction.highlightedMsg = highlightMessage(myAction, myAction.msg);
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addSubmit(ro) {
    var myAction = addAction(ro, "submitClicked");
    if (!duplicate(myAction)) {
        myLevel = myAction.level;
        var V1 = myAction.V[0];
        var V2 = myAction.V[1];
        var V3 = myAction.V[2];
        var goalV1 = myAction.goalV[0];
        var goalV2 = myAction.goalV[1];
        var goalV3 = myAction.goalV[2];
        var voltagesCorrectlySubmitted = (Math.abs(V1 - goalV1) + Math.abs(V2 - goalV2) + Math.abs(V3 - goalV3) < .01)
        if (voltagesCorrectlySubmitted) { //if they've got the right voltages
            if (!(myLevel.success)) { //and this is the first time
                myLevel.VSuccessTime = myAction.eMinSecs; //remember the time
            }
            myLevel.success = true; //set success true
        }
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}

function addSubmitER(ro) {
    var myAction = addAction(ro, "submitER");
    if (!duplicate(myAction)) {
        myTeam = myAction.team;
        myLevel = myAction.level;
        (ro["E: Value"] ? myAction.ESubmitValue = ro["E: Value"] : myAction.ESubmitValue = "<No value submitted>");
        (ro["E: Unit"] ? myAction.ESubmitUnit = ro["E: Unit"] : myAction.ESubmitUnit = "");
        (ro["R: Value"] ? myAction.RSubmitValue = ro["R: Value"] : myAction.RSubmitValue = "<No value submitted>");
        (ro["R: Unit"] ? myAction.RSubmitUnit = ro["R: Unit"] : myAction.RSubmitUnit = "");
        (ro["E: Value"] == myLevel.E ? myLevel.successE = true : myLevel.successE = false);
        (ro["R: Value"] == myLevel.R0 ? myLevel.successR = true : myLevel.successR = false);
        (ro["E: Value"] == myLevel.E ? myAction.successE = true : myAction.successE = false);
        (ro["R: Value"] == myLevel.R0 ? myAction.successR = true : myAction.successR = false);
        myAction.varRefs = [];
        myAction.varRefs.push(getVarRefs(myAction, myAction.ESubmitValue));
        myAction.varRefs.push(getVarRefs(myAction, myAction.RSubmitValue));
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction); myAction.R[0] = myAction.level.R[0];
    }
}

function addAttachProbe(ro) {
    var myAction = addAction(ro, "attach-probe");
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    if (ro["time"] == 1488326309) {
        console.log("Check");
    }
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        myAction.probeColor = ro["color"];
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over an attach probe action at . " + myAction.time);
    }
}

function addDetachProbe(ro, i) {
    var myAction = addAction(ro, "detach-probe");
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        myAction.probeColor = ro["color"];
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a detach probe action at . " + myAction.time);
    }
}

function addMovedDial(ro, i) {
    var myAction = addAction(ro, "move-dial");
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    if (!(duplicate(myAction))) {
        myAction.dialPosition = ro["value"];
        keepLevelValues(myAction);
        myAction.level.actions.push(myAction);
    }
}
    
function keepLevelValues(myAction) {
    myLevel = myAction.level;
    myAction.E = myLevel.E;
    myAction.R0 = myLevel.R0;
    for (var i = 0; i < 3; i++){
        myAction.R[i] = myLevel.R[i];
        myAction.V[i] = myLevel.V[i];
        myAction.goalR[i] = myLevel.goalR[i];
        myAction.goalV[i] = myLevel.goalV[i];
    }
}