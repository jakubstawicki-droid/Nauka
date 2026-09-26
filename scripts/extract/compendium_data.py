"""Glosariusz, oś czasu, test diagnostyczny, harmonogram i zasady z programu przygotowawczego.
Treści przepisane z PDF-u (działy I, III, V, VIII, test diagnostyczny, harmonogram)."""
import json

def dump(n, o):
    with open('src/data/' + n, 'w') as f:
        json.dump(o, f, ensure_ascii=False, indent=2); f.write('\n')

G = []
def g(term, definition, example=None, section='I', topic=None):
    e = dict(term=term, definition=definition, section=section)
    if example: e['example'] = example
    if topic: e['topic'] = topic
    G.append(e)

T = 'środki wyrazu'
g('punkt', 'Najprostszy element plastyczny — ślad narzędzia. Skupiony w grupy tworzy plamę, a rozłożony w rytmie buduje fakturę.', topic=T)
g('pointylizm', 'Świadome zbudowanie całego obrazu z drobnych punktów czystych barw.', 'Georges Seurat, Niedzielne popołudnie na wyspie Grande Jatte', topic=T)
g('linia', 'Ślad narzędzia prowadzonego po podłożu. Może być konturowa (zamyka kształt), modelująca (buduje bryłę kreskowaniem) lub swobodna, ekspresyjna. Linia miękka i falista uspokaja, linia ostra i łamana niepokoi.', 'Edvard Munch, Krzyk — faliste linie tła budują wrażenie lęku', topic=T)
g('plama', 'Powierzchnia wyodrębniona barwą lub walorem. Plama barwna może być jednowalorowa albo zróżnicowana walorowo.', topic=T)
g('syntetyzm', 'Sprowadzenie przedmiotu do kilku prostych plam — świadome uproszczenie po to, by oddać istotę rzeczy.', 'Paul Gauguin', topic=T)
g('walor', 'Stopień jasności barwy — od najjaśniejszej do najciemniejszej.', topic=T)
g('kontrast walorowy', 'Zestawienie barw o różnym walorze; najsilniejszy z możliwych to zestawienie czerni i bieli.', topic=T)
g('światłocień', 'Sposób rozmieszczenia świateł i cieni, dzięki któremu płaski obraz sprawia wrażenie trójwymiarowego. Buduje formę (bryłę pojedynczego przedmiotu) i przestrzeń (głębię całej sceny).', topic=T)
g('modelunek światłocieniowy', 'Stopniowe przechodzenie świateł w cienie.', topic=T)
g('luminizm', 'Światło ostre, kontrastowe, wydobywające z ciemności tylko wybrane elementy.', 'sygnaturowy chwyt Caravaggia i całego kręgu caravaggionistów', topic=T)
g('sfumato', 'Miękkie, mgliste przejścia między światłem a cieniem, bez ostrych konturów; wynalazek Leonarda da Vinci.', 'Leonardo da Vinci, Mona Lisa', topic=T)
g('chiaroscuro', 'Włoska nazwa światłocienia.', topic=T)
g('non finito', 'Celowo niedokończona partia dzieła, ślad świadomej decyzji artysty.', 'rzeźby Michała Anioła; Auguste Rodin, Mieszczanie z Calais', topic=T)
g('faktura', 'Sposób opracowania powierzchni dzieła — to, co dałoby się wyczuć dotykiem. Może być gładka albo impastowa. W rzeźbie i architekturze to sposób obrobienia kamienia: gładki polerowany marmur kontra chropowaty ślad dłuta.', topic=T)
g('fini', 'Efekt starannego wykończenia — faktura gładka, wygładzona, wypolerowana.', topic=T)
g('impast', 'Farba nakładana grubo pędzlem lub szpachlą, o wyraźnej wypukłości (faktura impastowa).', 'Vincent van Gogh', topic=T)
g('dukt pędzla', 'Widoczny ślad ruchu ręki malarza.', 'Vincent van Gogh, Gwiaździsta noc — wirujący dukt pędzla jest głównym środkiem wyrazu', topic=T)
g('proporcje', 'Stosunki wielkości między częściami dzieła. Sztuka klasyczna szukała proporcji idealnych; świadome zaburzenie proporcji jest środkiem wyrazu.', 'wydłużone postacie El Greca; ogromne biodra Wenus z Willendorfu', topic=T)
g('kanon Polikleta', 'Proporcje idealne ciała: głowa mieści się w wysokości ciała ok. siedem razy.', topic=T)
g('złoty podział', 'Proporcja idealna ok. 1:1,618.', topic=T)
g('rytm', 'Powtarzanie tych samych lub podobnych elementów — kolumn w portyku, fałd draperii, plam barwnych. Porządkuje kompozycję i nadaje jej tempo.', topic=T)
g('kontrast', 'Zestawienie elementów przeciwstawnych: jasne–ciemne, ciepłe–zimne, duże–małe, gładkie–chropowate. Przyciąga wzrok, dlatego artyści umieszczają go tam, gdzie chcą, żebyśmy patrzyli.', topic=T)

T = 'kompozycja'
g('kompozycja', 'Sposób powiązania elementów dzieła w całość.', topic=T)
g('kompozycja zewnętrzna', 'Kształt pola obrazowego, czyli format dzieła (prostokąt pionowy, poziomy, tondo).', topic=T)
g('tondo', 'Okrągły format dzieła (koło).', 'Botticelli, Madonna del Magnificat', topic=T)
g('kompozycja wewnętrzna', 'Układ elementów wewnątrz pola obrazowego.', topic=T)
g('kompozycja zamknięta', 'Wszystkie ważne elementy mieszczą się w ramach; wzrok krąży wewnątrz obrazu i nie ucieka poza niego. Często wpisana w figurę geometryczną — trójkąt, owal, koło.', 'Botticelli, Madonna del Magnificat; Leonardo, Ostatnia Wieczerza', topic=T)
g('kompozycja otwarta', 'Istotne elementy są ucięte krawędzią obrazu; scena zdaje się wykraczać poza ramy, jak kadr fotograficzny.', 'Monet, Katedra w Rouen; obrazy Degasa', topic=T)
g('kompozycja symetryczna', 'Da się poprowadzić oś, po której obu stronach powtarzają się podobne elementy. Daje wrażenie ładu, powagi, dostojeństwa.', 'mozaiki w San Vitale w Rawennie; Leonardo, Ostatnia Wieczerza', topic=T)
g('kompozycja asymetryczna', 'Brak osi symetrii; równowagę buduje się ciężarem plam i barw, nie lustrzanym odbiciem.', 'Rembrandt, Straż nocna', topic=T)
g('kompozycja centralna', 'Najważniejszy element w środku pola obrazowego, reszta podporządkowana; szczególny wypadek symetrii.', 'Rafael, Szkoła Ateńska; plany centralne w architekturze renesansu', topic=T)
g('kompozycja diagonalna', 'Główne kierunki biegną po skosach. Skos oznacza ruch, dlatego to ulubiona kompozycja baroku.', 'Rubens, Zdjęcie z krzyża; Delacroix, Wolność wiodąca lud na barykady', topic=T)
g('kompozycja horyzontalna / wertykalna', 'Dominują kierunki poziome (spokój, rozległość) albo pionowe (wzniosłość, dążenie w górę).', topic=T)
g('kompozycja rytmiczna', 'Te same lub zbliżone formy powtarzają się regularnie.', topic=T)
g('kompozycja statyczna / dynamiczna', 'Przewaga pionów i poziomów daje spokój; przewaga skosów i łuków daje ruch.', topic=T)
g('kompozycja zwarta / ażurowa', 'Używane zwłaszcza wobec rzeźby: bryła zbita w jedną masę albo przenikana przestrzenią (luźna, rozczłonkowana).', topic=T)
g('kompozycja tektoniczna / atektoniczna', 'Dzieło sprawia wrażenie stabilnego i wyważonego albo, przeciwnie, pozornie niestabilnego.', topic=T)
g('dominanta kompozycyjna', 'Element, który najsilniej przyciąga wzrok. Warto powiedzieć, czy pokrywa się ze środkiem geometrycznym obrazu i czy jest zarazem centrum treściowym.', topic=T)
g('plany kompozycyjne', 'Pierwszy, drugi, dalszy. Dzieło może być jednoplanowe (bez iluzji głębi) albo wieloplanowe.', topic=T)

