/* Delivery places for checkout. Nigeria goes State → City; other countries go straight to City.
   Every list also has "Other" so nobody is ever stuck. Keep names in sync with functions/_lib/places.js. */
const SS_PLACES={
 'Nigeria':{states:{
  'Abia':['Aba','Umuahia','Ohafia','Arochukwu','Bende'],
  'Adamawa':['Yola','Jimeta','Mubi','Numan','Ganye'],
  'Akwa Ibom':['Uyo','Eket','Ikot Ekpene','Oron','Abak'],
  'Anambra':['Awka','Onitsha','Nnewi','Ekwulobia','Ihiala','Agulu'],
  'Bauchi':['Bauchi','Azare','Misau','Jama’are'],
  'Bayelsa':['Yenagoa','Brass','Ogbia','Sagbama'],
  'Benue':['Makurdi','Gboko','Otukpo','Katsina-Ala'],
  'Borno':['Maiduguri','Biu','Bama','Monguno'],
  'Cross River':['Calabar','Ikom','Ogoja','Obudu','Ugep'],
  'Delta':['Asaba','Warri','Sapele','Ughelli','Agbor','Effurun'],
  'Ebonyi':['Abakaliki','Afikpo','Onueke'],
  'Edo':['Benin City','Ekpoma','Auchi','Uromi','Igueben'],
  'Ekiti':['Ado-Ekiti','Ikere-Ekiti','Ijero-Ekiti','Ikole-Ekiti'],
  'Enugu':['Enugu','Nsukka','Agbani','Oji River','Udi'],
  'Federal Capital Territory (Abuja)':['Abuja (Central)','Garki','Wuse','Maitama','Asokoro','Gwarinpa','Jabi','Lugbe','Kubwa','Gwagwalada','Kuje','Bwari'],
  'Gombe':['Gombe','Kaltungo','Billiri'],
  'Imo':['Owerri','Orlu','Okigwe','Oguta','Mbaise'],
  'Jigawa':['Dutse','Hadejia','Kazaure','Gumel'],
  'Kaduna':['Kaduna','Zaria','Kafanchan','Kagoro'],
  'Kano':['Kano','Wudil','Gaya','Rano'],
  'Katsina':['Katsina','Daura','Funtua','Malumfashi'],
  'Kebbi':['Birnin Kebbi','Argungu','Yauri','Zuru'],
  'Kogi':['Lokoja','Okene','Idah','Kabba','Anyigba'],
  'Kwara':['Ilorin','Offa','Omu-Aran','Jebba','Patigi'],
  'Lagos':['Ikeja','Victoria Island','Lekki','Ikoyi','Ajah','Surulere','Yaba','Lagos Island','Apapa','Festac','Ikorodu','Badagry','Epe','Maryland','Gbagada','Magodo','Ogba','Ojo','Agege','Isolo'],
  'Nasarawa':['Lafia','Keffi','Akwanga','Karu','Nasarawa'],
  'Niger':['Minna','Bida','Suleja','Kontagora','New Bussa'],
  'Ogun':['Abeokuta','Ijebu-Ode','Sagamu','Ota','Ilaro','Mowe','Ifo'],
  'Ondo':['Akure','Ondo','Owo','Ikare','Okitipupa'],
  'Osun':['Osogbo','Ile-Ife','Ilesa','Ede','Iwo','Ikirun'],
  'Oyo':['Ibadan','Ogbomosho','Oyo','Iseyin','Saki','Igboho'],
  'Plateau':['Jos','Bukuru','Pankshin','Shendam'],
  'Rivers':['Port Harcourt','Obio-Akpor','Bonny','Eleme','Omoku','Ahoada'],
  'Sokoto':['Sokoto','Wamakko','Tambuwal','Gwadabawa'],
  'Taraba':['Jalingo','Wukari','Bali','Takum'],
  'Yobe':['Damaturu','Potiskum','Gashua','Nguru'],
  'Zamfara':['Gusau','Kaura Namoda','Talata Mafara','Anka']
 }},
 'Ghana':{cities:['Accra','Kumasi','Tema','Takoradi','Cape Coast','Tamale','Koforidua','Ho','Sunyani','East Legon']},
 'Benin':{cities:['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Ouidah','Bohicon']},
 'South Africa':{cities:['Johannesburg','Cape Town','Durban','Pretoria','Sandton','Port Elizabeth (Gqeberha)','Bloemfontein','Midrand']},
 'Kenya':{cities:['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika']},
 'Egypt':{cities:['Cairo','Giza','Alexandria','New Cairo','Sheikh Zayed','6th of October City','Hurghada','Sharm El Sheikh']},
 'United Kingdom':{cities:['London','Manchester','Birmingham','Leeds','Liverpool','Glasgow','Edinburgh','Bristol','Leicester','Nottingham','Sheffield','Cardiff','Belfast','Milton Keynes','Reading','Coventry']},
 'Ireland':{cities:['Dublin','Cork','Galway','Limerick','Waterford','Drogheda']},
 'United States':{cities:['New York','Houston','Atlanta','Dallas','Washington, DC','Los Angeles','Chicago','Miami','Baltimore','Charlotte','Philadelphia','Boston','Newark','Minneapolis','Seattle','San Francisco']},
 'Canada':{cities:['Toronto','Calgary','Edmonton','Montreal','Ottawa','Vancouver','Winnipeg','Mississauga','Brampton','Halifax']},
 'Portugal':{cities:['Lisbon','Porto','Braga','Coimbra','Faro','Funchal','Aveiro','Setúbal','Cascais','Sintra','Évora','Viseu']},
 'Spain':{cities:['Madrid','Barcelona','Valencia','Seville','Málaga','Bilbao','Zaragoza','Alicante','Palma']},
 'France':{cities:['Paris','Lyon','Marseille','Toulouse','Nice','Lille','Bordeaux','Nantes','Strasbourg']},
 'Germany':{cities:['Berlin','Hamburg','Munich','Frankfurt','Cologne','Düsseldorf','Stuttgart','Leipzig','Dortmund']},
 'Italy':{cities:['Rome','Milan','Naples','Turin','Florence','Bologna','Venice','Palermo','Brescia']},
 'Netherlands':{cities:['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Almere','Groningen']},
 'Belgium':{cities:['Brussels','Antwerp','Ghent','Liège','Charleroi','Leuven']},
 'United Arab Emirates':{cities:['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Al Ain']},
 'Saudi Arabia':{cities:['Riyadh','Jeddah','Dammam','Mecca','Medina','Khobar']},
 'Qatar':{cities:['Doha','Al Wakrah','Al Rayyan','Lusail']}
};
const SS_OTHER='Other (type it)';

