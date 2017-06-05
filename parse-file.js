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
"Rtot", "goalRtot", "IA", "ImA", "goalIA", "goalImA", "??"] //Array of varRef labels (used to label
var csvArray = [["Team", "Level","Time", "Action", "Actor", "Message", "Input", "Result", "Old Resistancde", "New Resistance"]]; //Array of values to be downloaded as a .csv file
var csvFilename;

function parseCSV() {
    var filteredTeams = [];
    console.log("starting parse");
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
                console.log("file loaded");
                var fileName = fileInput.files[0].name;
                var truncatedFilename = fileName.slice(0, (fileName.length - 4));
                csvFilename = truncatedFilename + ".LOGS.csv"
                var obj = Papa.parse(e.target.result);
                console.log("data parsed");
                rowObjs = arrayToObjects(obj.data);
                console.log("row objects created");
                teams = makeTeams(rowObjs);
                for (var i = 0; i < teams.length; i++) {
                    if (teams[i].members.length == 3) {
                        filteredTeams.push(teams[i]);
                    }
                }
                teams = filteredTeams;
                console.log("teams generated");
                changes = analyze(rowObjs);
                console.log("analysis complete");
                setupForm(teams);
                console.log("form set up");
            }
            reader.readAsText(fileInput.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}
