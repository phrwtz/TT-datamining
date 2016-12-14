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
                        ", goalV1 = " + goalVoltages[0] + ", goalV2 = " + goalVoltages[1] + ", goalV3 = " + goalVoltages[2] +
                        levelMsg + "</mark><br><br>");
                    for (var i = 0; i < acts.length; i++) {
                        var preTime,
                            interval = 10, //Maximum interval between logged actions for considering them linked.
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
                                        ": " + styledName + " changed R" + bd + " from " + act.oldR[bd - 1] +
                                        " to " + act.R[bd - 1] + ", V" + bd + " changed from " + act.oldV[bd - 1] +
                                        " to " + act.V[bd - 1] + act.goalMsg + "<br>");
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
