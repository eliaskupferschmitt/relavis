// Alles löschen
CALL apoc.periodic.iterate('MATCH (n) RETURN n', 'DETACH DELETE n', {batchSize:1000});
CALL apoc.schema.assert({},{},true) YIELD label, key RETURN *;

CALL apoc.util.sleep(1000);

//Indexe erstellen

CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.genID);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.properties);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.age);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.born);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.dateOfBirth);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.dateOfDeath);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.yearOfBirth);
CREATE INDEX IF NOT EXISTS FOR (n:Person) ON (n.yearOfDeath);
//CREATE INDEX IF NOT EXISTS FOR (:wikidataPerson) ON (wikidataPerson.wikidataId);

CALL apoc.util.sleep(1000);

//Personenimport
call apoc.periodic.iterate("
LOAD CSV WITH HEADERS FROM 'https://git.thm.de/aksz15/genealogy/-/raw/master/csv/persons.csv' AS line  FIELDTERMINATOR '|' RETURN line",
"CREATE (p:Person {genID:line.id, properties:line.properties,
familyname:line.familyname,  file:line.file, mother:line.mutter,
born:line.geb, died:line.gest, level:line.level, anchor:line.anchor})",
{batchSize:1000});


CALL apoc.util.sleep(1000);

//KIND-Beziehungen
call apoc.periodic.iterate("
LOAD CSV WITH HEADERS FROM 'https://git.thm.de/aksz15/genealogy/-/raw/master/csv/parents.csv' AS line  FIELDTERMINATOR '|' RETURN line",
"MATCH (kind:Person {genID:line.kind}), (elternteil:Person {genID:line.elternteil1})
CREATE  (elternteil)<-[:CHILD_OF]-(kind)",
{batchSize:1000});

CALL apoc.util.sleep(1000);

//VERHEIRATET_MIT
call apoc.periodic.iterate("
LOAD CSV WITH HEADERS FROM 'https://git.thm.de/aksz15/genealogy/-/raw/master/csv/marriage.csv' AS line  FIELDTERMINATOR '|' RETURN line",
"MATCH (p1:Person {genID:line.partner1}), (p2:Person {genID:line.partner2})
CREATE  (p1)-[:SPOUSE]->(p2)",
{batchSize:1000});

CALL apoc.util.sleep(1000);

//SAME_AS
call apoc.periodic.iterate("
LOAD CSV WITH HEADERS FROM 'https://git.thm.de/aksz15/genealogy/-/raw/master/csv/sameas.csv' AS line  FIELDTERMINATOR '|' RETURN line",
"MATCH (p1:Person {genID:line.a}), (p2:Person {genID:line.b})
CREATE  (p1)-[:SAME_AS]->(p2)",
{batchSize:1000});

CALL apoc.util.sleep(1000);

//EQUAL_ID
call apoc.periodic.iterate("
LOAD CSV WITH HEADERS FROM 'https://git.thm.de/aksz15/genealogy/-/raw/master/csv/nonuniqueids.csv' AS line  FIELDTERMINATOR '|' RETURN line",
"MATCH (p1:Person {genID:line.equal_a}), (p2:Person {genID:line.equal_b})
CREATE  (p1)-[:EQUAL_ID]->(p2)",
{batchSize:1000});

CALL apoc.util.sleep(1000);

//All kids by
LOAD CSV WITH HEADERS FROM 'https://gitlab.rlp.net/adwmainz/regesta-imperii/lab/Genealogy/-/raw/master/csv/momdad.csv' AS line  FIELDTERMINATOR '|'
MATCH (k:Person)-[:CHILD_OF]->(v:Person {genID:line.Vater})-[:SPOUSE]-(m:Person {genID:line.Mutter})
CREATE (k)-[:CHILD_OF]->(m)
RETURN count(*);

CALL apoc.util.sleep(1000);

