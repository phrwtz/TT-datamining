function generateReport(teams) {
    //    document.getElementByID("data").innerHTML = ""; //Clear the screen
    reportResults(teams);
    reportSummary(teams);
    reportActions(teams);
    teacherReport(teams);
    reportVarRefs(teams);
}

function findSummaryData(myLevel) { //Runs through all the actions in myLevel collecting summary data
    // Set up variables
    var acts = myLevel.actions;
    var team = myLevel.team;
    var levelTime = Math.round(myLevel.endUTime - myLevel.lastJoinedUTime);
    var levelMinutes = Math.round(levelTime / 60);
    var levelSeconds = levelTime % 60;
    if (levelSeconds < 10) {
        levelSeconds = "0" + levelSeconds;
    }
    var myDate = myLevel.startPTime;
    var levelDate = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear();

    var messagesBeforeVsCount = [0, 0, 0],
        messagesBeforeVsTotal = 0,
        messagesAfterVsCount = [0, 0, 0],
        messagesAfterVsTotal = 0,
        messagesWithoutVsCount = [0, 0, 0],
        messagesWithoutVsTotal = 0,
        calculationsBeforeVsCount = [0, 0, 0],
        calculationsBeforeVsTotal = 0,
        calculationsAfterVsCount = [0, 0, 0],
        calculationsAfterVsTotal = [0],
        calculationsWithoutVsCount = [0, 0, 0],
        calculationsWithoutVsTotal = 0,
        resistorChangesBeforeVsCount = [0, 0, 0],
        resistorChangesBeforeVsTotal = 0,
        resistorChangesAfterVsCount = [0, 0, 0],
        resistorChangesAfterVsTotal = 0,
        resistorChangesWithoutVsCount = [0, 0, 0],
        resistorChangesWithoutVsTotal = 0,
        sumResistorDistancesFromGoal = [0, 0, 0],
        totalResistanceChanges = [0, 0, 0],
        averageResistanceDistances = [0, 0, 0],
        joinedGroupCount = 0,
        levelVMsg = "";
    myLevel.errorMsg = ""; //This one is added to the level so that we can report it in the level row.
    // Run through actions compiling level summary data  
    for (var ii = 0; ii < acts.length; ii++) {
        thisAction = acts[ii];
        index = thisAction.actor.colIndex;
        switch (thisAction.type) {
            //Count messages before and after voltage attained success (if any)
            case "message":
                if (myLevel.attainedVs) {
                    if (thisAction.eTime <= myLevel.attainedVsTime) {
                        messagesBeforeVsCount[index]++;
                        messagesBeforeVsTotal++;
                    } else {
                        messagesAfterVsCount[index]++;
                        messagesAfterVsTotal++;
                    }
                } else {
                    messagesWithoutVsCount[index]++;
                    messagesWithoutVsTotal++;
                }
                break;
                //Same for calculations and resistor changes
            case "calculation":
                if (myLevel.attainedVs) {
                    if (thisAction.eTime <= myLevel.attainedVsTime) {
                        calculationsBeforeVsCount[index]++;
                        calculationsBeforeVsTotal++;
                    } else {
                        calculationsAfterVsCount[index]++;
                        calculationsAfterVsTotal++;
                    }
                } else {
                    calculationsWithoutVsCount[index]++;
                    calculationsWithoutVsTotal++;
                }
                break;

            case "resistorChange":
                if (myLevel.attainedVs) {
                    if (thisAction.eTime <= myLevel.attainedVsTime) {
                        resistorChangesBeforeVsCount[index]++;
                        totalResistanceChanges[index]++;
                        resistorChangesBeforeVsTotal++;
                        sumResistorDistancesFromGoal[index] += thisAction.resDist;
                    } else {
                        resistorChangesAfterVsCount[index]++;
                        totalResistanceChanges[index]++;
                        resistorChangesAfterVsTotal++;
                        sumResistorDistancesFromGoal[index] += thisAction.resDist;
                    }
                } else {
                    resistorChangesWithoutVsCount[index]++;
                    totalResistanceChanges[index]++;
                    resistorChangesWithoutVsTotal++;
                    sumResistorDistancesFromGoal[index] += thisAction.resDist;
                }
                break;

            case "joined-group":
                joinedGroupCount++;
                break;
        } //End of switch body
    } //Next action

    for (var u = 0; u < 3; u++) {
        averageResistanceDistances[u] = Math.round(10 * sumResistorDistancesFromGoal[u] / totalResistanceChanges[u]) / 10;
        totalAverageResDist = Math.round(10 * (sumResistorDistancesFromGoal[0] + sumResistorDistancesFromGoal[1] + sumResistorDistancesFromGoal[2]) / (totalResistanceChanges[0] + totalResistanceChanges[1] + totalResistanceChanges[2])) / 10;
    }

    //Tag levels with technical problems by creating an error message
    if (joinedGroupCount > 3) {
        myLevel.errorMsg += "<b><font color=red>Error! More than three joined-group actions! (Note: this may not be a problem.)</font></b><br>"
    }

    if (joinedGroupCount < 3) {
        myLevel.errorMsg += "<b><font color=red>Error! Fewer than three joined-group actions! Duration may be incorrectly reported.</font></b><br>"
    }

    if (myLevel.levelValuesChanged) {
        myLevel.errorMsg += "<b><font color=red>  Error! Level values Changed! Check activity-settings actions.</font></b><br>"
    }
    //Create summary messages for this level
    if (myLevel.success) {
        levelVMsg = "Goal voltages correctly reported at " + myLevel.VSuccessTime + "."
    } else {
        levelVMsg = "Goal voltages not reported correctly."
    };
    var levelEMsg = (myLevel.successE ? " E correctly reported." : " E not reported correctly.");
    var levelRMsg = (myLevel.successR ? " R0 correctly reported." : " R0 not reported correctly.");
    var levelMsg = "",
        goalVMsg,
        goalV1Communicated = false,
        goalV2Communicated = false,
        goalV3Communicated = false;
    if (myLevel.movedAwayFromVs) {
        goalVMsg = "Attained goal voltages at " + myLevel.attainedVseMinSecs + " and then moved away at " + myLevel.movedAwayFromVsMinSecs + ". ";
    } else if (myLevel.attainedVs) {
        goalVMsg = "Attained correct goal voltages at " + myLevel.attainedVseMinSecs + ". "
    } else {
        goalVMsg = "Never attained goal voltages. "
    }
    if ((myLevel.label == "A") || (myLevel.label == "B")) {
        levelMsg = levelVMsg;
    }
    if (myLevel.label == "C") {
        levelMsg = levelVMsg + levelEMsg;
    }
    if (myLevel.label == "D") {
        levelMsg = levelVMsg + levelEMsg + levelRMsg;
    }
    for (var i = 0; i < myLevel.varRefs["goalV1"].length; i++) {
        if (myLevel.varRefs["goalV1"][i][0].type == "message") {
            goalV1Communicated = true;
            break;
        }
    }
    for (i = 0; i < myLevel.varRefs["goalV2"].length; i++) {
        if (myLevel.varRefs["goalV2"][i][0].type == "message") {
            goalV2Communicated = true;
            break;
        }
    }

    for (i = 0; i < myLevel.varRefs["goalV3"].length; i++) {
        if (myLevel.varRefs["goalV3"][i][0].type == "message") {
            goalV3Communicated = true;
            break;
        }
    }
    if ((goalV1Communicated) && (goalV2Communicated) && (goalV3Communicated)) {
        goalVMsg += " Goal voltages chatted. ";
    } else {
        goalVMsg += "Goal voltages not chatted. ";
    }

    // Print summary

    document.getElementById("data").innerHTML += ("<br><br><mark>Team " +
        team.name + ", level " + myLevel.label + "</mark>, start time: " + myLevel.startPTime + ", last member joined at " + myLevel.lastJoinedTime + ", duration: " + levelMinutes + ":" + levelSeconds + "<br>" + goalVMsg + levelMsg + "<br>");

    if (myLevel.errorMsg != "") {
        document.getElementById("data").innerHTML += (myLevel.errorMsg);
    }

    document.getElementById("data").innerHTML += "Average resistor distances from goal = " + averageResistanceDistances[0] + ", " + averageResistanceDistances[1] + ", " + averageResistanceDistances[2] + ". <span style = \"color:#FF0000;\"><b>Team average = " + totalAverageResDist + "</b></span><br>";

    if (myLevel.attainedVs) {
        document.getElementById("data").innerHTML += "<br><span style=\"color:#0000FF;\">Resistor changes performed before voltages attained:: </span>" + resistorChangesBeforeVsCount[0] + " + " + resistorChangesBeforeVsCount[1] + " + " + resistorChangesBeforeVsCount[2] + " = " + resistorChangesBeforeVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#FF0000;\">Messages sent before voltages attained: </span>" + messagesBeforeVsCount[0] + " + " + messagesBeforeVsCount[1] + " + " + messagesBeforeVsCount[2] + " = " + messagesBeforeVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#00DD00;\">Calculations performed before voltages attained:: </span>" + calculationsBeforeVsCount[0] + " + " + calculationsBeforeVsCount[1] + " + " + calculationsBeforeVsCount[2] + " = " + calculationsBeforeVsTotal + "<br><br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#0000FF;\">Resistor changes after voltages attained:: </span>" + resistorChangesAfterVsCount[0] + " + " + resistorChangesAfterVsCount[1] + " + " + resistorChangesAfterVsCount[2] + " = " + resistorChangesAfterVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#FF0000;\">Messages sent after voltages attained: </span>" + messagesAfterVsCount[0] + " + " + messagesAfterVsCount[1] + " + " + messagesAfterVsCount[2] + " = " + messagesAfterVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#00DD00;\">Calculations performed after voltages attained:: </span>" + calculationsAfterVsCount[0] + " + " + calculationsAfterVsCount[1] + " + " + calculationsAfterVsCount[2] + " = " + calculationsAfterVsTotal + "<br>";
    } else {
        document.getElementById("data").innerHTML += "<br><span style=\"color:#FF0000;\">Resistor changes: </span>" + resistorChangesWithoutVsCount[0] + " + " + resistorChangesWithoutVsCount[1] + " + " + resistorChangesWithoutVsCount[2] + " = " + resistorChangesWithoutVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#FF0000;\">Messages sent: </span>" + messagesWithoutVsCount[0] + " + " + messagesWithoutVsCount[1] + " + " + messagesWithoutVsCount[2] + " = " + messagesWithoutVsTotal + "<br>";

        document.getElementById("data").innerHTML += "<span style=\"color:#FF0000;\">Calculations: </span>" + calculationsWithoutVsCount[0] + " + " + calculationsWithoutVsCount[1] + " + " + calculationsWithoutVsCount[2] + " = " + calculationsWithoutVsTotal + "<br><br>";
    }

} // End of findSummaryData function

