# Analyysi

## 1. Mitä tekoäly teki hyvin?

Tekoäly loi nopeasti hyvän toimivan pohjan tekemiselle ja lähtöpisteestä oli helppo jatkaa itse, vaikka Express frameworkkina olikin itselle uusi tuttavuus. Se myös ymmärsi kerralla prompteistani mitä hain takaa, eikä sille tarvinnut toistaa asioita pahemmin. Tekoäly oli myös erittäin hyödyllinen refaktorointivaiheessa, se osasi ehdottaa hyvin seuraavia askelia ja jakaa koodin pienempiin osiin ilman tarkaa promptausta. 
Pidin myös siitä, että tekoäly perusteli valintojaan hyvin ja antoi etenemisvaihtoehtoja kattavasti, ottaen myös omat ehdotukseni huomioon.

---

## 2. Mitä tekoäly teki huonosti?

Tekoäly ei aina huomannut tekemiään virheitä ja esimerkiksi validoinneissa oli puutteita. Se myös kokosi kaiken logiikan yhteen tiedostoon, ja business logiikan suoraan endpointtien sekaan, mikä huononsi koodin luettavuutta ja teki siitä osittain melko sekavaa. Taistelin myös hyvän tovin tekoälyn kanssa skriptistä, joka tuotti PROMPTIT.md -tiedoston sisällön json-tiedostosta, siinä oli useita virheitä jotka huomasin vain käymällä promptit-tiedostoa manuaalisesti läpi useita kertoja.
Vakiona tekoäly tekee melko huonosti luettavaa koodia, jota sitten saa itse prompteilla ja käsin muokata paremmaksi. Tästä hyvä esimerkki on testit sisältävä tiedosto, se on aika raskasta luettavaa, mutta jätin sen ennalleen koska se ei ollut tehtävänannon pääpointteja.

---

## 3. Tärkeimmät parannukset, jotka tein ja miksi

### 3.1 Testit

Testien lisääminen oli prioriteettilistallani kärjessä, jotta pysyin jatkuvasti kartalla siitä, mitä tekoäly tekee ja saan mahdolliset bugit helposti ja nopeasti kiinni. Näistä olikin paljon apua, ja tämän johdosta lisäsin testejä lisää hieman myöhemmin. 

### 3.2 Rakenteen selkeyttäminen

Kaikki koodilogiikka oli yhdessä tiedostossa ja se oli raskasta luettavaa. Aluksi eriytytin validoinnin kokonaan omakseen jo alkuperäisen tiedoston sisällä ja jatkoin siitä koodin refaktorointia. Halusin logiikat omiin tiedostoihinsa koko projektirakenteen selkeyttämiseksi ja luettavuuden parantamiseksi. Koodi on nyt myös helpommin laajennettavissa ja hallittavissa.

### 3.3 Virheenkäsittely ja validointi

Huomasin vajavaisuuksia validoinneissa ja virheenkäsittelyissä, joten lisäsin ja täsmensin validointeja erityisesti syötteiden tyyppitarkistusten, selkeämpien virheilmoitusten ja yhdenmukaisten HTTP-statuskoodien osalta. Näin API:n käyttäytyminen on ennustettavampaa ja turvallisempaa.

### 3.4 Promptien ja tekoälyn tuotoksen kriittinen arviointi

Projektin edetessä koin että oma roolini siirtyi ohjaavasta toteuttavaan. En toteuttanut tekoälyn ehdotuksia aina sellaisenaan ja arvioin jokaisen muutoksen koodin laadun ja ylläpidettävyyden näkökulmasta. Tästä huomasi hyvin, että käytin tekoälyä työkaluna, en automaattisena ratkaisijana.