// genealogyUrl setzen
MATCH (p:Person)
SET p.genealogyUrl = 'http://genealogy.euweb.cz/' + p.familyname + "/" + p.file
WITH p WHERE p.anchor CONTAINS '<'
UNWIND apoc.text.regexGroups(p.anchor, "<A NAME='(.*?)'") as datepart
SET p.genealogyUrl = 'http://genealogy.euweb.cz/' + p.familyname + "/" + p.file + '#' + datepart[1]
RETURN count(*);


CALL apoc.util.sleep(1000);

//Geburtsjahr römisch setzen
MATCH (p1:Person)
WHERE EXISTS(p1.born)
UNWIND apoc.text.regexGroups(p1.born, "([XVI]?[XVI])\\.(\\d\\d\\d\\d?)") as datepart
SET p1.yearOfBirth = substring('0000', 0, 4 - size(datepart[2])) + datepart[2]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Todessjahr römisch setzen
MATCH (p1:Person)
WHERE EXISTS(p1.died)
UNWIND apoc.text.regexGroups(p1.died, "([XVI]?[XVI])\\.(\\d\\d\\d\\d?)") as datepart
SET p1.yearOfDeath = substring('0000', 0, 4 - size(datepart[2])) + datepart[2]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Geburtsdatum setzen
MATCH (p1:Person)
WHERE EXISTS(p1.born)
UNWIND apoc.text.regexGroups(p1.born, "(\\d\\d?)\\.(\\d\\d?)\\.(\\d\\d\\d\\d?)") as datepart
SET p1.dateOfBirth = substring('0000', 0, 4 - size(datepart[3])) + datepart[3]
    + '-'
    + substring('00', 0, 2 - size(datepart[2])) + datepart[2]
    + '-'
    + substring('00', 0, 2 - size(datepart[1])) + datepart[1]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Todesdatum setzen
MATCH (p1:Person)
WHERE EXISTS(p1.died)
UNWIND apoc.text.regexGroups(p1.died, "(\\d\\d?)\\.(\\d\\d?)\\.(\\d\\d\\d\\d?)") as datepart
SET p1.dateOfDeath = substring('0000', 0, 4 - size(datepart[3])) + datepart[3]
    + '-'
    + substring('00', 0, 2 - size(datepart[2])) + datepart[2]
    + '-'
    + substring('00', 0, 2 - size(datepart[1])) + datepart[1]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Geburtsdatum setzen
MATCH (p1:Person)
WHERE EXISTS(p1.born)
UNWIND apoc.text.regexGroups(p1.born, "\\W?(\\d\\d\\d\\d?)") as datepart
SET p1.yearOfBirth = substring('0000', 0, 4 - size(datepart[1])) + datepart[1]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Todesdatum setzen
MATCH (p1:Person)
WHERE EXISTS(p1.died)
UNWIND apoc.text.regexGroups(p1.died, "\\W?(\\d\\d\\d\\d?)") as datepart
SET p1.yearOfDeath = substring('0000', 0, 4 - size(datepart[1])) + datepart[1]
RETURN count(*);

CALL apoc.util.sleep(1000);

//Alter setzen
MATCH (p1:Person)
WHERE EXISTS(p1.yearOfBirth)
AND  EXISTS(p1.yearOfDeath)
SET p1.age = toInteger(p1.yearOfDeath) - toInteger(p1.yearOfBirth)
RETURN count(*);

CALL apoc.util.sleep(1000);

// ############################# Bis hier werden keine neuen Kanten erstellt


//Zweite Elternteile verknüfen bei durchgezählter Mutter
MATCH (n:Person)-[:CHILD_OF]->(:Person)-[:SPOUSE]-(m:Person)
WHERE n.mother = m.mother
MERGE (n)-[:CHILD_OF]->(m)
RETURN count(*);

CALL apoc.util.sleep(1000);

