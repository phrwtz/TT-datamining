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
    myAction.actor = po["username"];
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
    myAction.actor = po["username"];
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
    }
}

function reportResults(teams) {
    for (var k = 0; k < teams.length; k++) {
        var team = teams[k];
        if ($("#all-teams")[0].checked || $("#team-" + team.name)[0].checked) {
            for (var j = 0; j < team.levels.length; j++) {
                var level = team.levels[j];
                if ($("#all-levels")[0].checked || $("#level-" + level.label)[0].checked) {
                    var acts = level.actions;
                    var goalVoltages = [level.goalV1, level.goalV2, level.goalV3];
                    var levelMsg = (level.success ? ". Level succeeded." : ". Level failed.");
                    document.getElementById("demo").innerHTML += ("<br><mark>" + team.name + ", level " + level.label +
                        ":  E = " + level.E + ", R0 = " + level.R0 +
                        ", goalV1 = " + goalVoltages[0] + ", goalV2 = " + goalVoltages[1] + ", goalV3 = " + goalVoltages[2] +
                        levelMsg + "</mark><br><br>");
                    for (var i = 0; i < acts.length; i++) {
                        var act = acts[i];
                        var bd = act.board;
                        switch (act.type) {
                            case "submitCorrect":
                                if ($("#all-actions")[0].checked || $("#action-submit")[0].checked) {
                                    document.getElementById("demo").innerHTML += (act.pTime + ": " +
                                        act.actor + " submitted correct answers.<br>");
                                    break;
                                }
                            case "submitUnknown":
                                if ($("#all-actions")[0].checked || $("#action-submit")[0].checked) {
                                    var EMsg = "";
                                    var RMsg = "";
                                    if (act.eCorrect == "true") {
                                        EMsg = " E answer correct. "
                                    } else if (act.eHaveValue == "true") {
                                        EMsg = " E answer incorrect."
                                    } else {
                                        EMsg = " No answer for E."
                                    };

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

                                    document.getElementById("demo").innerHTML += (act.pTime + ": " +
                                        act.actor + " submitted incorrect values." +
                                        EMsg + RMsg + "<br>")
                                    break;
                                }
                            case "message":
                                if ($("#all-actions")[0].checked || $("#action-" + act.type)[0].checked) {
                                    document.getElementById("demo").innerHTML += (act.pTime + ": " +
                                        act.actor + " said: " + "\"" + highlight(act, act.msg) + "\"<br>");
                                    break;
                                }
                            case "resistorChange":
                                if ($("#all-actions")[0].checked || $("#action-" + act.type)[0].checked) {
                                    var oldVoltages = computeVoltages(level, act.oldR1, act.oldR2, act.oldR3);
                                    var newVoltages = computeVoltages(level, act.newR1, act.newR2, act.newR3);
                                    var oldV = Math.round(oldVoltages[bd] * 100) / 100;
                                    var newV = Math.round(newVoltages[bd] * 100) / 100;
                                    var gV = goalVoltages[bd - 1];
                                    var closer = ((Math.abs(oldV - gV) > Math.abs(newV - gV)) ? " Getting closer to " : " Getting further away from ");
                                    document.getElementById("demo").innerHTML += (act.pTime + ": " + act.actor +
                                        ", board " + bd + " changed " + act.changedRName +
                                        " from " + act.changedROld + " to " + act.changedRNew +
                                        ", voltage changed from " + oldV + " volts to " + newV + " volts." + closer + gV + " volts.<br>");
                                    break;
                                }
                            case "calculation":
                                if ($("#all-actions")[0].checked || $("#action-" + act.type)[0].checked) {
                                    document.getElementById("demo").innerHTML += (act.pTime + ": " + act.actor +
                                        " (board " + bd + ") performed the calculation  " + highlight(act, act.calculation) +
                                        " and got the result " + Math.round(100 * act.result) / 100 + ".<br>");
                                    break;
                                }
                        }
                    }
                }
            }
        }
    }
}
