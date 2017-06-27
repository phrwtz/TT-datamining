function findGuessAndCheck(teams) {
    var tOld,    
        tNew,
        count,
        board,
        ESubmitsForMember = [[], [], []],
        guessAndCheck = [false, false, false];
    document.getElementById("data").innerHTML = ""; //Clear data
    for (var i = 0; i < teams.length; i++) {
        myTeam = teams[i];
        if (($("#team-" + myTeam.name + myTeam.classID)[0].checked)) {
            document.getElementById("data").innerHTML += "<br>"
            for (var j = 0; j < myTeam.levels.length; j++) {
                myLevel = myTeam.levels[j];
                if ($("#level-" + myLevel.label)[0].checked) {
                    for (var k = 0; k < myLevel.actions.length; k++) { ///run over all the actions for this team and level
                        myAction = myLevel.actions[k];
                        if (myAction.type === "submitER") { //if the action is an E/R submit
                            board = myAction.board
                            ESubmitsForMember[board].push(myAction); //Push the action onto the array for this board
                        }
                    }
                    for (var ii = 0; ii < 3; ii++) { ///run ovver all three members
                        count = 0; //initialize count
                        for (var jj = 0; jj < ESubmitsForMember[ii].length; jj++) { //look at this member's ER submits
                            thisSubmit = ESubmitsForMember[ii][jj];
                            if (!thisSubmit.successE) { //if the value for E is incorrect
                                if (count === 0) {//if there are no prior incorrect ER submits in the array
                                    tOld = thisSubmit.uTime;
                                    tNew = tOld;
                                    count++;
                                } else { //if there are already incorrect submissions in the array
                                    tNew = thisSubmit.uTime; //check how long ago they were submitted
                                    if ((tNew - tOld) < 30) { //if there was a prior incorrect E submit by this member within 30 seconds
                                        count++ //increment the count
                                    } else { // if not
                                        count = 0; //zero out the co9nt
                                    }
                                }
                            } else { //if we find a correct E submission
                                if ((count > 2) && ((tNew - tOld) < 30)) { //and there are more than two incorrect guesses and this guess is within the time interval 
                                    guessAndCheck = true; //There is evidence of guess and check strategy being employed by this member
                                }
                            }
                        }
                    }
                myLevel.guessAndCheck = guessAndCheck[0] || guessAndCheck[1] || guessAndCheck[2];
                gAndCMsg = (myLevel.guessAndCheck ? "Guess and check identified." : "No guess and check here.")
                document.getElementById("data").innerHTML += "<br>" + "Team " + myTeam.name + ", level " + myLevel.label + ", " + gAndCMsg;
                }
            }  
        }
    }
}
