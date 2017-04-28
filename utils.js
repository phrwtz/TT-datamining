function clearScreen() { //clears data and summary tables
    document.getElementById("data").innerHTML = "";
    if (document.getElementById("tableDiv")) {
        var tableDiv = document.getElementById("tableDiv");
        while (tableDiv.firstChild) {
            tableDiv.removeChild(tableDiv.firstChild);
        }
    }
}

function initializeVarRefs(level) { //Initializes variable references for this level
    level.varRefs["E"] = [];
    level.varRefs["R0"] = [];
    level.varRefs["goalV0"] = [];
    level.varRefs["goalV1"] = [];
    level.varRefs["goalV2"] = [];
    level.varRefs["goalV3"] = [];
    level.varRefs["goalVs"] = [];
    level.varRefs["goalR1"] = [];
    level.varRefs["goalR2"] = [];
    level.varRefs["goalR3"] = [];
    level.varRefs["sumGoalRs"] = [];
    level.varRefs["R1"] = [];
    level.varRefs["R2"] = [];
    level.varRefs["R3"] = [];
    level.varRefs["sumRs"] = [];
    level.varRefs["sumRsPlusR0"] = [];
    level.varRefs["V1"] = [];
    level.varRefs["V2"] = [];
    level.varRefs["V3"] = [];
    level.varRefs["sumVs"] = [];
    level.varRefs["Rtot"] = [];
    level.varRefs["V0"] = [];
    level.varRefs["IA"] = [];
    level.varRefs["ImA"] = [];
    level.varRefs["goalIA"] = [];
    level.varRefs["goalImA"] = [];
    level.varRefs["no match"] = [];
    level.varRefs["??"] = [];
}

//Takes a variable string and an action and returns 1 if the variable
//is known to all players, 2 if it is known to the actor, 3 if it
//is known to a player other than the actor, and 4 if it is not initially
//known to anyone (and is presumed to be the result of a calculation).
//(Note: the designations for "E" and "R0" depend on the level.)
function score(varStr, action) {
    var score = 0;
    var bd = action.board + 1;
    switch (varStr) {
        case "E":
            (action.level.label < "C" ? score = 1 : score = 4);
            break;
        case "R0":
            (action.level.label < "D" ? score = 1 : score = 4);
            break;
        case "R1":
            (bd == 1 ? score = 2 : score = 3);
            break;
        case "R2":
            (bd == 2 ? score = 2 : score = 3);
            break;
        case "R3":
            (bd == 3 ? score = 2 : score = 3);
            break;
        case "goalR1":
            score = 4;
            break;
        case "goalR2":
            score = 4;
            break;
        case "goalR3":
            score = 4;
            break;
        case "V0":
            score = 4;
            break;
        case "V1":
            (bd == 1 ? score = 2 : score = 3);
            break;
        case "V2":
            (bd == 2 ? score = 2 : score = 3);
            break;
        case "V3":
            (bd == 3 ? score = 2 : score = 3);
            break;
        case "sumVs":
            score = 4;
            break;
        case "goalV0":
            score = 4;
            break;
        case "goalV1":
            (bd == 1 ? score = 2 : score = 3);
            break;
        case "goalV2":
            (bd == 2 ? score = 2 : score = 3);
            break;
        case "goalV3":
            (bd == 3 ? score = 2 : score = 3);
            break;
        case "IA":
            score = 4;
            break;
        case "ImA":
            score = 4;
            break;
        case "goalIA":
            score = 4;
            break;
        case "goalImA":
            score = 4;
            break;
        case "no match":
            score = 0;
            break;
        case "??":
            score = 0;
            break;
    }
    return score;
}

//Assuming that an action contains multiple numbers and that at least some of
//those numbers are associated with multiple variables, the algorithm for
//computing the score is to examine the scores for each of the numbers in the
//message, find the minimum score for those variables, then iterate over the numbers
//and return the sum of those scores