T = 'perspektywa'
g('perspektywa linearna', 'Zbieżna, geometryczna: linie biegnące w głąb zbiegają się w jednym lub kilku punktach na linii horyzontu; przedmioty maleją proporcjonalnie wraz z oddalaniem. Odkryta w renesansie (Filippo Brunelleschi).', 'Leonardo, Ostatnia Wieczerza; Rafael, Szkoła Ateńska', topic=T)
g('perspektywa powietrzna (barwna)', 'Dalsze plany są coraz bardziej zamglone, mniej wyraziste i chłodniejsze — sinobłękitne; bliższe cieplejsze i ostrzejsze. Wynika z obserwacji, że powietrze „zjada” kontrast. To jeden sposób budowania głębi opisany z dwóch stron — nie należy wymieniać perspektywy powietrznej i barwnej jako dwóch osobnych rodzajów.', 'tła u Leonarda; pejzaże holenderskie', topic=T)
g('perspektywa kulisowa', 'Głębię buduje się nakładającymi się na siebie „kulisami” — obiekty dalsze są przysłonięte przez bliższe, ustawione równolegle do płaszczyzny obrazu.', 'malarstwo starożytne i średniowieczne; dekoracje teatralne', topic=T)
g('perspektywa odwrócona', 'Linie zbiegają się nie w głębi obrazu, lecz przed nim — przedmioty dalsze są większe od bliższych. Widz zostaje niejako wciągnięty w przestrzeń dzieła.', 'ikony bizantyjskie i ruskie, np. Ikona Włodzimierska', topic=T)
g('perspektywa żabia', 'Odmiana perspektywy linearnej: patrzymy z dołu.', topic=T)
g('perspektywa z lotu ptaka', 'Odmiana perspektywy linearnej: patrzymy z góry.', topic=T)
g('perspektywa intuicyjna', 'Stosowana w średniowieczu — kilka punktów zbiegu naraz.', topic=T)
g('perspektywa wielokierunkowa', 'Świadomie stosowana w sztuce nowoczesnej — z wielu punktów widzenia jednocześnie.', 'kubizm', topic=T)

T = 'barwa'
g('barwy podstawowe', 'Barwy czyste: czerwona, żółta, niebieska — nie da się ich uzyskać z mieszania innych.', topic=T)
g('barwy pochodne', 'Powstają z mieszania podstawowych — pomarańczowa (czerwony + żółty), zielona (żółty + niebieski), fioletowa (niebieski + czerwony).', topic=T)
g('barwy dopełniające', 'Komplementarne; leżą naprzeciw siebie na kole barw: czerwony–zielony, żółty–fioletowy, niebieski–pomarańczowy. Zestawione obok siebie wzmacniają się nawzajem, zmieszane dają szarość.', topic=T)
g('barwy chromatyczne / achromatyczne', 'Chromatyczne to barwy kolorowe; achromatyczne (obojętne, neutralne) to czerń, biel i szarości.', topic=T)
g('barwy ziemi', 'Ochra, siena, umbra.', topic=T)
g('gama barwna', 'Zakres barw użytych w dziele. Może być szeroka (barwy ciepłe i chłodne) albo wąska (kilka blisko spokrewnionych barw); ciepła, chłodna lub monochromatyczna (jedna barwa w różnych walorach).', topic=T)
g('koloryt', 'Ogólny efekt barwny całego dzieła — „obraz jest utrzymany w kolorycie zielonkawym”.', topic=T)
g('dominanta barwna', 'Barwa najważniejsza, przeważająca.', topic=T)
g('akcent barwny', 'Niewielka plama odbijająca od reszty temperaturą lub walorem, często ustawiona tam, gdzie ma paść wzrok.', topic=T)
g('kontrast temperaturowy', 'Zestawienie barw ciepłych (czerwienie, żółcienie, pomarańcze) z chłodnymi (błękity, zielenie, fiolety). Barwy ciepłe zdają się przybliżać, chłodne oddalać.', topic=T)
g('kontrast dopełnieniowy', 'Zestawienie barw leżących naprzeciw siebie na kole barw; najmocniejszy sposób na to, żeby barwa „zagrała”.', topic=T)
g('koloryt lokalny', 'Barwa własna przedmiotu, ta sama w świetle i w cieniu, zmieniająca tylko walor.', topic=T)
g('refleks barwny', 'Zabarwienie przedmiotu odbitym kolorem sąsiada.', topic=T)
g('laserunek', 'Cienka, półprzezroczysta warstwa farby zmieniająca ton warstwy pod spodem.', topic=T)
g('dywizjonizm', 'Rozbicie barwy na drobne plamy barw podstawowych, które mieszają się dopiero w oku widza.', topic=T)

T = 'techniki'
g('akwarela', 'Pigment rozpuszczalny w wodzie, na chłonnym papierze. Przezroczysta, lekka, świetlista; bieli daje sam papier. Nie da się poprawiać.', topic=T)
g('tempera', 'Pigment z wodą i spoiwem naturalnym — żółtkiem jaja lub kazeiną; na desce. Matowa, o czystych barwach; podstawowa technika średniowiecza i wczesnego renesansu.', 'Botticelli, Narodziny Wenus', topic=T)
g('technika olejna', 'Pigment roztarty w oleju (lnianym), na płótnie lub desce. Wolno schnie, można poprawiać, pozwala na laserunki i impasty. Od XV w. technika dominująca.', 'Jan van Eyck', topic=T)
g('akryl', 'Pigment w żywicy syntetycznej, na różnych podłożach. Technika XX-wieczna; szybko schnie, bardzo trwała, daje intensywne barwy.', topic=T)
g('fresk', 'Malowanie na świeżym, wilgotnym tynku (wł. fresco = świeży). Barwa wiąże się z tynkiem, więc jest bardzo trwała, ale nie da się poprawiać — trzeba malować partiami w ciągu dnia.', 'Michał Anioł, sklepienie Kaplicy Sykstyńskiej', topic=T)
g('al secco', 'Malowanie na tynku suchym — łatwiejsze, ale mniej trwałe.', 'Leonardo, Ostatnia Wieczerza — dlatego zaczęła się niszczyć jeszcze za jego życia', topic=T)
g('ołówek', 'Technika rysunkowa: precyzyjna, pozwala na delikatne przejścia walorowe i drobiazgowy modelunek.', topic=T)
g('węgiel', 'Technika rysunkowa: miękki, sypki, daje szeroką, głęboką czerń i wyraziste kontrasty; łatwo go rozcierać, więc nadaje się do szybkich studiów.', topic=T)
g('pastel', 'Sprasowane pigmenty w formie sztyftu; łączy rysunek z malarstwem, daje aksamitną, matową powierzchnię o czystych barwach.', 'Edgar Degas, tancerki', topic=T)
g('druk wypukły', 'Drzeworyt, linoryt. Odbija się to, co zostało na powierzchni; tło zostaje wycięte. Farba pokrywa wypukłości. Efekt: mocne, płaskie plamy, wyrazisty kontur.', topic=T)
g('druk wklęsły', 'Miedzioryt, staloryt, sucha igła, akwaforta, akwatinta. Odbija się to, co wyryte w płycie; farba wchodzi w rowki, a powierzchnię się wyciera. Efekt: cienka, precyzyjna, aksamitna kreska.', topic=T)
g('druk płaski', 'Litografia, cynkografia, serigrafia (sitodruk). Matryca jest gładka; rysunek i tło różnią się nie poziomem, lecz podatnością na farbę (tłuszcz odpycha wodę). Efekt: swoboda zbliżona do rysunku.', topic=T)
g('miedzioryt', 'Technika druku wklęsłego: rysunek żłobi się w płycie rylcem — mechanicznie.', 'Albrecht Dürer, Adam i Ewa', topic=T)
g('akwaforta', 'Technika druku wklęsłego: płytę pokrywa się warstwą ochronną, przez którą rysuje się igłą, a rowki wygryza kwas — chemicznie. Aqua forte to „mocna woda”, czyli kwas azotowy.', 'mistrzem akwaforty był Rembrandt', topic=T)
g('grafika warsztatowa', 'Grafika artystyczna — artysta sam projektuje i odbija, każda odbitka jest oryginałem, odbitki się numeruje i sygnuje.', topic=T)
g('grafika użytkowa', 'Grafika stosowana — projekt przeznaczony do druku masowego: plakat, ilustracja, znak graficzny, opakowanie.', topic=T)
g('kucie w kamieniu', 'Technika ujmowania materiału (marmur, piaskowiec): rzeźbiarz odejmuje to, co zbędne, i nie ma prawa do pomyłki.', 'Michał Anioł', topic=T)
g('rzeźba w drewnie', 'Technika ujmowania; materiał ciepły, ale podatny na zniszczenie.', 'Ołtarz Wita Stwosza w kościele Mariackim, lipa', topic=T)
g('modelowanie w glinie', 'Technika dodawania materiału; pozwala poprawiać. Gotową formę się wypala albo służy ona jako model do odlewu.', topic=T)
g('odlew', 'Najczęściej w brązie — z modelu robi się formę, w którą wlewa się metal. Pozwala uzyskać wiele egzemplarzy tego samego dzieła.', 'Myśliciel Rodina istnieje w kilkudziesięciu odlewach', topic=T)
g('kolaż', 'Fr. collage — klejenie: naklejanie na podłoże elementów z innych materiałów: gazet, tkanin, fotografii. Wprowadzony do sztuki przez kubistów.', 'Picasso i Braque', topic=T)
g('asamblaż', 'Jak kolaż, ale w trzech wymiarach: kompozycja z gotowych przedmiotów.', topic=T)
g('instalacja', 'Wieloelementowa kompozycja powstała dla konkretnego wnętrza lub przestrzeni.', topic=T)