//SAME_AS-EQUAL_ID-gleiches-Geburtsdatum: die nonuiquIDs geben an, wenn zwei Personen auf einer Seite die gleiche HTML-Zielmarke haben. Same_As zeigt aber immer auf die ersten. Hier wird p2 rausgenommen und p1-[SAME_AS]-(p3) gesetzt
MATCH
(p1:Person)-[sa:SAME_AS]-(p2:Person)-[eq:EQUAL_ID]-(p3:Person)
WHERE p1.age = p3.age
OR p1.yearOfBirth = p3.yearOfBirth
OR p1.yearOfDeath = p3.yearOfDeath
DELETE sa, eq
CREATE (p2)-[:SAME_AS {type:'added'}]->(p3)
RETURN count(*);

CALL apoc.util.sleep(1000);

//SAME_AS und EQUAL_ID-gleiches-Geburtsdatum: die nonuiquIDs geben an, wenn zwei Personen auf einer Seite die gleiche HTML-Zielmarke haben. Same_As zeigt aber immer auf die Erste. Hier wird p3 rausgenommen und p1-[SAME_AS]-(p1) gelassen, da sie richtig ist
MATCH
(p1:Person)-[sa:SAME_AS]-(p2)-[eq:EQUAL_ID]-(p3)
WHERE p1.age = p2.age
OR p1.yearOfBirth = p2.yearOfBirth
OR p1.yearOfDeath = p2.yearOfDeath
DELETE eq
RETURN count(*);

CALL apoc.util.sleep(1000);

//Nicht zielführende EQUAL_ID-Kanten löschen
MATCH (p1)-[:SAME_AS]-(p2)-[r:EQUAL_ID]->(p3)
WHERE p1.age = p2.age
AND (
p1.yearOfBirth = p2.yearOfBirth
OR
p1.yearOfDeath = p2.yearOfDeath
)
DELETE r
RETURN count(*);

CALL apoc.util.sleep(1000);

//Nicht zielführende EQUAL_ID-Kanten löschen
MATCH (p1)-[r:EQUAL_ID]->(p3)
DELETE r
RETURN count(*);

CALL apoc.util.sleep(1000);

//10-SAME_AS-Level-0-ergänzen
call apoc.periodic.iterate("MATCH
(n1:Person)-[:SPOUSE]-(n2:Person)-[:SAME_AS]-(n3:Person)-[:SPOUSE]-(n4:Person)
WHERE n1.age = n4.age and id(n1) > id(n4)
AND n2.age = n3.age RETURN n1, n4",
"MERGE (n1)-[:SAME_AS]-(n4)",
{batchSize:1000});

CALL apoc.util.sleep(1000);

// Holt die Ehefrauen aus den Titelzeilen wieder rein
MATCH (n1:Person)-[:SPOUSE]-(n2:Person)-[:SAME_AS]-(n3:Person)-[:SPOUSE]-(n4:Person)
WHERE n1.age = n4.age
AND n2.age = n3.age
AND NOT (n1)-[:SAME_AS]->(n4)
AND NOT (n1)<-[:SAME_AS]-(n4)
MERGE (n1)<-[:SAME_AS]-(n4)
RETURN count(*);
CALL apoc.util.sleep(1000);

CALL apoc.util.sleep(1000);

//SAME_AS auf A1-Haupteinträge vereinigen: z.B. A1 und m2
// Muss insgesamt viermal ausgeführt werden um alles zu treffen
call apoc.periodic.commit("MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND (n2.properties STARTS WITH 'm.' OR n2.properties STARTS WITH 'm:' OR n2.properties =~ '[1-9]m.*')
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*)",{});

CALL apoc.util.sleep(1000);

call apoc.periodic.commit("MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND (n2.properties STARTS WITH 'm.' OR n2.properties STARTS WITH 'm:' OR n2.properties =~ '[1-9]m.*')
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*)",{});

CALL apoc.util.sleep(1000);

call apoc.periodic.commit("MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND (n2.properties STARTS WITH 'm.' OR n2.properties STARTS WITH 'm:' OR n2.properties =~ '[1-9]m.*')
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*)",{});

CALL apoc.util.sleep(1000);

