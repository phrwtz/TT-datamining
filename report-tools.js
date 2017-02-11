function generateReport(teams) {
    //    document.getElementByID("data").innerHTML = ""; //Clear the screen
    reportResults(teams);
    console.log("results reported");
    reportSummary(teams);
    console.log("summaries reported");
    reportActions(teams);
    console.log("action report generated");
    reportVarRefs(teams);
    console.log("variable references report generated");

}

function reportResults(teams) {
    document.getElementById("data").innerHTML = "";
    for (var k = 0; k < teams.length; k++) {
        var team = teams[k];
        if ($("#team-" + team.name)[0].checked) {
            for (var j = 0; j < team.levels.length; j++) {
                var level = team.levels[j];
                if ($("#level-" + level.label)[0].checked) {
                    var acts = level.actions;
                    var levelMsg = (level.goalsMet ? ". Level succeeded." : ". Level failed.");
                    document.getElementById("data").innerHTML += ("<br><mark>" +
                        team.name + ", level " + level.label + levelMsg + "</mark><br><br>");
                    for (var i = 0; i < acts.length; i++) {
                        var preTime,
                            interval = 45, //Maximum interval between logged actions for considering them linked.
                            act = acts[i],
                            bd = act.board + 1,
                            actor = act.actor,
                            eTime, //Elapsed time to nearest tenth of a second since start of level
                            styledName = actor.styledName,
                            currentMsg = (act.currentFlowing ? ". Current is flowing. " : ". Current is not flowing.");
                        eTime = Math.round((act.uTime - level.startTime) + 10) / 10;
                        switch (act.type) {
                            case "submitClicked":
                                if ($("#action-submit")[0].check) {
                                    var Rtotal = level.R0 + act.newR1 + act.newR3 + act.newR3;
                                    var V1 = level.E * act.newR1 / Rtotal;
                                    var V2 = level.E * act.newR3 / Rtotal;
                                    var V3 = level.E * act.newR3 / Rtotal;
                                    var success = false;
                                    if (Math.abs(V1 - level.goalV1) + Math.abs(V2 - level.goalV2) + Math.abs(V3 - level.goalV3) < .01) {
                                        success = true;
                                    }
                                    var successMsg = (success ? ", goal voltages achieved" : ", goal voltages not achieved");
                                    document.getElementById("data").innerHTML += ("Submit clicked" + successMsg + "<br>");
                                }
                                break;

                            case "submitCorrect":
                                if ($("#action-submit")[0].checked) {
                                    document.getElementById("data").innerHTML += (eTime + ": " +
                                        act.actor.styledName + " submitted correct answers.<br>");
                                }
                                break;

                            case "resistorChange":
                                if ($("#action-resistorChange")[0].checked) {
                                    var Rtot = level.R0 + act.R[0] + act.R[1] + act.R[2];
                                    var current = Math.round((level.E / Rtot) * 1000000) / 1000;
                                    var V0 = Math.round((level.E * level.R0 / Rtot) * 1000) / 1000;
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("data").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("data").innerHTML += (eTime +
                                        ": " + styledName + " changed R" + (bd) + " from " + act.oldR[bd - 1] +
                                        " to " + act.R[bd - 1] + ", V" + (bd) + " changed from " + act.oldV[bd - 1] +
                                        " to " + act.V[bd - 1] + ". (Goal is " + level.goalV[bd - 1] + ")" + act.goalMsg + "<br>");
                                    document.getElementById("data").innerHTML += ("R0 = " + level.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                    document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                    document.getElementById("data").innerHTML += ("I = " + current + " mA. <br><br>");

                                }
                                break;

                            case "submitUnknown":
                                if ($("#action-submit")[0].checked) {
                                    var EMsg = "";
                                    var RMsg = "";
                                    if (act.eCorrect == "true") {
                                        EMsg = " E answer correct. "
                                    } else if (act.eHaveValue == "true") {
                                        EMsg = " E answer incorrect."
                                    } else {
                                        EMsg = " No answer for E."
                                    }

                                    if (act.eHaveUnit == "true") {
                                        EMsg += " E units correct."
                                    } else {
                                        EMsg += " E units incorrect."
                                    }
                                    if (act.rCorrect == "true") {
                                        RMsg = " R answer correct."
                                    } else if (act.rHaveValue == "true") {
                                        RMsg = " R answer incorrect."
                                    } else {
                                        RMsg = " No answer for R."
                                    }
                                    if (act.rHaveUnit == "true") {
                                        RMsg += " R units correct."
                                    } else {
                                        RMsg += " R units incorrect."
                                    }
                                    document.getElementById("data").innerHTML += (eTime + ": " +
                                        act.actor.styledName + " submitted incorrect values." +
                                        EMsg + RMsg + "<br>")
                                }
                                break;
                            case "message":
                                if ($("#action-message")[0].checked) {
                                    var Rtot = level.R0 + act.R[0] + act.R[1] + act.R[2];
                                    var current = Math.round((level.E / Rtot) * 1000000) / 1000;
                                    var V0 = Math.round((level.E * level.R0 / Rtot) * 1000) / 1000;
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("data").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("data").innerHTML += (eTime + ": " +
                                        act.actor.styledName + ", board " + bd + ", said: " + act.highlightedMsg + ", score = " + act.score + "<br>");
                                    // document.getElementById("data").innerHTML += ("R0 = " + level.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                    // document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                    // document.getElementById("data").innerHTML += ("I = " + current + " mA. <br><br>");

                                }
                                break;

                            case "calculation":
                                if ($("#action-calculation")[0].checked) {
                                    var Rtot = level.R0 + act.R[0] + act.R[1] + act.R[2];
                                    var current = Math.round((level.E / Rtot) * 1000000) / 1000;
                                    var V0 = Math.round((level.E * level.R0 / Rtot) * 1000) / 1000;
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("data").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
                                        " performed the calculation  " + act.highlightedMsg + ".<br>");
                                    document.getElementById("data").innerHTML += ("R0 = " + level.R0 + ", R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + ";  ");
                                    document.getElementById("data").innerHTML += ("V0 = " + V0 + ", V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + ";  ");
                                    document.getElementById("data").innerHTML += ("I = " + current + " mA. <br><br>");
                                }
                                break;

                            case "attach-probe":
                                if ($("#action-attach-probe")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("data").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", disconnected a lead from " + act.location + currentMsg + "<br>");
                                }
                                break;
                            case "joined-group":
                                if ($("#action-joined-group")[0].checked) {
                                    document.getElementById("data").innerHTML += (eTime + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", joined team " + team.name + "<br>");
                                }
                                break;

                        }
                    }
                }
            }
        }
    }
}

function reportVarRefs(teams) {
    var team,
        level,
        varRefs,
        vrArray,
        vr,
        act,
        vrStr,
        vrNum,
        vrScore,
        vrLabelsArray = ["E", "R0", "R1", "R2", "R3", "V0", "V1", "V2", "V3", "goalR1", "goalR2", "goalR3", "goalV1", "goalV2", "goalV3", "Rtot", "goalRtot", "IA", "ImA", "goalIA", "goalIma"]


    for (var k = 0; k < teams.length; k++) {
        team = teams[k];
        if ($("#team-" + team.name)[0].checked) {
            for (var j = 0; j < team.levels.length; j++) {
                level = team.levels[j];
                if ($("#level-" + level.label)[0].checked) {
                    varRefs = level.varRefs;
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

//Reports on total number of resistor changes in each category for each team member, per level.
function reportSummary(teams) {
    var count = {};
    if ($("#summary-resistor-change")[0].checked) {
        for (var k = 0; k < teams.length; k++) {
            var team = teams[k];
            if ($("#team-" + team.name)[0].checked) {
                count[team.name] = {};
                for (var j = 0; j < team.levels.length; j++) {
                    var level = team.levels[j];
                    if ($("#level-" + level.label)[0].checked) {
                        count[team.name][level.label] = {};
                        var acts = level.actions;
                        for (var i = 0; i < team.members.length; i++) {
                            var member = team.members[i];
                            count[team.name][level.label][member.name] = {};
                            count[team.name][level.label][member.name].achieved = 0;
                            count[team.name][level.label][member.name].overshot = 0;
                            count[team.name][level.label][member.name].undershot = 0;
                            count[team.name][level.label][member.name].closer = 0;
                            count[team.name][level.label][member.name].farther = 0;
                        } //clear all the counts for all members for this level
                        for (var ii = 0; ii < acts.length; ii++) {
                            act = acts[ii];
                            if (act.type == "resistorChange") {
                                member = act.actor;
                                switch (act.goalMsg) {
                                    case ". Goal achieved":
                                        count[team.name][level.label][member.name].achieved += 1;
                                        break;
                                    case ". Goal overshot":
                                        count[team.name][level.label][member.name].overshot += 1;
                                        break;
                                    case ". Goal undershot":
                                        count[team.name][level.label][member.name].undershot += 1;
                                        break;
                                    case ". Goal closer":
                                        count[team.name][level.label][member.name].closer += 1;
                                        break;
                                    case ". Goal farther":
                                        count[team.name][level.label][member.name].farther += 1;
                                        break;
                                } //end of goalMsg switch
                            } //end of resistor change
                        } //end of actions
                    } //end of level check
                } //end of levels loop
            } //end of team check
        } //end of teams loop
        document.getElementById("data").innerHTML += ('<mark> <br> <tr> <td colspan = "4" align = "center" > Summary Resistor Change Report </td> </tr><br></mark>');
        for (var k = 0; k < teams.length; k++) {
            team = teams[k];
            if ($("#team-" + team.name)[0].checked) {
                document.getElementById("data").innerHTML += ("<br><br>");
                for (var j = 0; j < team.levels.length; j++) {
                    level = team.levels[j];
                    if ($("#level-" + level.label)[0].checked) {
                        document.getElementById("data").innerHTML += ("<br>");
                        for (var i = 0; i < team.members.length; i++) {
                            member = team.members[i];
                            document.getElementById("data").innerHTML += ("Team: " + team.name + ", level " + level.label +
                                ", member " + member.styledName + ": achieved = " +
                                count[team.name][level.label][member.name].achieved + ", overshot = " +
                                count[team.name][level.label][member.name].overshot + ", undershot = " +
                                count[team.name][level.label][member.name].undershot + ", closer = " +
                                count[team.name][level.label][member.name].closer + ", farther = " +
                                count[team.name][level.label][member.name].farther + "<br>");
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
//                     if ($("#level-" + level.label)[0].checked) {
//                         for (i = 0; i < level.actions.length; i++) {
//                             act = level.actions[i];
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

function reportActions(teams) {
    if ($("#summary-action-scores")[0].checked) {
        if (document.getElementById("tableDiv")) {
            var tableDiv = document.getElementById("tableDiv");
            while (tableDiv.firstChild) {
                tableDiv.removeChild(tableDiv.firstChild);
            }
        } else {
            var tableDiv = document.createElement("div");
            tableDiv.id = "tableDiv";
        }
        for (var j = 0; j < teams.length; j++) {
            var team = teams[j];
            if (team.members.length == 3) {
                var name = team.name;
                var mName1 = team.members[0].name;
                var mName2 = team.members[1].name;
                var mName3 = team.members[2].name;
                var actionScores = []; //array for containing the total action scores
                //for each team member in a level
                //Create table
                var reportTable = document.createElement("table");
                var teamRow = document.createElement("tr");
                var mRow1 = document.createElement("tr");
                var mRow2 = document.createElement("tr");
                var mRow3 = document.createElement("tr");
                var mRow4 = document.createElement("tr");
                var tCell = document.createElement("th");
                tCell.innerHTML = "<br>Team " + name;
                tCell.setAttribute("colspan", 6);
                teamRow.appendChild(tCell);
                var hRow = document.createElement("tr");
                var hCell0 = document.createElement("th");
                var hCell1 = document.createElement("th");
                var hCell2 = document.createElement("th");
                var hCell3 = document.createElement("th");
                var hCell4 = document.createElement("th");
                var hCell5 = document.createElement("th");
                var mCell1 = document.createElement("th");
                var mCell2 = document.createElement("th");
                var mCell3 = document.createElement("th");
                var mCell4 = document.createElement("th");
                hCell0.innerHTML = "Member";
                hCell1.innerHTML = "Level A";
                hCell2.innerHTML = "Level B";
                hCell3.innerHTML = "Level C";
                hCell4.innerHTML = "Level D";
                hCell5.innerHTML = "Total";
                mCell1.innerHTML = mName1;
                mCell2.innerHTML = mName2;
                mCell3.innerHTML = mName3;
                mCell4.innerHTML = "Total";

                var cellA1 = document.createElement("td");
                var cellA2 = document.createElement("td");
                var cellA3 = document.createElement("td");
                var cellB1 = document.createElement("td");
                var cellB2 = document.createElement("td");
                var cellB3 = document.createElement("td");
                var cellC1 = document.createElement("td");
                var cellC2 = document.createElement("td");
                var cellC3 = document.createElement("td");
                var cellD1 = document.createElement("td");
                var cellD2 = document.createElement("td");
                var cellD3 = document.createElement("td");
                var memberTotal1 = document.createElement("td");
                var memberTotal2 = document.createElement("td");
                var memberTotal3 = document.createElement("td");
                var levelTotalA = document.createElement("td");
                var levelTotalB = document.createElement("td");
                var levelTotalC = document.createElement("td");
                var levelTotalD = document.createElement("td");
                var totalTotal = document.createElement("td");

                cellA1.innerHTML = "N/A";
                cellA2.innerHTML = "N/A";
                cellA3.innerHTML = "N/A";
                cellB1.innerHTML = "N/A";
                cellB2.innerHTML = "N/A";
                cellB3.innerHTML = "N/A";
                cellC1.innerHTML = "N/A";
                cellC2.innerHTML = "N/A";
                cellC3.innerHTML = "N/A";
                cellD1.innerHTML = "N/A";
                cellD2.innerHTML = "N/A";
                cellD3.innerHTML = "N/A";
                memberTotal1.innerHTML = "N/A";
                memberTotal2.innerHTML = "N/A";
                memberTotal3.innerHTML = "N/A";
                levelTotalA.innerHTML = "N/A";
                levelTotalB.innerHTML = "N/A";
                levelTotalC.innerHTML = "N/A";
                levelTotalD.innerHTML = "N/A";
                totalTotal.innerHTML = "N/A";

                hRow.appendChild(hCell0);
                hRow.appendChild(hCell1);
                hRow.appendChild(hCell2);
                hRow.appendChild(hCell3);
                hRow.appendChild(hCell4);
                hRow.appendChild(hCell5);

                mRow1.appendChild(mCell1);
                mRow1.appendChild(cellA1);
                mRow1.appendChild(cellB1);
                mRow1.appendChild(cellC1);
                mRow1.appendChild(cellD1);
                mRow1.appendChild(memberTotal1);

                mRow2.appendChild(mCell2);
                mRow2.appendChild(cellA2);
                mRow2.appendChild(cellB2);
                mRow2.appendChild(cellC2);
                mRow2.appendChild(cellD2);
                mRow2.appendChild(memberTotal2);

                mRow3.appendChild(mCell3);
                mRow3.appendChild(cellA3);
                mRow3.appendChild(cellB3);
                mRow3.appendChild(cellC3);
                mRow3.appendChild(cellD3);
                mRow3.appendChild(memberTotal3);

                mRow4.appendChild(mCell4);
                mRow4.appendChild(levelTotalA);
                mRow4.appendChild(levelTotalB);
                mRow4.appendChild(levelTotalC);
                mRow4.appendChild(levelTotalD);
                mRow4.appendChild(totalTotal);


                reportTable.appendChild(teamRow);
                reportTable.appendChild(hRow);
                reportTable.appendChild(mRow1);
                reportTable.appendChild(mRow2);
                reportTable.appendChild(mRow3);
                reportTable.appendChild(mRow4);
                tableDiv.appendChild(reportTable);
                document.body.appendChild(tableDiv);

                //Add up the scores for each level and each member
                var totalForBoard = [0, 0, 0];
                for (var i = 0; i < team.levels.length; i++) {
                    level = team.levels[i];
                    actionScores = scoreActions(level);
                    switch (level.label) {
                        case "A":
                            var totalA = actionScores[0] + actionScores[1] + actionScores[2];
                            totalForBoard[0] += actionScores[0];
                            totalForBoard[1] += actionScores[1];
                            totalForBoard[2] += actionScores[2];
                            cellA1.innerHTML = actionScores[0];
                            cellA2.innerHTML = actionScores[1];
                            cellA3.innerHTML = actionScores[2];
                            levelTotalA.innerHTML = "<b>" + totalA + "</b>";
                            break;

                        case "B":
                            var totalB = actionScores[0] + actionScores[1] + actionScores[2];
                            totalForBoard[0] += actionScores[0];
                            totalForBoard[1] += actionScores[1];
                            totalForBoard[2] += actionScores[2];
                            cellB1.innerHTML = actionScores[0];
                            cellB2.innerHTML = actionScores[1];
                            cellB3.innerHTML = actionScores[2];
                            levelTotalB.innerHTML = "<b>" + totalB + "</b>";
                            break;

                        case "C":
                            var totalC = actionScores[0] + actionScores[1] + actionScores[2];
                            totalForBoard[0] += actionScores[0];
                            totalForBoard[1] += actionScores[1];
                            totalForBoard[2] += actionScores[2];
                            cellC1.innerHTML = actionScores[0];
                            cellC2.innerHTML = actionScores[1];
                            cellC3.innerHTML = actionScores[2];
                            levelTotalC.innerHTML = "<b>" + totalC + "</b>";
                            break;

                        case "D":
                            var totalD = actionScores[0] + actionScores[1] + actionScores[2];
                            totalForBoard[0] += actionScores[0];
                            totalForBoard[1] += actionScores[1];
                            totalForBoard[2] += actionScores[2];
                            cellD1.innerHTML = actionScores[0];
                            cellD2.innerHTML = actionScores[1];
                            cellD3.innerHTML = actionScores[2];
                            levelTotalD.innerHTML = "<b>" + totalD + "</b>";
                            break;
                    }
                } //end of the level loop
                memberTotal1.innerHTML = "<b>" + totalForBoard[0] + "</b>";
                memberTotal2.innerHTML = "<b>" + totalForBoard[1] + "</b>";
                memberTotal3.innerHTML = "<b>" + totalForBoard[2] + "</b>";
                totalTotal.innerHTML = "<b>" + (totalForBoard[0] + totalForBoard[1] + totalForBoard[2]) + "</b><br>";
                totalTotal.setAttribute("style", "color: red");
            }
        }
    }
}

//Takes a level and returns an array of the total score of all the actions
//(for the time being just messages) for each of the members of that level
//Note: members are identified by their index in the team.members array
//for that level so that their scores are consistent across levels.
function scoreActions(level) {
    var mems = level.team.members; //Array of members for this team
    var sumScores = [0, 0, 0];
    var scores = []
    var act,
        type,
        actor,
        score,
        memIndex;

    for (var i = 0; i < level.actions.length; i++) {
        act = level.actions[i];
        type = act.type;
        if (type == "message") {
            actor = act.actor;
            score = act.score;
            memIndex = findMemIndex(mems, actor);
            sumScores[memIndex] += score;
        }
    }
    return sumScores;
}

function findMemIndex(mems, actor) {
    var returnIndex = -1;
    for (var j = 0; j < mems.length; j++) {
        if (actor.name == mems[j].name) {
            returnIndex = j;
        }
    }
    return returnIndex;
}
