///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var ObjImporter;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (ObjImporter) {
    //Vertices  
    //write Vertices into the string below
    var inputVertices = "Vertices";
    //write VTs into the string below
    var inputVT = "UVs here";
    var splittedVertices = inputVertices.split(" ", inputVertices.length);
    var combinedVerticesArray = [];
    for (let i = 0, j = 0; i < splittedVertices.length; i += 4, j += 3) {
        var splittedVertices2 = inputVertices.split(" ", inputVertices.length);
        var splittedVT2 = inputVT.split(" ", inputVT.length);
        var tempArray = ("new Vertex(new Vector3(" + splittedVertices2[i + 1] + ", " + splittedVertices2[i + 2] + ", " + splittedVertices2[i + 3] + "), new Vector2(" + splittedVT2[j + 1] + ", " + splittedVT2[j + 2] + ")" + ")" + "," + "\n");
        combinedVerticesArray.push(tempArray);
    }
    console.log(combinedVerticesArray + "\n");
    //Faces
    //write faces into the string below
    var inputFaces = "Faces here";
    var splittedFaces = inputFaces.split(" ", inputFaces.length);
    var combinedFacesArray = [];
    for (let i = 0, j = 0; i < splittedFaces.length - 1; i += 4, j += 10) {
        var splittedFaces2 = inputFaces.split(/[\ \/]/, inputFaces.length);
        var numberFix1 = +splittedFaces2[j + 1] - 1;
        var firstNumber = String(numberFix1);
        var numberFix2 = +splittedFaces2[j + 4] - 1;
        var secondNumber = String(numberFix2);
        var numberFix3 = +splittedFaces2[j + 7] - 1;
        var thirdNumber = String(numberFix3);
        var tempArray2 = ("new Face(this.vertices," + " " + firstNumber + ", " + secondNumber + ", " + thirdNumber + ")," + "\n");
        combinedFacesArray.push(tempArray2);
    }
    console.log(combinedFacesArray + "\n");
})(ObjImporter || (ObjImporter = {}));
//# sourceMappingURL=ObjImporter.js.map