call apoc.periodic.commit("MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND (n2.properties STARTS WITH 'm.' OR n2.properties STARTS WITH 'm:' OR n2.properties =~ '[1-9]m.*')
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*)",{});

CALL apoc.util.sleep(1000);

// Löschen von SAME_AS-Kanten auf sich selbst
MATCH (n)-[r:SAME_AS]->(n)
DELETE r;

CALL apoc.util.sleep(1000);

//SAME_AS: Hier werden Titelzeileneinträge mit den Haupteinträgen zusammengeführt, bei gleichem Alter
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND substring(n1.properties, 4, 4)+"" = substring(n2.properties, 0, 4)+""
AND n1.age = n2.age
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: m3 und m3 mit gleichem Geburtsjahr
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND substring(n1.properties, 0, 2)+"" = substring(n2.properties, 0, 2)+""
AND n1.yearOfBirth = n2.yearOfBirth
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: m3 und m3 mit gleichem Todesjahr
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND substring(n1.properties, 0, 2)+"" = substring(n2.properties, 0, 2)+""
AND n1.yearOfDeath = n2.yearOfDeath
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: mit gleichem Geburts- oder Sterbejahr
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND n2.properties =~ '[A-Z][A-Za-z].*'
AND (n1.yearOfDeath = n2.yearOfDeath
OR n1.yearOfBirth = n2.yearOfBirth)
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: E
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND n2.properties =~ '[A-Z][A-Za-z].*'
AND (n1.dateOfBirth = n2.dateOfBirth
OR n1.dateOfDeath = n2.dateOfDeath)
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

// Löschen von SAME_AS-Kanten auf sich selbst
MATCH (n)-[r:SAME_AS]->(n)
DELETE r;

//SAME_AS: Alles mit gleichem Alter
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND n1.age = n2.age
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

// Löschen von SAME_AS-Kanten auf sich selbst
MATCH (n)-[r:SAME_AS]->(n)
DELETE r;

//SAME_AS: Alles mit gleichem Geburtsjahr
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND n1.yearOfBirth = n2.yearOfBirth
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: Alles mit gleichem Todesjahr
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND n1.yearOfDeath = n2.yearOfDeath
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

//SAME_AS: m3 und m3 ohne Altersangaben
MATCH (n1:Person)-[s1:SAME_AS]-(n2:Person)
WHERE n1.properties =~ '[A-Z][1-9].*'
AND substring(n1.properties, 0, 2)+"" = substring(n2.properties, 0, 2)
DELETE s1
WITH collect([n2, n1]) as listOfNodes LIMIT 100000
UNWIND listOfNodes as nodes
call apoc.refactor.mergeNodes(nodes) yield node return count(*);

CALL apoc.util.sleep(1000);

// Name-Property erstellen
MATCH (p1:Person)
WHERE EXISTS(p1.properties)
UNWIND apoc.text.regexGroups(p1.properties, "^\\s*(?:(?:(?:m\\.[\\w\\s]+[\\d\\.]+\\s)([a-zA-Zß\\s\\x{00C0}-\\x{017E}\\-\\']+))|(?:m\\.([a-zA-Zß\\s\\x{00C0}-\\x{017E}\\-\\']+))|(?:[A-Z]\\d+\\.\\s*(?:\\[[^\\]\\)]*\\])?([^,\\\\]+))|(?:\\d+m:.+div(?:[^\\)]+)?\\)([a-zA-Zß\\s\\x{00C0}-\\x{017E}\\-\\']+))|(?:(?:\\d+m\\:\\s(?:[\\(\\[][^\\]\\)]+[\\]\\)](?:\\s*ca\\.?)?[0-9\\s]*)?)(?:before\\s*\\d+)?([a-zA-Zß\\s\\x{00C0}-\\x{017E}\\-\\']+))|(?:(?:m\\s+)?([a-zA-Zß\\s\\x{00C0}-\\x{017E}\\-\\']+)))") as pers_name
SET p1.name=reduce(a = "", x IN pers_name | CASE when x IS null THEN a else x END)
Return count(*)


