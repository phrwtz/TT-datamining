function generateReport(teams) {
    //    document.getElementByID("data").innerHTML = ""; //Clear the screen
    reportResults(teams);
    console.log("results reported");
    reportSummary(teams);
    console.log("summaries reported");
    reportActions(teams);
    console.log("action report generated");
    teacherReport(teams);
    console.log("teacher report generated");
    //    reportVarRefs(teams);
    //   console.log("variable references report generated");
}

function reportResults(teams) {
    document.getElementById("data").innerHTML = ""; //Clear data
    for (var k = 0; k < teams.length; k++) {
        var team = teams[k];
        if ((team.members.length == 3)) {
            if ($("#team-" + team.name + team.classID)[0].checked) {
                for (var j = 0; j < team.levels.length; j++) {
                    var myLevel = team.levels[j];
                    if ($("#level-" + myLevel.label)[0].checked) {
                        var acts = myLevel.actions;
                        var levelTime = Math.round(myLevel.endUTime - myLevel.startUTime);
                        var levelMinutes = Math.round(levelTime / 60);
                        var levelSeconds = levelTime % 60;
                        if (levelSeconds < 10) {
                            levelSeconds = "0" + levelSeconds;
                        }
                        var levelVMsg = (myLevel.success ? "Goal voltages attained." : "Goal voltages not attained.");
                        var levelEMsg = (myLevel.successE ? " E correctly reported." : " E not reported correctly.");
                        var levelRMsg = (myLevel.successR ? " R0 correctly reported." : " R0 not reported correctly.");
var levelMsg = "";
                        if ((myLevel.label == "A") || (myLevel.label == "B")) {
                            levelMsg = levelVMsg;
                        }
                        if (myLevel.label == "C") {
                            levelMsg = levelVMsg + levelEMsg;
                        }
                        if (myLevel.label == "D") {
                            levelMsg = levelVMsg + levelEMsg + levelRMsg;
                        }
                        document.getElementById("data").innerHTML += "<br>";
                        for (var i = 0; i < acts.length; i++) {
                            var act = acts[i],
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
                                        if (myLevel.label == "B") {
                                            console.log("stop");
                                        }
                                        var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        var V1 = myLevel.E * act.R[0] / Rtot;
                                        var V2 = myLevel.E * act.R[1] / Rtot;
                                        var V3 = myLevel.E * act.R[2] / Rtot;
                                        var success = ((Math.abs(V1 - myLevel.goalV[0]) + Math.abs(V2 - myLevel.goalV[1]) + Math.abs(V3 - myLevel.goalV[2])) < .1)
                                        var successMsg = (success ? " submitted correct voltages." : " submitted incorrect voltages.");
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " +
                                            act.actor.styledName + ", board " + bd + successMsg + "<br>");
                                        document.getElementById("data").innerHTML += ("goalV1 = " + myLevel.goalV[0] + ", goalV2 = " + myLevel.goalV[1] +
                                            ", goalV3 = " + myLevel.goalV[2] + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + "<br>");
                                    }
                                    break;

                                case "submitCorrect":
                                    if ($("#action-submit-V")[0].checked) {
                                        var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + ", submitted correct answers.<br>");
                                        document.getElementById("data").innerHTML += ("R0 = " + myLevel.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("I = " + current + " mA" + currentMsg + "<br><br>");
                                    }
                                    break;

                                case "submitER":
                                    if ($("#action-submit-ER")[0].checked) {
                                        var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        var msg = "";
                                        var Elabel = "incorrect";
                                        var Rlabel = "incorrect";
                                        if ((act.ESubmitValue == myLevel.E) && (act.ESubmitUnit = "volts")) {
                                            Elabel = "correct";
                                        }
                                        if ((act.RSubmitValue == myLevel.R0) && (act.RSubmitUnit = "ohms")) {
                                            Rlabel = "correct";
                                        }
                                        if ((myLevel.label == "C") || (myLevel.label == "D")) {
                                            msg = ", submitted " + Elabel + " value for E (" + act.ESubmitValue + " " + act.ESubmitUnit + ")<br>";
                                        }
                                        if (myLevel.label == "D") {
                                            msg += " and submitted " + Rlabel + " value for R0 (" + act.RSubmitValue + " " + act.RSubmitUnit + ").<br>";
                                        }
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + msg);
                                        document.getElementById("data").innerHTML += ("R0 = " + myLevel.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("I = " + current + " mA" + currentMsg + "<br><br>");
                                    }
                                    break;


                                case "resistorChange":
                                    if ($("#action-resistorChange")[0].checked) {
                                        var Rtot = myLevel.R0 + act.newR[0] + act.newR[1] + act.newR[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("<span style=\"color:#0000FF;\">Resistor change:</span> At " + eTime + " seconds " +
                                            ": " + styledName + " changed R" + (bd) + " from " + act.oldR[bd - 1] +
                                            " to " + act.newR[bd - 1] + ", V" + (bd) + " changed from " + act.oldV[bd - 1] +
                                            " to " + act.newV[bd - 1] + ". (Goal is " + myLevel.goalV[bd - 1] + ")" + act.goalMsg + "<br>");
                                        document.getElementById("data").innerHTML += ("R0 = " + myLevel.R0 + ", R1 = " + act.newR[0] + ", R2 = " + act.newR[1] + ", R3 = " + act.newR[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.newV[0] + ", V2 = " + act.newV[1] + ", V3 = " + act.newV[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("I = " + current + " mA" + currentMsg + "<br><br>");

                                    }
                                    break;

                                case "message":
                                    if ($("#action-message")[0].checked) {
                                        var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("<span style=\"color:#FF0000;\">Message:</span> At "  
                                        + eTime + " seconds " + act.actor.styledName + ", board " + bd + ", said: " + act.highlightedMsg + "<br>");
                                        document.getElementById("data").innerHTML += ("R0 = " + myLevel.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("I = " + current + " mA" + currentMsg + "<br><br>");

                                    }
                                    break;

                                case "calculation":
                                    if ($("#action-calculation")[0].checked) {
                                        var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
                                        var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
                                        var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("<span style=\"color:#FF00FF;\">Calculation:</span> At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + ", performed the calculation  " + act.highlightedMsg + ".<br>");
                                        document.getElementById("data").innerHTML += ("R0 = " + myLevel.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                        document.getElementById("data").innerHTML += ("I = " + current + " mA" + currentMsg + "<br><br>");
                                    }
                                    break;

                                case "attach-probe":
                                    if ($("#action-attach-probe")[0].checked) {
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd +
                                            ", attached a probe to " + act.location + currentMsg + "<br>");
                                    }
                                    break;
                                case "detach-probe":
                                    if ($("#action-detach-probe")[0].checked) {
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd +
                                            ", detached a probe from " + act.location + currentMsg + "<br>");
                                    }
                                    break;
                                case "connect-lead":
                                    if ($("#action-connect-lead")[0].checked) {
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd +
                                            ", connected a lead to " + act.location + currentMsg + "<br>");
                                    }
                                    break;

                                case "disconnect-lead":
                                    if ($("#action-disconnect-lead")[0].checked) {
                                        if ((act.uTime - preTime) > interval) {
                                            document.getElementById("data").innerHTML += "<hr>"
                                        }
                                        preTime = act.uTime;
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd +
                                            ", disconnected a lead from " + act.location + currentMsg + "<br>");
                                    }
                                    break;
                                case "joined-group":
                                    if ($("#action-joined-group")[0].checked) {
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + ", joined team " + team.name + "<br>");
                                    }
                                    break;

                                case "measurement":
                                    if ($("#action-measurement")[0].checked) {
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + ", measured " + act.measurementType + ". Dial is set to " + 
                                            act.dial_position + ", reading is " + act.reading + ".<br>");
                                    }
                                    break;

                                case "move-dial":
                                    if ($("#action-move-DMM-dial")[0].checked) {
                                        document.getElementById("data").innerHTML += ("At " + eTime + " seconds " + act.actor.styledName +
                                            ", board " + bd + ", changed the DMM dial to " + act.dialPosition + ".<br>");
                                    }
                                    break;

                            }
                        }
                    }
                }
            }
        }
    }
}

