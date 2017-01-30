function generateReport(teams) {
    //    document.getElementByID("data").innerHTML = ""; //Clear the screen
    reportResults(teams);
    console.log("results reported");
    reportSummary(teams);
    console.log("summaries reported");
    instructorReport(teams);
    console.log("instructors report generated");
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
                    var levelMsg = (level.success ? ". Level succeeded." : ". Level failed.");
                    document.getElementById("data").innerHTML += ("<br><mark>" +
                        team.name + ", level " + level.label +
                        ":  E = " + level.E + ", R0 = " + level.R0 + ", R1 = " + level.initR[0] + ", R2 = " + level.initR[2] + ", R3 = " + level.initR[2] +
                        ", current = " + level.I + ", goal V1 = " + level.goalV[0] +
                        ", goal V2 = " + level.goalV[1] + ", goal V3 = " + level.goalV[2] +
                        "; goal R1 = " + level.goalR[0] + ", goal R2 = " + level.goalR[1] +
                        ", goal R3 = " + level.goalR[2] + levelMsg + "</mark><br><br>");
                    for (var i = 0; i < acts.length; i++) {
                        var preTime,
                            interval = 45, //Maximum interval between logged actions for considering them linked.
                            act = acts[i],
                            bd = act.board + 1,
                            actor = act.actor
                        styledName = actor.styledName,
                            currentMsg = (act.currentFlowing ? ". Current is flowing. " : ". Current is not flowing.");
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " +
                                        act.actor.styledName + ", board " + bd + ", said: \"" + act.highlightedMsg + "\", score = " + act.score + "<br>");
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
                                    var calculation = highlight(act, act.calculation);
                                    var result = highlight(act, Math.round(1000 * act.result) / 1000);
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        " performed the calculation  " + calculation + " and got the result " + result + ".<br>");
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
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
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", disconnected a lead from " + act.location + currentMsg + "<br>");
                                }
                                break;
                            case "joined-group":
                                if ($("#action-joined-group")[0].checked) {
                                    document.getElementById("data").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
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

//Reports on total number of resistor changes in each category for each team member, per level.
function reportSummary(teams) {
    var count = {};
    if ($("#resistor-change")[0].checked) {
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
    } //end of summary check
}
//Identifies instances of "voltage regulator behavior" by looking for pairs of resistor changes where
//(a) the actor for the second is not the same as the actor for the first
//(b) the first moved the voltage of the second actor away from the goal
//(c) the second moves the voltage closer to the goal or overshoots, and
//(d) the second follows the first by no more than <timeInterval> seconds
//if additional resistor changes occur within the same <timeInterval> by the second player
//and are goal seeking, they are to be added to the voltage regulator transaction.
//Returns the array of resistorChange actions that belong to the transaction.
function reportVoltageRegulator(teams) {
    if ($("#voltage-regulator")[0].checked) {
        for (var k = 0; k < teams.length; k++) {
            var team = teams[k];
            if ($("#team-" + team.name)[0].checked) {
                for (var j = 0; j < team.levels.length; j++) {
                    level = team.levels[j];
                    if ($("#level-" + level.label)[0].checked) {
                        for (i = 0; i < level.actions.length; i++) {
                            act = level.actions[i];
                            if (act.type = "resistorChange") {
                                var previousActions = [];
                                for (var j = 0; j < previousActions.length; j++) {
                                    preAct = previousActions[j];
                                    if (act.uTime - preAct.uTime < interval) {
                                        previousActions.splice(j, 1); //If the j'th element in the array is too old, get rid ot it.
                                    } else {
                                        var board = act.board;
                                        var preBoard = preAct.board;
                                        bdDiff = (board - preBoard) % 3;
                                        if (bdDiff != 0) { //If the two resistor changes were by different boards
                                            var preGoalMsg = (bdDiff = 1 ? preAct.goalAMsg : preAct.goalBMsg);
                                            if ((preGoalMsg == ". Goal farther") && (act.goalMsg = ". Goal closer")) {
                                                console.log("Voltage regulator activity identified!");
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function instructorReport(teams) {

    if ($("#instructor-report")[0].checked) {
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
            tCell.setAttribute("colspan", 5);
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
            hRow.appendChild(hCell0);
            hRow.appendChild(hCell1);
            hRow.appendChild(hCell2);
            hRow.appendChild(hCell3);
            hRow.appendChild(hCell4);
            hRow.appendChild(hCell5);
            mCell1.innerHTML = mName1;
            mCell2.innerHTML = mName2;
            mCell3.innerHTML = mName3;
            mCell4.innerHTML = "Total";
            mRow1.appendChild(mCell1);
            mRow2.appendChild(mCell2);
            mRow3.appendChild(mCell3);
            mRow4.appendChild(mCell4);

            reportTable.appendChild(teamRow);
            reportTable.appendChild(hRow);
            reportTable.appendChild(mRow1);
            reportTable.appendChild(mRow2);
            reportTable.appendChild(mRow3);
            reportTable.appendChild(mRow4);
            tableDiv.appendChild(reportTable);
            document.body.appendChild(tableDiv);

            //Add up the scores for each level and each member
            var totalByMember = [0, 0, 0];
            for (var i = 0; i < 4; i++) {
                level = team.levels[i];
                actionScores = scoreActions(level);
                var scoreCell1 = mRow1.insertCell(-1);
                var scoreCell2 = mRow2.insertCell(-1);
                var scoreCell3 = mRow3.insertCell(-1);
                var totalColCell4 = mRow4.insertCell(-1);
                var totalByLevel = [0, 0, 0, 0];
                totalByLevel[i] = actionScores[0] + actionScores[1] + actionScores[2];
                scoreCell1.innerHTML = actionScores[0];
                scoreCell2.innerHTML = actionScores[1];
                scoreCell3.innerHTML = actionScores[2];
                totalColCell4.innerHTML = totalByLevel[i];
                totalByMember[0] += actionScores[0];
                totalByMember[1] += actionScores[1];
                totalByMember[2] += actionScores[2];
            } //end of the level
            var total = totalByMember[0] + totalByMember[1] + totalByMember[2]
            totalRowCell1 = mRow1.insertCell(-1);
            totalRowCell2 = mRow2.insertCell(-1);
            totalRowCell3 = mRow3.insertCell(-1);
            totalCell = mRow4.insertCell(-1);
            totalRowCell1.innerHTML = totalByMember[0];
            totalRowCell2.innerHTML = totalByMember[1];
            totalRowCell3.innerHTML = totalByMember[2];
            totalCell.innerHTML = total;
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
