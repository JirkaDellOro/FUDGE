Beispielanwendung starten

1) Gitbash oder vergleichbare Kommandozeile ”ffnen
2) Navigieren zu Build/Scenes
3) Befehl: electron .

Code neu kompilieren
1) Gitbash oder vergleichbare Kommandozeile ”ffnen
2) Navigieren zu Source/Scenes
3) Befehl: tsc

Komponenten einbinden
- Es wird immer ein FudgeServer und wenigstens ein ClientManager ben”tigt!!
- FudgeServer und ClientManager mssen ein UI bekommen, es kann die Vorlage im Ordner ?HTML? als Beispiel herangenommen werden
- Importiert werden die Module mittels ?import * as FudgeNetwork ?path to ModuleCollector.ts??

Komponenten erweitern
- Zus„tzliche Funktionen k”nnen in den FudgeServer und ClientManager TypeScript Dateien direkt programmiert werden
- Empfehlung: Gewnschte Netzwerkstruktur ausw„hlen und FudgeServer/ClientManager in neuer Klasse vererben
o WICHTIG: In diesem Fall sollte die neue Klasse explizit, nicht als Teil des ModuleCollectors importiert werden. Andernfalls kann es zu circular dependencies und Absturz des Programms kommen
- šberschreiben der origin„ren Funktionen ist nicht empfehlenswert. 
o Am besten berschreiben und mit super() aufrufen, dann Daten weiterverarbeiten, so ist die Funktionsf„higkeit gew„hrleistet
- Komponenten k”nnen nun beliebig und gut strukturiert um Funktionen erweitert werden!
