//global variables
var team = function() {};
var level = function() {};
var member = function() {};
var action = function() {};
var teams = [];
var varRefs = function() {} //List of references to known variables
    //Each property is a variable name and is associated with an array of
    //actions (messages and calculations) that contain a reference
    //to that variable)

function parseCSV() {
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
                console.log("teams generated");
                changes = analyze(rowObjs);
                console.log("analysis complete");
                checkForm = setupForm(teams);
            }
            reader.readAsText(fileInput.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}
