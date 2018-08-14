function parseStudentData() {
    console.log("student data: start parse");
    var reader = new FileReader();
    reader.onloadend = function(e) {
        console.log("parse student data: file loaded");
        var obj = Papa.parse(e.target.result);
        console.log("parse student data: parsed");
        studentDataObjs = arrayToObjects(obj.data);
		studentCount = studentDataObjs.length;
		teacherName = studentDataObjs[0].Teachers; // get some values from the first record
		classWord = studentDataObjs[0].Class;
		schoolName = studentDataObjs[0].School;
        console.log("parse student data: " + studentCount + " students created, starting with class " + classWord + " taught by " + teacherName + " at " + schoolName);
		console.dir(studentDataObjs);
    }
    reader.readAsText(studentDataInput.files[0]);
}
