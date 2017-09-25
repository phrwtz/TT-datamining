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
    var checkForm = document.createElement("form"); // coming soon: enter name
    checkForm.ID = "checkForm";
    checkForm.style.margin = "5px";
    var checkTeacher = document.createElement("input");
    checkTeacher.ID = "checkTeacher";
    checkTeacher.value = "...coming soon: enter teacher name here";
    checkTeacher.style.width = "250px";
    //checkForm.appendChild(checkTeacher);
    var checkTable = document.createElement("table");
    checkTable.style.margin = "5px";
    var headerRow = document.createElement("tr");
    var checkBoxRow = document.createElement("tr");
    var headerCell1 = document.createElement("th");
    var headerCell2 = document.createElement("th");
    var headerCell3 = document.createElement("th");
    var headerCell4 = document.createElement("th");
    var headerCell5 = document.createElement("th");
    var headerCell6 = document.createElement("th");

    headerCell1.innerHTML = "Teams";
    headerCell2.innerHTML = "Levels";
    headerCell3.innerHTML = "Actions";
    headerCell4.innerHTML = "Variable Refs";
    headerCell5.innerHTML = "Summary Data";
    headerCell6.innerHTML = "Teacher Reports";

    headerRow.appendChild(headerCell1);
    headerRow.appendChild(headerCell2);
    headerRow.appendChild(headerCell3);
    headerRow.appendChild(headerCell4);
    headerRow.appendChild(headerCell5);
    headerRow.appendChild(headerCell6);

    var teamData = document.createElement("td");
    var levelData = document.createElement("td");
    var actionData = document.createElement("td");
    var summaryData = document.createElement("td");
    var varRefData = document.createElement("td");
    var teacherData = document.createElement("td");

    var typeStr = 'type="checkbox"  ';

    // Teams
    var IDStr = 'id="all-teams" name="team" ';
    var onChangeStr = "onchange = \"toggleSelectAll('team')\"";
    var labelStr = '<b>All teams</b><br>';
    teamData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (var i = 0; i < teams.length; i++) {
        IDStr = 'id=team-' + teams[i].name + teams[i].classID + ' name=team>';
        labelStr = teams[i].name + "<br>";
        teamData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }
    // Levels
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
    // Actions
    IDStr = 'id="all-actions" name="action" ';
    onChangeStr = "onchange = \"toggleSelectAll('action')\"";
    labelStr = '<b>All actions</b><br>';
    actionData.innerHTML = "<input + " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    var actionLabels = ["activity-settings", "message", "calculation", "resistorChange", "attach-probe", "detach-probe",
        "connect-lead", "disconnect-lead", "measurement", "move-DMM-dial", "submit-V", "submit-ER", "joined-group", "opened-zoom", "closed-zoom"
    ];
    for (var k = 0; k < actionLabels.length; k++) {
        IDStr = 'id=action-' + actionLabels[k] + " name=action>";
        labelStr = actionLabels[k] + "<br>";
        actionData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }
    // Variable Refs
    IDStr = 'id="all-varRefs" name="varRef" ';
    onChangeStr = "onchange = \"toggleSelectAll('varRef')\"";
    labelStr = '<b>All refs</b><br>';
    varRefData.innerHTML = "<input + " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (var kk = 0; kk < vrLabelsArray.length; kk++) {
        IDStr = 'id=varRef-' + vrLabelsArray[kk] + " name=varRef>";
        labelStr = vrLabelsArray[kk] + "<br>";
        varRefData.innerHTML += "<input + " + typeStr + IDStr + labelStr;
    }
    // Summary Data
    var summaryNames = ["rChg", "iRep", "results"];
    var summaryIDs = ["resistor-change", "action-scores", "teacher-report"];
    var summaryLabels = ["Resistor changes", "Message scores"];
    for (var l = 0; l < summaryLabels.length; l++) {
        IDStr = 'id = summary-' + summaryIDs[l] + " name=summary>";
        labelStr = summaryLabels[l] + "<br>";
        summaryData.innerHTML += "<input " + typeStr + IDStr + labelStr;
    }
    //Teacher Reports
    IDStr = 'id="all-teachers" name="teachers" ';
    onChangeStr = "onchange = \"toggleSelectAll('teachers')\"";
    labelStr = '<b>All teachers</b><br>';
    teacherData.innerHTML = "<input " + typeStr + IDStr + onChangeStr + ">" + labelStr;
    for (j = 0; j < teachers.length; j++) {
        IDStr = 'id=report-' + teachers[j] + ' name=teachers>';
        teacherData.innerHTML += "<input " + typeStr + IDStr + teachers[j] + "<br>";
    }

    document.body.appendChild(checkDiv);
    checkDiv.appendChild(checkForm);
    checkForm.appendChild(checkTable);
    checkTable.appendChild(headerRow);
    checkTable.appendChild(checkBoxRow);
    checkBoxRow.appendChild(teamData);
    checkBoxRow.appendChild(levelData);
    checkBoxRow.appendChild(actionData);
    checkBoxRow.appendChild(varRefData);
    checkBoxRow.appendChild(summaryData);
    checkBoxRow.appendChild(teacherData);

    var submitButton = document.createElement("button");
    var clearButton = document.createElement("button");
    var downLoadButton = document.createElement("button");
    var strategyButton = document.createElement("button");
    var summaryButton = document.createElement("button");

    var submitText = document.createTextNode("Submit query");
    submitButton.appendChild(submitText);
    submitButton.type = "submit";
    submitButton.setAttribute("onclick", "generateReport(teams); return false;");
    checkForm.appendChild(submitButton);

    var clearText = document.createTextNode("Clear screen");
    clearButton.appendChild(clearText);
    clearButton.setAttribute("onclick", "clearScreen(csvActionsArray, csvSummaryArray); clearReport(); return false;");
    checkForm.appendChild(clearButton);
    console.log("html-support setupForm: check-boxes form created");

    var downLoadText = document.createTextNode("Actions File download");
    downLoadButton.appendChild(downLoadText);
    downLoadButton.setAttribute("onclick", "downloadLogCSV(csvActionsArray); return false;");
    checkForm.appendChild(downLoadButton);

    var summaryText = document.createTextNode("Summary File download");
    summaryButton.appendChild(summaryText);
    summaryButton.setAttribute("onclick", "downloadSummaryCSV(csvSummaryArray); return false;");
    checkForm.appendChild(summaryButton);

    var strategyText = document.createTextNode("Find guess and check");
    strategyButton.appendChild(strategyText);
    strategyButton.setAttribute("onclick", "findGuessAndCheck(teams); return false;");
    //  checkForm.appendChild(strategyButton);
    console.log("guess and check search completed");

    var p = document.createElement("p");
    p.id = "data";
    checkDiv.appendChild(p);

    console.log("html-support: user selection form and action buttons created");
}