T = 'słownik architektoniczny'
for term, d in [
    ('absyda', 'Półkoliste zamknięcie prezbiterium.'),
    ('arkada', 'Łuk wsparty na dwóch podporach.'),
    ('attyka', 'Ozdobna ścianka nad gzymsem, zasłaniająca dach; typowa dla polskiego renesansu.'),
    ('bazylika', 'Budowla o nawie głównej wyższej od bocznych, z oknami w górnej części.'),
    ('boniowanie', 'Opracowanie muru w wyraźne, oddzielone bruzdami bloki.'),
    ('fiala', 'Smukła, ostrosłupowa wieżyczka gotycka.'),
    ('gzyms', 'Pozioma listwa wysunięta przed lico muru.'),
    ('hala', 'Kościół, w którym wszystkie nawy mają jednakową wysokość.'),
    ('kolebka', 'Sklepienie w kształcie przeciętej wzdłuż beczki.'),
    ('kontrafort (przypora, skarpa)', 'Filar wzmacniający mur od zewnątrz.'),
    ('krużganek', 'Arkadowa galeria wokół dziedzińca.'),
    ('łuk oporowy (przyporowy)', 'Łuk przenoszący rozpór sklepienia na przyporę.'),
    ('maswerk', 'Ażurowa dekoracja kamienna wypełniająca okno gotyckie.'),
    ('nawa', 'Podłużna część wnętrza kościoła.'),
    ('pendentyw', 'Trójkątny żagiel umożliwiający oparcie okrągłej kopuły na kwadratowym planie.'),
    ('pilaster', 'Płaski filar przyścienny naśladujący kolumnę.'),
    ('portal', 'Ozdobne obramienie wejścia.'),
    ('portyk', 'Kolumnowy ganek przed wejściem, zwykle z tympanonem.'),
    ('prezbiterium', 'Część kościoła przeznaczona dla duchowieństwa, z ołtarzem głównym.'),
    ('rozeta', 'Okrągłe okno gotyckie z maswerkiem.'),
    ('rustyka', 'Mur z surowych, nieobrobionych kamieni.'),
    ('sklepienie krzyżowe', 'Powstałe z przecięcia dwóch kolebek.'),
    ('sklepienie krzyżowo-żebrowe', 'Jak sklepienie krzyżowe, ale z żebrami przenoszącymi ciężar na podpory.'),
    ('transept', 'Nawa poprzeczna tworząca ramiona krzyża.'),
    ('tympanon', 'Trójkątne (antyk) lub półkoliste (średniowiecze) pole nad wejściem, wypełnione rzeźbą.'),
]:
    g(term, d, section='V', topic=T)
T = 'porządki architektoniczne'
g('porządek dorycki', 'Kolumna krępa, bez bazy, żłobkowana; głowica prosta: kwadratowa płyta na okrągłej poduszce. Wrażenie: surowość, siła, „męskość”.', 'Partenon', section='V', topic=T)
g('porządek joński', 'Kolumna smuklejsza, na bazie; głowica ze ślimacznicami (wolutami). Wrażenie: lekkość, wdzięk.', section='V', topic=T)
g('porządek koryncki', 'Kolumna najsmuklejsza; głowica w kształcie kosza liści akantu. Wrażenie: bogactwo, dekoracyjność.', section='V', topic=T)
g('porządek toskański i kompozytowy', 'Rzymskie uzupełnienia greckich porządków.', section='V', topic=T)
dump('glossary.json', G)

P = []
def per(name, dates, motto, annex, features=(), keyWorks=(), polish=()):
    P.append(dict(name=name, dates=dates, motto=motto, features=list(features), keyWorks=list(keyWorks), polishExamples=list(polish), annexPeriods=annex))

per('Prehistoria', 'ok. 40 000 – ok. 3500 p.n.e.', 'magia i przetrwanie', ['Prehistoria'])
per('Starożytny Egipt', 'ok. 3100 – 30 p.n.e.', 'wieczność i niezmienny kanon', ['Egipt'],
    ['Kanon przedstawiania postaci — głowa z profilu, oko i tors na wprost, biodra i nogi z profilu. Nie jest to nieudolność, lecz zasada: każdą część ciała pokazywano od strony najbardziej dla niej charakterystycznej.',
     'Hierarchia wielkości — im ważniejsza postać, tym większa. Faraon góruje nad żoną, żona nad służbą.',
     'Frontalizm i statyczność w rzeźbie: postać siedząca lub krocząca, ręce przy ciele, spojrzenie wprost, blok kamienia nienaruszony.',
     'Płaskość i brak perspektywy w malarstwie; barwy lokalne, kontur, sceny układane pasami (rejestrami).',
     'Pismo hieroglificzne jako integralna część kompozycji.',
     'Kolumna egipska ma głowicę wzorowaną na roślinach: lotosową, papirusową lub palmową.'],
    ['Piramidy w Gizie', 'Wielki Sfinks', 'Popiersie Nefertiti (Neues Museum, Berlin)', 'Złota maska Tutanchamona', 'Pisarz siedzący (Luwr)', 'Malowidła z grobowców w Dolinie Królów'])