/*function reportVarRefs(teams) {
    var team,
        level,
        varRefs,
        vrArray,
        vr,
        act,
        vrStr,
        vrNum,
        vrScore,
        vrLabelsArray = ["E", "R0", "R1", "R2", "R3", "sumRs", "sumRsPlusR0", "V0", "V1", "V2", "V3", "sumVs", "goalR1", "goalR2", "goalR3", "sumGoalRs", "goalV1", "goalV2", "goalV3", "sumGoalVs", "Rtot", "goalRtot", "IA", "ImA", "goalIA", "goalIma"]

    for (var k = 0; k < teams.length; k++) {
        team = teams[k];
        if (team.members.length == 3) {
            if ($("#team-" + team.name + team.classID)[0].checked) {
                for (var j = 0; j < team.levels.length; j++) {
                    level = team.levels[j];
                    if ($("#level-" + myLevel.label)[0].checked) {
                        varRefs = myLevel.varRefs;
                        for (var i = 0; i < vrLabelsArray.length; i++) {
                            vrStr = vrLabelsArray[i];
                            if ($("#varRef-" + vrStr)[0].checked) {
                                vrArray = varRefs[vrStr]; //contains all the varRefs of type vrStr;
                                for (var ii = 0; ii < vrArray.length; ii++) {
                                    vr = vrArray[ii];
                                    act = vr[0];
                                    vrNum = vr[2];
                                    vrScore = vr[3];
                                    document.getElementById("data").innerHTML += (eTime +
                                        ": board " + (act.board + 1) + ", type " +
                                        act.type + ", text = " + act.msg + ", " + vrNum + " is " +
                                        vrStr + ", score = " + vrScore + ".<br>");
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
*/

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
            }
        }
    }
}




