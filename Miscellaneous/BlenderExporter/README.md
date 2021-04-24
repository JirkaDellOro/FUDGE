# Blender to FUDGE Exporter

This Blender Addon allows to export Scenes from Blender to the "fm" Format (importer todo).

Installation: Edit → Preferences → Add-ons → Install → Select the ExportFudgeScene.py File from this directory.

To Export a file choose File → Export → FUDGE Scene

![img](ui_options.png)


## TODO

- Object hierarchy
- support materials (colors only)
- support multiple objects using the same data

**Examplefile with a cube, a pointlight and a camera:**
```json
{
    "objects": [
        {
            "name": "Cube",
            "type": "MESH",
            "matrix": [
                [
                    0.750556230545044,
                    0.24996453523635864,
                    0.6117050647735596,
                    -4.433318138122559
                ],
                [
                    -0.4535636305809021,
                    0.8680787682533264,
                    0.2017902135848999,
                    -1.468988060951233
                ],
                [
                    -0.4805678129196167,
                    -0.4289020895957947,
                    0.764916718006134,
                    1.6936286687850952
                ],
                [
                    0.0,
                    0.0,
                    0.0,
                    1.0
                ]
            ],
            "data": {
                "vertices": [
                    1.0,
                    1.0,
                    1.0,
                    1.0,
                    1.0,
                    -1.0,
                    1.0,
                    -1.0,
                    1.0,
                    1.0,
                    -1.0,
                    -1.0,
                    -1.0,
                    1.0,
                    1.0,
                    -1.0,
                    1.0,
                    -1.0,
                    -1.0,
                    -1.0,
                    1.0,
                    -1.0,
                    -1.0,
                    -1.0
                ],
                "indices": [
                    4,
                    2,
                    0,
                    2,
                    7,
                    3,
                    6,
                    5,
                    7,
                    1,
                    7,
                    5,
                    0,
                    3,
                    1,
                    4,
                    1,
                    5,
                    4,
                    6,
                    2,
                    2,
                    6,
                    7,
                    6,
                    4,
                    5,
                    1,
                    3,
                    7,
                    0,
                    2,
                    3,
                    4,
                    0,
                    1
                ]
            }
        },
        {
            "name": "Light",
            "type": "LIGHT",
            "matrix": [
                [
                    -0.29086464643478394,
                    -0.7711008191108704,
                    0.5663931965827942,
                    4.076245307922363
                ],
                [
                    0.9551711678504944,
                    -0.1998833566904068,
                    0.21839119493961334,
                    1.0054539442062378
                ],
                [
                    -0.05518905818462372,
                    0.6045247316360474,
                    0.7946722507476807,
                    5.903861999511719
                ],
                [
                    0.0,
                    0.0,
                    0.0,
                    1.0
                ]
            ],
            "data": {
                "type": "POINT",
                "energy": 1000.0,
                "color": [
                    1.0,
                    1.0,
                    1.0
                ]
            }
        },
        {
            "name": "Camera",
            "type": "CAMERA",
            "matrix": [
                [
                    0.6859206557273865,
                    -0.32401347160339355,
                    0.6515582203865051,
                    7.358891487121582
                ],
                [
                    0.7276763319969177,
                    0.305420845746994,
                    -0.6141703724861145,
                    -6.925790786743164
                ],
                [
                    0.0,
                    0.8953956365585327,
                    0.44527140259742737,
                    4.958309173583984
                ],
                [
                    0.0,
                    0.0,
                    0.0,
                    1.0
                ]
            ],
            "data": {
                "fov_vertical": 0.4710899591445923,
                "fov_horizontal": 0.6911112070083618,
                "fov_diagonal": 0.6911112070083618
            }
        }
    ]
}
```