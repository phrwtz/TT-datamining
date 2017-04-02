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
        //        console.log("No level found in add action. Team = " + myTeam.name + ", level number = " + number);
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
    myAction.type = type;
    myAction.team = myTeam;
    myAction.level = myLevel;
    myAction.actor = myMember;
    myAction.uTime = ro["time"];
    //    myAction.pTime = unixTimeConversion(myAction.uTime);
    myAction.board = parseInt(ro["board"]);
    myAction.index = myLevel.actions.length; //The length of the array before the action is pushed. (The index of the action
    //if it is pushed will equal this.)
    myAction.id = myMember.id;
    myAction.currentFlowing = (ro["currentFlowing"] == "TRUE" ? true : false);
    myAction.R = [parseInt(ro["r1"]), parseInt(ro["r2"]), parseInt(ro["r3"])];
    var Rtot = myLevel.R0 + myAction.R[0] + myAction.R[1] + myAction.R[2];
    myAction.V = [Math.round(((myLevel.E * myAction.R[0]) / Rtot) * 100) / 100,
        Math.round(((myLevel.E * myAction.R[1]) / Rtot) * 100) / 100,
        Math.round(((myLevel.E * myAction.R[2]) / Rtot) * 100) / 100
    ];
    myLevel.endUTime = myAction.uTime;
    return myAction;
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
        checkbackLength = Math.min(actions.length, 3);
    for (var i = 1; i < checkbackLength; i++) { //check three actions back
        //or fewer if there aren't many actions on the stack
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

function addJoinedGroup(ro) {
    var myAction = addAction(ro, "joined-group");
    if (!(duplicate(myAction))) {
        myAction.level.actions.push(myAction);
    }
}

function addConnectLead(ro) {
    var myAction = addAction(ro, "connect-lead");
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a connect lead action at . " + myAction.time);
    }
}

function addDisconnectLead(ro) {
    var myAction = addAction(ro, "disconnect-lead");
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
        myAction.level.actions.push(myAction);
    }
}

function addRChange(ro) {
    var myAction = addAction(ro, "resistorChange");
    if (myAction) {
        var myLevel = myAction.level,
            bd = myAction.board,
            bdA = (bd + 1) % 3,
            bdB = (bd + 2) % 3;
        myAction.oldR = myLevel.R;
        myAction.oldV = myLevel.V;
        if (!myAction.oldR) {
            console.log("stop");
        }
        //if the new resistor values are all numbers and at least one of them is indeed new
        if ((!(isNaN(myAction.R[0])) && !(isNaN(myAction.R[1])) && !(isNaN(myAction.R[2]))) &&
            ((myAction.R[0] != myAction.oldR[0]) || (myAction.R[1] != myAction.oldR[1]) || (myAction.R[2] != myAction.oldR[2]))) {
            myAction.oldGoalDifference = myAction.oldV[bd] - myLevel.goalV[bd];
            myAction.newGoalDifference = myAction.V[bd] - myLevel.goalV[bd];
            myAction.oldGoalADifference = myAction.oldV[bdA] - myLevel.goalV[bdA];
            myAction.newGoalADifference = myAction.V[bdA] - myLevel.goalV[bdA];
            myAction.oldGoalBDifference = myAction.oldV[bdB] - myLevel.goalV[bdB];
            myAction.newGoalBDifference = myAction.V[bdB] - myLevel.goalV[bdB];
            if (Math.abs(myAction.newGoalDifference) < .01) {
                myAction.goalMsg = ". Local goal met";
            } else if (Math.sign(myAction.oldGoalDifference) != Math.sign(myAction.newGoalDifference) &&
                (myAction.newGoalDifference > 0)) {
                myAction.goalMsg = ". Goal overshot";
            } else if (Math.sign(myAction.oldGoalDifference) != Math.sign(myAction.newGoalDifference) &&
                (myAction.newGoalDifference < 0)) {
                myAction.goalMsg = ". Goal undershot";
            } else if (Math.abs(myAction.newGoalDifference) < Math.abs(myAction.oldGoalDifference)) {
                myAction.goalMsg = ". Goal closer";
            } else if (Math.abs(myAction.newGoalDifference) > Math.abs(myAction.oldGoalDifference)) {
                myAction.goalMsg = ". Goal farther";
            }

            if (Math.abs(myAction.newGoalADifference) < .01) {
                myAction.goalAMsg = ". Local goal met";
            } else if (Math.sign(myAction.oldGoalADifference) != Math.sign(myAction.newGoalADifference) &&
                (myAction.newGoalADifference > 0)) {
                myAction.goalAMsg = ". Goal overshot";
            } else if (Math.sign(myAction.oldGoalADifference) != Math.sign(myAction.newGoalADifference) &&
                (myAction.newGoalADifference < 0)) {
                myAction.goalAMsg = ". Goal undershot";
            } else if (Math.abs(myAction.newGoalADifference) < Math.abs(myAction.oldGoalADifference)) {
                myAction.goalAMsg = ". Goal closer";
            } else if (Math.abs(myAction.newGoalADifference) > Math.abs(myAction.oldGoalADifference)) {
                myAction.goalAMsg = ". Goal farther";
            }

            if (Math.abs(myAction.newGoalBDifference) < .01) {
                myAction.goalBMsg = ". Local goal met";
            } else if (Math.sign(myAction.oldGoalBDifference) != Math.sign(myAction.newGoalBDifference) &&
                (myAction.newGoalBDifference > 0)) {
                myAction.goalBMsg = ". Goal overshot";
            } else if (Math.sign(myAction.oldGoalBDifference) != Math.sign(myAction.newGoalBDifference) &&
                (myAction.newGoalBDifference < 0)) {
                myAction.goalBMsg = ". Goal undershot";
            } else if (Math.abs(myAction.newGoalBDifference) < Math.abs(myAction.oldGoalBDifference)) {
                myAction.goalBMsg = ". Goal closer";
            } else if (Math.abs(myAction.newGoalBDifference) > Math.abs(myAction.oldGoalBDifference)) {
                myAction.goalBMsg = ". Goal farther";
            }
            myLevel.R = myAction.R; // Update level so that we have something to compare to next time around
            myLevel.V = myAction.V;
            myAction.level.actions.push(myAction); //and push the action onto the level
        }
    }
}

