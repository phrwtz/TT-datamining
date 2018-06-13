function reportResistorChange(act) {
    var bd = parseInt(act.board) + 1;
    var resDistStr = "";
    var resJumpStr = "";

    if (act.resDist == 1) {
        resDistStr = act.resDist + " resistance value away from goal."
    }
    if (act.resDist > 1) {
        resDistStr = act.resDist + " resistance values away from goal."
    }

    if (Math.abs(act.resJump) == 1) {
        resJumpStr = "<br>Moved to neighboring resistance value."
    }
    if (act.resJump > 1) {
        resJumpStr = "<br>Moved " + act.resJump + " resistance values higher."
    }
    if (act.resJump < -1) {
        resJumpStr = "<br>Moved " + (0 - act.resJump) + " resistance values lower."
    }


    myLevel = act.level;
    var content = act.actor.styledName + " changed R" + bd + " from " + act.oldR[bd - 1] +
        " to " + act.newR[bd - 1] + ", V" + (bd) + " changed from " + act.oldV[bd - 1] +
        " to " + act.newV[bd - 1] + ". (Goal is " + act.goalV[bd - 1] + ")" + act.goalMsg + ". " + resDistStr + resJumpStr;
    addActionRow(act, content);
}

function reportCalculation(act) {
    content = act.actor.styledName + " performed the calculation  " + act.highlightedMsg;
    addActionRow(act, content);
}

function reportMessage(act) {
    content = act.actor.styledName + " said: " + act.highlightedMsg;
    addActionRow(act, content);
}

function reportActivitySettings(act) {
    var team = act.team;
    level = act.level;
    content = "Activity settings: E = " + act.E + ", R0 = " + act.R0;
    addActionRow(act, content);
}

function reportMeasurement(act) {
    var currentMsg = (act.currentFlowing ? ", current flowing" : ", current is not flowing"),
        gapMsg = (act.gapMeasurement ? " (across gap)" : " (across resistor)")
    content = act.actor.styledName + " measured " + act.measurementType + ". Dial set to " + act.dialPosition +
        ", probes at " + act.redPosition + " and " + act.blackPosition +
        gapMsg + currentMsg + ", reading is " + act.highlightedMsg;
    addActionRow(act, content);
}

function reportMovedDial(act) {
    content = act.actor.styledName + " changed the DMM dial to " + act.dialPosition;
    addActionRow(act, content);
}

function reportSubmitVoltages(act) {
    var V1 = act.V[0];
    var V2 = act.V[1];
    var V3 = act.V[2];
    var goalV1 = act.goalV[0];
    var goalV2 = act.goalV[1];
    var goalV3 = act.goalV[2];
    var voltagesCorrectlySubmitted = (Math.abs(V1 - goalV1) + Math.abs(V2 - goalV2) + Math.abs(V3 - goalV3) < .01)
    var successMsg = (voltagesCorrectlySubmitted ? " submitted correct voltages." : " submitted incorrect voltages.");
    content = act.actor.styledName + successMsg;
    addActionRow(act, content);
}

function reportSubmitER(act) {
    var myLevel = act.level;
    var msg = "";
    var Elabel = "<mark>incorrect</mark>";
    var Rlabel = "<mark>incorrect</mark>";
    if ((act.ESubmitValue == myLevel.E) && (act.ESubmitUnit = "volts")) {
        Elabel = "<mark>correct</mark>";
    }
    if ((act.RSubmitValue == myLevel.R0) && (act.RSubmitUnit = "ohms")) {
        Rlabel = "<mark>correct</mark>";
    }
    if (myLevel.label == "C") {
        msg = ", submitted " + Elabel + " value for E (" + act.ESubmitValue + " " + act.ESubmitUnit + ")<br>";
    }
    if (myLevel.label == "D") {
        msg += ", submitted " + Elabel + " value for E (" + act.ESubmitValue + " " + act.ESubmitUnit + ")" +
            " and " + Rlabel + " value for R0 (" + act.RSubmitValue + " " + act.RSubmitUnit + ").<br>";
    }
    content = act.actor.styledName + msg;
    addActionRow(act, content);
}

