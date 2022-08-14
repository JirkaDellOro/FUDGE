///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var ObjImporter;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (ObjImporter) {
    //Vertices  
    //write Vertices into the string below
    var inputVertices = "v -0.195542 -0.341678 0.036432 v 0.031128 0.050926 0.036432 v -0.195542 -0.341678 -0.036432 v 0.031128 0.050926 -0.036432 v -0.132440 -0.378110 0.036432 v 0.094230 0.014494 0.036432 v -0.132440 -0.378110 -0.036432 v 0.094230 0.014494 -0.036432 v 0.037710 0.062327 0.036432 v 0.037710 0.062327 -0.036432 v 0.108813 0.078250 0.036432 v 0.108813 0.078250 -0.036432 v 0.053886 0.090344 0.036432 v 0.053886 0.090344 -0.036432 v 0.105899 0.141372 0.036432 v 0.105899 0.141372 -0.036432 v 0.029184 0.115524 0.036432 v 0.029184 0.115524 -0.036432 v 0.081197 0.166551 0.036432 v 0.081197 0.166551 -0.036432 v 0.195542 -0.341678 0.036432 v -0.031128 0.050926 0.036432 v 0.195542 -0.341678 -0.036432 v -0.031128 0.050926 -0.036432 v 0.132440 -0.378110 0.036432 v -0.094230 0.014494 0.036432 v 0.132440 -0.378110 -0.036432 v -0.094230 0.014494 -0.036432 v -0.037710 0.062327 0.036432 v -0.037710 0.062327 -0.036432 v -0.108813 0.078251 0.036432 v -0.108813 0.078251 -0.036432 v -0.053886 0.090344 0.036432 v -0.053886 0.090344 -0.036432 v -0.105899 0.141372 0.036432 v -0.105899 0.141372 -0.036432 v -0.029184 0.115524 0.036432 v -0.029184 0.115524 -0.036432 v -0.081197 0.166551 0.036432 v -0.081197 0.166551 -0.036432";
    //write VTs into the string below
    var inputVT = "vt 0.792771 0.705512 vt 0.439156 0.822194 vt 0.099996 0.932720 vt 0.792771 0.064372 vt 0.396154 0.178968 vt 0.896385 0.705512 vt 0.146385 0.006911 vt 0.099996 0.829105 vt 0.896385 0.064372 vt 0.103384 0.650137 vt 1.000000 0.702169 vt 0.335772 0.829105 vt 0.195267 0.932720 vt 0.292771 0.185880 vt 1.000000 0.078933 vt 0.043001 0.000000 vt 0.896385 0.702169 vt 0.195267 0.829105 vt 0.000000 0.643226 vt 0.896385 0.078933 vt 0.792771 0.045754 vt 0.394906 0.160289 vt 0.102135 0.668817 vt 0.896385 0.045754 vt 1.000000 0.000000 vt 0.689156 0.849721 vt 0.314153 0.095366 vt 0.021383 0.733739 vt 0.896385 0.000000 vt 0.585541 0.849721 vt 0.792771 0.000000 vt 0.245425 0.829105 vt 0.391837 0.114387 vt 0.896385 0.000000 vt 0.245425 0.932720 vt 0.099066 0.714719 vt 0.689156 0.774661 vt 0.357467 0.016638 vt 0.585541 0.774661 vt 0.064696 0.812467 vt 0.792771 0.705512 vt 0.295143 0.829105 vt 0.439156 0.097748 vt 0.792771 0.809127 vt 0.295143 0.932720 vt 0.146385 0.731357 vt 0.689156 0.725047 vt 0.894948 0.705512 vt 0.404786 0.000000 vt 0.585541 0.725047 vt 0.894948 0.809127 vt 0.112015 0.829105 vt 0.689156 0.000000 vt 0.292771 0.006911 vt 0.099996 0.932720 vt 0.689156 0.641139 vt 0.249769 0.650137 vt 0.792771 0.000000 vt 0.585541 0.822194 vt 0.099996 0.829105 vt 0.792771 0.641139 vt 0.542540 0.178968 vt 0.689156 0.000000 vt 0.189387 0.000000 vt 0.000000 0.932720 vt 0.146385 0.643226 vt 0.689156 0.640060 vt 0.482157 0.829105 vt 0.585542 0.000000 vt 0.000000 0.829105 vt 0.439156 0.185880 vt 0.585541 0.640060 vt 0.689156 0.659759 vt 0.248520 0.668816 vt 0.541291 0.160289 vt 0.792771 0.659759 vt 0.689156 0.725047 vt 0.792771 0.705512 vt 0.167768 0.733739 vt 0.460539 0.095366 vt 0.585541 0.725047 vt 0.689156 0.705512 vt 0.689156 0.705512 vt 0.195267 0.932720 vt 0.245452 0.714719 vt 0.792771 0.705512 vt 0.195267 0.829105 vt 0.538222 0.114387 vt 0.792771 0.780572 vt 0.211082 0.812467 vt 0.689156 0.780572 vt 0.503852 0.016638 vt 0.792771 0.912741 vt 0.245425 0.932720 vt 0.292771 0.731357 vt 0.792771 0.809127 vt 0.245425 0.829105 vt 0.585541 0.097748 vt 0.792771 0.830186 vt 0.894948 0.912741 vt 0.258401 0.829105 vt 0.689156 0.830186 vt 0.894948 0.809127 vt 0.551171 0.000000";
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
    var inputFaces = "f 1/1/1 3/7/1 4/9/1 f 4/9/2 3/7/2 7/13/2 f 8/14/3 7/13/3 5/11/3 f 6/12/4 5/11/4 1/2/4 f 7/13/5 3/8/5 1/3/5 f 8/14/6 6/12/6 2/6/6 f 10/18/1 9/15/1 11/22/1 f 12/23/7 11/22/7 15/27/7 f 16/28/3 15/27/3 13/25/3 f 14/26/4 13/25/4 9/16/4 f 15/27/8 11/21/8 9/17/8 f 12/24/9 16/28/9 14/26/9 f 18/32/1 19/36/1 17/29/1 f 20/37/7 23/41/7 19/36/7 f 24/42/3 21/39/3 23/41/3 f 22/40/4 17/30/4 21/39/4 f 23/41/9 17/31/9 19/35/9 f 20/38/8 22/40/8 24/42/8 f 1/1/1 4/9/1 2/4/1 f 4/9/2 7/13/2 8/14/2 f 8/14/3 5/11/3 6/12/3 f 6/12/4 1/2/4 2/5/4 f 7/13/10 1/3/10 5/11/10 f 8/14/11 2/6/11 4/10/11 f 10/18/1 11/22/1 12/23/1 f 12/23/7 15/27/7 16/28/7 f 16/28/3 13/25/3 14/26/3 f 14/26/4 9/16/4 10/19/4 f 15/27/8 9/17/8 13/25/8 f 12/24/9 14/26/9 10/20/9 f 18/32/1 20/37/1 19/36/1 f 20/37/7 24/42/7 23/41/7 f 24/42/3 22/40/3 21/39/3 f 22/40/4 18/33/4 17/30/4 f 23/41/9 21/39/9 17/31/9 f 20/38/8 18/34/8 22/40/8 ";
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