function reportResults(teams) { // extract and list actions checked by user
    document.getElementById("data").innerHTML = ""; //Clear data
    clearReport();
    setUpActionsReport();
    for (var k = 0; k < teams.length; k++) { // for each team
        var team = teams[k];
        if ($("#team-" + team.name + team.classID)[0].checked) {
            mssg = "report-tools: analyzing actions for " + team.name + "...";
            console.log(mssg);
            for (var j = 0; j < team.levels.length; j++) {
                var myLevel = team.levels[j];
                if ($("#level-" + myLevel.label)[0].checked) { // create summary for each level
                    findSummaryData(myLevel);
                    addLevelRow(team, myLevel);
                    var acts = myLevel.actions;
                    //Now run through the actions a second time, publishing each in a separate row if it has been selected
                    for (var i = 0; i < acts.length; i++) {
                        var act = acts[i],
                            content = "",
                            bd = act.board + 1,
                            actor = act.actor,
                            styledName = actor.styledName,
                            currentMsg = (act.currentFlowing ? ". Current is flowing. " : ". Current is not flowing."),
                            preTime, //Used to decide when to insert a horizontal line in the output
                            uTime = act.uTime,
                            eTime = Math.round((act.uTime - myLevel.startUTime) * 10) / 10, //Elapsed time since start of level
                            interval = 45; //Maximum interval between logged actions for considering them linked.
                        switch (act.type) {
                            case "submitClicked":
                                if ($("#action-submit-V")[0].checked) {
                                    reportSubmitVoltages(act);
                                }
                                break;

                            case "submitER":
                                if ($("#action-submit-ER")[0].checked) {
                                    reportSubmitER(act);
                                }
                                break;

                            case "resistorChange":
                                if ($("#action-resistorChange")[0].checked) {
                                    reportResistorChange(act);
                                }
                                break;

                            case "message":
                                if ($("#action-message")[0].checked) {
                                    reportMessage(act);
                                }
                                break;

                            case "calculation":
                                if ($("#action-calculation")[0].checked) {
                                    reportCalculation(act);
                                }
                                break;

                            case "attach-probe":
                                if ($("#action-attach-probe")[0].checked) {
                                    reportAttachProbe(act);
                                }
                                break;

                            case "detach-probe":
                                if ($("#action-detach-probe")[0].checked) {
                                    reportDetachProbe(act);
                                }
                                break;

                            case "connect-lead":
                                if ($("#action-connect-lead")[0].checked) {
                                    reportConnectLead(act);
                                }
                                break;

                            case "disconnect-lead":
                                if ($("#action-disconnect-lead")[0].checked) {
                                    reportDisconnectLead(act);
                                }
                                break;

                            case "joined-group":
                                if ($("#action-joined-group")[0].checked) {
                                    reportJoinedGroup(act);
                                }
                                break;

                            case "opened-zoom":
                                if ($("#action-opened-zoom")[0].checked) {
                                    reportOpenedZoom(act);
                                }
                                break;

                            case "closed-zoom":
                                if ($("#action-closed-zoom")[0].checked) {
                                    reportClosedZoom(act);
                                }
                                break;

                            case "measurement":
                                if ($("#action-measurement")[0].checked) {
                                    reportMeasurement(act);
                                }
                                break;

                            case "move-dial":
                                if ($("#action-move-DMM-dial")[0].checked) {
                                    reportMovedDial(act);
                                }
                                break;

                            case "activity-settings":
                                if ($("#action-activity-settings")[0].checked) {
                                    reportActivitySettings(act);
                                }
                                break;
                        } //End of switch block
                    } //Next action
                } //End of level checkbox checked
            } //Next level
        } //End of team checkbox checked
    } // Next team
} // End of function