per('Starożytna Grecja', 'ok. VIII – I w. p.n.e.', 'człowiek miarą wszechrzeczy', ['Grecja'],
    ['Piękno jest wymierne i wynika z harmonii, proporcji i umiaru; idealne proporcje ciała opisano matematycznie (kanon Polikleta).',
     'Porządki architektoniczne: dorycki, joński, koryncki.',
     'Świątynia na stopniowanej podstawie (krepidoma), otoczona kolumnadą, z belkowaniem i trójkątnym tympanonem wypełnionym rzeźbą.',
     'Rzeźba archaiczna: kurosi i kory — postacie sztywne, frontalne, z „archaicznym uśmiechem”.',
     'Rzeźba klasyczna: odkrycie kontrapostu, idealizacja, spokój.',
     'Hellenizm: ruch, ekspresja, emocja, dramat, skomplikowane skręty ciała.',
     'Malarstwo wazowe: styl czarnofigurowy i późniejszy czerwonofigurowy.'],
    ['Partenon (Iktinos i Kallikrates, rzeźby Fidiasza, 447–432 p.n.e.)', 'Doryforos Polikleta', 'Dyskobol Myrona', 'Nike z Samotraki', 'Grupa Laokoona', 'Wenus z Milo'])
per('Starożytny Rzym', 'ok. 753 p.n.e. – 476 n.e.', 'państwo, inżynieria, realizm', ['Rzym'],
    ['Łuk i sklepienie kolebkowe — pozwoliły przekrywać ogromne przestrzenie; beton rzymski (opus caementicium) uczynił to tanim.',
     'Kopuła — Panteon ma kopułę o średnicy 43 m z otworem (okulus) w szczycie.',
     'Porządek toskański i kompozytowy — rzymskie uzupełnienia greckich porządków.',
     'Portret rzymski — weryzm, czyli wierność aż do zmarszczek i defektów; przeciwieństwo greckiej idealizacji.',
     'Relief historyczny — narracja o czynach władcy.',
     'Nowe typy budowli: amfiteatr, termy, bazylika, łuk triumfalny, akwedukt, forum, insula.',
     'Malarstwo ścienne w Pompejach i Herkulanum — z iluzjonistyczną architekturą i pejzażem.'],
    ['Panteon (ok. 125 n.e.)', 'Koloseum', 'Kolumna Trajana', 'Ara Pacis'])
per('Sztuka wczesnochrześcijańska', 'ok. 313 – VI w.', 'znak ważniejszy niż wygląd', ['Wczesnochrześcijańska'],
    ['Po edykcie mediolańskim (313 r.) chrześcijaństwo wyszło z katakumb.',
     'Sztuka porzuciła wierność naturze na rzecz znaku: ważne było, żeby przedstawienie dało się odczytać, nie żeby było podobne.',
     'Bogaty język symboli: ryba, baranek, winna latorośl, chryzmon, gołębica.'])
per('Bizancjum', 'ok. VI – XV w.', 'złoto i hieratyczność', ['Bizancjum'],
    ['Hieratyczność — postacie sztywne, frontalne, dostojne, pozbawione ruchu i indywidualnych rysów.',
     'Złote tło — nie przestrzeń, lecz znak wieczności i światła Bożego.',
     'Rezygnacja z perspektywy linearnej, stosowanie perspektywy odwróconej.',
     'Mozaika jako główna technika dekoracji ścian.',
     'Ikona — obraz kultowy pisany według ścisłego kanonu, na desce, temperą.',
     'W architekturze: plan centralny, kopuła na pendentywach.'],
    ['Hagia Sophia w Konstantynopolu (532–537)', 'San Vitale w Rawennie z mozaikami Justyniana i Teodory', 'San Apollinare Nuovo', 'Ikona Matki Boskiej Włodzimierskiej'])
per('Romanizm', 'ok. XI – XII w. (w Polsce do poł. XIII w.)', 'ciężar, mur, obronność', ['Romanizm'],
    ['Grube mury z ciosów kamiennych, niewielkie okna, wnętrze mroczne.',
     'Łuk półkolisty — w oknach, portalach, arkadach.',
     'Sklepienie kolebkowe i krzyżowe.',
     'Plan bazylikowy, na rzucie krzyża łacińskiego, z transeptem i absydą.',
     'System wiązany — na jedno przęsło nawy głównej przypadają dwa przęsła naw bocznych.',
     'Bryła zwarta, przysadzista, z wieżami; kościoły często pełniły funkcję obronną.',
     'Portal uskokowy z tympanonem wypełnionym rzeźbą.',
     'Rzeźba podporządkowana architekturze; deformacja proporcji, płaskość, schematyzm.'],
    ['Opactwo w Cluny', 'Katedra w Pizie z krzywą wieżą', 'Kościół Sainte-Marie-Madeleine w Vézelay', 'Katedra w Wormacji'],
    ['Kolegiata w Tumie pod Łęczycą', 'Kościół św. Andrzeja w Krakowie', 'Rotunda św. Mikołaja w Cieszynie', 'Krypta św. Leonarda na Wawelu', 'Drzwi Gnieźnieńskie (brąz, ok. 1175)', 'Kolumna z Kruszwicy', 'Tympanon z Ołbina'])
per('Gotyk', 'ok. XII – XV w. (w Polsce XIII – pocz. XVI w.)', 'światło i pion', ['Gotyk'],
    ['Łuk ostry — rozkłada nacisk bardziej pionowo niż półkolisty, więc mury mogą być cieńsze.',
     'Sklepienie krzyżowo-żebrowe — ciężar spływa po żebrach do punktów podparcia.',
     'System przyporowy — łuki oporowe przenoszą rozpór sklepienia na zewnętrzne przypory. Konstrukcja wyszła na zewnątrz budynku.',
     'Strzelistość, dominacja pionu, wieże i sterczyny (fiale), zwieńczenia kwiatonów.',
     'Rozeta — wielkie okrągłe okno w fasadzie, wypełnione maswerkiem.',
     'Witraże zamiast malowideł ściennych; wnętrze pełne barwnego światła.',
     'Portal rozglifiony z rzeźbami w ościeżach.',
     'Rzeźba stopniowo uwalnia się od ściany; typy: Pietà, Piękna Madonna.',
     'Malarstwo: ołtarze szafiaste malowane temperą na desce, ze złotym tłem.'],
    ['Katedra Notre-Dame w Paryżu', 'Katedra w Chartres (witraże)', 'Katedra w Reims', 'Sainte-Chapelle w Paryżu', 'Katedra w Kolonii'],
    ['Katedra na Wawelu', 'Kościół Mariacki w Krakowie', 'Katedra we Włocławku', 'Zamek w Malborku', 'Collegium Maius', 'Ołtarz Mariacki Wita Stwosza (1477–1489)'])
per('Renesans', 'XV – XVI w. (w Polsce XVI w.)', 'powrót do antyku, człowiek w centrum', ['Renesans'],
    ['Perspektywa linearna — odkryta przez Brunelleschiego, opisana przez Albertiego; obraz staje się „oknem na świat”.',
     'Równowaga i symetria, kompozycje wpisane w figury geometryczne, zwłaszcza w trójkąt.',
     'Studium anatomii i realizm ciała ludzkiego, ale poddany idealizacji.',
     'Światłocień i sfumato (Leonardo).',
     'Tematyka: obok religijnej wraca mitologiczna, rozwija się portret i pejzaż jako tło.',
     'Artysta przestaje być rzemieślnikiem — zaczyna być twórcą.',
     'W architekturze: plan centralny, kopuła, kolumny i pilastry w porządkach antycznych, boniowanie, podział poziomy gzymsami.',
     'Charakterystyczna dla Polski jest attyka.'],
    ['Brunelleschi — kopuła katedry we Florencji, Kaplica Pazzich', 'Donatello — Dawid', 'Botticelli — Narodziny Wenus, Wiosna', 'Leonardo da Vinci — Mona Lisa, Ostatnia Wieczerza, Dama z gronostajem', 'Michał Anioł — Dawid, Pietà, sklepienie Kaplicy Sykstyńskiej, Sąd Ostateczny', 'Rafael Santi — Szkoła Ateńska', 'Andrea Palladio — Villa Rotonda', 'Jan van Eyck — Portret małżonków Arnolfinich', 'Albrecht Dürer — Adam i Ewa'],
    ['Kaplica Zygmuntowska na Wawelu (1519–1533, Bartolomeo Berrecci)', 'Dziedziniec arkadowy Wawelu', 'Sukiennice w Krakowie z attyką', 'Ratusz w Poznaniu (Jan Baptysta Quadro)', 'Zamość — miasto idealne (Bernardo Morando)'])
