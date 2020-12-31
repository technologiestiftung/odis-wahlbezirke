- In Analyse Variante auswählen und im Editor anzeigen

# SAFARI
- Simulation: SVG Size of scatter plot not resizing
- MDS: SVGs cut off

> Intro-Text wurde angepasst.

- Ab „Varianten erstellen“ fehlen in den Karten die +,- und Pfeile zum Navigieren in der Karte. > Sollte eigentlich überall funktionieren, bitte sonst nochmal Browser & OS schicken...

- Die Simulationen stoppen wenn 100 Iterationen erreicht werden. Wenn man dann links auf stop und dann wieder auf Start drückt laufen die Simulationen weiter. Vielleicht ist es so gewollt, ich würde dann aber beim Stopp den Button automatisch zu „Start“ wechseln lassen, damit man erkennt, dass das Programm sich nicht aufgehangen hat, sondern „fertig“ ist. > Habe jetzt die States der Buttons optimiert. Wenn ein Ende erreicht ist, kann man auf zurücksetzen klicken und dann erscheint der Start-Button wieder.

- Ich verstehe leider die „Simulationsübersicht“ nicht. Was heißen denn die Zahlen auf der Y-Achse? > Ich habe hier nun noch eine kleine Infobox eingebaut, welche den Scatterplot (hoffe ich zumindest) besser erklärt.

- Bei Vergleichen und Auswählen verstehe ich den Scatterplot nicht. Wie werden denn all diese Bewertungskriterien auf 2 Dimensionen runtergebrochen? Was sind X und Y Achse des Plots? Was bedeutet diese Colorbar unter dem Scatterplot? Vielleicht stecke ich hier zu wenig im Thema drin. > 
 
- Ich fände es hilfreich, wenn man in der Karte mittels Mausrad scrollen könnte. > Habe ich angepasst. Falls ihr es irgendwann anders wollt, es ist nur eine Zeile in Map.svelte, die ihr entkommentieren müsst.

- Bei der aktuellen Lage musste ich 2 mal gucken welche Bezirke hier „hervorgehoben“ sind. Vielleicht kann man die nicht hervorgehobenen Bezirke noch ein kleines bisschen transparenter machen, oder die hervorgehobenen schwarz umranden. > Wurde angepasst.

- Auf dem Tooltip der beim Mausover über die Blöcke kommt, würde ich „Einwohner:innen“ statt „Bevölkerung“ schreiben. > Angepasst.

- Ich finde es mutig, dass man Varianten für alle zugänglich abspeichern kann, unter beliebigem Namen. Hoffentlich gibt es keine Trolle in der Verwaltung 😃 > Ich habe nun bei den Environmental Variables noch einen Wert hinzugefügt, welcher das Speichern de-/aktiviere kann. Ich habe euch nun zwei Varianten aufgesetzt: odis-wahlbezirke.netlify.app (ohne speichern) und wahlbezirke.odis-berlin.de (mit abspeichern). Abgesehen vom Speichern, sind beide Varianten identisch. Herunterladen kann man sich seinen Edit auch ohne Abspeichern.
 
> Rechtschreibfehler wurden angepasst.