function reportVarRefs(teams) {
    var team,
        level,
        varRefs,
        vrArray,
        vr,
        act,
        vrStr,
        vrNum,
        oMsg,
        vrScore;

    for (var k = 0; k < teams.length; k++) {
        team = teams[k];
        if ($("#team-" + team.name + team.classID)[0].checked) {
            for (var j = 0; j < team.levels.length; j++) {
                myLevel = team.levels[j];
                if ($("#level-" + myLevel.label)[0].checked) {
                    document.getElementById("data").innerHTML += ("<br><mark>Variable references for team " + team.name + ", level " + myLevel.label + ":</mark><br>");
                    varRefs = myLevel.varRefs;
                    varRefCount = 0;
                    for (var i = 0; i < vrLabelsArray.length; i++) {
                        vrStr = vrLabelsArray[i];
                        try {
                            if ($("#varRef-" + vrStr)[0].checked) {
                                document.getElementById("data").innerHTML += ("<br>");
                                vrArray = varRefs[vrStr]; //contains all the varRefs of type vrStr;
                                for (var ii = 0; ii < vrArray.length; ii++) {
                                    vr = vrArray[ii];
                                    act = vr[0];
                                    o = ""; // String used to return other matching varRefs
                                    vrNum = vr[2];
                                    vrScore = vr[3];
                                    var t = act.type;
                                    var bd = parseInt(act.board) + 1;
                                    oMsg = ""
                                    switch (t) {
                                        case "message":
                                            t = "<span style=\"color:#FF0000;\">message</span>";
                                            o = findOtherVariables(vr);
                                            break;
                                        case "calculation":
                                            t = "<span style=\"color:#FF00FF;\">calculation</span>";
                                            o = findOtherVariables(vr);
                                            break;
                                        case "measurement":
                                            t = "<span style=\"color:#0000FF;\">measurement</span>";
                                            o = findOtherVariables(vr);
                                            break;
                                        case "submitClicked":
                                            t = "<span style=\"color:#00AAAA;\"></span>";
                                            o = findOtherVariables(vr);
                                            break;
                                        case "submitER":
                                            t = "<span style=\"color:#00AAAA;\">submitER</span>";
                                            o = findOtherVariables(vr);
                                            break;
                                    }
                                    if (o.length == 0) {
                                        oMsg = ". No other references.";
                                    } else if (o.length == 1) {
                                        oMsg = ". One other reference: " + o[0];
                                    } else {
                                        oMsg += ". Other references: " + o[0];
                                        for (var jj = 1; jj < o.length; jj++) {
                                            oMsg += ", " + o[jj];
                                        }
                                    }
                                    document.getElementById("data").innerHTML += ("Variable " + vrStr + " found at " + act.eMinSecs +
                                        " seconds in a " + t + " by " + act.actor.styledName + ", board " + bd + oMsg + "<br>");
                                    varRefCount++;
                                }
                            }
                        } catch (err) {
                            console.log(err + " in variable references report, vrStr = " + vrStr)
                        }
                    }
                    console.log("report-tools: variable references report generated with " + varRefCount + " lines");
                }
            }
        }
    }
}