per('Manieryzm', 'ok. 1520 – 1600', 'wydłużenie, niepokój, wyrafinowanie', ['Manieryzm'],
    ['Wydłużone, powyginane proporcje postaci (figura serpentinata).', 'Niepokojące, zatłoczone kompozycje.', 'Chłodna, „nienaturalna” kolorystyka, sztuczne oświetlenie.', 'Wyrafinowanie i intelektualna zagadka.'],
    ['Parmigianino — Madonna z długą szyją', 'Pontormo', 'El Greco — Pogrzeb hrabiego Orgaza', 'Giuseppe Arcimboldo — portrety z owoców i warzyw'])
per('Barok', 'koniec XVI – poł. XVIII w.', 'ruch, emocja, teatr', ['Barok'],
    ['Dynamika — kompozycje diagonalne, skosy, spirale, formy w ruchu.',
     'Silny światłocień, kontrast, luminizm.',
     'Ekspresja i patos — uchwycony moment kulminacyjny, gwałtowne gesty, ekstaza, cierpienie.',
     'Iluzjonizm — malarstwo plafonowe otwierające sklepienie na niebo (di sotto in sù).',
     'Bogactwo i przepych materiałów: złocenia, marmury, stiuki.',
     'Synteza sztuk — architektura, rzeźba i malarstwo działają razem.',
     'W architekturze: falujące fasady, kolumny, pilastry, wolutowe spływy, wielkie kopuły.',
     'Barok holenderski: obrazy dla mieszczan, gatunki „małe” — martwa natura, pejzaż, scena rodzajowa, portret zbiorowy.'],
    ['Caravaggio — Powołanie św. Mateusza, Wieczerza w Emaus', 'Bernini — Ekstaza św. Teresy, Apollo i Dafne, kolumnada placu św. Piotra', 'Rubens — Zdjęcie z krzyża', 'Rembrandt — Straż nocna, Lekcja anatomii', 'Vermeer — Dziewczyna z perłą, Mleczarka', 'Velázquez — Panny dworskie', 'Pałac w Wersalu'],
    ['Kościół św. Piotra i Pawła w Krakowie', 'Pałac w Wilanowie', 'Kolumna Zygmunta III Wazy w Warszawie', 'Kościół św. Anny w Krakowie'])
per('Rokoko', 'ok. 1720 – 1780', 'lekkość, wdzięk, pastel', ['Rokoko'],
    ['Lekkość, wdzięk, asymetria.', 'Drobna, wyszukana dekoracja oparta na motywie muszli (rocaille).', 'Pastelowa, jasna kolorystyka (róż, błękit, biel, złoto).', 'Tematyka zabawowa i miłosna, brak powagi.'],
    ['Antoine Watteau — Odjazd na Cyterę', 'François Boucher', 'Jean-Honoré Fragonard — Huśtawka', 'Kościół w Vierzehnheiligen (Balthasar Neumann)'])
per('Klasycyzm', 'ok. 1760 – 1830', 'rozum, ład, powrót do antyku', ['Klasycyzm'],
    ['Harmonia, symetria, statyka, jasna i czytelna kompozycja.', 'Prymat rysunku i konturu nad barwą; gładka faktura, chłodna, oszczędna kolorystyka.', 'Tematyka antyczna i historyczna, o wymowie moralnej i obywatelskiej.', 'W architekturze: portyk kolumnowy z tympanonem, kopuła, płaskie ściany, oszczędna dekoracja.'],
    ['Jacques-Louis David — Przysięga Horacjuszy, Śmierć Marata', 'Ingres', 'Antonio Canova — Amor i Psyche', 'Panteon w Paryżu', 'Brama Brandenburska w Berlinie'],
    ['Pałac na Wyspie w Łazienkach', 'Teatr na Wyspie', 'Pałac w Natolinie', 'Marcello Bacciarelli', 'Canaletto (Bernardo Bellotto)'])
per('Romantyzm', 'ok. 1800 – 1850', 'uczucie, wyobraźnia, wolność', ['Romantyzm'],
    ['Dominacja barwy i plamy nad rysunkiem; swobodny, widoczny dukt pędzla.', 'Kompozycje dynamiczne, diagonalne, dramatyczne oświetlenie.', 'Tematy: wydarzenia współczesne o wymowie wolnościowej, egzotyka i Orient, natura żywiołowa, ruiny, noc, śmierć, szaleństwo, sen.', 'Pejzaż jako wyraz stanu duszy, człowiek mały wobec przyrody.'],
    ['Goya — Rozstrzelanie powstańców madryckich', 'Géricault — Tratwa Meduzy', 'Delacroix — Wolność wiodąca lud na barykady', 'Caspar David Friedrich — Wędrowiec nad morzem mgły', 'William Turner'],
    ['Piotr Michałowski', 'Artur Grottger (cykle Polonia, Lithuania)'])
per('Realizm', 'ok. 1840 – 1870', 'zwykły człowiek, prawda bez upiększeń', ['Realizm'],
    ['Tematy z życia codziennego, bohaterem zwykły człowiek pracy.', 'Rezygnacja z idealizacji i patosu.', 'Malarstwo w plenerze i studium natury; często wymowa społeczna.', 'Ciemna, ziemista kolorystyka.', 'Duże formaty użyte do tematów uważanych za „niegodne”.'],
    ['Gustave Courbet — Kamieniarze, Pogrzeb w Ornans', 'Jean-François Millet — Anioł Pański, Zbieraczki kłosów', 'Honoré Daumier'],
    ['Aleksander Gierymski — Żydówka z pomarańczami', 'Józef Chełmoński — Babie lato, Czwórka', 'Maksymilian Gierymski'])
per('Akademizm / historyzm', 'XIX w.', 'oficjalna sztuka salonów i wielkie tematy', ['Akademizm', 'Historyzm i nurt inżynieryjny'],
    ['Hierarchia gatunków (najwyżej scena historyczna i mitologiczna).', 'Doskonały warsztat, gładka faktura, wysoki stopień wykończenia.', 'Monumentalne formaty, dydaktyczna wymowa.', 'Historyzm w architekturze — powtarzanie stylów minionych (neogotyk, neorenesans, neobarok) oraz eklektyzm.'],
    [], ['Jan Matejko — malarstwo historyczne w czasach zaborów'])
per('Impresjonizm', 'ok. 1870 – 1890', 'światło i chwila', ['Impresjonizm'],
    ['Malarstwo w plenerze, szybko, wprost z natury.', 'Rozbicie plamy barwnej na drobne, widoczne pociągnięcia pędzla (dywizjonizm).', 'Jasna, czysta paleta, rezygnacja z czerni — cień jest barwny.', 'Kompozycje otwarte, kadrowanie jak w fotografii, nietypowe punkty widzenia.', 'Tematy zwyczajne: ulica, kawiarnia, rzeka, ogród, dworzec, tancerki.', 'Cykle tego samego motywu o różnych porach dnia.'],
    ['Claude Monet — Impresja, wschód słońca; Katedra w Rouen; nenufary', 'Auguste Renoir — Bal w Moulin de la Galette', 'Edgar Degas — tancerki', 'Camille Pissarro', 'Alfred Sisley', 'Berthe Morisot', 'Édouard Manet — Śniadanie na trawie, Olimpia'],
    ['Władysław Podkowiński', 'Józef Pankiewicz', 'Leon Wyczółkowski', 'Olga Boznańska'])