function clearReport() {
    if (document.getElementById("reportDiv")) {
        var reptDiv = document.getElementById("reportDiv")
        while (reptDiv.firstChild) {
            reptDiv.removeChild(reptDiv.firstChild);
        }
    }
}

function setUpActionsReport(teams) { //Sets up a table with three columns into which the actions can be inserted with a different column for each actor
    if (document.getElementById("reportDiv")) { //If reportDiv exists
        var reportDiv = document.getElementById("reportDiv"); //clear it
        while (reportDiv.firstChild) {
            reportDiv.removeChild(reportDiv.firstChild);
        }
    } else { //otherwise create one
        var reportDiv = document.createElement("div");
        reportDiv.id = "reportDiv";
        document.body.appendChild(reportDiv);
    }
    var actionTable = document.createElement("table");
    actionTable.id = "actionTable";
    reportDiv.appendChild(actionTable);
}


var rowIndex = counter();

function addLevelRow(team, level) {
    var headerRow = document.createElement("tr");
    headerRow.style.backgroundColor = "#DDFFDD";
    var timeCell = document.createElement("th");
    var teamCell = document.createElement("th");
    teamCell.style.alignItems = "flex-start";
    timeCell.innerHTML = "Time";
    teamCell.innerHTML = "Team " + team.name + ", Level " + level.label + ",  E = " + level.E + " R0 = " + level.R0;
    teamCell.setAttribute("colspan", 3);
    headerRow.appendChild(timeCell);
    headerRow.appendChild(teamCell);
    actionTable = reportDiv.firstChild;
    actionTable.appendChild(headerRow);
    rowIndex.reset();
}

