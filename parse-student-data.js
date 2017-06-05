function parseStudentData() {
    console.log("student data: start parse");
    var reader = new FileReader();
    reader.onloadend = function(e) {
        console.log("student data: file loaded");
        var obj = Papa.parse(e.target.result);
        console.log("student data: parsed");
        studentDataObjs = arrayToObjects(obj.data);
		studentCount = studentDataObjs.length;
        console.log("student data: " + studentCount + " students created");
    }
    reader.readAsText(studentDataInput.files[0]);
}