// //Identifies instances of "voltage regulator behavior" by looking for pairs of resistor changes where
// //(a) the actor for the second is not the same as the actor for the first
// //(b) the first moved the voltage of the second actor away from the goal
// //(c) the second moves the voltage closer to the goal or overshoots, and
// //(d) the second follows the first by no more than <timeInterval> seconds
// //if additional resistor changes occur within the same <timeInterval> by the second player
// //and are goal seeking, they are to be added to the voltage regulator transaction.
// //Returns the array of resistorChange actions that belong to the transaction.
// function reportVoltageRegulator(teams) {
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
//                                 var previousActions = [];
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
        //empty the div if it exists
        if (document.getElementById("tableDiv")) {
            var tableDiv = document.getElementById("tableDiv");
            while (tableDiv.firstChild) {
                tableDiv.removeChild(tableDiv.firstChild);
            }
        } else {
            //if it doesn't, create one.
            var tableDiv = document.createElement("div");
            tableDiv.id = "tableDiv";
            //          tableDiv.setAttribute("style", "overflow-x:auto");
            document.body.appendChild(tableDiv);
        }
        for (var j = 0; j < teams.length; j++) {
            var team = teams[j];
            if (team.members.length == 3) {
                levelsArray = []; //An array of numMsgs, totalScores and averageScores by level
                for (var i = 0; i < team.levels.length; i++) {
                    level = team.levels[i];
                    levelsArray[i] = scoreActions(level);
                }
                scoreTable = makeTeamTable(team, "Total message score", levelsArray, "Total");
                numberTable = makeTeamTable(team, "Number of messages", levelsArray, "Number");
                averageTable = makeTeamTable(team, "Average message score", levelsArray, "Average");
                tableDiv.appendChild(scoreTable);
                tableDiv.appendChild(numberTable);
                tableDiv.appendChild(averageTable);
            }
        }
    }
}

function teacherReport(teams) {
    var reportRequested = false;
    //check to see whether at least one teacher report is asked for
    for (var k = 0; k < teachers.length; k++) {
        var teacher = teachers[k];
        if ($("#report-" + teacher)[0].checked) {
            reportRequested = true;
        } //if so, empty the tableDiv (if it exists)
        if (reportRequested) {
            if (document.getElementById("tableDiv")) {
                var tableDiv = document.getElementById("tableDiv");
                while (tableDiv.firstChild) {
                    tableDiv.removeChild(tableDiv.firstChild);
                }
            } else { //if it doesn't, create one.
                var tableDiv = document.createElement("div");
                tableDiv.id = "tableDiv";
                //          tableDiv.setAttribute("style", "overflow-x:auto");
                document.body.appendChild(tableDiv);
            }
            //run through the array again, reporting on each teacher
            for (var kk = 0; kk < teachers.length; kk++) {
                teacher = teachers[kk];
                if ($("#report-" + teacher)[0].checked) {
                    //create a table for this teacher
                    var table = document.createElement("table");
                    tableDiv.appendChild(table);
                    var titleRow = document.createElement("tr");
                    table.appendChild(titleRow);
                    var titleCell = document.createElement("th");
                    titleCell.setAttribute("colspan", 5);
                    titleRow.appendChild(titleCell);
                    var headerRow = document.createElement("tr");
                    table.appendChild(headerRow);
                    var headerCells = [];
                    for (var i = 0; i < 6; i++) {
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
                            if (myTeam.members.length == 3) { //Don't report on teams that don't have three members
                                dataRows[i] = document.createElement("tr");
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
                                for (var j = 0; j < myTeam.levels.length; j++) {
                                    myLevel = myTeam.levels[j];
                                    var levelTime = Math.round(myLevel.endUTime - myLevel.startUTime);
                                    var levelMinutes = Math.round(levelTime / 60);
                                    var levelSeconds = levelTime % 60;
                                    var levelMsg = (myLevel.success ? "<br>Goal voltages attained." : "<br>Goal voltages not attained.");
                                    var levelEMsg = (myLevel.successE ? "<br>E correctly reported." : "<br>E not reported correctly.");
                                    var levelRMsg = (myLevel.successR ? "<br>R0 correctly reported." : "<br>R0 not reported correctly.");
                                    var successMsg;
                                    var cellContents = "Time: " + levelMinutes + ":" + levelSeconds;
                                    cellContents += levelMsg;
                                    if ((myLevel.label == "A") || myLevel.label == "B") {
                                        successMsg = (myLevel.success ? "<br><b>Level successful.</b>" :
                                            "<br><b>Level unsuccessful.</b>");
                                    }
                                    if (myLevel.label == "C") {
                                        cellContents += levelEMsg;
                                        successMsg = ((myLevel.success && myLevel.successE) ? "<br><b>Level successful.</b>" :
                                            "<br><b>Level unsuccessful.</b>");
                                    }
                                    if (myLevel.label == "D") {
                                        cellContents += levelEMsg + levelRMsg;
                                        successMsg = ((myLevel.success && myLevel.successE && myLevel.successR) ?
                                            "<br><b>Level successful.</b>" : "<br><b>Level unsuccessful.</b>");
                                    }
                                    cellContents += successMsg;
                                    dataCells[i][j + 1].innerHTML = cellContents;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
