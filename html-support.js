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
    var checkDiv = document.createElement("div");
    var checkForm = document.createElement("form");
    checkForm.ID = "checkForm";
    var checkTable = document.createElement("table");
    var headerRow = document.createElement("tr");
    var checkBoxRow = document.createElement("tr");
    var headerCell1 = document.createElement("th");
    var headerCell2 = document.createElement("th");
    var headerCell3 = document.createElement("th");
    var headerCell4 = document.createElement("th");
    headerCell1.innerHTML = "Teams";
    headerCell2.innerHTML = "Levels";
    headerCell3.innerHTML = "Actions";
    headerCell4.innerHTML = "Summary Data";
    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
    headerRow.appendChild(headerCell3);
    headerRow.appendChild(headerCell4);

    var teamData = document.createElement("td");
    var levelData = document.createElement("td");
    var actionData = document.createElement("td");
    var summaryData = document.createElement("td");
    var typeStr = 'type="checkbox"  ';
    var IDStr = 'id="all-teams" name="team" ';
    var onChangeStr = "onchange = \"toggleSelectAll('team')\"";
    var labelStr = 'All teams<br>';
    teamData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (var i = 0; i < teams.length; i++) {
        IDStr = 'id=team-' + teams[i].name + ' name=team>';
        labelStr = teams[i].name + "<br>";
        teamData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    var IDStr = 'id="all-levels" name="level" ';
    var onChangeStr = "onchange = \"toggleSelectAll('level')\"";
    labelStr = 'All levels<br>';
    levelData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    var levelLabels = ["A", "B", "C", "D"];
    for (j = 0; j < levelLabels.length; j++) {
        IDStr = 'id=level-' + levelLabels[j] + ' name=level>';
        labelStr = levelLabels[j] + "<br>";
        levelData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    IDStr = 'id="all-actions"';
    onChangeStr = 'onchange="toggleSelectAll("action")">';
    labelStr = 'all-actions<br>';
    var actionLabels = ["message", "calculation", "resistorChange", "attach-probe", "detach-probe", "connect-lead", "disconnect-lead", "submit", "joined-group"];
    for (var k = 0; k < actionLabels.length; k++) {
        IDStr = 'id=action-' + actionLabels[k] + "> ";
        labelStr = actionLabels[k] + "<br>";
        actionData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }

    var summaryNames = ["rChg", "iRep"];
    var summaryIDs = ["resistor-change", "action-scores"];
    var summaryLabels = ["Resistor change types by level", "Action scores"];
    for (var l = 0; l < summaryLabels.length; l++) {
        IDStr = ' id = ' + summaryIDs[l] + "> ";
        nameStr = ' name = ' + summaryNames[l];
        labelStr = summaryLabels[l] + "<br>";
        summaryData.innerHTML += "<input " + typeStr + nameStr + IDStr + labelStr;
    }
    document.body.appendChild(checkDiv);
    checkDiv.appendChild(checkForm);
    checkForm.appendChild(checkTable);
    checkTable.appendChild(headerRow);
    checkTable.appendChild(checkBoxRow);
    checkBoxRow.appendChild(teamData);
    checkBoxRow.appendChild(levelData);
    checkBoxRow.appendChild(actionData);
    checkBoxRow.appendChild(summaryData);
    //    checkForm.addEventListener("submit", report(teams));
    var submitButton = document.createElement("button");
    var t = document.createTextNode("Submit query");
    submitButton.type = "submit";
    submitButton.setAttribute("onclick", "generateReport(teams); return false;");
    submitButton.appendChild(t);
    checkForm.appendChild(submitButton);
    console.log("form created");
    var p = document.createElement("p");
    p.id = "data";
    checkDiv.appendChild(p);
}
