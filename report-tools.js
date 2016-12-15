function reportResults(teams) {
    document.getElementById("demo").innerHTML = "";
    for (var k = 0; k < teams.length; k++) {
        var team = teams[k];
        if ($("#team-" + team.name)[0].checked) {
            for (var j = 0; j < team.levels.length; j++) {
                var level = team.levels[j];
                if ($("#level-" + level.label)[0].checked) {
                    var acts = level.actions;
                    var goalVoltages = [level.goalV[0], level.goalV[1], level.goalV[2]];
                    var levelMsg = (level.success ? ". Level succeeded." : ". Level failed.");
                    document.getElementById("demo").innerHTML += ("<br><mark>" +
                        team.name + ", level " + level.label +
                        ":  E = " + level.E + ", R0 = " + level.R0 +
                        ", goal V1 = " + goalVoltages[0] + ", goal V2 = " + goalVoltages[1] + ", goal V3 = " + goalVoltages[2] +
                        "; goal R1 = " + level.goalR[0] + ", goal R2 = " + level.goalR[1] + ", goal R3 = " + level.goalR[2] + levelMsg + "</mark><br><br>");
                    for (var i = 0; i < acts.length; i++) {
                        var preTime,
                            interval = 30, //Maximum interval between logged actions for considering them linked.
                            act = acts[i],
                            bd = act.board,
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
                                    document.getElementById("demo").innerHTML += ("Submit clicked" + successMsg + "<br>");
                                }
                                break;

                            case "submitCorrect":
                                if ($("#action-submit")[0].checked) {
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " +
                                        act.actor.styledName + " submitted correct answers.<br>");
                                }
                                break;

                            case "resistorChange":
                                if ($("#action-resistorChange")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time +
                                        ": " + styledName + " changed R" + (bd + 1) + " from " + act.oldR[bd] +
                                        " to " + act.R[bd] + ", V" + (bd + 1) + " changed from " + act.oldV[bd] +
                                        " to " + act.V[bd] + ". (Goal is " + level.goalV[bd] + ")" + act.goalMsg + "<br>");
                                    document.getElementById("demo").innerHTML += ("R1 = " + act.R[0] + " R2 = " + act.R[1] + " R3 = " + act.R[2] + "<br>");
                                    document.getElementById("demo").innerHTML += ("V1 = " + act.V[0] + " V2 = " + act.V[1] + " V3 = " + act.V[2] + "<br>");

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
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " +
                                        act.actor.styledName + " submitted incorrect values." +
                                        EMsg + RMsg + "<br>")
                                }
                                break;
                            case "message":
                                if ($("#action-message")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time +
                                        act.actor.styledName + " said: " + "\"" + highlight(act, act.msg) + "\"<br>");
                                }
                                break;

                            case "calculation":
                                if ($("#action-calculation")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        " performed the calculation  " + highlight(act, act.calculation) +
                                        " and got the result " + Math.round(1000 * act.result) / 1000 + ".<br>");
                                }
                                break;

                            case "attach-probe":
                                if ($("#action-attach-probe")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", attached a probe to " + act.location + currentMsg + "<br>");
                                }
                                break;
                            case "detach-probe":
                                if ($("#action-detach-probe")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", detached a probe from " + act.location + currentMsg + "<br>");
                                }
                                break;
                            case "connect-lead":
                                if ($("#action-connect-lead")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", connected a lead to " + act.location + currentMsg + "<br>");
                                }
                                break;

                            case "disconnect-lead":
                                if ($("#action-disconnect-lead")[0].checked) {
                                    if ((act.uTime - preTime) > interval) {
                                        document.getElementById("demo").innerHTML += "<hr>"
                                    }
                                    preTime = act.uTime;
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
                                        ", board " + bd +
                                        ", disconnected a lead from " + act.location + currentMsg + "<br>");
                                }
                                break;
                            case "joined-group":
                                if ($("#action-joined-group")[0].checked) {
                                    document.getElementById("demo").innerHTML += (act.date + ", " + act.time + ": " + act.actor.styledName +
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

function reportSummary(teams) {
    var count = {};
    if ($("#summary-change-types")[0].checked) {
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
                            count[team.name][level.label][member.name].closer = 0;
                            count[team.name][level.label][member.name].farther = 0;
                        } //clear all the counts for all members for this level
                        for (var ii = 0; ii < acts.length; ii++) {
                            act = acts[ii];
                            if (act.type == "resistorChange") {
                                member = act.actor;
                                if (act.goalMsg == ". Goal achieved") {
                                    count[team.name][level.label][member.name].achieved += 1;
                                } else
                                if (act.goalMsg == ". Goal overshot") {
                                    count[team.name][level.label][member.name].overshot += 1;
                                } else {

                                }
                                if (act.goalMsg == ". Goal closer") {
                                    count[team.name][level.label][member.name].closer += 1;
                                } else
                                if (act.goalMsg == ". Goal farther") {
                                    count[team.name][level.label][member.name].farther += 1;
                                }
                            } //end of resistor change
                        } //end of actions
                    } //end of level check
                } //end of levels loop
            } //end of team check
        } //end of teams loop
        document.getElementById("demo").innerHTML += ('<mark><br> <tr> <td colspan = "4" align = "center" > Summary Resistor Change Report </td> </tr><br><br></mark>');
        for (var k = 0; k < teams.length; k++) {
            team = teams[k];
            if ($("#team-" + team.name)[0].checked) {
                document.getElementById("demo").innerHTML += ("<br><br>");
                for (var j = 0; j < team.levels.length; j++) {
                    level = team.levels[j];
                    if ($("#level-" + level.label)[0].checked) {
                        document.getElementById("demo").innerHTML += ("<br>");
                        for (var i = 0; i < team.members.length; i++) {
                            member = team.members[i];
                            document.getElementById("demo").innerHTML += ("Team: " + team.name + ", level " + level.label +
                                ", member " + member.styledName + ": achieved = " +
                                count[team.name][level.label][member.name].achieved + ", overshot = " + count[team.name][level.label][member.name].overshot +
                                ", closer = " + count[team.name][level.label][member.name].closer + ", farther = " + count[team.name][level.label][member.name].farther + "<br>");
                        }
                    }
                }
            }
        }
    } //end of summary check
}
