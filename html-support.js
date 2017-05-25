function toggleSelectAll(checkboxName) {
    var checkboxArray = $("input[name=" + checkboxName + "]");
    if (checkboxArray[0].checked) {
        for (var i = 0; i < checkboxArray.length - 1; i++) {
            checkboxArray[i + 1].checked = true;
        }
    } else {
        for (var j = 0; j < checkboxArray.length - 1; j++) {
            checkboxArray[j + 1].checked = false;
        }
    }
}

function setupForm(teams) {
    if (document.getElementById("checkDiv")) { //If checkDiv exists
        var checkDiv = document.getElementById("checkDiv"); //clear it
        while (checkDiv.firstChild) {
            checkDiv.removeChild(checkDiv.firstChild);
        }
    } else { //otherwise create one
        var checkDiv = document.createElement("div");
        checkDiv.id = "checkDiv";
    }
    var checkForm = document.createElement("form");
    checkForm.ID = "checkForm";
    var checkTeacher = document.createElement("input");
    checkTeacher.ID = "checkTeacher";
 //   checkTeacher.setAttribute("type", "radio");
    checkForm.appendChild(checkTeacher);
    var checkTable = document.createElement("table");
    var headerRow = document.createElement("tr");
    var checkBoxRow = document.createElement("tr");
    var headerCell1 = document.createElement("th");
    var headerCell2 = document.createElement("th");
    var headerCell3 = document.createElement("th");
 //   var headerCell4 = document.createElement("th");
    var headerCell5 = document.createElement("th");
    var headerCell6 = document.createElement("th");

    headerCell1.innerHTML = "Teams";
    headerCell2.innerHTML = "Levels";
    headerCell3.innerHTML = "Actions";
//    headerCell4.innerHTML = "Variable Refs";
    headerCell5.innerHTML = "Summary Data";
    headerCell6.innerHTML = "Teacher Reports";

    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
    headerRow.appendChild(headerCell3);
//    headerRow.appendChild(headerCell4);
    headerRow.appendChild(headerCell5);
    headerRow.appendChild(headerCell6);

    var teamData = document.createElement("td");
    var levelData = document.createElement("td");
    var actionData = document.createElement("td");
    var summaryData = document.createElement("td");
 //   var varRefData = document.createElement("td");
    var teacherData = document.createElement("td");

    var typeStr = 'type="checkbox"  ';
    var IDStr = 'id="all-teams" name="team" ';
    var onChangeStr = "onchange = \"toggleSelectAll('team')\"";
    var labelStr = '<b>All teams</b><br>';
    teamData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (var i = 0; i < teams.length; i++) {
        IDStr = 'id=team-' + teams[i].name + teams[i].classID + ' name=team>';
        labelStr = teams[i].name + "<br>";
        teamData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    IDStr = 'id="all-teachers" name="teachers" ';
    onChangeStr = "onchange = \"toggleSelectAll('teachers')\"";
    labelStr = '<b>All teachers</b><br>';
    teacherData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (j = 0; j < teachers.length; j++) {
        IDStr = 'id=report-' + teachers[j] + ' name=teachers>';
        teacherData.innerHTML += "<input " + typeStr + IDStr + teachers[j] + "<br>";
    }

    IDStr = 'id="all-levels" name="level" ';
    onChangeStr = "onchange = \"toggleSelectAll('level')\"";
    labelStr = '<b>All levels</b><br>';
    levelData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    var levelLabels = ["A", "B", "C", "D"];
    for (j = 0; j < levelLabels.length; j++) {
        IDStr = 'id=level-' + levelLabels[j] + ' name=level>';
        labelStr = levelLabels[j] + "<br>";
        levelData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    IDStr = 'id="all-actions" name="action" ';
    onChangeStr = "onchange = \"toggleSelectAll('action')\"";
    labelStr = '<b>All actions</b><br>';
    actionData.innerHTML = "<input + " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    var actionLabels = ["message", "calculation", "resistorChange", "attach-probe", "detach-probe", 
    "connect-lead", "disconnect-lead", "measurement", "move-DMM-dial", "submit-V", "submit-ER", "joined-group"];
    for (var k = 0; k < actionLabels.length; k++) {
        IDStr = 'id=action-' + actionLabels[k] + " name=action>";
        labelStr = actionLabels[k] + "<br>";
        actionData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    // IDStr = 'id="all-varRefs" name="varRef" ';
    // onChangeStr = "onchange = \"toggleSelectAll('varRef')\"";
    // labelStr = '<b>All refs</b><br>';
    // varRefData.innerHTML = "<input + " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    // var varRefLabels = ["E", "R0", "R1", "R2", "R3", "V0", "V1", "V2", "V3", "sumVs", "goalR1", "goalR2", "goalR3", "goalV1", "goalV2", "goalV3", "Rtot", "goalRtot", "IA", "ImA", "goalIA", "goalIma"]
    // for (var kk = 0; kk < varRefLabels.length; kk++) {
    //     IDStr = 'id=varRef-' + varRefLabels[kk] + " name=varRef>";
    //     labelStr = varRefLabels[kk] + "<br>";
    //     varRefData.innerHTML += "<input + " + typeStr + IDStr + labelStr;
    // }

    var summaryNames = ["rChg", "iRep", "results"];
    var summaryIDs = ["resistor-change", "action-scores", "teacher-report"];
    var summaryLabels = ["Resistor changes", "Message scores"];
    for (var l = 0; l < summaryLabels.length; l++) {
        IDStr = 'id = summary-' + summaryIDs[l] + " name=summary>";
        labelStr = summaryLabels[l] + "<br>";
        summaryData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    document.body.appendChild(checkDiv);
    checkDiv.appendChild(checkForm);
    checkForm.appendChild(checkTable);
    checkTable.appendChild(headerRow);
    checkTable.appendChild(checkBoxRow);
    checkBoxRow.appendChild(teamData);
    checkBoxRow.appendChild(levelData);
    checkBoxRow.appendChild(actionData);
//    checkBoxRow.appendChild(varRefData);
    checkBoxRow.appendChild(summaryData);
    checkBoxRow.appendChild(teacherData);

    var submitButton = document.createElement("button");
    var clearButton = document.createElement("button");
    var downLoadButton = document.createElement("button");

    var submitText = document.createTextNode("Submit query");
    submitButton.appendChild(submitText);
    submitButton.type = "submit";
    submitButton.setAttribute("onclick", "generateReport(teams); return false;");
    checkForm.appendChild(submitButton);

    var clearText = document.createTextNode("Clear screen");
    clearButton.appendChild(clearText);
    clearButton.setAttribute("onclick", "clearScreen(); return false;");
    checkForm.appendChild(clearButton);

    var downLoadText = document.createTextNode("Download");
    downLoadButton.appendChild(downLoadText);
    downLoadButton.setAttribute("onclick", "download(teams); return false")
    checkForm.appendChild(downLoadButton);

    console.log("form created");
    var p = document.createElement("p");
    p.id = "data";
    checkDiv.appendChild(p);
}
