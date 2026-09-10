import { ItineraryStop, SuggestedPlace, TripData } from '../types';

export const RAW_TRIPIT_TEXT = `My info on TripIt

Wed, Sep 16
4:35 PM PDT
SFO → LHR
BA 284 (British Airways), Terminal I

Thu, Sep 17
11:00 AM GMT+1
Arrive London (LHR)
Terminal 5
2 hr 5 min layover in LHR

Thu, Sep 17
1:05 PM GMT+1
LHR → ATH
BA 632 (British Airways), Terminal 5
7:00 PM GMT+3
Arrive Athens (ATH)

Thu, Sep 17
9:00 PM GMT+3
Check In Airbnb - Yue
Leof. Al. Papanastasiou 29, Pireas 185 33, Greece
Sea view design / Mikrolimano House rules: You’ll be staying in someone’s home, so please treat it with care and respect. 2 guests maximum, No pets, No commercial photography

Sat, Sep 19
5:00 PM GMT+3
Acropolis of Athens
Until 6:00 PM GMT+3

Mon, Sep 21
11:00 AM GMT+3
Check Out Airbnb - Yue
Leof. Al. Papanastasiou 29, Pireas 185 33, Greece

Mon, Sep 21
10:00 AM CDT
Seajets - PIR → JNX
Depart PIR PIR
1:20 PM GMT+3
Arrive JNX JNX

Mon, Sep 21
3:00 PM GMT+3
Check In Airbnb - Dimitris
Ag. Anna 843 00, Greece
Top Floor Suite with Superior View House rules: You’ll be staying in someone’s home, so please treat it with care and respect. 2 guests maximum, Pets allowed, No parties or events

Mon, Sep 28
11:00 AM GMT+3
Check Out Airbnb - Dimitris

Mon, Sep 28
11:15 AM GMT+3
JNX → ATH
GQ 401 (Sky Express)
11:55 AM GMT+3
Arrive Athens (ATH)
3 hr 40 min layover in ATH

Mon, Sep 28
3:35 PM GMT+3
ATH → VCE
W4 6724 (Wizz Air Malta)
4:55 PM GMT+2
Arrive Venice (VCE)

Mon, Sep 28
6:55 PM GMT+2
Check In Hotel Marte
Ponte Delle Guglie - Cannaregio 338 Venezia, Italy 30121
PIN: 7893

Wed, Sep 30
10:30 AM GMT+2
Check Out Hotel Marte

Wed, Sep 30
3:00 PM GMT+2
Check In JOIVY Together Florence Urban Resort
Via Livenza 3/A Firenze, Italy 50012
PIN: 3312

Sat, Oct 3
11:00 AM GMT+2
Check Out JOIVY Together Florence Urban Resort

Sat, Oct 3
11:00 AM GMT+2
Pick Up Budget
Via Palagio degli Spini, Firenze, Italy, 50127
39055315588

Sat, Oct 3
12:00 PM GMT+2
Pick Up Florence aeroport
Aeroporto Di Firenze Peretola, Via Palagio degli Spini, 50145 Firenze FI, Italy
+39 055 311256

Sat, Oct 3
3:00 PM GMT+2
Check In Villa Montepulciano
Via di Poggio Pagano, 2, 53045 Montepulciano SI, Italy

Sat, Oct 10
11:00 AM GMT+2
Check Out Villa Montepulciano

Sat, Oct 10
3:00 PM GMT+2
Check In Villa Gelsi
Str. Giovanni Maria Lancisi, 191, 61122 Pesaro PU, Italy

Tue, Oct 13
11:00 AM GMT+2
Check Out Villa Gelsi

Tue, Oct 13
3:00 PM GMT+2
Check In Airbnb - Raji
Via del Fontanile Arenato, 66, A, 00163, Rome, Lazio, Italy
La Casetta al Fontanile House rules: You’ll be staying in someone’s home, so please treat it with care and respect. 4 guests maximum, Quiet hours: 10:00 PM - 8:00 AM, No parties or events

Sat, Oct 17
10:00 AM GMT+2
Check Out Airbnb - Raji

Sat, Oct 17
3:00 PM GMT+2
Check In Parcheggio torre del sole
Viale Circe, 278, 04019 Terracina LT, Italy

Wed, Oct 21
8:00 AM GMT+2
Check Out Parcheggio torre del sole

Wed, Oct 21
8:00 AM GMT+2
Drop Off Budget & Florence aeroport rental
1655, Via Appia Nuova, Roma, Italy, 00040
39055315588

Wed, Oct 21
10:00 AM GMT+2
CIA → MAN
FR 3205 (Ryanair)
11:50 AM GMT+1
Arrive Manchester (MAN)

Wed, Oct 28
12:10 PM GMT
MAN → LHR
BA 1367 (British Airways), Terminal 2
1:25 PM GMT
Arrive London (LHR) Terminal 5
2 hr layover in LHR

Wed, Oct 28
3:25 PM GMT
LHR → SFO
BA 287 (British Airways), Terminal 5
7:45 PM PDT
Arrive San Francisco (SFO) Terminal I`;