/* Wires up Country → State → City on a form that has #ocountry, #ostateW/#os, #ocity and #oc (typed city). */
function ssPlacesInit(){
 const ctry=document.getElementById('ocountry'),st=document.getElementById('os'),stW=document.getElementById('ostateW'),
       city=document.getElementById('ocity'),cityT=document.getElementById('oc'),cityTW=document.getElementById('ocW');
 if(!ctry)return;
 const opt=(v,l)=>{const o=document.createElement('option');o.value=v;o.textContent=l||v;return o};
 const fill=(sel,list,ph)=>{sel.replaceChildren(opt('',ph),...list.map(x=>opt(x)),opt(SS_OTHER));sel.value=''};
 ctry.replaceChildren(opt('','Choose a country'),...Object.keys(SS_PLACES).map(c=>opt(c)));
 const showTyped=on=>{cityTW.hidden=!on;cityT.required=on;if(!on)cityT.value=''};
 function onCountry(){
  const c=SS_PLACES[ctry.value];showTyped(false);
  if(!c){stW.hidden=true;st.required=false;fill(city,[],'Choose a country first');city.disabled=true;return}
  city.disabled=false;
  if(c.states){stW.hidden=false;st.required=true;st.replaceChildren(opt('','Choose a state'),...Object.keys(c.states).map(s=>opt(s)));fill(city,[],'Choose a state first');city.disabled=true}
  else{stW.hidden=true;st.required=false;st.value='';fill(city,c.cities,'Choose a city')}
 }
 function onState(){const c=SS_PLACES[ctry.value];showTyped(false);if(!c||!c.states)return;const l=c.states[st.value];city.disabled=!l;fill(city,l||[],l?'Choose a city or area':'Choose a state first')}
 ctry.addEventListener('change',onCountry);st.addEventListener('change',onState);
 city.addEventListener('change',()=>showTyped(city.value===SS_OTHER));
 ctry.value='Nigeria';onCountry();
}
/* The city to send: the typed one when "Other" is picked */
function ssCityValue(){const c=document.getElementById('ocity');return c&&c.value===SS_OTHER?document.getElementById('oc').value.trim():(c?c.value:'')}