function scoreAction(action) {
    var vrs = action.varRefs;
    var s = [];
    var ns;
    var score = 0;
    if (vrs) {
    for (var i = 0; i < vrs.length; i++) { //iterating over the numbers
        s[i] = 5;
        for (var j = 0; j < vrs[i].length; j++) { //iterating over the variables for each number
            if (vrs[i].length == 0) { //if no variable was matched for this number
                return 0; //the score is zero
            } else {
                ns = vrs[i][j][3]; //the score for the j'th variable
                if (ns < s[i]) { //if it's smaller than the last one
                    s[i] = ns; //replace the last one
                } //s[i] is the minimum score over all the variables associated with
                //the ith number
            }
        } //next j
        score += s[i]; //the score for the action is the sum of the scores for
        //each of its numbers
    } //next i
    return score;
}}

function highlightMessage(act) { //Highlights the variable names, if any, in a message
    //returns the highlighted message
    var msg = act.msg;
    vrArray = act.varRefs;
    var messageWithoutSpaces = msg.replace(/\s/g, '');
    var numRegEx = new RegExp(/([[0-9]+\.?[0-9]*)|(\.[0-9]+)/g);
    var numArray = messageWithoutSpaces.match(numRegEx);
    //numArray is an array of all the numbers in the message, including those
    //for which no matching variable was found
    //to a given number in the message
    if (numArray) { //if there are numbers in the message
        for (i = 0; i < numArray.length; i++) { //look at each and try to match it
            var numStr = numArray[i]; //the number string in the message.
            var matchedVariables = []; //array to store matching variables for this number
            for (j = 0; j < vrArray[i].length; j++) { //compare it to the i'th array of var refs
                vrNum = vrArray[i][j][2]; //the number that matched the variable
                vrVar = vrArray[i][j][1]; //the string representing the variable
                if (numStr == vrNum) { //if it matches the number in the message
                    vrScore = vrArray[i][j][3];
                    matchedVariables.push(vrVar); //put it in the array
                }
            }
            var highlightedStr = " <mark>["
            for (var k = 0; k < matchedVariables.length; k++) {
                highlightedStr += matchedVariables[k] + ", ";
            }
            highlightedStr = highlightedStr.substring(0, highlightedStr.length - 2) + "]</mark>";
            msg = msg.replace(numArray[i], numArray[i] + highlightedStr);
        }
    }
    return msg;
}

function getVarRefs(action, text) {
    //returns an array (possibly empty) of variable references contained in text.
    //(the message of a message action and/or the input or output of a calculation)
    //A variable reference is an array consisting of the action in which the
    //reference occurs, a string representing the variable that is matched, a string
    //representing the number that was matched, and a numerical score indicating whether
    //the value of the variable was globally known (e.g., E and/or R0 at some levels),
    //known to the actor of the action (e.g.,the actor's own resistance or voltage),
    //known to some other member of the team, or unknown (presumably, the result of a calculation)

    var textWithoutSpaces = text.replace(/\s/g, '');
    var pattern = new RegExp(/([[0-9]+\.?[0-9]*)|(\.[0-9]+)/g);
    var nums = textWithoutSpaces.match(pattern);
    var vrs = [] //array that will contain all the variable references
    //contained in the action. It will remain empty if nums is null or
    //no VRs are found.
    if (nums) {
        //nums is an array of strings representing all the numbers in text
        for (var i = 0; i < nums.length; i++) {
            vrs[i] = findVars(action, nums[i]); //matches the numbers to the variables.
            //returns an array of varRefs;
        }
    }
    return vrs;
}

//This function looks for variables by matching numStr to their numeric values.
//If it finds a match it returns an array of variable reference objects, each of
//which is itself a four-dimensional array consisting of the action object,
//the label of the variable matched, the string that was matched, and a score
//(0 to 5). Note: numStr can match more than one variable, which is why the
//function returns an array, rather than a single varRef
function findVars(act, numStr) {
    var num = parseFloat(numStr);
    var myLevel = act.level;
    var returnArray = [];
    var E = myLevel.E,
        R0 = myLevel.R0,
        goalV1 = myLevel.goalV[0],
        goalV2 = myLevel.goalV[1],
        goalV3 = myLevel.goalV[2],
        goalV0 = E - goalV1 - goalV2 - goalV3,
        sumGoalVs = goalV1 + goalV2 + goalV3,
        goalR1 = myLevel.goalR[0],
        goalR2 = myLevel.goalR[1],
        goalR3 = myLevel.goalR[2],
        sumGoalRs = goalR1 + goalR2 + goalR3,
        R1 = act.R[0],
        R2 = act.R[1],
        R3 = act.R[2],
        sumRs = R1 + R2 + R3,
        sumRsPlusR0 = sumRs + R0,
        Rtot = R0 + R1 + R2 + R3,
        goalRtot = R0 + goalR1 + goalR2 + goalR3,
        V0 = E * R0 / Rtot,
        V1 = act.V[0],
        V2 = act.V[1],
        V3 = act.V[2],
        sumVs = V1 + V2 + V3,
        IA = E / Rtot,
        ImA = 1000 * IA,
        goalIA = E / goalRtot,
        goalImA = 1000 * goalIA;
    //tol is how close two numbers have to be to considered "about equal"
    //Note: we compare tol to |x - y| / (x + y) so it's a relative value
    var tol = .01,
    thisStr = "";
    var variableFound = false;
    if (about(num, E, tol)) {
        variableFound = true;
        thisStr = "E";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, R0, tol)) {
        variableFound = true;
        thisStr = "R0";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, R1, tol)) {
        variableFound = true;
        thisStr = "R1";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, R2, tol)) {
        variableFound = true;
        thisStr = "R2";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        returnArray.push(thisVarRef);
    }
    if (about(num, R3, tol)) {
        variableFound = true;
        thisStr = "R3";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, sumRs, tol)) {
        variableFound = true;
        thisStr = "sumRs";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, sumRsPlusR0, tol)) {
        variableFound = true;
        thisStr = "sumRsPlusR0";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, V0, tol)) {
        variableFound = true;
        thisStr = "V0";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, V1, tol)) {
        variableFound = true;
        thisStr = "V1";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, V2, tol)) {
        variableFound = true;
        thisStr = "V2";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, V3, tol)) {
        variableFound = true;
        thisStr = "V3";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, sumVs, tol)) {
        variableFound = true;
        thisStr = "sumVs";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalR1, tol)) {
        variableFound = true;
        thisStr = "goalR1";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalR2, tol)) {
        variableFound = true;
        thisStr = "goalR2";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalR3, tol)) {
        variableFound = true;
        thisStr = "goalR3";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalV0, tol)) {
        variableFound = true;
        thisStr = "goalV0";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalV1, tol)) {
        variableFound = true;
        thisStr = "goalV1";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalV2, tol)) {
        variableFound = true;
        thisStr = "goalV2";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalV3, tol)) {
        variableFound = true;
        thisStr = "goalV3";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, IA, tol)) {
        variableFound = true;
        thisStr = "IA";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, ImA, tol)) {
        variableFound = true;
        thisStr = "ImA";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, goalIA, tol)) {
        variableFound = true;
        thisStr = "goalIA";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (about(num, ImA, tol)) {
        variableFound = true;
        thisStr = "goalImA";
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    if (!variableFound) { //if there is no match
        (act.type == "message" ? thisStr = "no match" : 
            thisStr = "??");
        thisVarRef = [act, thisStr, numStr, score(thisStr, act)];
        act.level.varRefs[thisStr].push(thisVarRef);
        returnArray.push(thisVarRef);
    }
    return returnArray;
}

function makeTeams(rowObjs) { //parse the row objects array looking for and populating teams
    for (i = 0; i < rowObjs.length; i++) {
        var ro = rowObjs[i];
        if ((ro["event"] == "Activity Settings") || (ro["event"] == "Joined Group") ||
            (ro["event"] == "model options") || (ro["event"] == "model name") ||
            (ro["event"] == "model values") || (ro["event"] == "Selected board") ||
            (ro["event"] == "Selected Username")) {
            // These events all have groupname and levelName
            addTeam(ro);
        }
        //   if ((ro["event"] == "Selected Username") || (ro["event"] == "Joined Group") ||
        // (ro["event"] == "Selected board") ||)) {
        //   addMember;
        // }
    }
    return teams;
}

function about(num, target, tol) {
    return (Math.abs((num - target) / Math.abs(num + target)) < tol)
    }

//We invoke this function when the event is "Selected Username" or "Joined Group"
//we construct a new team from ro and add it to teams array.
//If we already have a team with that name, we use it.
function addTeam(ro) {
    var userID = ro["username"].slice(0, 5); //First five characters are the user id
    var myClass = getMemberDataObj(userID)["Class"];
    var classID = getMemberDataObj(userID)["Class ID"];
    var teacher = getMemberDataObj(userID)["Teachers"];
    var inTeams = false;
    var groupName = ro["groupname"];
    var levelNumber = ro["levelName"].charAt(ro["levelName"].length - 1); //number = 1 ... 4


    //check to see whether we already have a team with this name in this class
    for (var j = 0; j < teams.length; j++) {

        //if we have a team with this name but a different class

        if ((teams[j].name == groupName) && (teams[j].classID != classID)) {
            console.log("same name, different class.");
        }
        if ((teams[j].name == groupName) && (teams[j].classID == classID)) {
            inTeams = true;
            myTeam = teams[j]; //set myTeam to be the one we found in the array
            break;
        }
    }
    if (!inTeams) { //if a team with this name and class is not in the teams array
        myTeam = new team; //make a new one
        teams.push(myTeam); //and put it on the array
        myTeam.name = groupName;
        myTeam.class = myClass;
        myTeam.classID = classID;
        myTeam.levels = [];
        myTeam.members = [];
        myTeam.teacher = teacher;
    }
    addLevel(myTeam, ro); //add level, if new
    addMember(myTeam, ro)
}

function addLevel(myTeam, ro) { //construct a new level from ro and add it to levels array.
    //If we already have a level with that number, use it
    //   console.log("Adding a level");
    var inLevels = false;
    //Check to see whether we already have a level with this number in this team
    var num = ro["levelName"].charAt(ro["levelName"].length - 1);
    for (j = 0; j < myTeam.levels.length; j++) {
        if (myTeam.levels[j].number == num) {
            inLevels = true;
            //          console.log("Level already found, adding values");
            myLevel = myTeam.levels[j];
            addLevelValues(myLevel, ro);
            break;
        }
    }
    if (!inLevels) { //if not, add this level
        var myLevel = new level;
        //       console.log("new level, not in teams");
        myTeam.levels.push(myLevel);
        myLevel.startUTime = ro["time"];
        var startDate = new Date(parseFloat(myLevel.startUTime * 1000));
        myLevel.startPTime = startDate;
        myLevel.number = num;
        myLevel.label = getAlphabeticLabel(num);
        myLevel.team = myTeam;
        myLevel.success = false;
        myLevel.successE = false;
        myLevel.successR = false;
        myLevel.attainedVs = false;
        myLevel.movedAwayFromVs = false;
        addLevelValues(myLevel, ro);
        myLevel.varRefs = function() {} //List of references to known variables
        //Each property is a variable label and is associated with an array of
        //actions (messages and calculations) that contain a reference
        //to that variable, paired with a string that defines whether the
        //variable is globally known, known to the actor, known to some other
        //team member, or unknown (e.g., E or R0 at higher levels)
        initializeVarRefs(myLevel); //Set all the arrays empty
        myLevel.actions = [];
    }
}

function addMember(myTeam, ro) { //If the member doesn't already exist, construct a
    //new member from ro and add it to the members array
    //    var po = JSON.parse(ro["parameters"].replace(/=>/g, ":").replace(/nil/g, "\"nil\""));
    var userID = ro["username"].slice(0, 5); //First five characters are the user id
    //Check to see whether we already have a member with this id in this team
    inMembers = false;
    for (j = 0; j < myTeam.members.length; j++) {
        if (myTeam.members[j].id == userID) {
            inMembers = true;
            myMember = myTeam.members[j];
            break;
        }
    }
    if (!inMembers) { //if not, make a new member
        myMember = new member;
        myTeam.members.push(myMember);
        myMember.startTime = ro["time"];
        //        myMember.startPTime = unixTimeConversion(myMember.startTime);
        //        myMember.colIndex = colIndex; //used for identifying member when counting actions
        myMember.colIndex = myTeam.members.length - 1 // will be 0, 1, or 2
        var colorArray = ["DarkTurquoise", "Gold", "GreenYellow"];
        //from level to level. Used in identifying the member when we count or score actions.
        myMember.color = colorArray[myMember.colIndex];
        myMember.id = userID;
        if (myMember.name) { // if we've assigned a name to this member
            myMember.styledName = "<span style= \"background-color: " + myMember.color + "\">" + myMember.name + "</span>"
        }
        myMember.studentName = ""; //Placeholder for the student's real name (if available)
        myMember.teacherName = ""; //Placeholder for the teacher's name (if available)
        for (var i = 0; i < studentDataObjs.length; i++) {
            if (studentDataObjs[i]["UserID"] == myMember.id) {
                if (!studentDataObjs[i]["team"]) {
                    studentDataObjs[i]["team"] = myTeam;
                } else if (studentDataObjs[i] != myTeam) {
                    console.log("More than one team found for student id " + myMember.id +
                        ", first team = " + studentDataObjs[i]["team"].name +
                        ", second team = " + myTeam.name + ", time = " + ro["time"]);
                }
                studentDataObjs[i]["team"] = myTeam;
                myMember.studentName = studentDataObjs[i]["Student Name"];
                myMember.teacherName = studentDataObjs[i]["Teachers"];
                myMember.classID = studentDataObjs[i]["Class ID"];
                myMember.school = studentDataObjs[i]["School"];
                break;
            }
        }
        if (myMember.studentName == "") {
            console.log("Student id " + myMember.id + " not found, Team = " + myTeam.name);
        }
        myMember.team = myTeam;
        myTeam.teacherName = myMember.teacherName.replace(" ", "_");
        myTeam.classID = myMember.classID;
        myTeam.school = myMember.school;
        var notInTeachers = true;
        //if this team is not yet registered to a teacher...
        for (var j = 0; j < teachers.length; j++) {
            if (myTeam.teacherName == teachers[j]) {
                notInTeachers = false;
            }
        }
        //push it to the teachers array
        if (notInTeachers) {
            teachers.push(myTeam.teacherName)
        }
    }
    // Regardless of whether or not this is a new member fill in these values, if possible
    if (ro["event"] == "Selected Username") {
        myMember.name = ro["event_value"];
        if (myMember.color) {
            myMember.styledName = "<span style= \"background-color: " + myMember.color + "\">" + myMember.name + "</span>";
        }
    }
    if (ro["event"] == "Selected board") {
        myMember.board = parseInt(ro["board"]) + 1;
        if ((myMember.color) && (myMember.name)) {
            myMember.styledName = "<span style= \"background-color: " + myMember.color + "\">" + myMember.name + "</span>";
        }

    }
}

function getLevel(ro) { //assumes that groupName and levelName are properties of ro
    var teamName = ro["groupname"];
    var levelNumber = ro["levelName"].charAt(ro["levelName"].length - 1);;
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].name == teamName) {
            myTeam = teams[i];
        }
    }
    for (var j = 0; j < myTeam.levels.length; j++) {
        if (myTeam.levels[j].number == levelNumber) {
            var myLevel = myTeam.levels[j];
        } else {
            myLevel = new level;
            myLevel.startUTime = ro["time"];
            var startDate = new Date(parseFloat(myLevel.startUTime * 1000));
            myLevel.startPTime = startDate;
            myLevel.number = levelNumber;
            myLevel.label = getAlphabeticLabel(levelNumber);
            myLevel.team = myTeam;
            myLevel.actions = [];
            myLevel.success = false;
            //    myLevel.varRefs = function() {}
            //    initializeVarRefs(myLevel); //Set all the arrays empty
        }
    }
    return myLevel;
}