export const INITIAL_TRIP_STOPS: ItineraryStop[] = [
  {
    id: 'stop-1',
    type: 'flight',
    title: 'Flight SFO → LHR',
    subtitle: 'British Airways BA 284 • Terminal I',
    date: 'Wed, Sep 16',
    time: '4:35 PM PDT',
    city: 'San Francisco',
    country: 'United States',
    address: 'San Francisco International Airport (SFO), CA',
    lat: 37.6213,
    lng: -122.379,
    carrier: 'British Airways',
    flightNumber: 'BA 284',
    terminal: 'Terminal I',
    notes: 'Long haul transatlantic flight across the Atlantic to London Heathrow.',
    categoryTag: 'Transatlantic Flight',
  },
  {
    id: 'stop-2',
    type: 'transit',
    title: 'Layover in London Heathrow (LHR)',
    subtitle: '2 hr 5 min layover • Terminal 5 transfer',
    date: 'Thu, Sep 17',
    time: '11:00 AM GMT+1',
    city: 'London',
    country: 'United Kingdom',
    address: 'London Heathrow Airport, Terminal 5',
    lat: 51.47,
    lng: -0.4543,
    terminal: 'Terminal 5',
    layover: '2h 05m',
    notes: 'Arrive 11:00 AM at Terminal 5. Connect to flight BA 632 to Athens departing 1:05 PM.',
    categoryTag: 'Airport Layover',
  },
  {
    id: 'stop-3',
    type: 'flight',
    title: 'Flight LHR → ATH',
    subtitle: 'British Airways BA 632 • Terminal 5 to Athens',
    date: 'Thu, Sep 17',
    time: '1:05 PM GMT+1',
    endTime: '7:00 PM GMT+3',
    city: 'Athens',
    country: 'Greece',
    address: 'Athens International Airport Eleftherios Venizelos (ATH)',
    lat: 37.9364,
    lng: 23.9445,
    carrier: 'British Airways',
    flightNumber: 'BA 632',
    terminal: 'Terminal 5',
    notes: 'Arrive in Athens 7:00 PM local time (GMT+3). Proceed to Piraeus port / Mikrolimano stay.',
    categoryTag: 'Flight',
  },
  {
    id: 'stop-4',
    type: 'stay',
    title: 'Airbnb - Yue (Mikrolimano Sea View)',
    subtitle: 'Check In 9:00 PM • Sea view design suite',
    date: 'Thu, Sep 17',
    time: '9:00 PM GMT+3',
    endDate: 'Mon, Sep 21',
    endTime: '11:00 AM GMT+3',
    city: 'Piraeus / Athens',
    country: 'Greece',
    address: 'Leof. Al. Papanastasiou 29, Pireas 185 33, Greece',
    lat: 37.9385,
    lng: 23.6582,
    houseRules: '2 guests maximum, No pets, No commercial photography. Please treat home with care.',
    notes: 'Overlooking the picturesque Mikrolimano marina. Easy access to Piraeus port ferry.',
    categoryTag: 'Accommodation',
  },
  {
    id: 'stop-5',
    type: 'sight',
    title: 'Acropolis of Athens & Parthenon',
    subtitle: 'Scheduled Visit 5:00 PM - 6:00 PM',
    date: 'Sat, Sep 19',
    time: '5:00 PM GMT+3',
    endTime: '6:00 PM GMT+3',
    city: 'Athens',
    country: 'Greece',
    address: 'Athens 105 58, Greece',
    lat: 37.9715,
    lng: 23.7257,
    notes: 'Golden hour sunset view of the ancient citadel, Parthenon, Erechtheion and Plaka neighborhood.',
    categoryTag: 'Highlight Sight',
  },
  {
    id: 'stop-6',
    type: 'ferry',
    title: 'Seajets High-Speed Ferry PIR → JNX',
    subtitle: 'Piraeus Port to Naxos Island • Depart 10:00 AM',
    date: 'Mon, Sep 21',
    time: '10:00 AM CDT / 10:00 AM local',
    endTime: '1:20 PM GMT+3',
    city: 'Piraeus to Naxos',
    country: 'Greece',
    address: 'Port of Piraeus (Gate E9/E7), Pireas 185 31, Greece',
    lat: 37.9482,
    lng: 23.6375,
    carrier: 'Seajets Ferry',
    notes: 'Scenic Aegean crossing through the Cyclades arriving at Naxos Harbor at 1:20 PM.',
    categoryTag: 'Island Ferry',
  },
  {
    id: 'stop-7',
    type: 'stay',
    title: 'Airbnb - Dimitris (Top Floor Suite)',
    subtitle: 'Check In 3:00 PM • Agia Anna Beachfront View',
    date: 'Mon, Sep 21',
    time: '3:00 PM GMT+3',
    endDate: 'Mon, Sep 28',
    endTime: '11:00 AM GMT+3',
    city: 'Naxos Island',
    country: 'Greece',
    address: 'Ag. Anna 843 00, Greece',
    lat: 37.0702,
    lng: 25.3565,
    houseRules: '2 guests maximum, Pets allowed, No parties or events.',
    notes: 'Top floor suite with superior Aegean sunset view. 7-night island vacation.',
    categoryTag: 'Island Resort',
  },
  {
    id: 'stop-8',
    type: 'flight',
    title: 'Flight JNX → ATH (Sky Express)',
    subtitle: 'GQ 401 • Naxos to Athens Airport',
    date: 'Mon, Sep 28',
    time: '11:15 AM GMT+3',
    endTime: '11:55 AM GMT+3',
    city: 'Naxos to Athens',
    country: 'Greece',
    address: 'Naxos Island National Airport (JNX)',
    lat: 37.0815,
    lng: 25.3683,
    carrier: 'Sky Express',
    flightNumber: 'GQ 401',
    layover: '3 hr 40 min layover in ATH',
    notes: 'Short island hop back to Athens mainland, followed by layover before Venice flight.',
    categoryTag: 'Domestic Flight',
  },
  {
    id: 'stop-9',
    type: 'flight',
    title: 'Flight ATH → VCE (Wizz Air)',
    subtitle: 'W4 6724 • Athens to Venice Marco Polo',
    date: 'Mon, Sep 28',
    time: '3:35 PM GMT+3',
    endTime: '4:55 PM GMT+2',
    city: 'Venice',
    country: 'Italy',
    address: 'Venice Marco Polo Airport (VCE), Viale Galileo Galilei, Tessera',
    lat: 45.5053,
    lng: 12.3519,
    carrier: 'Wizz Air Malta',
    flightNumber: 'W4 6724',
    notes: 'Arrive Venice Marco Polo. Take Alilaguna water bus or water taxi to Cannaregio.',
    categoryTag: 'Flight',
  },
  {
    id: 'stop-10',
    type: 'stay',
    title: 'Hotel Marte (Venice)',
    subtitle: 'Check In 6:55 PM • Cannaregio Canal District',
    date: 'Mon, Sep 28',
    time: '6:55 PM GMT+2',
    endDate: 'Wed, Sep 30',
    endTime: '10:30 AM GMT+2',
    city: 'Venice',
    country: 'Italy',
    address: 'Ponte Delle Guglie - Cannaregio 338 Venezia, Italy 30121',
    lat: 45.4437,
    lng: 12.3248,
    pin: '7893',
    notes: 'PIN Code: 7893. Located beside the historic Ponte delle Guglie bridge and Cannaregio canal.',
    categoryTag: 'Hotel Stay',
  },
  {
    id: 'stop-11',
    type: 'stay',
    title: 'JOIVY Together Florence Urban Resort',
    subtitle: 'Check In 3:00 PM • Florence Stay',
    date: 'Wed, Sep 30',
    time: '3:00 PM GMT+2',
    endDate: 'Sat, Oct 3',
    endTime: '11:00 AM GMT+2',
    city: 'Florence',
    country: 'Italy',
    address: 'Via Livenza 3/A Firenze, Italy 50012',
    lat: 43.7661,
    lng: 11.2831,
    pin: '3312',
    notes: 'PIN Code: 3312. Base in Florence for Uffizi, Duomo, and Tuscan countryside preparation.',
    categoryTag: 'Resort Stay',
  },
  {
    id: 'stop-12',
    type: 'car',
    title: 'Budget Car Rental Pick Up (Florence Aeroport)',
    subtitle: 'Pick Up 11:00 AM - 12:00 PM • Road trip through Tuscany',
    date: 'Sat, Oct 3',
    time: '11:00 AM GMT+2',
    city: 'Florence',
    country: 'Italy',
    address: 'Aeroporto Di Firenze Peretola, Via Palagio degli Spini, 50145 Firenze FI, Italy',
    lat: 43.8016,
    lng: 11.2012,
    phone: '+39 055 311256 / 39055315588',
    carrier: 'Budget Car Rental',
    notes: 'Rental vehicle picked up for the scenic Italian road trip through Tuscany, Marche, and Lazio.',
    categoryTag: 'Car Rental',
  },
  {
    id: 'stop-13',
    type: 'stay',
    title: 'Villa Montepulciano (Tuscany)',
    subtitle: 'Check In 3:00 PM • Val d’Orcia Wine Region',
    date: 'Sat, Oct 3',
    time: '3:00 PM GMT+2',
    endDate: 'Sat, Oct 10',
    endTime: '11:00 AM GMT+2',
    city: 'Montepulciano',
    country: 'Italy',
    address: 'Via di Poggio Pagano, 2, 53045 Montepulciano SI, Italy',
    lat: 43.0934,
    lng: 11.7876,
    notes: '7-night countryside stay in Tuscany! Known for Vino Nobile, rolling hills, cypress roads, and thermal springs.',
    categoryTag: 'Tuscan Villa',
  },
  {
    id: 'stop-14',
    type: 'stay',
    title: 'Villa Gelsi (Pesaro - Adriatic Coast)',
    subtitle: 'Check In 3:00 PM • Marche Region',
    date: 'Sat, Oct 10',
    time: '3:00 PM GMT+2',
    endDate: 'Tue, Oct 13',
    endTime: '11:00 AM GMT+2',
    city: 'Pesaro',
    country: 'Italy',
    address: 'Str. Giovanni Maria Lancisi, 191, 61122 Pesaro PU, Italy',
    lat: 43.9125,
    lng: 12.9155,
    notes: 'Seaside stay in Pesaro on the Adriatic Sea, Rossini Opera city, San Bartolo natural park.',
    categoryTag: 'Coastal Villa',
  },
  {
    id: 'stop-15',
    type: 'stay',
    title: 'Airbnb - Raji (La Casetta al Fontanile)',
    subtitle: 'Check In 3:00 PM • Rome Western Quarter',
    date: 'Tue, Oct 13',
    time: '3:00 PM GMT+2',
    endDate: 'Sat, Oct 17',
    endTime: '10:00 AM GMT+2',
    city: 'Rome',
    country: 'Italy',
    address: 'Via del Fontanile Arenato, 66, A, 00163, Rome, Lazio, Italy',
    lat: 41.8902,
    lng: 12.4285,
    houseRules: '4 guests max, Quiet hours: 10:00 PM - 8:00 AM, No parties or events.',
    notes: 'Quiet residential villa in Rome near Villa Doria Pamphilj and Vatican City.',
    categoryTag: 'City Apartment',
  },
  {
    id: 'stop-16',
    type: 'stay',
    title: 'Parcheggio Torre del Sole (Terracina Beach)',
    subtitle: 'Check In 3:00 PM • Riviera di Ulisse Coast',
    date: 'Sat, Oct 17',
    time: '3:00 PM GMT+2',
    endDate: 'Wed, Oct 21',
    endTime: '8:00 AM GMT+2',
    city: 'Terracina',
    country: 'Italy',
    address: 'Viale Circe, 278, 04019 Terracina LT, Italy',
    lat: 41.2882,
    lng: 13.2425,
    notes: 'Stunning Tyrrhenian coast stay right on Viale Circe seafront, Temple of Jupiter Anxur nearby.',
    categoryTag: 'Beach Stay',
  },
  {
    id: 'stop-17',
    type: 'car',
    title: 'Budget Rental Car Drop Off (Rome Appia)',
    subtitle: 'Drop Off 8:00 AM • Return before flight to UK',
    date: 'Wed, Oct 21',
    time: '8:00 AM GMT+2',
    city: 'Rome',
    country: 'Italy',
    address: '1655, Via Appia Nuova, Roma, Italy, 00040',
    lat: 41.8021,
    lng: 12.5934,
    phone: '+39 055 311256 / 39055315588',
    notes: 'Return rental car near Rome Ciampino Airport (CIA) before departing to Manchester.',
    categoryTag: 'Rental Return',
  },
  {
    id: 'stop-18',
    type: 'flight',
    title: 'Flight CIA → MAN (Ryanair)',
    subtitle: 'FR 3205 • Rome Ciampino to Manchester',
    date: 'Wed, Oct 21',
    time: '10:00 AM GMT+2',
    endTime: '11:50 AM GMT+1',
    city: 'Manchester',
    country: 'United Kingdom',
    address: 'Manchester Airport (MAN), Manchester M90 1QX',
    lat: 53.3537,
    lng: -2.275,
    carrier: 'Ryanair',
    flightNumber: 'FR 3205',
    notes: 'Fly into Manchester for 1-week visit in Northern England.',
    categoryTag: 'Flight',
  },
  {
    id: 'stop-19',
    type: 'flight',
    title: 'Flight MAN → LHR (British Airways)',
    subtitle: 'BA 1367 • Terminal 2 to Heathrow Terminal 5',
    date: 'Wed, Oct 28',
    time: '12:10 PM GMT',
    endTime: '1:25 PM GMT',
    city: 'London',
    country: 'United Kingdom',
    address: 'London Heathrow Airport (LHR), Terminal 5',
    lat: 51.47,
    lng: -0.4543,
    carrier: 'British Airways',
    flightNumber: 'BA 1367',
    terminal: 'Terminal 2 → Terminal 5',
    layover: '2 hr layover in LHR',
    notes: 'Connect at London Heathrow Terminal 5 for the final homeward flight to San Francisco.',
    categoryTag: 'Flight',
  },
  {
    id: 'stop-20',
    type: 'flight',
    title: 'Flight LHR → SFO (British Airways)',
    subtitle: 'BA 287 • Terminal 5 to San Francisco Terminal I',
    date: 'Wed, Oct 28',
    time: '3:25 PM GMT',
    endTime: '7:45 PM PDT',
    city: 'San Francisco',
    country: 'United States',
    address: 'San Francisco International Airport (SFO), Terminal I',
    lat: 37.6213,
    lng: -122.379,
    carrier: 'British Airways',
    flightNumber: 'BA 287',
    terminal: 'Terminal 5 / Terminal I',
    notes: 'Home sweet home! Complete around-the-world loop.',
    categoryTag: 'Return Flight',
  },
];

