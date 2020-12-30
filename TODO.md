- In Analyse Variante auswählen und im Editor anzeigen

# SAFARI
- Simulation: SVG Size of scatter plot not resizing
- MDS: SVGs cut off

Vor jeder Wahl müssen die Wahlbezirke in den jeweiligen Berliner Bezirken auf ihre räumliche Festlegung geprüft und angepasst werden. Der Grund dafür sind ständig stattfindende Änderungen der Bevölkerungszahlen: In der Regel sollte ein Wahlbezirk nicht mehr als 2.500 deutsche Einwohner:innen beinhalten. Dieses Tool wurde entwickelt, um Teile des Prozesses der Neufestlegung von Wahlbezirken zu automatisieren und somit die Mitarbeitenden der bezirklichen Wahlämter zu unterstützen. Für den hier gezeigten ersten Prototypen, wurden exemplarisch Daten vom Bezirk Tempelhof-Schöneberg aus dem Jahr XXX (Aus welchem (Wahl)Jahr kommen die Daten eigentlich?) verwendet.

Dieses Tool dient dazu, Geodaten im GML-Format gegen eine festgelegte, dem Tool bekannte Datenstruktur zu prüfen. Abweichungen werden anhand von Fehlermeldungen beschrieben. GML ist ein offener Standard für räumliche Daten, basierend auf XML. Mehr zur Anwendung und Hintergrund des Validators finden sie unten sowie in diesem Blogpost (noch nicht live). Der Quellcode dieser Anwendung ist Open Source und auf GitHub verfügbar.

Eventuell ist es eh so geplant, aber ich würde mehr Erklärung zum Tool auf der Seite gebrauchen können. Also zum Beispiel den Text zu den Teilschritten aus Evelyns Blogpost hier auch nochmal zum nachlesen. Die ersten beiden Reiter „Aktuelle Lage“ und „Netzwerk“ sind gut erklärt und leicht verständlich, hier gibt es keine Verständnisprobleme. Ab „Varianten erstellen“ war ich dann teilweise etwas verwirrt. Hier was mir so aufgefallen ist:

 

- Ab „Varianten erstellen“ fehlen in den Karten die +,- und Pfeile zum Navigieren in der Karte. > Sollte eigentlich überall funktionieren, bitte sonst nochmal Browser & OS schicken...

Die Simulationen stoppen wenn 100 Iterationen erreicht werden. Wenn man dann links auf stop und dann wieder auf Start drückt laufen die Simulationen weiter. Vielleicht ist es so gewollt, ich würde dann aber beim Stopp den Button automatisch zu „Start“ wechseln lassen, damit man erkennt, dass das Programm sich nicht aufgehangen hat, sondern „fertig“ ist.
Ich verstehe leider die „Simulationsübersicht“ nicht. Was heißen denn die Zahlen auf der Y-Achse?
Bei Vergleichen und Auswählen verstehe ich den Scatterplot nicht. Wie werden denn all diese Bewertungskriterien auf 2 Dimensionen runtergebrochen? Was sind X und Y Achse des Plots? Was bedeutet diese Colorbar unter dem Scatterplot? Vielleicht stecke ich hier zu wenig im Thema drin.
 
So, dass sind eigentlich die wesentlichen Punkte. Zur Usability gibt es noch ein paar Kleinigkeiten:

Ich fände es hilfreich, wenn man in der Karte mittels Mausrad scrollen könnte.
Bei der aktuellen Lage musste ich 2 mal gucken welche Bezirke hier „hervorgehoben“ sind. Vielleicht kann man die nicht hervorgehobenen Bezirke noch ein kleines bisschen transparenter machen, oder die hervorgehobenen schwarz umranden.
Auf dem Tooltip der beim Mausover über die Blöcke kommt, würde ich „Einwohner:innen“ statt „Bevölkerung“ schreiben.
Ich finde es mutig, dass man Varianten für alle zugänglich abspeichern kann, unter beliebigem Namen. Hoffentlich gibt es keine Trolle in der Verwaltung 😃
 

Und dann noch kleine Rechtschreibfehler:

Beim Aktuelle Lage-Text: Hervorgehobene Wahlbezirke liegen über dem Zielwert von 2500 Einwohner:innen.
Beim Netzwerk-Text: „Die Linien zeigen auf, welche Bezirke benachbart sind.“
Vergleichen und Auswählen: Aus den über 1000 Varianten die über die Simulation generiert wurden haben wir die X besten Ergebnisse ausgewählt. Welche Variante wirklich am besten geeignet ist, hängt stark von den eigenen Präferenzen ab. 