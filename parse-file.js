//global variables
var team = function() {};
var level = function() {};
var member = function() {};
var action = function() {};
var teams = [];
var teachers = [];
var studentDataObjs = [];
var timeZone = -5; //offset for Eastern Standard Time

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