function addLevelValues(myLevel, ro) {
    if (ro["event"] == "model values") {
        myLevel.goalR = [parseInt(ro["GoalR1"]), parseInt(ro["GoalR2"]), parseInt(ro["GoalR3"])];
        myLevel.goalV = [parseFloat(ro["V1"]), parseFloat(ro["V2"]), parseFloat(ro["V3"])];
    }
    if (ro["event"] == "Activity Settings") {
        //     console.log("In addLevelValues. Level name = " + myLevel.name + ", level " + myLevel.label);
        myLevel.E = parseInt(ro["E"]);
        myLevel.R0 = parseInt(ro["R0"]);
        myLevel.initR = [parseInt(ro["r1"]), parseInt(ro["r2"]), parseInt(ro["r3"])];
        myLevel.R = [];
        for (var i = 0; i < myLevel.initR.length; i++) {
            myLevel.R[i] = myLevel.initR[i];
        }
        myLevel.V = findVValues(myLevel.E, myLevel.R0, myLevel.R);
    }
}

//Check to see whether the team at this row is in the teams array
function findTeam(teams, ro) {
    var teamName = ro["groupname"];
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].name == teamName) {
            return teams[i];
        } else {
            //            console.log("No such team!" + teamName);
        }
    }
}


function getMemberDataObj(userID) { //Takes the userID and returns the studentData object for that ID
    var memberDataObject = function() {};
    for (var i = 0; i < studentDataObjs.length; i++) {
        if (studentDataObjs[i]["UserID"] == userID) {
            memberDataObject = studentDataObjs[i];
        }
    }
    return memberDataObject;
}

