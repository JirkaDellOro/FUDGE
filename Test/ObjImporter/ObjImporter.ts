///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace ObjImporter {

  //Vertices  
  //write Vertices into the string below
  var inputVertices: String = "Vertices";
  //write VTs into the string below
  var inputVT: String = "UVs here";
  var splittedVertices: string[] = inputVertices.split(" ", inputVertices.length);
  var combinedVerticesArray: string[] = [];
  for (let i: number = 0, j: number = 0; i < splittedVertices.length; i += 4, j += 3) {
    var splittedVertices2: string[] = inputVertices.split(" ", inputVertices.length);
    var splittedVT2: string[] = inputVT.split(" ", inputVT.length);
    var tempArray: string = ("new Vertex(new Vector3(" + splittedVertices2[i + 1] + ", " + splittedVertices2[i + 2] + ", " + splittedVertices2[i + 3] + "), new Vector2(" + splittedVT2[j + 1] + ", " + splittedVT2[ j + 2] + ")" + ")"  + "," + "\n");
    combinedVerticesArray.push(tempArray);
  }
  console.log(combinedVerticesArray + "\n");  


  //Faces
  //write faces into the string below
  var inputFaces: String = "Faces here";
  var splittedFaces: string [] = inputFaces.split(" ", inputFaces.length);
  var combinedFacesArray: string[] = [];
  for (let i: number = 0, j: number = 0; i < splittedFaces.length - 1; i += 4, j += 10) { 
    var splittedFaces2: string[] = inputFaces.split(/[\ \/]/, inputFaces.length);
    var numberFix1: number = +splittedFaces2[j + 1] - 1;
    var firstNumber: string = String(numberFix1);
    var numberFix2: number = +splittedFaces2[j + 4] - 1;
    var secondNumber: string = String(numberFix2);
    var numberFix3: number = +splittedFaces2[j + 7] - 1;
    var thirdNumber: string = String(numberFix3);
    var tempArray2: string = ("new Face(this.vertices," + " " + firstNumber + ", " + secondNumber + ", " + thirdNumber + ")," + "\n" );
    combinedFacesArray.push(tempArray2);
  }
  console.log(combinedFacesArray + "\n");

  
} 
