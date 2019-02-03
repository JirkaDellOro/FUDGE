This folder was created to test a new object structure that groups vertices and tangent points together instead of having one long array where every third point is considered a vertex point.

Old Structure:
```
+-------------------+
|     DrawPath      |
|-------------------|
|points: DrawPoint[]|
|-------------------|
+-------------------+


+-------------------+
|     DrawPoint     |
|-------------------|
| x,y: number       |
|-------------------|
+-------------------+

```

New Structure:
```
+-------------------+
|     DrawPath      |
|-------------------|
| points: Vertex[]  |
|-------------------|
+-------------------+


+-------------------+         +-----------------------+
|     DrawPoint     |         |         Vertex        |
|-------------------|         |-----------------------|
| x,y: number       |   <--   |tIn, tOut: TangentPoint|
|-------------------|         |-----------------------|
+-------------------+         +-----------------------+
         ^
         |
+-------------------+
|   TangentPoint    |
|-------------------|
|-------------------|
+-------------------+
```

## Test Result
with different amounts of Vertices and different amounts of Paths

`paths` refers to the amount of DrawPaths that have been created, `vertices` to the amount of vertices each of those Paths have, `gt` is the generation time it took to create all the objects for it, `dt` is the drawing time it took to draw all of the paths.

_NOTE:_ The numbers come from the built-in Date.now() method and are averaged over 10 runs each. Tested in firefox on local files.



| paths | vertices | gt old (ms) | gt new (ms) | dt old (ms) | dt new (ms) | annotation |
|-------|----------|-------------|-------------|-------------|-------------|------------|
| 10    | 10       | 2,5         | 2,5         | 0,7         | 0,3         |            |
| 100   | 10       | 15,7        | 14,5        | 1,4         | 12,5        |            |
| 10    | 100      | 23,7        | 21,8        | 0,5         | 0,6         |            |
| 100   | 100      | 178,9       | 195,2       | 2,2         | 149,2       |            |
| 1000  | 100      | 1791,7      | 2044,7      | 1333,8      | 1481,6      |            |
| 100   | 1000     | 7961,4      | 9265,8      | 16,8        | 13859,8     | 1          |
| 1000  | 1000     | -           | -           | -           | -           | 2          |
| 10000 | 10       | 1227,6      | 1367,7      | 1021        | 1106,8      |            |
| 10000 | 100      | 21446,2     | 25111,8     | 14848       | 14699       | 1          |
| 10000 | 1000     | -           | -           | -           | -           | 2          |

##### Annotations:  
1: test only includes 5 testruns instead of 10  
2: test couldn't be finished as the browser recognized the tab as crashed an halted all operations even before the new objects were generated. with more than 16GB RAM and stepwise generation of the objects it might have worked. Here is the resource usage from the start until the tab and firefox itself were closed.
![resource usage](https://user-images.githubusercontent.com/7681159/52181179-81ceee00-27ef-11e9-9221-172e73ddabbb.png)