export const INITIAL_CURATED_PLACES: SuggestedPlace[] = [
  // Piraeus & Athens
  {
    id: 'piraeus-1',
    city: 'Piraeus / Athens',
    name: 'Varoulko Seaside (Mikrolimano)',
    category: 'food',
    address: 'Akti Koumoundourou 54, Pireas 185 33',
    lat: 37.9392,
    lng: 23.6591,
    rating: 4.8,
    description: 'Michelin-starred seafood dining right on the Mikrolimano marina promenade, a 3-minute stroll from your Airbnb.',
    whyVisit: 'Chef Lefteris Lazarou’s legendary smoked eel, sea bream carpaccio, and grilled octopus with panoramic yacht views.',
    tags: ['Michelin Star', 'Waterfront', 'Seafood', 'Sunset'],
    localTip: 'Reserve an outdoor deck table right at water level for sunset over the harbor.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'piraeus-2',
    city: 'Piraeus / Athens',
    name: 'Kastella Hill Scenic Overlook',
    category: 'sight',
    address: 'Kastella Hill, Pireas 185 33',
    lat: 37.9405,
    lng: 23.6548,
    rating: 4.7,
    description: 'Historic neoclassical hilltop quarter rising above Mikrolimano with 360° views across the Saronic Gulf.',
    whyVisit: 'Cobblestone staircases, 19th-century mansions, and breath-taking views of Athens and the islands.',
    tags: ['Scenic View', 'Photography', 'Walkable'],
    localTip: 'Walk up from Mikrolimano before dusk for evening breezes and cocktail bars with vistas.',
    estimatedTime: '1-2 hours',
    isSaved: false,
  },
  {
    id: 'athens-3',
    city: 'Piraeus / Athens',
    name: 'Acropolis Museum & Dionysiou Areopagitou Walk',
    category: 'culture',
    address: 'Dionysiou Areopagitou 15, Athina 117 42',
    lat: 37.9684,
    lng: 23.7285,
    rating: 4.9,
    description: 'World-renowned museum housing the archaeological treasures of the Acropolis, set on Athens’ grandest pedestrian boulevard.',
    whyVisit: 'Glass-floor excavations and the top-floor Parthenon Gallery aligned perfectly with the ancient temple.',
    tags: ['Museum', 'History', 'Must-See'],
    localTip: 'Visit before or right after your 5:00 PM Acropolis ticket slot; the cafe terrace has an unobstructed view of the Parthenon.',
    estimatedTime: '2.5 hours',
    isSaved: true,
  },

  // Naxos Island
  {
    id: 'naxos-1',
    city: 'Naxos Island',
    name: 'Portara (Temple of Apollo) Sunset',
    category: 'sight',
    address: 'Palatia Islet, Naxos Port 843 00',
    lat: 37.1101,
    lng: 25.3718,
    rating: 4.9,
    description: 'Colossal 2,500-year-old marble gateway framing the Aegean Sea and sunset, connected to Chora by a stone causeway.',
    whyVisit: 'The undisputed symbol of Naxos; watching the sun drop directly through the marble frame is magical.',
    tags: ['Iconic Monument', 'Sunset', 'Ancient History'],
    localTip: 'Arrive 45 minutes before sunset to secure a perch on the rocky knoll.',
    estimatedTime: '1 hour',
    isSaved: true,
  },
  {
    id: 'naxos-2',
    city: 'Naxos Island',
    name: 'Taverna Giannoulis (Agia Anna Beach)',
    category: 'food',
    address: 'Agia Anna Coast Road, Naxos 843 00',
    lat: 37.071,
    lng: 25.3559,
    rating: 4.7,
    description: 'Beloved beachfront taverna serving authentic Cycladic dishes with tables directly on the golden sand.',
    whyVisit: 'Famous Naxian roasted potatoes with local Graviera cheese, fresh calamari, and home-brewed white wine.',
    tags: ['Beach Dining', 'Local Farm Produce', 'Fresh Fish'],
    localTip: 'Right by your Airbnb Dimitris; ask for the catch of the day or rooster in red wine sauce.',
    estimatedTime: '1.5 hours',
    isSaved: true,
  },
  {
    id: 'naxos-3',
    city: 'Naxos Island',
    name: 'Halki Village & Vallindras Kitron Distillery',
    category: 'hidden_gem',
    address: 'Chalkio (Halki), Naxos 843 02',
    lat: 37.0632,
    lng: 25.4831,
    rating: 4.8,
    description: 'Picturesque inland village surrounded by olive groves, Byzantine churches, and the historic 1896 Kitron liqueur distillery.',
    whyVisit: 'Taste three varieties of traditional citron liqueur distilled in copper stills and explore artisan shops.',
    tags: ['Artisan', 'Tasting', 'Cycladic Architecture'],
    localTip: 'Rent a scooter or quad bike from Agia Anna to spend an afternoon in the Tragaia valley.',
    estimatedTime: '3 hours',
    isSaved: false,
  },

  // Venice
  {
    id: 'venice-1',
    city: 'Venice',
    name: 'Cantina Do Mori & Fondamenta dei Ormesini Cicchetti',
    category: 'food',
    address: 'Fondamenta dei Ormesini, Cannaregio 30121',
    lat: 45.4452,
    lng: 12.3275,
    rating: 4.8,
    description: 'Vibrant canal-side strip 4 minutes from Hotel Marte, bustling with locals enjoying Venetian wine and cicchetti bar snacks.',
    whyVisit: 'Authentic bacari culture: sip Select Spritz, baccalà mantecato crostini, and polpette without tourist crowds.',
    tags: ['Cicchetti', 'Wine Bar', 'Local Vibe'],
    localTip: 'Sit along the canal edge at Vino Vero or Al Timon as boats cruise past in the evening.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'venice-2',
    city: 'Venice',
    name: 'Historic Jewish Ghetto of Venice',
    category: 'culture',
    address: 'Campo di Ghetto Nuovo, Cannaregio 30121',
    lat: 45.4456,
    lng: 12.3271,
    rating: 4.7,
    description: 'The world’s first Jewish ghetto (established 1516), featuring historic tall tenement buildings, five synagogues, and peaceful squares.',
    whyVisit: 'Deep historic significance, tranquil open squares, and traditional Venetian-Jewish bakeries (try fritelle and impanata).',
    tags: ['Heritage', 'Architecture', 'Cannaregio'],
    localTip: 'Directly behind your hotel; visit the Jewish Museum for guided access inside the secretive upper-floor synagogues.',
    estimatedTime: '1.5 hours',
    isSaved: false,
  },

  // Florence
  {
    id: 'florence-1',
    city: 'Florence',
    name: 'Piazzale Michelangelo Sunset & San Miniato al Monte',
    category: 'sight',
    address: 'Piazzale Michelangelo, 50125 Firenze FI',
    lat: 43.7629,
    lng: 11.265,
    rating: 4.9,
    description: 'The definitive panorama of Florence spanning the Ponte Vecchio, Florence Duomo, and rolling Tuscan hills.',
    whyVisit: 'Live musicians, open-air wine kiosks, and golden hour lighting over the terracotta rooftops of Renaissance Florence.',
    tags: ['Iconic View', 'Romantic', 'Architecture'],
    localTip: 'Walk 5 minutes higher to San Miniato al Monte church for even better views and serene 11th-century marble facade.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'florence-2',
    city: 'Florence',
    name: 'Trattoria Cammillo or All’Antico Vinaio',
    category: 'food',
    address: 'Borgo S. Jacopo, 57/r, 50125 Firenze FI',
    lat: 43.7681,
    lng: 11.2512,
    rating: 4.8,
    description: 'Classic Florentine dining celebrated for ribollita soup, handmade pasta with shaved truffles, and prime Bistecca alla Fiorentina.',
    whyVisit: 'Authentic Tuscan culinary craft honoring centuries of culinary tradition.',
    tags: ['Tuscan Cuisine', 'Steak', 'Wine'],
    localTip: 'Pair dinner with a bottle of Chianti Classico Riserva.',
    estimatedTime: '2 hours',
    isSaved: false,
  },

  // Montepulciano & Val d’Orcia
  {
    id: 'montepulciano-1',
    city: 'Montepulciano',
    name: 'Cantina De’ Ricci & Underground Monumental Cellars',
    category: 'culture',
    address: 'Via di Ricci, 11, 53045 Montepulciano SI',
    lat: 43.0927,
    lng: 11.7816,
    rating: 4.9,
    description: 'Known as the "Cathedral of Wine", these astonishing Gothic barrel-vaulted cellars are carved directly into subterranean tufa stone.',
    whyVisit: 'Taste prestigious Vino Nobile di Montepulciano DOCG aging in massive Slavonian oak casks beneath Renaissance palazzos.',
    tags: ['Wine Cellar', 'Tasting', 'Historic'],
    localTip: 'Book a cellar tasting with Tuscan cold cuts and pecorino cheeses.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'montepulciano-2',
    city: 'Montepulciano',
    name: 'Val d’Orcia Scenic Drive (Pienza & San Quirico d’Orcia)',
    category: 'daytrip',
    address: 'SP146 / Str. dei Cipressi, 53027 San Quirico d’Orcia SI',
    lat: 43.0763,
    lng: 11.6025,
    rating: 4.9,
    description: 'UNESCO World Heritage landscape characterized by rolling emerald-gold hills, isolated cypress groves, and Renaissance ideal towns.',
    whyVisit: 'Stop in Pienza for Pecorino cheese tastings, photograph the famous zigzag cypress road, and bathe in Bagno Vignoni hot springs.',
    tags: ['Scenic Drive', 'UNESCO', 'Day Trip', 'Cypress Roads'],
    localTip: 'Your Budget rental car is perfect for this drive; keep your camera ready for the Belvedere viewpoint.',
    estimatedTime: 'Full Day (5-7 hours)',
    isSaved: true,
  },

  // Pesaro & Marche
  {
    id: 'pesaro-1',
    city: 'Pesaro',
    name: 'Parco Naturale del Monte San Bartolo & Panoramica',
    category: 'nature',
    address: 'Strada Panoramica Adriatica, 61121 Pesaro PU',
    lat: 43.9284,
    lng: 12.8752,
    rating: 4.8,
    description: 'Dramatic limestone coastal cliffs plunging into the turquoise Adriatic Sea, lined with broom wildflowers and quiet pebble coves.',
    whyVisit: 'Drive or cycle the famous Strada Panoramica, stop in the medieval fortified hamlet of Fiorenzuola di Focara, and swim at Vallugola.',
    tags: ['Nature Reserve', 'Coastal Cliff', 'Cycling'],
    localTip: 'Stop at Fiorenzuola di Focara for lunch overlooking the sea cliffs mentioned in Dante’s Inferno.',
    estimatedTime: '3-4 hours',
    isSaved: true,
  },
  {
    id: 'pesaro-2',
    city: 'Pesaro',
    name: 'Rossini Opera Birthplace & Teatro Rossini',
    category: 'culture',
    address: 'Via Gioachino Rossini, 34, 61121 Pesaro PU',
    lat: 43.9103,
    lng: 12.9135,
    rating: 4.7,
    description: 'UNESCO City of Music commemorating composer Gioachino Rossini (The Barber of Seville, William Tell).',
    whyVisit: 'Visit Rossini’s childhood home museum, antique music manuscripts, and grand 1818 opera house.',
    tags: ['Classical Music', 'Opera', 'UNESCO City'],
    localTip: 'Pair with seafood brodetto pesarese at a trattoria near the port.',
    estimatedTime: '2 hours',
    isSaved: false,
  },

  // Rome
  {
    id: 'rome-1',
    city: 'Rome',
    name: 'Villa Doria Pamphilj Parkland & Casino del Bel Respiro',
    category: 'nature',
    address: 'Via Aurelia Antica, 183, 00164 Roma RM',
    lat: 41.8872,
    lng: 12.4491,
    rating: 4.8,
    description: 'Rome’s largest landscaped public park, located right next to your Airbnb on Via del Fontanile Arenato.',
    whyVisit: 'Sweeping umbrella pines, 17th-century ornate palace gardens, fountains, jogging trails, and a serene escape from city frenzy.',
    tags: ['Park', 'Renaissance Villa', 'Walking Trails'],
    localTip: 'Start your morning with espresso at Vivi Bistrot inside the park gardens.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'rome-2',
    city: 'Rome',
    name: 'Trastevere Evening Stroll & Authentic Carbonara',
    category: 'food',
    address: 'Piazza di Santa Maria in Trastevere, 00153 Roma RM',
    lat: 41.8895,
    lng: 12.4702,
    rating: 4.9,
    description: 'Ivy-covered medieval alleys, glowing lanterns, bustling piazzas, and the finest Roman trattorias.',
    whyVisit: 'Enjoy crispy fried artichokes (Carciofi alla Giudia), rigatoni alla carbonara, and cacio e pepe at Da Enzo al 29 or Osteria Da Zi Umberto.',
    tags: ['Roman Dining', 'Nightlife', 'Historic Neighborhood'],
    localTip: 'Book early or arrive at 7:15 PM before doors open at 7:30 PM to beat the queue.',
    estimatedTime: '3 hours',
    isSaved: true,
  },

  // Terracina & Riviera di Ulisse
  {
    id: 'terracina-1',
    city: 'Terracina',
    name: 'Temple of Jupiter Anxur (Tempio di Giove Anxur)',
    category: 'sight',
    address: 'Piazzale Loffredo, 04019 Terracina LT',
    lat: 41.2912,
    lng: 13.2592,
    rating: 4.9,
    description: 'Monumental 1st-century BC Roman sanctuary perched dramatically 227 meters atop Monte Sant’Angelo.',
    whyVisit: 'Massive vaulted arcades with breathtaking vistas over the Pontine Islands (Ponza, Ventotene), Circeo headland, and bay.',
    tags: ['Ancient Roman', 'Epic Panorama', 'Sanctuary'],
    localTip: 'Sunset here is unmissable; you can see the sun setting behind the mythological silhouette of Mount Circeo.',
    estimatedTime: '2 hours',
    isSaved: true,
  },
  {
    id: 'terracina-2',
    city: 'Terracina',
    name: 'Sperlonga Coastal Village & Grotto of Tiberius',
    category: 'daytrip',
    address: 'Via Flacca km 16.300, 04029 Sperlonga LT',
    lat: 41.2581,
    lng: 13.4342,
    rating: 4.9,
    description: 'Whitewashed cliffside Mediterranean village 20 minutes down the coast from Terracina, featuring the Emperor Tiberius seaside villa.',
    whyVisit: 'Pristine blue-flag beaches, labyrinthine whitewashed steps reminiscent of Greece, and colossal Homeric marble statues.',
    tags: ['Whitewashed Village', 'Beaches', 'Emperor Villa'],
    localTip: 'Your Budget rental car makes this a quick 20-minute drive down the coastal Via Flacca.',
    estimatedTime: 'Half Day (4 hours)',
    isSaved: false,
  },

  // Manchester
  {
    id: 'manchester-1',
    city: 'Manchester',
    name: 'John Rylands Research Institute and Library',
    category: 'culture',
    address: '150 Deansgate, Manchester M3 3EH',
    lat: 53.4804,
    lng: -2.2483,
    rating: 4.9,
    description: 'Masterpiece of neo-Gothic Victorian architecture resembling Hogwarts, housing ancient biblical papyri and illuminated manuscripts.',
    whyVisit: 'Walk through the grand Reading Hall with vaulted stone ceilings, stained glass windows, and quiet alcoves.',
    tags: ['Historic Library', 'Neo-Gothic', 'Free Admission'],
    localTip: 'Free admission; take the lift to the historic reading room for tranquil atmosphere.',
    estimatedTime: '1.5 hours',
    isSaved: true,
  },
  {
    id: 'manchester-2',
    city: 'Manchester',
    name: 'Northern Quarter Street Art & Independent Cafes',
    category: 'culture',
    address: 'Stevenson Square & Oldham St, Manchester M1 1DB',
    lat: 53.4831,
    lng: -2.2352,
    rating: 4.7,
    description: 'The creative heart of Manchester with brick warehouses, vibrant murals, vinyl record stores, and world-class coffee roasters.',
    whyVisit: 'Try brunch at Federal Cafe, browse vintage shops in Afflecks Palace, and explore craft beer taprooms.',
    tags: ['Street Art', 'Coffee', 'Vibrant', 'Music'],
    localTip: 'Stop by Mackie Mayor for artisan food hall dining in a restored 1858 market hall.',
    estimatedTime: '2-3 hours',
    isSaved: false,
  },
];

export const DEFAULT_TRIP: TripData = {
  id: 'trip-tripit-mediterranean-2026',
  title: 'Grand Mediterranean & UK Adventure',
  description: 'San Francisco to Athens, Naxos Cyclades, Venice canals, Tuscan road trip, Adriatic coast, Rome, Terracina & Manchester.',
  startDate: '2026-09-16',
  endDate: '2026-10-28',
  stops: INITIAL_TRIP_STOPS,
  savedPlaces: INITIAL_CURATED_PLACES,
  rawItinerary: RAW_TRIPIT_TEXT,
  notes: 'Confirmed TripIt booking: flights with BA, Sky Express, Wizz Air & Ryanair; Airbnbs and villas in Piraeus, Naxos, Venice, Florence, Montepulciano, Pesaro, Rome, and Terracina with Budget car rental.',
};