function addMessage(ro) {
    var myAction = addAction(ro, "message");
    if (myAction) {
        myAction.msg = ro["event_value"];
        myAction.varRefs = getVarRefs(myAction);
        myAction.score = scoreAction(myAction);
        myAction.highlightedMsg = highlightMessage(myAction);
        myAction.R = myAction.level.R;
        myAction.V = myAction.level.V;
        myAction.level.actions.push(myAction);
    }
}

function addCalculation(ro) {
    var myAction = addAction(ro, "calculation");
    if (myAction) {
        myAction.result = ro["result"];
        myAction.calculation = ro["calculation"];
        myAction.msg = myAction.calculation + " = " + myAction.result;
        myAction.varRefs = getVarRefs(myAction);
        myAction.score = scoreAction(myAction);
        myAction.highlightedMsg = highlightMessage(myAction);
        if (!(duplicate(myAction))) {
            myAction.level.actions.push(myAction);
        }
    }
}

function addSubmit(ro) {
    var myAction = addAction(ro, "submitClicked");
    if (!duplicate(myAction)) {
        myLevel = myAction.level;
        var V1 = myAction.V[0];
        var V2 = myAction.V[1];
        var V3 = myAction.V[2];
        var goalV1 = myLevel.goalV[0];
        var goalV2 = myLevel.goalV[1];
        var goalV3 = myLevel.goalV[2];
        myLevel.success = (Math.abs(V1 - goalV1) + Math.abs(V2 - goalV2) + Math.abs(V3 - goalV3) < .01)
        myAction.level.actions.push(myAction);
    }
}

function addSubmitER(ro) {
    var myAction = addAction(ro, "submitER");
    if (!duplicate(myAction)) {
        myLevel = myAction.level;
        (ro["E: Correct"] == "true" ? myLevel.successE = true : myLevel.successE = false);
        (ro["R: Correct"] == "true" ? myLevel.successR = true : myLevel.successR = false);
    }
}

function addAttachProbe(ro) {
    var myAction = addAction(ro, "attach-probe");
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    if (!(duplicate(myAction))) {
        myAction.location = ro["location"];
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
        myAction.level.actions.push(myAction);
    } else {
        //        console.log("Passed over a detach probe action at . " + myAction.time);
    }
}
