function reportResistorChange(act) {
    var bd = parseInt(act.board) + 1;
    myLevel = act.level;
    var content = act.actor.styledName + " changed R" + bd + " from " + act.oldR[bd - 1] +
        " to " + act.newR[bd - 1] + ", V" + (bd) + " changed from " + act.oldV[bd - 1] +
        " to " + act.newV[bd - 1] + ". (Goal is " + myLevel.goalV[bd - 1] + ")" + act.goalMsg;
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
    var myLevel = act.level;
    var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
    var V1 = myLevel.E * act.R[0] / Rtot;
    var V2 = myLevel.E * act.R[1] / Rtot;
    var V3 = myLevel.E * act.R[2] / Rtot;
    var successMsg = (myLevel.success ? " submitted correct voltages." : " submitted incorrect voltages.");
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
    myLevel = act.level;
    var Rtot = myLevel.R0 + act.R[0] + act.R[1] + act.R[2];
    var current = Math.round((myLevel.E / Rtot) * 1000000) / 1000;
    var V0 = Math.round((myLevel.E * myLevel.R0 / Rtot) * 1000) / 1000;
    var V1 = myLevel.E * act.R[0] / Rtot;
    var V2 = myLevel.E * act.R[1] / Rtot;
    var V3 = myLevel.E * act.R[2] / Rtot;
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