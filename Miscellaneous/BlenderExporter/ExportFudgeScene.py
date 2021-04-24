# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

bl_info = {
    "name" : "Export FUDGE Scene",
    "author" : "Simon Storl-Schulke",
    "description" : "",
    "blender" : (2, 92, 0),
    "version" : (0, 0, 1),
    "location" : "File → Export → FUDGE Scene",
    "warning" : "",
    "category" : "Import-Export"
}

import bpy
import bmesh
from bpy_extras.io_utils import ExportHelper
import json
import math

def serialize_mesh(mesh: bpy.types.Mesh) -> dict:
    bm: bmesh.types.BMesh = bmesh.new()
    bm.from_mesh(mesh)

    bmesh.ops.triangulate(bm, faces=bm.faces[:], quad_method="BEAUTY", ngon_method="BEAUTY")

    vertices = []
    indices = []
    normals = []
    uvs = []

    for i, c_vert in enumerate(bm.verts):
        vertices.extend([c_vert.co[0], c_vert.co[1], c_vert.co[2]])
        # print(mesh.uv_layers[0].data[i].uv)

    for c_face in bm.faces:
        indices.extend([c_face.verts[0].index, c_face.verts[1].index, c_face.verts[2].index])
        # normals_face.extend([c_face.normal[0], c_face.normal[1], c_face.normal[2]])


    meshdata = {
        "name": mesh.name + "(mesh)",
        "vertices": vertices,
        "indices": indices,
        # "facenormals": normals_face
    }

    bm.free()
    return meshdata


def serialize_light(light: bpy.types.Light) -> dict:
    return {
        "name": light.name + "(light)",
        "type": light.type, # possible Types are POINT, SUN, SPOT, AREA
        "energy": light.energy, 
        "color": [light.color.r, light.color.g, light.color.b]
        }


def serialize_camera(cam: bpy.types.Camera) -> dict:
    return {
        "name": cam.name + "(camera)",
        "fov_vertical": cam.angle_y,
        "fov_horizontal": cam.angle_x,
        "fov_diagonal": cam.angle
    }


def export_scene(context, filepath, human_readable, selected_only):
    
    scenedata = {
        "objects": [],
        "objectdata": []
    }

    objectlist = bpy.context.selected_objects if selected_only else bpy.context.scene.objects
 
    for c_obj in objectlist:

        objectdata: dict = {}

        objecttype = c_obj.type
        objectdata_name = c_obj.data.name if c_obj.data is not None else ""

        if objecttype == "MESH":
            objectdata = serialize_mesh(c_obj.data)
            objectdata_name += "(mesh)"

        elif objecttype == "LIGHT":
            objectdata = serialize_light(c_obj.data)
            objectdata_name += "(light)"

        elif objecttype == "CAMERA":
            objectdata = serialize_camera(c_obj.data)
            objectdata_name += "(camera)"
        
        else:
            objecttype = "EMPTY"
            objectdata_name = ""


        m = c_obj.matrix_local

        if objectdata:
            scenedata["objectdata"].append(objectdata)

        matrix = [
            [m[0][0], m[0][1], m[0][2], m[0][3]],
            [m[1][0], m[1][1], m[1][2], m[1][3]],
            [m[2][0], m[2][1], m[2][2], m[2][3]],
            [m[3][0], m[3][1], m[3][2], m[3][3]],
        ]


        obj = {
            "name": c_obj.name,
            "type": objecttype,
            "matrix": matrix,
            "data": objectdata_name
        }

        scenedata["objects"].append(obj)

    
    f = open(filepath, 'w', encoding='utf-8')

    jsonstring = json.dumps(scenedata, indent=4) if human_readable else json.dumps(scenedata)

    f.write(jsonstring)
    f.close()
    

    return {'FINISHED'}

class IO_OT_export_fudge_scene(bpy.types.Operator, ExportHelper):
    """Export for use in the FUDGE Game Engine"""
    bl_idname = "export_scene.fudge"
    bl_label = "Export FUDGE Scene"

    # ExportHelper mixin class uses this
    filename_ext = ".fs"

    filter_glob: bpy.props.StringProperty(
        default="*.fs",
        options={'HIDDEN'},
        maxlen=255,  # Max internal buffer length, longer would be clamped.
    )

    human_readable: bpy.props.BoolProperty(
        name="human readable",
        description="Format JSON Text nicely at the cost of storage space",
        default=True,
    )

    selected_only: bpy.props.BoolProperty(
        name="Selected Objects only",
        default=False,
    )

    type: bpy.props.EnumProperty(
        name="Color From",
        description="Choose between two items",
        items=(
            ('OPT_A', "Material Display Color", "Description one"),
            ('OPT_B', "Object Color", "Description two"),
            ('OPT_C', "Don't export Color", "Description two"),
        ),
        default='OPT_A',
    )

    def execute(self, context):
        return export_scene(context, self.filepath, self.human_readable, self.selected_only)


def menu_func_export(self, context):
    self.layout.operator(IO_OT_export_fudge_scene.bl_idname, text="FUDGE Scene (.fs)")


def register():
    bpy.utils.register_class(IO_OT_export_fudge_scene)
    bpy.types.TOPBAR_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(IO_OT_export_fudge_scene)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func_export)