function variableInVarRef(vrStr, vrArray) { //Looks for the vrStr in vrArray. Returns true if found.
    for (var i = 0; i < vrArray.length; i++) {
        if (vrArray[i][0][1] == vrStr) {
            return true;
        }
    }
    return false;
}

function findOtherVariables(vr) { // Returns a string containing all the variable names that could have applied to the varRef vr (in other words, other variables that also matched the value field of vr)
    var otherStrs = [], //Array to be filled with the ambiguous variable names, if any
        theseVarRefs = [],
        thisAction = {},
        thisStr = "",
        thisVal = "",
        compareStr = "",
        compareVal = "";
    thisAction = vr[0]; //The action that is associated with the varRef we are examining
    theseVarRefs = thisAction.varRefs //Array of all the varRefs associated with thisAction.
    thisStr = vr[1]; //Variable name of the varRef we are examining
    thisVal = vr[2]; //Value of the varRef we are examining
    //We are interested in variables associated with this action that have the same values as the variable of the varRef we are examining. These are the ambiguous variables
    for (var i = 0; i < theseVarRefs.length; i++) {
        thisVarRef = theseVarRefs[i]; //An array of references, one for each variable that matched the value
        for (var j = 0; j < thisVarRef.length; j++) {
            thisReference = thisVarRef[j]; //each reference is a four-dimensional array consisting of the action that generated gthe match, a string represeting the variable that was matched, the number that was matched, and a score corresponding to that variable. All the references in thisVarRef will have the same action and number,but different strings and scores.
            compareStr = thisReference[1];
            compareVal = thisReference[2];
            if ((compareStr !== thisStr) && (compareVal === thisVal)) {
                otherStrs.push(compareStr);
            }
        }
    }
    return otherStrs;
}

