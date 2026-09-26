"""„Analiza dzieła sztuki” → analysisSteps, modelAnalyses, signals, analysisGuide, examRules (błędy + karta oceny)."""
import json,re
import pdfplumber
with pdfplumber.open('materialy/Analiza dzieła sztuki.pdf') as _pdf:
  t='\n\n=====PAGE=====\n'.join((p.extract_text() or '') for p in _pdf.pages)
start=t.index('Powołanie św. Mateusza\nCaravaggio'); end=t.index('Część III · Dzieło')
body=t[start:end]
labels={'IDENTYFIKACJA','TREŚĆ','KOMPOZYCJA','PRZESTRZEŃ','I ŚWIATŁO','BARWA','FAKTURA','FUNKCJA I','KONTEKST','STYL I CZAS','POWSTANIA','WŁASNA','OPINIA','=====PAGE====='}
heads=[('Powołanie św. Mateusza','caravaggio-powolanie-sw-mateusza'),('Stańczyk','matejko-stanczyk'),('Dawid','michal-aniol-dawid'),('Fasada zachodnia katedry Notre-Dame w Paryżu','notre-dame-fasada-zachodnia'),('Broadway Boogie Woogie','mondrian-broadway-boogie-woogie')]
lines=[l for l in body.split('\n') if l.strip() and l.strip() not in labels and not re.fullmatch(r'\d+',l.strip())]
out=[];cur=None;expect=1
i=0
while i<len(lines):
  l=lines[i]
  h=[x for x in heads if l==x[0]]
  if h:
    cur={'id':h[0][1],'title':l,'artistDate':lines[i+1],'meta':lines[i+2],'note':lines[i+3],'steps':[]}
    out.append(cur);expect=1;i+=4;continue
  m=re.match(r'^(\d) (.*)$',l)
  if m and int(m.group(1))==expect:
    cur['steps'].append({'n':expect,'text':m.group(2)});expect+=1
  elif not cur['steps']:
    cur['note']+=' '+l
  else:
    cur['steps'][-1]['text']+=' '+l
  i+=1
for a in out:
  artist,date=[s.strip() for s in a.pop('artistDate').split('·')]
  parts=[s.strip() for s in a.pop('meta').split('·')]
  a['artist']=artist;a['date']=date;a['domain']=parts[0];a['style']=parts[1];a['techniqueLocation']=parts[2]
models=out

