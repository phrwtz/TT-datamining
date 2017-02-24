//This function takes a team, a title, a data array in the format
//array[level][member] and a type (so far, type = "Total", "Number", or "Average",
//depending on whether we want the total score, the number of messages, or the average score.)
//and returns a <table> element with the team members' names
//down the left-hand column, the level labels across the top, and the array
//values with summary values (either totals, sums, or averages) in the 5th column and 4th row.

function makeTeamTable(team, title, levelData, type) {
    var table = document.createElement("table"); //the table to be returned
    table.setAttribute("class", type);
    var titleRow = document.createElement("tr"); //contains team name and title
    var titleCell = document.createElement("th"); //will span all six columns
    var levelRow = document.createElement("tr"); //contains level labels
    var levelCell = []; //each element is a <th> element
    var levelsArray = ["Member", "Level A", "Level B", "Level C", "Level D", type];
    var dataRows = []; //each element is a <tr> element
    var dataCells = []; //each element is an array of <td> elements


    var totalRowScores = [0, 0, 0];
    var totalColScores = [0, 0, 0, 0];
    var totalRowMsgs = [0, 0, 0];
    var totalColMsgs = [0, 0, 0, 0];
    var totalScores = 0;
    var totalMsgs = 0;
    var averageScore = 0;


    //add header-formatted cell to titleRow
    titleCell.innerHTML = "Team " + team.name + ": " + title;
    titleCell.setAttribute("colspan", 6);
    titleRow.appendChild(titleCell); //add the cell to the row
    table.appendChild(titleRow); //add the row to the table

    //Add six header-formatted cells to level row
    for (var jj = 0; jj < 6; jj++) {
        levelCell[jj] = document.createElement("th");
        levelCell[jj].innerHTML = levelsArray[jj];
        levelRow.appendChild(levelCell[jj]); //add the cell to the row
        table.appendChild(levelRow); //add the row to the table
    } //next row

    //Create the next four rows, one for each member and one for the total/average
    //Each row has six cells, one for the member name, four for the level data
    //and one for the total/average. Fill them with 0 for the time being.
    for (var i = 0; i < 4; i++) {
        dataRows[i] = document.createElement("tr");
        table.appendChild(dataRows[i]);
        dataCells[i] = [];
        for (var j = 0; j < 6; j++) {
            dataCells[i][j] = document.createElement("td");
            dataCells[i][j].innerHTML = 0;
            dataRows[i].appendChild(dataCells[i][j]);
        }
    }
    //for the first three rows the first cell contains the team members' names
    for (var i = 0; i < 3; i++) {
        dataCells[i][0].innerHTML = "<b>" + team.members[i].name + "</b>";
    }
    //for the last row the first cell contains the type
    dataCells[3][0].innerHTML = "<b>" + type + "</b>";

    //for each of the first three rows
    for (var i = 0; i < 3; i++) {
        //the four cells after the first contain score or average score data from each level
        for (var j = 0; j < levelData.length; j++) { //but not all levels are represented
            //so we have to figure out where to put the data by looking at the level number

            levelNum = (levelData[j].level.number - 1);
            if (type == "Average") {
                dataCells[i][levelNum].innerHTML = levelData[j].averageScores[i];
            } else if (type == "Number") {
                dataCells[i][levelNum].innerHTML = levelData[j].numMsgs[i];
            } else if (type == "Total") {
                dataCells[i][levelNum].innerHTML = levelData[j].totalScores[i];
            }
            totalRowScores[i] += levelData[j].totalScores[i];
            totalRowMsgs[i] += levelData[j].numMsgs[i];
            totalColMsgs[j] += levelData[j].numMsgs[i];
            totalColScores[j] += levelData[j].totalScores[i];
        }
    }

    //The last cells in each row contain either the average or the total
    for (var i = 0; i < 3; i++) {
        if (type == "Average") {
            if (!(totalRowMsgs[i] == 0)) {
                dataCells[i][5].innerHTML = "<b>" + (Math.round(100 * totalRowScores[i] / totalRowMsgs[i]) / 100) + "</b>";
            }
        } else if (type == "Number") {
            dataCells[i][5].innerHTML = "<b>" + totalRowMsgs[i] + "</b>";
        } else if (type == "Total") {
            dataCells[i][5].innerHTML = "<b>" + totalRowScores[i] + "</b>";
        }
    }

    //The second through fifth cells in the fourth row contain the column totals or averages
    for (var j = 0; j < 4; j++) {
        if (type == "Average") {
            if (!(totalColMsgs[j] == 0)) {
                dataCells[3][j + 1].innerHTML = "<b>" + (Math.round(100 * totalColScores[j] / totalColMsgs[j]) / 100) + "</b>";
            }
        } else if (type == "Number") {
            dataCells[3][j + 1].innerHTML = "<b>" + totalColMsgs[j] + "</b>";
        } else if (type == "Total") {
            dataCells[3][j + 1].innerHTML = "<b>" + totalColScores[j] + "</b>";
        }
    }

    //And the sixth cell of the fifth row contain the total of totals or the average
    //of averages
    dataCells[3][5].setAttribute("style", "color:red");
    for (var i = 0; i < totalRowScores.length; i++) {
        totalScores += totalRowScores[i];
        totalMsgs += totalRowMsgs[i];
    }
    if (type == "Average") {
        if (!(totalMsgs == 0)) {
            dataCells[3][5].innerHTML = "<b>" + (Math.round(100 * totalScores / totalMsgs) / 100) + "</b>";
        }
    } else if (type == "Number") {
        dataCells[3][5].innerHTML = "<b>" + totalMsgs + "</b>";
    } else if (type == "Total") {
        dataCells[3][5].innerHTML = "<b>" + totalScores + "</b>";
    }
    return table;
}


//Takes a level and returns a data object with the total number of messages for each actor,
//at that level, the total score of those messages, and the average score of the messages.
//The function also returns the level object itself.
//(Note: members are identified by their color index so that their scores are
//consistent across levels.) if a level is missing the scores for each member on
//that level are zero.
function scoreActions(level) {
    var mems = level.team.members; //Array of members for this team
    var totalScores = [0, 0, 0];
    var returnValues = function() {};
    returnValues.level = level,
        returnValues.numMsgs = [0, 0, 0];
    returnValues.totalScores = [0, 0, 0];
    returnValues.averageScores = [0, 0, 0];

    var act,
        type,
        actor,
        score;

    for (var i = 0; i < level.actions.length; i++) {
        act = level.actions[i];
        type = act.type;
        if (type == "message") {
            actor = act.actor;
            index = actor.colIndex;
            score = act.score;
            returnValues.numMsgs[index] += 1; //a 3-d array with the number of messages sent by each member in this level
            returnValues.totalScores[index] += score; //a 3-D array with the total score of those messages
        }
    }
    for (var i = 0; i < 3; i++) {
        if (!(returnValues.numMsgs[i] == 0)) {
            returnValues.averageScores[i] = Math.round(100 * returnValues.totalScores[i] / returnValues.numMsgs[i]) / 100;
        }
    }
    return returnValues;
}