function counter(checkboxName) {
    n = 0;
    return {
        count: function () {
            return n++;
        },
        reset: function () {
            return n = 1
        }
    };
}
var dataWindow;

function showData(act) {
    dataWindow = window.open("", "myWindow", "width=500, height=400, left=500, top=100");
    dataWindow.document.body.innerHTML = "E = " + act.E + ", R0 = " + act.R0 + "<br>R1 = " + act.R[0] + ", R2 = " + act.R[1] + ", R3 = " + act.R[2] + "<br>goalR1 = " + act.goalR[0] + ", goalR2 = " + act.goalR[1] + ", goalR3 = " + act.goalR[2] + "<br>V1 = " + act.V[0] + ", V2 = " + act.V[1] + ", V3 = " + act.V[2] + "<br>goalV1 = " + act.goalV[0] + ", goalV2 = " + act.goalV[1] + ", goalV3 = " + act.goalV[2];
}

function hideData() {
    dataWindow.close();
}

function addActionRow(act, content) {
    var actionRow = document.createElement("tr");
    actionRow.id = 'row-' + rowIndex.count();
    var actionCell0 = document.createElement("td");
    var actionCell1 = document.createElement("td");
    var actionCell2 = document.createElement("td");
    var actionCell3 = document.createElement("td");
    var bd = parseInt(act.board);
    actionTable.appendChild(actionRow);
    actionCell0.innerHTML = act.eMinSecs;
    actionCell0.addEventListener("mousedown", function () {
        showData(act);
    })
    actionCell0.addEventListener("mouseup", function () {
        hideData();
    })

    switch (act.type) {
        case "message":
            actionCell0.style.backgroundColor = "#F9D593";
            break;
        case "resistorChange":
            actionCell0.style.backgroundColor = "#B5F3A9";
            break;
        case "calculation":
            actionCell0.style.backgroundColor = "#B3F3F6";
            break;
        case "measurement":
            actionCell0.style.backgroundColor = "#FACBFA";
            break;
        case "move-dial":
            actionCell0.style.backgroundColor = "#FADEFA";
            break;
        case "opened-zoom":
            actionCell0.style.backgroundColor = "#D9D6FF";
            break;
        case "closed-zoom":
            actionCell0.style.backgroundColor = "#D9D6FF";
            break;
    }
    actionRow.appendChild(actionCell0);

    var cellIndex = bd;
    var idArray = [];
    if (act.actor.id) {
        for (var h = 0; h < 3; h++) {
            idArray[h] = act.team.members[h].id;
        }
        for (var hh = 0; hh < 3; hh++) {
            if (act.actor.id == idArray[hh]) {
                bd = hh;
            }
        }
    }

    switch (bd) {
        case 0:
            actionCell1.innerHTML = content;
            actionCell2.innerHTML = "";
            actionCell3.innerHTML = "";
            actionRow.appendChild(actionCell1);
            actionRow.appendChild(actionCell2);
            actionRow.appendChild(actionCell3);
            // actionCell1.addEventListener("mousedown", function () {
            //     reportAllActions(teams, act);
            //     element = document.getElementById(actionRow.id);
            //     element.scrollIntoView(true);
            // });
            break;
        case 1:
            actionCell1.innerHTML = "";
            actionCell2.innerHTML = content;
            actionCell3.innerHTML = "";
            actionRow.appendChild(actionCell1);
            actionRow.appendChild(actionCell2);
            actionRow.appendChild(actionCell3);
            break;
        case 2:
            actionCell1.innerHTML = "";
            actionCell2.innerHTML = "";
            actionCell3.innerHTML = content;
            actionRow.appendChild(actionCell1);
            actionRow.appendChild(actionCell2);
            actionRow.appendChild(actionCell3);
            break;
    }
}

function runQuery() {

}