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



## Test Results: Firefox
with different amounts of Vertices and different amounts of Paths, vertex points are generated randomly in the scope of the canvas size, the Tangent Points are set to the Vertex Positions.

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

Also interesting to note is that it sometimes took firefox (tens of) seconds to actually show the generated image, eventhough the console logs suggested that it was done already.

## Test Results: Edge
Since firefox was failing at some points , the test was repeated on Edge. These numbers aren't averages but only one run each. Important to note here is that Edge generally took longer to generate everything but the RAM usage wasn't nearly as bad as with firefox. The drawing itself was said to be done much quicker, though it also took the actual image a long time to appear for the more complex images in the canvas as well.

| paths | vertices | gt old (ms) | gt new (ms) | dt old (ms) | dt new (ms) | annotation |
|-------|----------|-------------|-------------|-------------|-------------|------------|
| 10    | 10       | 2           | 2           | 0           | 0           |            |
| 100   | 10       | 20          | 17          | 1           | 1           |            |
| 10    | 100      | 29          | 27          | 1           | 0           |            |
| 100   | 100      | 243         | 234         | 3           | 5           |            |
| 1000  | 100      | 2354        | 2422        | 34          | 45          |            |
| 100   | 1000     | 14742       | 14933       | 32          | 39          |            |
| 1000  | 1000     | 146255      | 148019      | 326         | 430         |            |
| 10000 | 10       | 1485        | 1363        | 1550        | 1894        |            |
| 10000 | 100      | 27060       | 26504       | 37855       | -           | 1          |

##### Annotations:  
1: Edge generated both sets of data and drew the old one. after starting drawing the new one it reloaded the page by itself, thus aborting the test. This time RAM probably wasn't the issue as it only used about half of the available RAM (6GB).

Interesting to not about this test is that the RAM usage climbed much slower than on Firefox. Also, the runtime differences between the old and the new are muss smaller.

## Test Results: Chrome/Chromium
Probably the most important test as that is what Electron is based on. Coming soon.
