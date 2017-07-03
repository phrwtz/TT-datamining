function findGuessAndCheck(teams) {
    var tOldE,
        tOldE,
        tNewE,
        tNewR,
        countE,
        countR,
        board,
        ERSubmitsForMember = [[], [], []],
        guessAndCheckE = [],
        guessAndCheckR = [],
        gAndCMsgE,
        gAndCMsgR;
    
    document.getElementById("data").innerHTML = ""; //Clear data
    for (var i = 0; i < teams.length; i++) {
        myTeam = teams[i];
        if (($("#team-" + myTeam.name + myTeam.classID)[0].checked)) {
            document.getElementById("data").innerHTML += "<br>"
            for (var j = 0; j < myTeam.levels.length; j++) {
                myLevel = myTeam.levels[j];
                if ($("#level-" + myLevel.label)[0].checked) {
                    ERSubmitsForMember = [[], [], []];                    
                    guessAndCheckE = [false, false, false];
                    guessAndCheckR = [false, false, false];
                    for (var k = 0; k < myLevel.actions.length; k++) { ///run over all the actions for this team and level
                        myAction = myLevel.actions[k];
                        if (myAction.type === "submitER") { //if the action is an E/R submit
                            board = myAction.board
                            ERSubmitsForMember[board].push(myAction); //Push the action onto the array for this board
                        }
                    }
                    for (var ii = 0; ii < 3; ii++) { ///run over all three members
                        countE = 0;
                        countR = 0;
                        for (var jj = 0; jj < ERSubmitsForMember[ii].length; jj++) { //look at this member's ER submits
                            thisERSubmit = ERSubmitsForMember[ii][jj];
                            //Look for guess and check for E
                            if (!thisERSubmit.successE) { //if the value for E is incorrect
                                if (countE === 0) {//if there are no prior incorrect E submits in the array
                                    tOldE = thisERSubmit.uTime;
                                    tNewE = tOldE;
                                    countE++;
                                } else { //if there are already incorrect E submissions in the array
                                    tNewE = thisERSubmit.uTime; //check how long ago they were submitted
                                    if ((tNewE - tOldE) < 30) { //if there was a prior incorrect E submit by this member within 30 seconds
                                        countE++ //increment the count
                                    } else { // if not
                                        countE = 0; //zero out the count
                                    }
                                }
                            } else if (thisERSubmit.successE) { //if we find a correct E submission
                                if ((countE > 2) && ((tNewE - tOldE) < 30)) { //and there are more than two incorrect E guesses and this guess is within the time interval 
                                    guessAndCheckE[i] = true; //There is evidence of guess and check strategy being employed by this member for E
                                }
                            }
                            //Look for guess and check for R0
                            if (!thisERSubmit.successR) { //if the value for R is incorrect
                                if (countR === 0) {//if there are no prior incorrect R submits in the array
                                    tOldR = thisERSubmit.uTime;
                                    tNewR = tOldR;
                                    countR++;
                                } else { //if there are already incorrect R submissions in the array
                                    tNewR = thisERSubmit.uTime; //check how long ago they were submitted
                                    if ((tNewR - tOldR) < 30) { //if there was a prior incorrect R submit by this member within 30 seconds
                                        countR++ //increment the count
                                    } else { // if not
                                        countR = 0; //zero out the count
                                    }
                                }
                            } else if (thisERSubmit.successR) { //if we find a correct R submission
                                if ((countR > 2) && ((tNewR - tOldR) < 30)) { //and there are more than two incorrect R guesses and this guess is within the time interval 
                                    guessAndCheckR[i] = true; //There is evidence of guess and check strategy being employed by this member for E
                                

                                }
                            }
                        }
                    }
                            myLevel.guessAndCheckE = guessAndCheckE[0] || guessAndCheckE[1] || guessAndCheckE[2];
                            myLevel.guessAndCheckR = guessAndCheckR[0] || guessAndCheckR[1] || guessAndCheckR[2];
                            gAndCMsgE = (myLevel.guessAndCheckE ? "Guess and check identified for E." : "No guess and check for E.");
                            gAndCMsgR = (myLevel.guessAndCheckR ? "Guess and check identified for R." : "No guess and check for R.");
                            document.getElementById("data").innerHTML += "<br>" + "Team " + myTeam.name + ", level " + myLevel.label + ", " + gAndCMsgE;
                            document.getElementById("data").innerHTML += "<br>" + "Team " + myTeam.name + ", level " + myLevel.label + ", " + gAndCMsgR;;
                }
            }
        }
    }
}
