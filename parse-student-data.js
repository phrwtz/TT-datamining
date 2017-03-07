function parseStudentData() {
    console.log("starting student data parse");
    var reader = new FileReader();
    reader.onloadend = function(e) {
        console.log("student data loaded");
        var obj = Papa.parse(e.target.result);
        console.log("student data parsed");
        studentDataObjs = arrayToObjects(obj.data);
        console.log("student data objects created");
    }
    reader.readAsText(studentDataInput.files[0]);
}