per('Postimpresjonizm', 'ok. 1885 – 1905', 'każdy własną drogą', ['Postimpresjonizm'],
    ['Cézanne — formy geometryczne w naturze, wielokierunkowa perspektywa; ojciec sztuki nowoczesnej.', 'Van Gogh — ekspresja przez barwę i fakturę; gruby impast, wirujący dukt, kontrasty dopełnieniowe.', 'Gauguin — syntetyzm: płaskie plamy czystego koloru zamknięte konturem.', 'Seurat — pointylizm.', 'Toulouse-Lautrec — syntetyczny rysunek, płaska plama; twórca nowoczesnego plakatu.'],
    ['Paul Cézanne — Góra Sainte-Victoire', 'Vincent van Gogh — Gwiaździsta noc, Słoneczniki', 'Paul Gauguin', 'Georges Seurat — Niedzielne popołudnie na wyspie Grande Jatte', 'Henri de Toulouse-Lautrec'])
per('Symbolizm', 'ok. 1885 – 1910', 'to, czego nie widać', ['Symbolizm'],
    ['Tematyka nastrojowa i wieloznaczna, alegoria i symbol.', 'Marzenie senne, świat mitu i baśni, często niepokojący nastrój.', 'Symbolizm jest raczej postawą niż stylem.'],
    ['Arnold Böcklin — Wyspa umarłych', 'Edvard Munch — Krzyk', 'Auguste Rodin — Myśliciel, Pocałunek, Brama piekieł', 'Gustave Moreau', 'Odilon Redon'],
    ['Jacek Malczewski — Melancholia, Błędne koło', 'Witold Wojtkiewicz'])
per('Secesja', 'ok. 1890 – 1910', 'linia falista i ornament roślinny', ['Secesja'],
    ['Linia falista, giętka, „biczowa”.', 'Ornament roślinny i zwierzęcy: lilie, irysy, wodorosty, pawie, łabędzie, ważki.', 'Asymetria i płynne, organiczne kształty.', 'Motyw kobiety z rozpuszczonymi, falującymi włosami.', 'Płaskość, dekoracyjność, często złoto.', 'Zatarcie granicy między sztuką a rzemiosłem.'],
    ['Gustav Klimt — Pocałunek', 'Antoni Gaudí — Sagrada Família, Casa Batlló, Park Güell', 'Alfons Mucha — plakaty', 'Émile Gallé', 'Victor Horta', 'Louis Comfort Tiffany'],
    ['Stanisław Wyspiański — witraże i polichromia w kościele Franciszkanów w Krakowie', 'Józef Mehoffer — witraże we Fryburgu', 'Olga Boznańska', 'Styl zakopiański — Stanisław Witkiewicz (willa „Koliba”, „Pod Jedlami”)'])
per('Ekspresjonizm', 'ok. 1905 – 1925', 'krzyk zamiast opisu', ['Fowizm'],
    ['Deformacja kształtu i proporcji dla celów wyrazowych.', 'Agresywna, nienaturalna barwa nakładana płaskimi plamami.', 'Ostry, łamany kontur; kompozycje niespokojne, skośne, ciasne.', 'Chętne sięganie po drzeworyt.', 'Tematy: samotność, miasto, wojna, cierpienie.'],
    ['Ernst Ludwig Kirchner', 'Emil Nolde', 'Egon Schiele', 'Oskar Kokoschka', 'Franz Marc', 'Edvard Munch — Krzyk (prekursor)'],
    ['Grupa Bunt w Poznaniu', 'Formiści'])
per('Kubizm', 'ok. 1907 – 1914', 'przedmiot z wielu stron naraz', ['Kubizm'],
    ['Geometryzacja form; perspektywa wielokierunkowa.', 'Faza analityczna (ok. 1909–1912): drobne fasety, kolorystyka niemal monochromatyczna.', 'Faza syntetyczna (od 1912): większe, płaskie płaszczyzny, powrót barwy, kolaż.', 'Inspiracja sztuką Afryki i Iberii oraz malarstwem Cézanne’a.'],
    ['Pablo Picasso — Panny z Awinionu (1907)', 'Georges Braque — martwe natury', 'Juan Gris', 'Fernand Léger', 'Alexander Archipenko'],
    ['Formiści (Zbigniew Pronaszko, Tytus Czyżewski)'])
per('Abstrakcjonizm', 'od ok. 1910', 'obraz nie musi nic przedstawiać', ['Abstrakcjonizm'],
    ['Abstrakcja geometryczna — figura geometryczna, linia prosta, kąt prosty, barwy podstawowe.', 'Abstrakcja niegeometryczna (liryczna, ekspresyjna) — swobodna plama i gest.', 'Po II wojnie: ekspresjonizm abstrakcyjny.'],
    ['Piet Mondrian — Broadway Boogie Woogie', 'Kazimierz Malewicz — Czarny kwadrat na białym tle (1915)', 'Wassily Kandinsky', 'Jackson Pollock', 'Mark Rothko'],
    ['Władysław Strzemiński — unizm', 'Katarzyna Kobro — kompozycje przestrzenne', 'Muzeum Sztuki w Łodzi'])
per('Surrealizm', 'od 1924', 'logika snu', ['Surrealizm'],
    ['Zestawianie przedmiotów, które nie mają ze sobą nic wspólnego, w nieprawdopodobnych sytuacjach.', 'Deformacja i metamorfoza — przedmioty topnieją, rosną, zmieniają się w inne.', 'Przestrzeń bezkresna, pustynna, nierealna, ostre światło, wyraziste cienie.', 'Bardzo realistyczna, drobiazgowa technika.', 'Automatyzm — frotaż, dekalkomania.'],
    ['Salvador Dalí — Trwałość pamięci', 'René Magritte — Zdradliwość obrazów, Syn człowieczy', 'Max Ernst', 'Joan Miró', 'Giorgio de Chirico', 'Meret Oppenheim'],
    ['Bruno Schulz (grafika)', 'Zdzisław Beksiński'])
per('Pop-art, minimalizm, konceptualizm', '2. poł. XX w.', 'kultura masowa, redukcja, idea', ['Sztuka XX w.'],
    ['Pop-art: kultura masowa, powielenie i seryjność, płaska plama, sitodruk, ironiczny dystans.', 'Minimalizm: proste bryły geometryczne, przemysłowe materiały, powtarzalne moduły; „mniej znaczy więcej”.', 'Konceptualizm: idea jest dziełem; wykonanie jest drugorzędne.', 'Op-art, land art, hiperrealizm, sztuka krytyczna.'],
    ['Andy Warhol — Puszki zupy Campbell, Marilyn', 'Roy Lichtenstein', 'Donald Judd', 'Marcel Duchamp — Fontanna (1917)', 'Joseph Kosuth — Jedno i trzy krzesła', 'Joseph Beuys'],
    ['Roman Opałka — Obrazy liczone', 'Magdalena Abakanowicz — Abakany', 'Katarzyna Kozyra', 'Zbigniew Libera'])
dump('periods.json', P)