//Check to see whether name is in the members array for some team. If so, return the member.
function findMember(id) {
    for (var j = 0; j < teams.length; j++) {
        team = teams[j];
        for (var i = 0; i < team.members.length; i++) {
            if (team.members[i].id == id) {
                return team.members[i];
            } else {
                //        console.log("no such member!" + name);
            }
        }
    }
}

function unixTimeConversion(uTime) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(uTime * 1000);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();

    var formattedTime = month + "/" + day + "/" + year + " " +
        hours + ':' + minutes + ":" + seconds + "." + milliseconds;
    return (formattedTime);
}

function arrayToObjects(rows) {
    var headers = rows[0];

    function rowObj() {};
    var rowObjs = [];
    for (i = 1; i < rows.length; i++) {
        currentRow = new rowObj;
        var row = rows[i];
        if (row.length == headers.length) {
            for (j = 0; j < row.length; j++) {
                currentRow[headers[j]] = row[j];
            }
        }
        rowObjs.push(currentRow);
    }
    return rowObjs;
}

//returns A for level 2, B for level 3, and so forth
function getAlphabeticLabel(index) {
    var alphaArray = ["A", "B", "C", "D"];
    if ((index >= 2) && (index <= 5)) {
        return alphaArray[index - 2];
    } else {
        alert("Alphabetic label array index out of range." + index)
    }
}

function testScore(varStr) {
    var act = new action;
    var lvl = new level;
    lvl.number = 1;
    lvl.label = "A";
    act.board = 2;
    act.level = lvl;
    console.log(score(varStr, act));
}