import json
D='src/data/'
def dump(n,o): json.dump(o,open(D+n,'w'),ensure_ascii=False,indent=2); open(D+n,'a').write('\n')
steps=[
 dict(n=1,name="Identyfikacja",goal="Powiedz, na co patrzysz, zanim powiesz cokolwiek innego.",duration="2–3 zdania · ok. 15 sekund",durationSeconds=15,
  selfQuestions=["Jaka to dziedzina sztuki: malarstwo, rzeźba, grafika, architektura?","Jaka technika — na ile da się ją rozpoznać z reprodukcji?","Jaki jest format i kształt pola obrazowego?","Czy znam autora i tytuł? Jeśli tak — podaj od razu i idź dalej."],
  phrases=["Mamy do czynienia z dziełem malarskim, prawdopodobnie wykonanym techniką olejną na płótnie.","To rzeźba pełna, kuta w marmurze, przeznaczona do oglądania ze wszystkich stron.","Widzimy fotografię budowli sakralnej — fasady zachodniej kościoła.","Format jest pionowy, prostokątny, co już podpowiada, że kompozycja będzie budowana na osi pionowej."],
  commonMistake="Zaczynanie od „na tym obrazie widzimy…”. Najpierw nazwij dziedzinę i technikę — to pokazuje, że myślisz jak plastyk, nie jak widz."),
 dict(n=2,name="Treść",goal="Powiedz, co dzieło przedstawia — od rzeczy najważniejszych do szczegółów.",duration="3–5 zdań · ok. 25 sekund",durationSeconds=25,
  selfQuestions=["Jaki to gatunek: portret, pejzaż, martwa natura, scena rodzajowa, historyczna, religijna, mitologiczna, batalistyczna, akt, alegoria?","Co konkretnie widać? Ile jest postaci, co robią, gdzie się znajdują?","Czy są symbole lub atrybuty, po których rozpoznaję postacie?","Czy scena jest przedstawiająca, czy abstrakcyjna?"],
  phrases=["Pod względem gatunku jest to scena religijna, ukazana w momencie kulminacyjnym.","Kompozycja jest wielopostaciowa — widzę siedem postaci skupionych wokół stołu.","Postać w czerwonym płaszczu rozpoznaję po atrybucie — trzyma…","Dzieło należy do sztuki abstrakcyjnej, więc nie ma tu tematu w tradycyjnym sensie."],
  commonMistake="Opisywanie wszystkiego po kolei, jak inwentaryzacja. Powiedz najpierw, o co w scenie chodzi, a potem dwa–trzy istotne szczegóły."),
 dict(n=3,name="Kompozycja",goal="Pokaż, jak dzieło jest zbudowane — to część, w której najłatwiej zdobyć punkty.",duration="4–6 zdań · ok. 35 sekund",durationSeconds=35,
  selfQuestions=["Zamknięta czy otwarta? Czy coś jest ucięte krawędzią?","Symetryczna czy asymetryczna? Statyczna czy dynamiczna?","Jakie kierunki przeważają: pionowe, poziome, skośne?","Gdzie jest dominanta kompozycyjna i czy pokrywa się ze środkiem geometrycznym?","Ile jest planów? Czy kompozycja wpisuje się w figurę geometryczną?"],
  phrases=["Kompozycja jest zamknięta i wpisana w trójkąt, co daje wrażenie ładu i stabilności.","To kompozycja diagonalna — główne kierunki biegną po skosie od prawego górnego rogu, przez co scena wydaje się być w ruchu.","Dominantą kompozycyjną jest postać w centrum, ale nie pokrywa się ona ze środkiem geometrycznym obrazu — jest przesunięta w prawo.","Kompozycja jest wieloplanowa: na pierwszym planie…, na drugim…, w głębi…"],
  commonMistake="Powiedzenie samego terminu bez wskazania, z czego on wynika. Zawsze dodaj „ponieważ” — „kompozycja jest dynamiczna, ponieważ przeważają skosy i łuki”."),
 dict(n=4,name="Przestrzeń i światło",goal="Wyjaśnij, jak zbudowana jest głębia i skąd pada światło.",duration="3–5 zdań · ok. 30 sekund",durationSeconds=30,
  selfQuestions=["Jaki rodzaj perspektywy: linearna, powietrzna, kulisowa, odwrócona, wielokierunkowa? A może dzieło jest jednoplanowe?","Gdzie biegnie linia horyzontu — nisko, wysoko, w połowie?","Skąd pada światło? Naturalne czy sztuczne, rozproszone czy skupione?","Czy występuje modelunek światłocieniowy? Czy światło ma charakter luministyczny?"],
  phrases=["Artysta zastosował perspektywę linearną — linie posadzki zbiegają się w punkcie tuż za głową głównej postaci.","Głębię buduje przede wszystkim perspektywa powietrzna: dalsze plany są zamglone i chłodniejsze.","Światło pada z prawej strony, spoza kadru, ostrym, wąskim snopem — to typowy luminizm.","Modelunek światłocieniowy jest miękki, przejścia od światła do cienia niemal niezauważalne — to sfumato."],
  commonMistake="Pominięcie tego kroku. Światło jest tym, o co egzaminatorzy pytają najczęściej w pytaniu dodatkowym."),
 dict(n=5,name="Barwa",goal="Opisz kolorystykę jako system, nie jako listę kolorów.",duration="3–5 zdań · ok. 30 sekund",durationSeconds=30,
  selfQuestions=["Gama szeroka czy wąska? Ciepła, chłodna czy monochromatyczna?","Jaki jest koloryt całości i co stanowi dominantę barwną?","Czy są akcenty barwne i gdzie zostały umieszczone?","Jakie kontrasty barwne występują: temperaturowy, walorowy, dopełnieniowy?"],
  phrases=["Gama barwna jest wąska i ciepła — przeważają brązy, ochry i czerwienie.","Dominanta barwna jest chłodna, ale malarz wprowadził ciepły akcent w postaci czerwonej draperii, który przyciąga wzrok do centrum.","Najsilniejszy jest kontrast walorowy — jasna postać wydobyta z niemal czarnego tła.","Barwy są czyste i nasycone, kładzione płaskimi plamami, bez modelunku."],
  commonMistake="„Obraz jest kolorowy” albo wyliczanie: „jest tu czerwony, niebieski, żółty”. Mów o gamie, dominancie, akcentach i kontrastach."),
 dict(n=6,name="Faktura",goal="Powiedz, jak opracowana jest powierzchnia — nawet jedno zdanie robi różnicę.",duration="1–2 zdania · ok. 10 sekund",durationSeconds=10,
  selfQuestions=["Gładka czy impastowa? Czy widać dukt pędzla?","W rzeźbie: powierzchnia wypolerowana czy ze śladami dłuta? Czy jest kontrast faktur?","Czy dzieło jest starannie wykończone (fini), czy celowo niedokończone (non finito)?"],
  phrases=["Faktura jest gładka, wykończona, ślad pędzla niewidoczny — malarz dążył do efektu fini.","Widoczny jest wyrazisty, wirujący dukt pędzla i gruby impast.","Rzeźbiarz zestawił wypolerowane ciało z chropowatą, surową powierzchnią cokołu — to kontrast faktur."],
  commonMistake="Całkowite pominięcie faktury. To najczęściej opuszczany element analizy, więc wspomnienie o niej od razu wyróżnia odpowiedź."),
 dict(n=7,name="Funkcja i kontekst",goal="Powiedz, po co dzieło powstało i dla kogo.",duration="2–3 zdania · ok. 20 sekund",durationSeconds=20,
  selfQuestions=["Funkcja: kultowa, dekoracyjna, memoratywna, propagandowa, estetyczna, użytkowa, sepulkralna?","Gdzie dzieło pierwotnie się znajdowało — w kościele, w pałacu, na rynku, w domu mieszczanina?","Kto był zleceniodawcą i do kogo dzieło było adresowane?"],
  phrases=["Dzieło powstało jako obraz ołtarzowy, więc pełniło funkcję kultową i dydaktyczną.","Ogromny format i temat historyczny wskazują na funkcję propagandową — obraz miał budować dumę narodową.","Niewielki format i temat z życia codziennego mówią, że obraz powstał dla mieszczańskiego odbiorcy, do prywatnego domu."],
  commonMistake="Mylenie funkcji z tematem. Temat to „co przedstawia”, funkcja to „po co powstało i gdzie wisiało”."),
 dict(n=8,name="Styl i czas powstania",goal="Postaw tezę o epoce — i uzasadnij ją tym, co już powiedziałaś.",duration="3–4 zdania · ok. 25 sekund",durationSeconds=25,
  selfQuestions=["Które z omówionych cech są charakterystyczne dla konkretnej epoki?","Czy potrafię wskazać przynajmniej trzy argumenty za tym datowaniem?","Czy znam artystę lub krąg artystyczny, do którego to dzieło można przypisać?"],
  phrases=["Zestawienie tych cech pozwala mi sądzić, że dzieło powstało w epoce baroku — na przełomie XVI i XVII wieku.","Przemawiają za tym trzy rzeczy: kompozycja diagonalna, luministyczne światło i uchwycenie momentu kulminacyjnego.","Nie jestem pewna autorstwa, ale sposób budowania światła wskazuje na krąg caravaggionistów.","Gdyby to był renesans, kompozycja byłaby statyczna i symetryczna — a tutaj wszystko jest w ruchu."],
  commonMistake="Zgadywanie bez uzasadnienia. Zła epoka z trzema dobrymi argumentami jest oceniana lepiej niż trafiona epoka bez uzasadnienia."),
 dict(n=9,name="Własna opinia",goal="Zamknij wypowiedź jednym zdaniem od siebie — z uzasadnieniem odwołującym się do formy.",duration="1–2 zdania · ok. 15 sekund",durationSeconds=15,
  selfQuestions=["Co robi na mnie największe wrażenie i który środek plastyczny za to odpowiada?","Czy mogę powiedzieć, dlaczego to dzieło jest ważne albo nowatorskie?"],
  phrases=["Najsilniej działa na mnie światło — to ono, a nie gest postaci, decyduje o dramatyzmie tej sceny.","Robi na mnie wrażenie kontrast między spokojem twarzy a napięciem całego ciała.","Uważam to dzieło za przełomowe, ponieważ po raz pierwszy…"],
  commonMistake="„Podoba mi się” bez ciągu dalszego. Opinia musi się opierać na czymś, co wcześniej nazwałaś."),
]
dump('analysisSteps.json',steps)
names={s['n']:s['name'] for s in steps}
for m in models:
  for st in m['steps']: st['stepName']=names[st['n']]
  m['steps']=[{'n':s['n'],'stepName':s['stepName'],'text':s['text']} for s in m['steps']]