dump('diagnostic.json', dict(
    maxPoints=30,
    when='Tydzień 0 (przed rozpoczęciem nauki), po Tygodniu 7 i na koniec. Bez zaglądania do materiałów, ok. 30 minut.',
    purpose='Wynik nie służy do oceniania — służy do tego, żeby wiedzieć, gdzie dołożyć czasu.',
    parts=[
        dict(code='A', title='Pojęcia', instruction='Wyjaśnij krótko, własnymi słowami:', points=10,
             tasks=[dict(n=i + 1, text=t, points=1) for i, t in enumerate(['kompozycja zamknięta', 'perspektywa powietrzna', 'walor', 'barwy dopełniające', 'światłocień', 'fresk', 'akwaforta', 'płaskorzeźba', 'weduta', 'ikonografia'])]),
        dict(code='B', title='Epoki', instruction='Podaj ramy czasowe i dwie cechy charakterystyczne:', points=5,
             tasks=[dict(n=i + 11, text=t, points=1) for i, t in enumerate(['gotyk', 'renesans', 'barok', 'impresjonizm', 'kubizm'])]),
        dict(code='C', title='Rozpoznawanie', instruction='Kto jest autorem i z jakiej epoki pochodzi:', points=7,
             tasks=[dict(n=i + 16, text=t, points=1) for i, t in enumerate(['Mona Lisa', 'Bitwa pod Grunwaldem', 'Guernica', 'Gwiaździsta noc', 'Trwałość pamięci', 'Dawid (rzeźba, marmur, Florencja)', 'Krzyk'])]),
        dict(code='D', title='Architektura', instruction='', points=3,
             tasks=[dict(n=23, text='Czym różni się sklepienie kolebkowe od krzyżowo-żebrowego?', points=1),
                    dict(n=24, text='Wymień trzy porządki architektoniczne starożytnej Grecji.', points=1),
                    dict(n=25, text='Podaj po jednym przykładzie budowli romańskiej i gotyckiej w Polsce.', points=1)]),
        dict(code='E', title='Wypowiedź', instruction='26. Wybierz dowolny obraz, który znasz, i opowiadaj o nim przez dwie minuty bez przerwy. Nagraj się. Punkt za:', points=5,
             tasks=[dict(n=26, sub=s, text=t, points=1) for s, t in zip('abcde', ['użycie co najmniej pięciu terminów plastycznych', 'omówienie kompozycji', 'omówienie kolorystyki', 'podanie epoki lub czasu powstania', 'wypowiedzenie własnej opinii z uzasadnieniem'])]),
    ],
    interpretation=[
        dict(min=0, max=12, text='Start od zera. Realizuj plan bez skrótów, w Tygodniach 1–2 nie spiesz się z przechodzeniem dalej.'),
        dict(min=13, max=21, text='Solidna baza, brakuje terminologii i przykładów. Największy zysk: karty dzieł i mówienie na głos.'),
        dict(min=22, max=30, text='Wiedza jest. Przesuń nacisk na Część E, czyli na formę wypowiedzi, i na dział VIII.'),
    ],
    retakeNote='Ten sam test warto powtórzyć po Tygodniu 7 i na koniec — różnica w wyniku jest najlepszą motywacją.',
))


def qr(sec, a, b):
    return [f'{sec}-{i:02d}' for i in range(a, b + 1)]

S = []
def wk(week, phase, title, material, qids, periods, special=(), goal=None, artworkCount=None, polishAccent=None, artists=()):
    S.append(dict(week=week, phase=phase, title=title, material=material, goals=[goal] if goal else [], questionIds=qids,
                  artworkPeriods=periods, artworkCount=artworkCount, polishAccent=polishAccent, artists=list(artists), specialTasks=list(special)))

W12 = ('Kompendium dział I w całości; Ars longa t. I, Wprowadzenie (s. 7–27). Karty dzieł: 10 dowolnych — ćwiczenie polega na nazywaniu środków wyrazu, nie na zapamiętywaniu. Pytania: I-01 do I-16.')
wk(1, 'Fundament', 'Środki wyrazu i analiza dzieła (dział I)', W12, qr('I', 1, 8), [], artworkCount=10,
   special=['Test diagnostyczny na start (Tydzień 0)'])
wk(2, 'Fundament', 'Środki wyrazu i analiza dzieła (dział I)', W12, qr('I', 9, 16), [], artworkCount=10,
   goal='Potrafisz z pamięci wyrecytować schemat analizy dzieła i zastosować go do losowego obrazu.')
wk(3, 'Fundament', 'Techniki plastyczne i dziedziny sztuki (dział I cz. 2 + dział II)',
   'Kompendium dział I (techniki) i dział II. Pytania: I-17 do I-32, II-01 do II-18.', qr('I', 17, 32) + qr('II', 1, 18), [],
   special=['Obejrzeć w internecie po jednym filmiku o drzeworycie, akwaforcie i litografii — różnicy między technikami graficznymi nie da się zapamiętać z samego opisu.'])
wk(4, 'Chronologia', 'Starożytność: Egipt, Grecja, Rzym',
   'Kompendium dział III cz. 1 + dział V (architektura Egiptu, Grecji, Rzymu). Ars longa t. I, rozdz. III–VII. Karty dzieł: 21 kart (Prehistoria–Rzym). Pytania: III o Egipcie, Grecji i Rzymie + V-01 do V-05.',
   qr('III', 1, 8) + qr('V', 1, 5), ['Prehistoria', 'Mezopotamia', 'Egipt', 'Grecja', 'Rzym'], artworkCount=21)
wk(5, 'Chronologia', 'Średniowiecze: sztuka wczesnochrześcijańska, Bizancjum, romanizm, gotyk',
   'Kompendium dział III cz. 2 + architektura romańska i gotycka. Ars longa t. I, rozdz. VIII–XII. Karty dzieł: 15 kart.',
   qr('III', 9, 13), ['Wczesnochrześcijańska', 'Bizancjum', 'Romanizm', 'Gotyk'], artworkCount=15,
   polishAccent='Drzwi Gnieźnieńskie, kolegiata w Tumie, kościół Mariacki i ołtarz Wita Stwosza.',
   goal='Kluczowe rozróżnienie tygodnia: romanizm kontra gotyk — po czym poznać jedno i drugie w trzy sekundy.')
wk(6, 'Powtórka', 'Pierwsza powtórka scalająca + próbne odpytywanie',
   'Bez nowego materiału. Losowanie 25 pytań z działów I–III (starożytność i średniowiecze), analiza trzech nieznanych dzieł na czas, powtórka 36 kart.',
   [], ['Prehistoria', 'Mezopotamia', 'Egipt', 'Grecja', 'Rzym', 'Wczesnochrześcijańska', 'Bizancjum', 'Romanizm', 'Gotyk'], artworkCount=36,
   special=['Losowanie 25 pytań z działów I–III', 'Analiza trzech nieznanych dzieł na czas', 'Mini-egzamin: 15 minut, trzy pytania z losowania, ktoś dorosły w roli egzaminatora'])
wk(7, 'Chronologia', 'Renesans i manieryzm',
   'Kompendium dział III cz. 3. Ars longa t. II, rozdz. I–IV. Karty dzieł: 16 kart.', qr('III', 14, 16) + ['IV-13', 'IV-14'], ['Renesans', 'Manieryzm'], artworkCount=16,
   artists=['Leonardo da Vinci', 'Michał Anioł', 'Rafael'], polishAccent='Kaplica Zygmuntowska, Sukiennice, ratusz w Poznaniu, attyka.',
   special=['Powtórz test diagnostyczny — półmetek'])
wk(8, 'Chronologia', 'Barok i rokoko', 'Kompendium dział III cz. 4. Ars longa t. II, rozdz. V–XI. Karty dzieł: 12 kart.', qr('III', 17, 19) + ['IV-15'], ['Barok', 'Rokoko'], artworkCount=12,
   artists=['Caravaggio', 'Bernini', 'Rembrandt', 'Vermeer', 'Velázquez'], polishAccent='Wilanów, kościół św. Piotra i Pawła, Canaletto i widoki Warszawy.')