function reportAttachProbe(act) {
    var currentMsg = (act.currentFlowing ? ", current flowing" : ", current is not flowing");
    content = act.actor.styledName + " attached the " + act.probeColor + " probe to " + act.location + currentMsg;
    addActionRow(act, content);
}

function reportDetachProbe(act) {
    var currentMsg = (act.currentFlowing ? ", current flowing" : ", current is not flowing");
    content = act.actor.styledName + " detached the " + act.probeColor + " probe from " + act.location + currentMsg;
    addActionRow(act, content);
}

function reportConnectLead(act) {
    var currentMsg = (act.currentFlowing ? ", current flowing" : ", current is not flowing");
    content = act.actor.styledName + " connected a lead to " + act.location + currentMsg;
    addActionRow(act, content);
}


function reportDisconnectLead(act) {
    var currentMsg = (act.currentFlowing ? ", current flowing" : ", current is not flowing");
    content = act.actor.styledName + " disconnected a lead from " + act.location + currentMsg;
    addActionRow(act, content);
}

function reportJoinedGroup(act) {
    content = act.actor.styledName + " joined team " + act.team.name;
    addActionRow(act, content);
}

function reportOpenedZoom(act) {
    content = act.actor.styledName + " opened zoom view ";
    addActionRow(act, content);
}

function reportClosedZoom(act) {
    content = act.actor.styledName + " closed zoom view ";
    addActionRow(act, content);
}

function reportCircuitState(act) { //Reports on voltages and current at the moment of act
    var Rtot = act.R0 + act.R[0] + act.R[1] + act.R[2];
    var current = Math.round((act.E / Rtot) * 1000000) / 1000;
    var V0 = Math.round((act.E * act.R0 / Rtot) * 1000) / 1000;
    var V1 = act.E * act.R[0] / Rtot;
    var V2 = act.E * act.R[1] / Rtot;
    var V3 = act.E * act.R[2] / Rtot;
}

function openNewWindow() {
    var wnd = window.open("https://action-window.org")
}

function reportAllActions(teams, act) { //Reports all actions for the team and level of act. Then scrolls to act.
    var myTeam = act.team;
    var myLevel = act.level;
    for (var i = 0; i < teams.length; i++) {
        t = teams[i];
        if (t.name == myTeam.name) {
            for (var j = 0; j < t.levels.length; j++) {
                l = t.levels[j];
                if (l.level == myLevel.level) {
                    for (k = 0; k < l.actions.length; k++) {
                        a = l.actions[k];
                        switch (a.type) {
                            case "submitClicked":
                                reportSubmitVoltages;
                                break;

                            case "submitER":
                                reportSubmitER(act);
                                break;

                            case "resistorChange":
                                reportResistorChange(act);
                                break;

                            case "message":
                                reportMessage(act);
                                break;

                            case "calculation":
                                reportCalculation(act);
                                break;

                            case "attach-probe":
                                reportAttachProbe(act);
                                break;

                            case "detach-probe":
                                reportDetachProbe(act);
                                break;

                            case "connect-lead":
                                reportConnectLead(act);
                                break;

                            case "disconnect-lead":
                                reportDisconnectLead(act);
                                break;

                            case "joined-group":
                                reportJoinedGroup(act);
                                break;

                            case "opened-zoom":
                                reportOpenedZoom(act);
                                break;

                            case "closed-zoom":
                                reportClosedZoom(act);
                                break;

                            case "measurement":
                                reportMeasurement(act);
                                break;

                            case "move-dial":
                                reportMovedDial(act);
                                break;
                        }
                    }
                }
            }
        }
    }
}

var resIndex = {};
resIndex["10"] = 1;
resIndex["12"] = 2;
resIndex["15"] = 3;
resIndex["18"] = 4;
resIndex["22"] = 5;
resIndex["27"] = 6;
resIndex["33"] = 7;
resIndex["39"] = 8;
resIndex["47"] = 9;
resIndex["56"] = 10;
resIndex["68"] = 11;
resIndex["82"] = 12;

