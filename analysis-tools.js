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
                var myChg = new action;
                myChg.type = "resistorChange"
                myChg.actor = findMember(team, po["username"]);
                myChg.board = parseInt(po["board"]) + 1;
                myChg.time = ro["time"];
                myChg.pTime = unixTimeConversion(myChg.time);
                myChg.level = level;
                myChg.team = team;
                myChg.currentFlowing = po["currentFlowing"];
                myChg.oldR1 = level.oldR1;
                myChg.oldR2 = level.oldR2;
                myChg.oldR3 = level.oldR3;
                myChg.newR1 = parseInt(newR1);
                myChg.newR2 = parseInt(newR2);
                myChg.newR3 = parseInt(newR3);
                level.oldR1 = myChg.newR1;
                level.oldR2 = myChg.newR2;
                level.oldR3 = myChg.newR3;
                switch (myChg.board) {
                    case 1:
                        myChg.changedRName = "R1";
                        myChg.changedROld = myChg.oldR1;
                        myChg.changedRNew = myChg.newR1;
                        break;
                    case 2:
                        myChg.changedRName = "R2";
                        myChg.changedROld = myChg.oldR2;
                        myChg.changedRNew = myChg.newR2;
                        break;
                    case 3:
                        myChg.changedRName = "R3";
                        myChg.changedROld = myChg.oldR3;
                        myChg.changedRNew = myChg.newR3;
                        break;
                }
                level.actions.push(myChg);
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
        var myMsg = new action;
        myMsg.type = "message";
        myMsg.actor = findMember(team, po["username"]);
        myMsg.board = parseInt(po["board"]) + 1;
        myMsg.time = ro["time"];
        myMsg.pTime = unixTimeConversion(myMsg.time);
        myMsg.level = level;
        myMsg.team = team;
        myMsg.msg = ro["event_value"];
        level.actions.push(myMsg);
    } catch (err) {
        console.log("in addMessage " + err);
    }
}

function addCalculation(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var team = findTeam(teams, ro);
    var level = findLevel(team, ro);
    var myCalc = new action;
    myCalc.type = "calculation";
    myCalc.team = team;
    myCalc.level = level;
    myCalc.time = ro["time"];
    myCalc.pTime = unixTimeConversion(myCalc.time);
    myCalc.board = parseInt(po["board"]) + 1;
    myCalc.actor = po["username"];
    myCalc.result = ro["result"];
    myCalc.calculation = ro["calculation"];
    level.actions.push(myCalc);
}

function reportResults(teams) {
    for (var k = 0; k < teams.length; k++) {
        var team = teams[k];
        for (var j = 0; j < teams[k].levels.length; j++) {
            var level = team.levels[j];
            var acts = level.actions;
            var goalVoltages = [level.goalV1, level.goalV2, level.goalV3];
            document.getElementById("demo").innerHTML += ("<br>" + team.name + ", level " + level.label +
                ". E = " + level.E + ", R0 = " + level.R0 +
                ", goalV1 = " + goalVoltages[0] + ", goalV2 = " + goalVoltages[1] + ", goalV3 = " + goalVoltages[2] + "<br><br>");
            for (var i = 0; i < acts.length; i++) {
                var act = acts[i];
                var bd = act.board;
                switch (act.type) {
                    case "message":
                        document.getElementById("demo").innerHTML += (act.pTime + ": " +
                            act.actor + " said: " + "\"" + highlight(act, act.msg) + "\"<br>");
                        break;
                    case "resistorChange":
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
                    case "calculation":
                        document.getElementById("demo").innerHTML += (act.pTime + ": " + act.actor +
                            " (board " + bd + ") performed the calculation  " + highlight(act, act.calculation) +
                            " and got the result " + Math.round(100 * act.result) / 100 + ".<br>");
                        break;
                }
            }
        }
    }
}
