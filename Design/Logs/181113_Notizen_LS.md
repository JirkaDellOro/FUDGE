### Allgemein

Aktueller Szenenaufbau sollte über JSON gespeichert werden, **MENSCHENLESBAR!!** sein.

- **Wichtig**: Undo mit beachten  
- Holzhammermethode: Einfach bei jeder Änderung den kompletten Vorherigen Zustand (ist ja eh in JSON) zwischenspeichern.  
- Später vllt noch eine bessere Methode implementieren  
- evtl glTF (ein Dateiformat für 3D-Szenen über JSON-Standard)
- Eine eigene Zeitklasse (Für Physik, Framerate, etc).
- WebGL (bzw in der Zukunft evtl Webassembly)

### Animator
- Es werden (erstmal) keine Vertexanimationen benötigt, da diese zu viele Ungenauigkeiten haben -> ggf Stretchgoal
- **Layer direkt als 3D Planes darstellen und dann diese Animieren, so braucht man dann nur einen Animator**
	- **Also die Ebenen als Texturen auf die Planes welche aus den Texturen der unteren Planes gerendert werden**  
	Canvas -> Plane -> Canvas -> Plane -> Canvas -> etc.  
	- 1 Objekt pro Ast kann "vorgerenderet" werden, um Effizienz zu erhöhen.  
		- Dadurch kann auf den Ast nicht mehr über Code zugegriffen werden.
		- Wird beim Laden der Szene vorgerendert.
	
### 2D Editor
- Die gemalten Objekte sollten nicht über SVG gespeichert werden sondern mit einem eigenen Format beschrieben werden, weil...
	- SVG Einschränkungen hat
	- wir so auch die Objekte wieder direkt im "FUDGE-Standard" JSON speichen können (SVG ist XML). 
	- so die Erweiterung auf 3D dann später einfacher wird, bzw schon im Vornherein mit berücksichtigt werden kann.
	- SVG viele Eigenschaften mitbringt, die wir nicht brauchen und so für die Anwender unnötig groß sein könnte.
- Als ein Export-Format ist SVG es eine Überlegung wert.
- Wenn Layer angelegt werden, kann man diese ja direkt als eine Räumliche Ebene Verwenden, auf die eine Orthografische Kamera schaut  
- Pixelgrafiken sollten importiert werden können
- Spritesheets sollten exportiert werden können
- Als bmp rendern, damit es einfach angezeigt werden kann und nicht berechnet werden muss
