//This is where we do all the analysis of the files

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
            }
        } catch (err) {
            console.log("in analyze " + err);
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
        var team = findTeam(teams, ro);
        var level = findLevel(team, ro);
        var newR1 = po["r1"];
        var newR2 = po["r2"];
        var newR3 = po["r3"];
        if ((newR1 != level.oldR1) || (newR2 != level.oldR2) || (newR3 != level.oldR3)) {
            var myChg = new rChange;
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
            myChg.newR1 = newR1;
            myChg.newR2 = newR2;
            myChg.newR3 = newR3;
            level.oldR1 = newR1;
            level.oldR2 = newR2;
            level.oldR3 = newR3;
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
    } catch (err) {
        console.log("in addRChanges " + err);
    }
}

function addMessage(ro) {
    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    try {
        var team = findTeam(teams, ro);
        var level = findLevel(team, ro);
        var myMsg = new message;
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