# powiązanie z kartami dzieł z Aneksu A programu przygotowawczego
ARTWORK_IDS={'caravaggio-powolanie-sw-mateusza':'powolanie-sw-mateusza','matejko-stanczyk':'stanczyk','michal-aniol-dawid':'dawid',
  'notre-dame-fasada-zachodnia':'katedra-notre-dame-w-paryzu','mondrian-broadway-boogie-woogie':'broadway-boogie-woogie'}
for m in models: m['artworkId']=ARTWORK_IDS[m['id']]
dump('modelAnalyses.json',[{k:m[k] for k in ['id','artworkId','title','artist','date','domain','style','techniqueLocation','note','steps']} for m in models])
sig=[("Łuk półkolisty, gruby mur, małe okna, mroczne wnętrze","romanizm","XI–XII w."),
("Łuk ostry, witraże, rozeta, przypory na zewnątrz, dominacja pionu","gotyk","XII–XV w."),
("Złote tło, frontalizm, brak cienia, perspektywa odwrócona","sztuka bizantyjska / ikona","VI–XV w."),
("Perspektywa linearna, symetria, kompozycja w trójkącie, idealizacja","renesans","XV–XVI w."),
("Wydłużone, powyginane postacie, chłodna barwa, zatłoczona kompozycja","manieryzm","ok. 1520–1600"),
("Diagonala, ostry światłocień, patos, moment kulminacyjny","barok","XVII w."),
("Pastelowa gama, asymetria, muszla i wić, tematy zabawowe","rokoko","ok. 1720–1780"),
("Portyk z tympanonem, prymat rysunku nad barwą, statyka, temat antyczny","klasycyzm","ok. 1760–1830"),
("Diagonala i barwa, żywioł, ruiny, egzotyka, jednostka wobec natury","romantyzm","ok. 1800–1850"),
("Zwykły człowiek pracy, ziemista gama, brak idealizacji","realizm","ok. 1840–1870"),
("Widoczne pociągnięcia pędzla, jasna paleta, barwny cień, kadr jak z fotografii","impresjonizm","ok. 1870–1890"),
("Gruby impast, wirujący dukt, kontrast barw dopełniających","postimpresjonizm (van Gogh)","ok. 1885–1905"),
("Falista linia, ornament roślinny, płaskość, złoto, kobieta z długimi włosami","secesja","ok. 1890–1910"),
("Deformacja, agresywna barwa, ostry kontur, niepokój","ekspresjonizm","ok. 1905–1925"),
("Przedmiot z wielu stron naraz, fasety, gama szaro-brązowa","kubizm","ok. 1907–1914"),
("Realistyczna technika, nierealna scena, długie cienie, pusta przestrzeń","surrealizm","od 1924"),
("Brak przedstawienia, figura geometryczna, barwy podstawowe","abstrakcjonizm geometryczny","od ok. 1910"),
("Motyw z reklamy lub komiksu, sitodruk, płaska plama, seryjność","pop-art","lata 50.–60. XX w.")]
dump('signals.json',[dict(clue=a,period=b,dates=c) for a,b,c in sig])
dump('analysisGuide.json',dict(
 intro="Analiza dzieła to jedyne zadanie na egzaminie, które można wykonać bez wiedzy o konkretnym dziele. Jeśli egzaminator położy przed tobą nieznaną reprodukcję, nie sprawdza, czy ją rozpoznasz — sprawdza, czy potrafisz uporządkować to, co widzisz, i wyciągnąć z tego wnioski. Dlatego schemat z tej instrukcji jest ważniejszy niż jakakolwiek pojedyncza data.",
 threeMoves=dict(summary="Każde zdanie dobrej analizy wykonuje jeden z trzech ruchów — i najlepsze zdania wykonują wszystkie trzy naraz:",
  moves=[dict(name="Widzę",role="obserwacja",example="światło pada z prawej strony, spoza kadru"),dict(name="Nazywam",role="termin fachowy",example="to luminizm"),dict(name="Wnioskuję",role="konsekwencja",example="dzięki temu z ciemności wydobyte są tylko twarze, co kieruje uwagę na gest")],
  conclusion="Wypowiedź złożona z samych obserwacji brzmi jak opis. Wypowiedź złożona z samych terminów brzmi jak wykuta. Dopiero ich połączenie brzmi jak analiza."),
 timing="Pełna analiza to od dwóch do czterech minut mówienia, czyli mniej więcej 250–400 słów. Dziewięć kroków rozkłada ten czas tak, żeby żaden element nie został pominięty ani rozdmuchany. Nie trzeba realizować ich w tej kolejności co do joty — ale trzeba przez wszystkie przejść.",
 mainAdvice="Analizy nie da się nauczyć czytaniem. Trzeba ją wypowiedzieć na głos co najmniej dwadzieścia razy, za każdym razem o innym dziele. Dopiero wtedy schemat przestaje być listą, a staje się sposobem patrzenia.",
 unknownArtwork=dict(intro="To sytuacja, której warto sobie życzyć — pokazuje, że egzaminator chce sprawdzić myślenie, a nie pamięć. Postępowanie jest proste i zawsze takie samo.",
  startSteps=[dict(title="Przyznaj się od razu, ale nie przepraszaj.",text="„Nie rozpoznaję tego dzieła, ale spróbuję je opisać i na tej podstawie określić epokę.” To zdanie kupuje ci życzliwość i czas."),
   dict(title="Zacznij od kroku 1 i idź po kolei.",text="Dziedzina, technika, format — to da się powiedzieć zawsze, nawet o dziele całkowicie nieznanym."),
   dict(title="Zostaw datowanie na koniec.",text="Krok 8 ma być wnioskiem z tego, co powiedziałaś wcześniej, a nie zgadywanką na starcie."),
   dict(title="Formułuj ostrożnie.",text="„Sądzę”, „przypuszczam”, „wskazywałoby to na” — to nie jest oznaka niepewności, tylko poprawna postawa badawcza.")],
  dont="Nie zmyślaj tytułu ani nazwiska. Nie mów „chyba Rembrandt” tylko dlatego, że obraz jest ciemny. Powiedz raczej: „ciemna, wąska gama i ostry światłocień wskazują na krąg malarstwa barokowego, być może holenderskiego” — to jest merytoryczne i bezpieczne.",
  signalsTip="Tabela działa najlepiej, gdy zbierzesz trzy sygnały wskazujące na tę samą epokę."),
 trainingPlan=dict(intro="Trudność rośnie stopniowo. Każdy etap zakłada trzy analizy w tygodniu — nie więcej, ale i nie mniej.",
  stages=[dict(weeks=[1,2],form="Analiza pisemna, bez ograniczenia czasu",how="Wybierz dzieło z kart, rozpisz wszystkie dziewięć kroków na kartce. Sprawdź, czy w każdym kroku pada przynajmniej jeden termin fachowy."),
   dict(weeks=[3,4,5],form="Analiza na głos z notatką",how="Rozpisz hasłowo dziewięć kroków, potem mów na głos, zerkając tylko na hasła. Nagraj się i odsłuchaj."),
   dict(weeks=[6,7,8,9],form="Analiza na głos bez notatki, dzieło znane",how="Trzy minuty, dzieło z kart. Osoba pytająca odhacza kroki na karcie oceny."),
   dict(weeks=[10,11,12],form="Analiza dzieła nieznanego",how="Ktoś wyszukuje losową reprodukcję, której nie znasz. Masz minutę na przyjrzenie się i trzy minuty na wypowiedź. To ćwiczenie najbliższe egzaminowi."),
   dict(weeks=[13,14],form="Analiza z pytaniami dodatkowymi",how="Po wypowiedzi osoba pytająca zadaje dwa pytania pogłębiające, np. „a co to znaczy luminizm?”, „dlaczego sądzisz, że to barok?”.")])))