wk(9, 'Chronologia', 'Klasycyzm, romantyzm, realizm, akademizm',
   'Kompendium dział III cz. 5. Ars longa t. III, rozdz. I–VII. Karty dzieł: 12 kart. Jan Matejko — jeden z czterech artystów wymienionych w zagadnieniach z nazwiska, więc traktowany osobno i szeroko.',
   qr('III', 20, 25) + qr('IV', 1, 3), ['Klasycyzm', 'Romantyzm', 'Realizm', 'Akademizm'], artworkCount=12, artists=['David', 'Goya', 'Delacroix', 'Courbet', 'Jan Matejko'])
wk(10, 'Chronologia', 'Impresjonizm, postimpresjonizm, symbolizm, secesja',
   'Kompendium dział III cz. 6. Ars longa t. III, rozdz. VIII–XII. Karty dzieł: 18 kart.', qr('III', 26, 28) + qr('III', 31, 32) + qr('IV', 4, 6) + qr('IV', 16, 20), ['Historyzm i nurt inżynieryjny', 'Impresjonizm', 'Postimpresjonizm', 'Symbolizm', 'Secesja'], artworkCount=18,
   artists=['Monet', 'Van Gogh', 'Rodin', 'Klimt', 'Gaudí', 'Stanisław Wyspiański', 'Malczewski', 'Boznańska', 'Chełmoński'])
wk(11, 'Chronologia', 'XX wiek: ekspresjonizm, kubizm, surrealizm, abstrakcja, druga połowa wieku',
   'Kompendium dział III cz. 7. Podręcznik Ars longa nie obejmuje tego okresu w tomach I–III, więc opieramy się na kompendium i na oglądaniu dzieł w internecie. Karty dzieł: 16 kart.',
   qr('III', 29, 30) + qr('III', 33, 40) + qr('IV', 7, 12), ['Fowizm', 'Kubizm', 'Surrealizm', 'Abstrakcjonizm', 'Sztuka XX w.'], artworkCount=16,
   artists=['Pablo Picasso', 'Salvador Dalí', 'Kandinsky', 'Mondrian', 'Malewicz', 'Warhol', 'Abakanowicz', 'Strzemiński', 'Kobro'])
wk(12, 'Uzupełnienia', 'Architektura przekrojowo, instytucje kultury, wiedza o kulturze (działy V–VII)',
   'Kompendium działy V, VI, VII + słownik terminów architektonicznych. Pytania: V, VI, VII w całości.',
   qr('V', 1, 18) + qr('VI', 1, 8) + qr('VII', 1, 8), [],
   special=['Wizyta w muzeum lub galerii (Muzeum Narodowe w Warszawie, Zachęta, MSN, Zamek Królewski) — do zrobienia koniecznie. Punkt VI.3 zagadnień wymaga opowiedzenia o wydarzeniu artystycznym, w którym kandydatka uczestniczyła.',
            'Po wizycie: notatka na pół strony o jednym dziele i o sposobie ekspozycji.'])
wk(13, 'Trening', 'Forma wypowiedzi (dział VIII) + powtórka scalająca',
   'Codziennie: analiza jednego nieznanego dzieła na głos, 3 minuty, według schematu. Powtórka wszystkich 110 kart w trybie szybkim (rozpoznaj → autor → epoka). Losowanie pytań ze wszystkich działów.',
   qr('VIII', 1, 6), [], artworkCount=110,
   special=['Codziennie: analiza jednego nieznanego dzieła na głos, 3 minuty', 'Powtórka wszystkich 110 kart w trybie szybkim', 'Dwa pełne egzaminy próbne: losowanie zestawu trzech pytań, 3 minuty na przygotowanie'])
wk(14, 'Finisz', 'Powtórka celowana i wyciszenie',
   'Tylko te działy, które w egzaminach próbnych wypadły najsłabiej. Ostatnie trzy dni — bez nowego materiału: przegląd kart dzieł, schemat analizy, jeden egzamin próbny. Dzień przed egzaminem: nic. Naprawdę nic.',
   [], [], special=['Jeden egzamin próbny', 'Powtórz test diagnostyczny — na koniec'])
dump('schedule.json', dict(
    assumption='4 dni nauki w tygodniu po ok. 30 minut + jedna dłuższa sesja weekendowa (60 min) na powtórkę i odpytywanie. Dzień piąty i szósty wolne — to jest częścią planu, nie odstępstwem od niego.',
    reminders=['Punkt VI.3 wymaga własnego przeżycia — wystawy, spektaklu lub koncertu. Bez wizyty w muzeum tego pytania nie da się odpowiedzieć wiarygodnie. Zaplanować wcześniej niż w Tygodniu 12, jeśli się da.',
               'Zagadnienia wymieniają czterech artystów z nazwiska — Matejko, Wyspiański, Dalí, Picasso. To najsilniejsza podpowiedź, jaką dała szkoła: o nich pytania padną niemal na pewno.',
               'Sztuka XX wieku (kubizm, surrealizm, abstrakcjonizm, pop-art) nie mieści się w tomach I–III podręcznika. Ten obszar trzeba przerobić z kompendium i z reprodukcji.'],
    weeks=S))

import json as _j
r = _j.load(open('src/data/examRules.json'))
r['rules'] = ['Mów pełnymi zdaniami, wolniej niż w rozmowie. Pauza jest lepsza niż „yyy”.',
              'Używaj terminologii fachowej — ale tylko takiej, którą umiesz wyjaśnić, gdy padnie pytanie „a co to znaczy?”.',
              'Zawsze podaj przykład dzieła z nazwiskiem autora.',
              'Jeśli nie znasz dzieła — opisz, co widzisz, i wnioskuj o epoce z cech formalnych. To pełnoprawna odpowiedź.',
              'Nie zmyślaj dat ani tytułów. „Około XVII wieku” jest lepsze niż zmyślony rok.',
              'Nie mów „ładne”, „fajne”, „takie sobie”. Mów, co sprawia, że dzieło tak działa.',
              'Własna opinia jest mile widziana, ale musi być uzasadniona formą dzieła.',
              'Nie przerywaj egzaminatorowi i nie kończ odpowiedzi w połowie zdania — dopowiedz myśl do końca.',
              'Pytanie dodatkowe to nie kara, tylko szansa na dodanie czegoś od siebie.',
              'Jeśli się pomylisz, powiedz „przepraszam, chciałam powiedzieć…” i mów dalej. Poprawienie się jest atutem.']
r['rulesSource'] = 'Dział VIII · Jak mówić na egzaminie'
r['answerStructure'] = [
    dict(n=1, name='Definicja lub teza', text='Jedno zdanie, które odpowiada wprost na pytanie. Nie zaczynaj od „no więc…”.'),
    dict(n=2, name='Rozwinięcie', text='Trzy do pięciu zdań: cechy, podziały, kontekst.'),
    dict(n=3, name='Przykład', text='Konkretne dzieło z autorem i, jeśli się pamięta, przybliżoną datą. To jest część, którą kandydaci najczęściej pomijają — i to ona najbardziej podnosi ocenę.'),
    dict(n=4, name='Zamknięcie', text='Jedno zdanie podsumowania albo własnej oceny.')]
r['lastWeek'] = 'W ostatnim tygodniu nie uczy się nowych rzeczy. Ogląda się reprodukcje, powtarza schemat analizy i mówi na głos. Dzień przed egzaminem — spacer i sen. Wiedza, która jest, nie ucieknie; wiedza, której nie ma, nie pojawi się w jedną noc.'
r['namedArtists'] = ['Jan Matejko', 'Stanisław Wyspiański', 'Salvador Dalí', 'Pablo Picasso']
dump('examRules.json', {k: r[k] for k in ['rules', 'rulesSource', 'answerStructure', 'namedArtists', 'lastWeek', 'analysisMistakes', 'scorecard', 'feedbackTip']})
print(len(G), 'terminów;', len(P), 'epok;', len(S), 'tygodni')