//Reports on total number of resistor changes in each category for each team member, per level.
function reportSummary(teams) {
    var count = {};
    if ($("#summary-resistor-change")[0].checked) {
        for (var k = 0; k < teams.length; k++) {
            var team = teams[k];
            if ($("#team-" + team.name + team.classID)[0].checked) {
                count[team.name] = {};
                for (var j = 0; j < team.levels.length; j++) {
                    var myLevel = team.levels[j];
                    if ($("#level-" + myLevel.label)[0].checked) {
                        count[team.name][myLevel.label] = {};
                        var acts = myLevel.actions;
                        for (var i = 0; i < team.members.length; i++) {
                            var member = team.members[i];
                            count[team.name][myLevel.label][member.name] = {};
                            count[team.name][myLevel.label][member.name].achieved = 0;
                            count[team.name][myLevel.label][member.name].overshot = 0;
                            count[team.name][myLevel.label][member.name].undershot = 0;
                            count[team.name][myLevel.label][member.name].closer = 0;
                            count[team.name][myLevel.label][member.name].farther = 0;;
                            count[team.name][myLevel.label][member.name].total = 0;
                        } //clear all the counts for all members for this level
                        for (var ii = 0; ii < acts.length; ii++) {
                            act = acts[ii];
                            if (act.type == "resistorChange") {
                                member = act.actor;
                                switch (act.goalMsg) {
                                    case ". Local goal met":
                                        count[team.name][myLevel.label][member.name].achieved += 1;
                                        count[team.name][myLevel.label][member.name].total += 1;
                                        break;
                                    case ". Goal overshot":
                                        count[team.name][myLevel.label][member.name].overshot += 1;
                                        count[team.name][myLevel.label][member.name].total += 1;
                                        break;
                                    case ". Goal undershot":
                                        count[team.name][myLevel.label][member.name].undershot += 1;
                                        count[team.name][myLevel.label][member.name].total += 1;
                                        break;
                                    case ". Goal closer":
                                        count[team.name][myLevel.label][member.name].closer += 1;
                                        count[team.name][myLevel.label][member.name].total += 1;
                                        break;
                                    case ". Goal farther":
                                        count[team.name][myLevel.label][member.name].farther += 1;
                                        count[team.name][myLevel.label][member.name].total += 1;
                                        break;
                                } //end of goalMsg switch
                            } //end of resistor change
                        } //end of actions
                    } //end of level check
                } //end of levels loop
            } //end of team check
        } //end of team loop
        document.getElementById("data").innerHTML += ('<mark> <br> <tr> <td colspan = "4" align = "center" > Summary Resistor Change Report </td> </tr></mark>');
        for (var kk = 0; kk < teams.length; kk++) {
            team = teams[kk];
            if ($("#team-" + team.name + team.classID)[0].checked) {
                document.getElementById("data").innerHTML += ("<br><br>");
                for (var j = 0; j < team.levels.length; j++) {
                    myLevel = team.levels[j];
                    if ($("#level-" + myLevel.label)[0].checked) {
                        document.getElementById("data").innerHTML += ("<br>");
                        for (var i = 0; i < team.members.length; i++) {
                            member = team.members[i];
                            var ach = count[team.name][myLevel.label][member.name].achieved;
                            var clo = count[team.name][myLevel.label][member.name].closer;
                            var und = count[team.name][myLevel.label][member.name].undershot;
                            var ove = count[team.name][myLevel.label][member.name].overshot;
                            var far = count[team.name][myLevel.label][member.name].farther;
                            var tot = count[team.name][myLevel.label][member.name].total;
                            var score = (tot ? Math.round(100 * ((tot - far) / tot)) : 0) / 100;
                            document.getElementById("data").innerHTML += ("Team: " + team.name +
                                ", level " + myLevel.label +
                                ", member " + member.styledName + ": local goal met = " + ach +
                                ", overshot = " + ove + ", undershot = " + und + ", closer = " +
                                clo + ", farther = " + far + ", total = " + tot + ", score = " +
                                score + "<br>");
                        }
                    }
                }
                mssg = "report-tools: resistor-change summaries for " + team.name;
                console.log(mssg);
            }
        }
    }
}