resIndex["100"] = 13;
resIndex["120"] = 14;
resIndex["150"] = 15;
resIndex["180"] = 16;
resIndex["220"] = 17;
resIndex["270"] = 18;
resIndex["330"] = 19;
resIndex["390"] = 20;
resIndex["470"] = 21;
resIndex["560"] = 22;
resIndex["680"] = 23;
resIndex["820"] = 24;

resIndex["1000"] = 25;
resIndex["1200"] = 26;
resIndex["1500"] = 27;
resIndex["1800"] = 28;
resIndex["2200"] = 29;
resIndex["2700"] = 30;
resIndex["3300"] = 31;
resIndex["3900"] = 32;
resIndex["4700"] = 33;
resIndex["5600"] = 34;
resIndex["6800"] = 35;
resIndex["8200"] = 36;

resIndex["10000"] = 37;
resIndex["12000"] = 38;
resIndex["15000"] = 39;
resIndex["18000"] = 40;
resIndex["22000"] = 41;
resIndex["27000"] = 42;
resIndex["33000"] = 43;
resIndex["39000"] = 44;
resIndex["47000"] = 45;
resIndex["56000"] = 46;
resIndex["68000"] = 47;
resIndex["82000"] = 48;

resIndex["100000"] = 49;
resIndex["120000"] = 50;
resIndex["150000"] = 51;
resIndex["180000"] = 52;
resIndex["220000"] = 53;
resIndex["270000"] = 54;
resIndex["330000"] = 55;
resIndex["390000"] = 56;
resIndex["470000"] = 57;
resIndex["560000"] = 58;
resIndex["680000"] = 50;
resIndex["820000"] = 60;

resIndex["1000000"] = 61;
resIndex["1200000"] = 62;
resIndex["1500000"] = 63;
resIndex["1800000"] = 64;
resIndex["2200000"] = 65;
resIndex["2700000"] = 66;
resIndex["3300000"] = 67;
resIndex["3900000"] = 68;
resIndex["4700000"] = 69;
resIndex["5600000"] = 70;
resIndex["6800000"] = 71;
resIndex["8200000"] = 72;

var resArray = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
    100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
    1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
    10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000,
    100000, 120000, 150000, 180000, 220000, 270000, 330000, 390000, 470000, 560000, 680000, 820000, 1000000, 1200000, 1500000, 1800000, 2200000, 2700000, 3300000, 3900000, 4700000, 5600000, 6800000, 8200000];

function resDist(act) { //Returns the number of legal resistor values between the current one and the one that overshoots or undershoots the goal voltage. It will be 0 if the current resistance gets the user as close as possible to the goal voltage on that side, 1 if there is only one legal resistance value that provides a voltage on the same side of the goal voltage, and so forth.
    var gV = act.goalV[act.board]; // the goal voltage for this board
    var V = act.V[act.board]; // the actual voltage
    var R = act.R[act.board]; // the actual resistance
    var Ra = act.R[(act.board + 1) % 3] // the actual resistance of one of the other two boards
    var Rb = act.R[(act.board + 2) % 3] // the actual resistance of the other board
    var E = act.E;
    var R0 = act.R0;
    var index = resIndex[R.toString()]; // the index of the actual resistance

    if (V == gV) {
        return 0;
    }

    if (V < gV) { // We're below the goal voltage
        for (var i = 1; resArray[index + i]; i++) { // Raise R until we reach the goal voltage
            Rtest = resArray[index - 1 + i]
            Vtest = E * Rtest / (R0 + Ra + Rb + Rtest);
            if (Vtest >= gV) { // If we've either arrived at the goal voltage or overshot it
                return i; // return the number of resistors we've tried out in achieving that.
            }
        }
    }

    if (V > gV) { // We're above the goal voltage
        for (var i = -1; resArray[index + i]; i--) { // Lower R until we reach the goal voltage
            Rtest = resArray[index - 1 + i] // Array starts at 0,
            Vtest = E * Rtest / (R0 + Ra + Rb + Rtest);
            if (Vtest <= gV) { // If we've either arrived at the goal voltage or undershot it
                return -i; // return the number of resistors we've tried out in achieving that.
            }
        }
    }
}