dump('examRules.json',dict(
 rules=[],
 analysisMistakes=[dict(title="Opisywanie zamiast analizowania",text="„Widzimy pana w kapeluszu, obok stoi stół.” To relacja, nie analiza. Po każdym „widzę” musi paść „nazywam to tak” i „wynika z tego”."),
  dict(title="Terminy bez pokrycia",text="Użycie słowa „sfumato” przy obrazie, w którym go nie ma, kosztuje więcej niż jego nieużycie. Mów tylko o tym, co faktycznie widzisz."),
  dict(title="Brak uzasadnienia epoki",text="Sama nazwa epoki to zgadywanie. Trzy argumenty formalne są warte więcej niż trafiona nazwa."),
  dict(title="Pomijanie faktury i funkcji",text="To dwa najczęściej opuszczane kroki. Jedno zdanie o każdym z nich wyraźnie podnosi ocenę."),
  dict(title="Zmyślanie danych",text="Wymyślony tytuł lub rok to błąd rzeczowy. „Około XVII wieku” jest zawsze bezpieczniejsze niż fałszywa precyzja."),
  dict(title="Ocena zamiast opisu",text="„Ładny obraz”, „dziwne to jest”. Opinia jest mile widziana, ale dopiero na końcu i zawsze z uzasadnieniem formalnym."),
  dict(title="Mówienie za szybko",text="Wypowiedź trzyminutowa powiedziana w minutę brzmi jak wyrecytowana. Pauza jest lepsza niż „yyy”."),
  dict(title="Urwanie w połowie",text="Jeśli zabraknie pomysłu, przejdź do kolejnego kroku schematu zamiast milknąć. Schemat zawsze podpowie, co dalej.")],
 scorecard=dict(instructions="Odhaczaj w trakcie wypowiedzi, nie po niej. Dziesięć i więcej ptaszków to wynik egzaminacyjny.",passThreshold=10,
  items=[dict(n=i+1,text=t,steps=s) for i,(t,s) in enumerate([
   ("Nazwała dziedzinę sztuki i technikę",[1]),("Określiła gatunek i opisała treść",[2]),("Omówiła kompozycję, używając co najmniej dwóch określeń fachowych",[3]),
   ("Omówiła sposób budowania przestrzeni (rodzaj perspektywy)",[4]),("Omówiła światło i światłocień",[4]),("Omówiła kolorystykę: gamę, dominantę, kontrast",[5]),
   ("Wspomniała o fakturze",[6]),("Określiła funkcję dzieła",[7]),("Postawiła tezę o epoce i uzasadniła ją co najmniej dwoma argumentami",[8]),
   ("Wypowiedziała własną opinię z uzasadnieniem",[9]),("Mówiła pełnymi zdaniami, bez urywania myśli",[]),("Zmieściła się w czasie 2–4 minut",[])])]),
 feedbackTip="Najpierw powiedz, co zabrzmiało dobrze — konkretnie, z cytatem. Potem wskaż jeden brakujący krok, nie wszystkie. Analiza, po której pada lista dziesięciu uwag, zniechęca; analiza, po której pada jedna, poprawia się w kolejnym podejściu."))