//Identifies instances of "voltage regulator behavior" by looking for pairs of resistor changes where
//(a) the actor for the second is not the same as the actor for the first
//(b) the first moved the voltage of the second actor away from the goal
//(c) the second moves the voltage closer to the goal or overshoots, and
//(d) the second follows the first by no more than <timeInterval> seconds
//if additional resistor changes occur within the same <timeInterval> by the second player
//and are goal seeking, they are to be added to the voltage regulator transaction.
//Returns the array of resistorChange actions that belong to the transaction.
// function reportVoltageRegulator(teams) {
//     var previousActions = [];
//     if ($("#voltage-regulator")[0].checked) {
//         for (var k = 0; k < teams.length; k++) {
//             var team = teams[k];
//             if ($("#team-" + team.name)[0].checked) {
//                 for (var j = 0; j < team.levels.length; j++) {
//                     level = team.levels[j];
//                     if ($("#level-" + myLevel.label)[0].checked) {
//                         for (i = 0; i < myLevel.actions.length; i++) {
//                             act = myLevel.actions[i];
//                             if (act.type = "resistorChange") {
//                                 for (var j = 0; j < previousActions.length; j++) {
//                                     preAct = previousActions[j];
//                                     if (act.uTime - preAct.uTime < interval) {
//                                         previousActions.splice(j, 1); //If the j'th element in the array is too old, get rid ot it.
//                                     } else {
//                                         var board = act.board;
//                                         var preBoard = preAct.board;
//                                         bdDiff = (board - preBoard) % 3;
//                                         if (bdDiff != 0) { //If the two resistor changes were by different boards
//                                             var preGoalMsg = (bdDiff = 1 ? preAct.goalAMsg : preAct.goalBMsg);
//                                             if ((preGoalMsg == ". Goal farther") && (act.goalMsg = ". Goal closer")) {
//                                                 console.log("Voltage regulator activity identified!");
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }

function reportActions(teams, type) {
    if ($("#summary-action-scores")[0].checked) {
        myDate = teams[0].levels[0].startPTime;
        levelDate = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear();
        var count = 0;
        for (var j = 0; j < teams.length; j++) {
            var team = teams[j];
            if (team.members.length == 3) {
                levelsArray = []; //An array of numMsgs, totalScores and averageScores by level
                for (var i = 0; i < team.levels.length; i++) {
                    level = team.levels[i];
                    levelsArray[i] = scoreActions(level);
                }
                var arrTotal = [];
                var arrNumber = [];
                var arrAvg = [];
                scoreTable = makeTeamTable(team, "Total message score", levelsArray, "Total", arrTotal);
                numberTable = makeTeamTable(team, "Number of messages", levelsArray, "Number", arrNumber);
                averageTable = makeTeamTable(team, "Average message score", levelsArray, "Average", arrAvg);
                for (var i = 0; i < 3; i++) { // push csv data for each player on this team
                    count += arrNumber[i];
                    // Teacher / Date / Team / Level / Time / Action / Actor / Total Mssg Score / Number Mssgs / Avg Mssg Score
                    newRow = [team.teacherName, levelDate, team.name, , , "MssgScores", team.members[i].name,
                        arrTotal[i], arrNumber[i], arrAvg[i]
                    ];
                    csvSummaryArray.push(newRow);
                }
                var tableSummary = document.createElement("div");
                tableSummary.className = "tableSummary";
                document.body.appendChild(tableSummary);
                tableSummary.appendChild(scoreTable);
                tableSummary.appendChild(numberTable);
                tableSummary.appendChild(averageTable);
            }
        }
        mssg = "report-tools: " + count + " messages scored";
        console.log(mssg);
    }
}

