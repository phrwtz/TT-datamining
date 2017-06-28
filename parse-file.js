//global variables
var team = function() {};
var level = function() {};
var member = function() {};
var action = function() {};
var teams = [];
var teachers = [];
var studentDataObjs = [];
var timeZone = -5; //offset for Eastern Standard Time
var vrLabelsArray = ["E", "R0", "R1", "R2", "R3", "sumRs", "sumRsPlusR0", "V0", "V1", "V2", "V3",
    "sumVs", "goalR1", "goalR2", "goalR3", "sumGoalRs", "goalV0", "goalV1", "goalV2", "goalV3", "sumGoalVs",
    "Rtot", "goalRtot", "IA", "ImA", "goalIA", "goalImA", "??"]; //Array of varRef labels (used to label)
var csvActionsArray = [["Teacher", "Date", "Team", "Level", "Time", "Action", "Actor", "Message", "Input", "Result",
	    "Old Resistance", "New Resistance", "Dial Position", "Probe Positions", "Measurement type",
	    "Measurement Result", "Submit E-Value", "Submit E-Unit", "Submit R0-Value", "Submit R0-Unit"]]; //col headings for Actions File Download as csv file
var csvSummaryArray = [["Teacher", "Date", "Team", "Level", "Time", "Summary Type", "Actor", "Total Mssg Score", "Number Mssgs", "Avg Mssg Score"]] // col headings for Summary File Downloads as csv file
var csvFilename;

function parseCSV() {
    var filteredTeams = [];
    console.log("parse-file: starting parse");
    teams = []; //Clear the teams array (which might be populated if we haven't
    //refreshed the page).
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/;
    if (regex.test(fileInput.value)) {
        if (typeof(FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onerror = function(err) {
                console.log(err);
            }
            reader.onloadend = function(e) {

                console.log("parse-file: file loaded");
                fileName = fileInput.files[0].name;
                var obj = Papa.parse(e.target.result);
                console.log("parse-file: data parsed");
                
            //Sort obj by time
                var headerArray = obj.data[0];               
                var dataArray = obj.data.slice(1, obj.data.length) //omit the header row when sorting
                dataArray.sort(sortByTime);
                var dataPlusHeaderArray = new Array;
                dataPlusHeaderArray[0] = headerArray;
                for (var ii = 1; ii < dataArray.length + 1; ii++) {
                    dataPlusHeaderArray[ii] = dataArray[ii - 1];
                }
                
            //Turn the rows into objects
                rowObjs = arrayToObjects(dataPlusHeaderArray);
                console.log("parse-file: row objects created");
                teams = makeTeams(rowObjs);
                for (var i = 0; i < teams.length; i++) {
                    if (teams[i].members.length == 3) {
                        filteredTeams.push(teams[i]);
                    }
                }
                teams = filteredTeams;
                console.log("parse-file: " + teams.length + " teams found");
                changes = analyze(rowObjs);
                console.log("parse-file: analysis complete");
                setupForm(teams);
                console.log("parse-file: form set up");
            }
            reader.readAsText(fileInput.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}
