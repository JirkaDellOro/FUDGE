## Zusammenfassung KF
WebXR hat am 10.01. eine neue Version veröffentlicht, immer noch nicht stabil ==> Anwendung muss neu geschrieben werden, da es einige Änderungen gab  
Außerdem, ich weiß noch nicht genau warum, funktioniert WebXR mit der neusten Version von Chrome Dev bzw. Canary (73) nicht mehr --> hier hoffe ich, dass es mit dem nächsten Update wieder funktioniert. Gleichzeitig könnte das aber auch damit zusammenhängen, dass die Anwendungen auf die neue WebXR-Version abgeändert werden müssen (auch die Demo Anwendung funktioniert nicht mehr…)  
Hier bin ich auf der Suche nach einer Lösung!  

Ich hab mich dazu noch einmal detailliert mit den Unity-Plugins von Vuforia (markerbased), ARCore (markerless and markerbased) und kudan (markerless) auseinandergesetzt, um daraus Erkenntnisse ziehen zu können, wie AR-Anwendungen in GameEngines (im speziellen Fall Unity) aufgebaut werden und diese für die Electron-Anwendung "kopieren" zu können.  

Die bei der letzten Besprechung erwähnte Übersicht wie WebXR, ARCore, etc. zusammenhängt liegt hier:  
[Übersicht Zusammenhänge WebXR, ARCore](https://github.com/JirkaDellOro/FUDGE/blob/master/Design/Logs/190115-WebXR-ARCore-WebGL-JS_KF.jpg)  

Für die PhoneGap-Prozesse habe ich eine Tabelle erstellt mit allen möglichen Befehlen des CLI, diese müssen jedoch nicht alle in die Anwendung integriert werden. Hier werden die wichtigsten abgebildet, die dick markierten werden auf jeden Fall benötigt. Der Befehl **build** könnte integriert werden, muss aber nicht. Denn es besteht die Möglichkeit, dass das Projekt in die PhoneGap-Cloud hochgeladen werden muss, um dieses dort dann zu erstellen. Auf diesem Weg hat man keine Probleme mit SDK Installation, MacOS Zertifikaten etc. - der Entwickler muss es dort aber manuell hochladen...

| Befehle |	Beschreibung |
|---------|--------------|
| help [command] |	Ausgabe der Nutzungsinformationen |
| **create <path>** |	Ein phonegap-Projekt erstellen |
| build <platforms>	| Das Projekt für eine bestimmte Plattform erstellen |
| install <platforms>	| Das Projekt für eine bestimmte Plattform installieren (Anzeige auf einem Endgerät) |
| **run <platforms>** |	Das Projekt für eine bestimmte Plattform erstellen und installieren |
| platform [command] | Eine Plattform Version aktualisieren |
| plugin [command] | Plugins hinzufügen, löschen und auflisten |  
| template [command] | Verfügbare App-Templates auflisten | 
| info | Projekt-Informationen anzeigen |
| **serve** |	Das Projekt auf einem lokalen node-Server starten (Anzeige im Browser) |  
| **version** |	Ausgabe der Versionsnummer von PhoneGap |
    