function teacherReport(teams) {
    var reportRequested = false;
    //check to see whether at least one teacher report is asked for
    for (var k = 0; k < teachers.length; k++) {
        var teacher = teachers[k];
        if ($("#report-" + teacher)[0].checked) {
            reportRequested = true;
        }
    }
    if (!reportRequested) { // clear the report
        if (document.getElementById("tableDiv")) { // empty the tableDiv (if it exists)
            var tableDiv = document.getElementById("tableDiv");
            while (tableDiv.firstChild) {
                tableDiv.removeChild(tableDiv.firstChild);
            }
        }
    }
    if (reportRequested) { // generate a report
        if (document.getElementById("tableDiv")) { // empty the tableDiv (if it exists)
            var tableDiv = document.getElementById("tableDiv");
            while (tableDiv.firstChild) {
                tableDiv.removeChild(tableDiv.firstChild);
            }
        } else { //if it doesn't, create one.
            var tableDiv = document.createElement("div");
            tableDiv.id = "tableDiv";
            document.body.appendChild(tableDiv);
        }
        //run through the array again, reporting on each teacher
        for (var kk = 0; kk < teachers.length; kk++) {
            teacher = teachers[kk];
            if ($("#report-" + teacher)[0].checked) {
                //create a table for this teacher
                var table = document.createElement("table");
                table.className = "tableTeacher";
                tableDiv.appendChild(table);
                var titleRow = document.createElement("tr"); // row 1: table title
                table.appendChild(titleRow);
                var titleCell = document.createElement("th");
                titleCell.setAttribute("colspan", 5);
                titleRow.appendChild(titleCell);
                var headerRow = document.createElement("tr"); // row 2: column headings
                table.appendChild(headerRow);
                var headerCells = [];
                for (var i = 0; i < 5; i++) {
                    headerCells[i] = document.createElement("th");
                    headerRow.appendChild(headerCells[i]);
                }
                headerCells[0].innerHTML = "Team";
                headerCells[1].innerHTML = "Level A";
                headerCells[2].innerHTML = "Level B";
                headerCells[3].innerHTML = "Level C";
                headerCells[4].innerHTML = "Level D";


                var dataRows = []; //rows that will contain a team name and level data
                var dataCells = []; //cells that contain the team name and level data
                for (var i = 0; i < teams.length; i++) {
                    myTeam = teams[i];
                    if (myTeam.teacherName == teacher) {
                        titleCell.innerHTML = myTeam.teacherName + ", " + myTeam.class + ": Results by team and level";
                        if (myTeam.members.length == 3) { // Only report teams having three members
                            dataRows[i] = document.createElement("tr"); // row i+2: team, levels a, b, c, d
                            table.appendChild(dataRows[i]);
                            dataCells[i] = [];
                            dataCells[i][0] = document.createElement("td");
                            if (myTeam.members[0].studentName != "N/A") {
                                dataCells[i][0].innerHTML = "<b>" + myTeam.name + "</b><br>" +
                                    myTeam.members[0].studentName + "<br>" + myTeam.members[1].studentName + "<br>" +
                                    myTeam.members[2].studentName;
                            } else {
                                dataCells[i][0].innerHTML = "<b>" + myTeam.name + "</b><br>" +
                                    myTeam.members[0].name + "<br>" + myTeam.members[1].name + "<br>" +
                                    myTeam.members[2].name;
                            }
                            dataRows[i].appendChild(dataCells[i][0]);
                            for (var j = 1; j < 5; j++) {
                                dataCells[i][j] = document.createElement("td");
                                dataCells[i][j].innerHTML = "Not attempted";
                                dataRows[i].appendChild(dataCells[i][j]);
                            }
                            var myTeamTotalTime = 0;
                            for (var j = 0; j < myTeam.levels.length; j++) {
                                myLevel = myTeam.levels[j];
                                var levelTime = Math.round(myLevel.endUTime - myLevel.lastJoinedUTime);
                                var levelMinutes = Math.round(levelTime / 60);
                                var levelSeconds = levelTime % 60;
                                myTeamTotalTime += levelTime;
                                var levelMsg = (myLevel.success ?
                                    "<br><font color=green>Goal voltages attained.</font>" :
                                    "<br><font color=red>Goal voltages not attained.</font>");
                                var levelEMsg = (myLevel.successE ?
                                    "<br><font color=green>E correctly reported.</font>" :
                                    "<br><font color=red>E not reported correctly.</font>");
                                var levelRMsg = (myLevel.successR ?
                                    "<br><font color=green>R0 correctly reported.</font>" :
                                    "<br><font color=red>R0 not reported correctly.</font>");
                                var successMsg;
                                var cellContents = "Duration: " + levelMinutes + ":" + levelSeconds;
                                cellContents += levelMsg;
                                if ((myLevel.label == "A") || myLevel.label == "B") {
                                    successMsg = (myLevel.success ?
                                        "<br><b><font color=green>Level successful.</font></b>" :
                                        "<br><b><font color=red>Level unsuccessful.</font></b>");
                                }
                                if (myLevel.label == "C") {
                                    cellContents += levelEMsg;
                                    successMsg = ((myLevel.success && myLevel.successE) ?
                                        "<br><b><font color=green>Level successful.</font></b>" :
                                        "<br><b><font color=red>Level unsuccessful.</font></b>");
                                }
                                if (myLevel.label == "D") {
                                    cellContents += levelEMsg + levelRMsg;
                                    successMsg = ((myLevel.success && myLevel.successE && myLevel.successR) ?
                                        "<br><b><font color=green>Level successful.</font></b>" :
                                        "<br><b><font color=red>Level unsuccessful.</font></b>");
                                }
                                cellContents += successMsg;
                                dataCells[i][j + 1].innerHTML = cellContents;
                            }
                            maxLevel = "None";
                            for (var j = 0; j < myTeam.levels.length; j++) {
                                myLevel = myTeam.levels[j];
                                if (myLevel.label == "A" && myLevel.success) {
                                    maxLevel = "A";
                                }
                                if (myLevel.label == "B" && myLevel.success) {
                                    maxLevel = "B";
                                }
                                if (myLevel.label == "C" && myLevel.success && myLevel.successE) {
                                    maxLevel = "C";
                                }
                                if (myLevel.label == "D" && myLevel.success && myLevel.successE && myLevel.successR) {
                                    maxLevel = "D";
                                }
                            }
                            myDate = myLevel.startPTime
                            levelDate = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear();
                            // Teacher / Date / Team / Level / Time / Action / Actor / Total Mssg Score / Number Mssgs / Avg Mssg Score
                            newRow = [myTeam.teacherName, levelDate, myTeam.name, maxLevel, Math.round(myTeamTotalTime / 6) / 10, "MaxLevel"];
                            csvSummaryArray.push(newRow);

                        }
                    }
                }
            }
        }
        mssg = "report-tools: teacher report for " + teacher;
        console.log(mssg);
    }
}

function makeSummaryArray(teams) {
    var summaryArray = ["Team", "Teacher", "Level A", "Level B", "Level C", "Level D"]

    for (var i = 0; i < teams.length; i++) {
        myTeam = teams[i]
        myTeacher = myTeam.teacher;
        var summaryRow = [myTeam.name, myTeacher];
        myLevel = myTeam.levels[0];
        for (var j = 0; j < 4; j++) {
            if (!myTeam.levels[j]) {
                summaryRow.push("not attempted");
            } else if (!myTeam.levels[j].success) {
                summaryRow.push("unsuccessful");
            } else {
                summaryRow.push("successful");
            }
        }
        summaryRow.push("/n");
        summaryArray.push(summaryRow);
    }
    downloadSummaryCSV(summaryArray);
    mssg = "report-tools: makeSummaryArray for " + i + " teams";
    console.log(mssg);
}