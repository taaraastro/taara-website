/* [city, state/province, country, lat, lon, standard UTC offset] */
const PLACES = (() => {
  const out = [];
  const add = (country, tz, data) => { for (const [state, list] of Object.entries(data)) for (const [c, la, lo, z] of list) out.push([c, state, country, la, lo, z ?? tz]); };
  add("India", 5.5, {
    "Andhra Pradesh": [["Visakhapatnam",17.686,83.218],["Vijayawada",16.506,80.648],["Guntur",16.307,80.436],["Nellore",14.443,79.986],["Kurnool",15.828,78.037],["Tirupati",13.628,79.419],["Kakinada",16.989,82.247],["Rajahmundry",17.000,81.804],["Anantapur",14.681,77.600],["Kadapa",14.467,78.824],["Amaravati",16.573,80.358]],
    "Arunachal Pradesh": [["Itanagar",27.084,93.605],["Tawang",27.586,91.865]],
    "Assam": [["Guwahati",26.144,91.736],["Dibrugarh",27.472,94.912],["Silchar",24.833,92.779],["Jorhat",26.757,94.203],["Tezpur",26.633,92.800],["Nagaon",26.348,92.684]],
    "Bihar": [["Patna",25.594,85.138],["Gaya",24.796,85.003],["Bhagalpur",25.244,86.972],["Muzaffarpur",26.120,85.390],["Darbhanga",26.152,85.897],["Purnia",25.778,87.475],["Begusarai",25.418,86.129],["Arrah",25.556,84.663]],
    "Chandigarh": [["Chandigarh",30.733,76.779]],
    "Chhattisgarh": [["Raipur",21.251,81.630],["Bhilai",21.209,81.428],["Bilaspur",22.080,82.148],["Korba",22.346,82.696],["Durg",21.190,81.285]],
    "Delhi": [["New Delhi",28.614,77.209],["Delhi",28.704,77.102],["Dwarka",28.592,77.046],["Rohini",28.741,77.067]],
    "Goa": [["Panaji",15.490,73.828],["Margao",15.276,73.958],["Vasco da Gama",15.396,73.812],["Mapusa",15.591,73.809]],
    "Gujarat": [["Ahmedabad",23.023,72.571],["Surat",21.170,72.831],["Vadodara",22.307,73.181],["Rajkot",22.303,70.802],["Bhavnagar",21.765,72.151],["Jamnagar",22.471,70.058],["Gandhinagar",23.216,72.637],["Junagadh",21.522,70.457],["Anand",22.556,72.951],["Bhuj",23.242,69.666],["Navsari",20.951,72.924],["Morbi",22.817,70.837]],
    "Haryana": [["Gurugram",28.459,77.027],["Faridabad",28.408,77.318],["Panipat",29.390,76.963],["Ambala",30.378,76.776],["Rohtak",28.895,76.607],["Hisar",29.149,75.722],["Karnal",29.686,76.990],["Sonipat",28.993,77.016],["Kurukshetra",29.969,76.878]],
    "Himachal Pradesh": [["Shimla",31.105,77.173],["Dharamshala",32.219,76.323],["Mandi",31.708,76.932],["Solan",30.905,77.097],["Kullu",31.958,77.109]],
    "Jammu and Kashmir": [["Srinagar",34.084,74.797],["Jammu",32.727,74.857],["Anantnag",33.730,75.150]],
    "Jharkhand": [["Ranchi",23.344,85.310],["Jamshedpur",22.805,86.203],["Dhanbad",23.796,86.430],["Bokaro",23.669,86.151],["Deoghar",24.485,86.695],["Hazaribagh",23.992,85.361]],
    "Karnataka": [["Bengaluru",12.972,77.595],["Mysuru",12.296,76.639],["Mangaluru",12.914,74.856],["Hubballi",15.365,75.124],["Belagavi",15.850,74.498],["Davanagere",14.464,75.922],["Ballari",15.139,76.921],["Kalaburagi",17.329,76.835],["Shivamogga",13.930,75.568],["Udupi",13.341,74.747],["Tumakuru",13.340,77.101],["Hassan",13.007,76.096]],
    "Kerala": [["Thiruvananthapuram",8.524,76.937],["Kochi",9.931,76.267],["Kozhikode",11.259,75.780],["Thrissur",10.527,76.214],["Kollam",8.893,76.614],["Kannur",11.875,75.374],["Palakkad",10.787,76.654],["Kottayam",9.592,76.522],["Alappuzha",9.498,76.339],["Malappuram",11.073,76.074]],
    "Ladakh": [["Leh",34.152,77.577],["Kargil",34.557,76.126]],
    "Madhya Pradesh": [["Bhopal",23.260,77.413],["Indore",22.720,75.858],["Gwalior",26.218,78.183],["Jabalpur",23.181,79.987],["Ujjain",23.180,75.784],["Sagar",23.839,78.739],["Rewa",24.531,81.296],["Satna",24.601,80.832],["Ratlam",23.331,75.040],["Dewas",22.966,76.051]],
    "Maharashtra": [["Mumbai",19.076,72.878],["Pune",18.520,73.857],["Nagpur",21.146,79.088],["Thane",19.218,72.978],["Navi Mumbai",19.033,73.030],["Nashik",19.998,73.790],["Chhatrapati Sambhajinagar (Aurangabad)",19.876,75.343],["Solapur",17.660,75.906],["Kolhapur",16.705,74.243],["Amravati",20.937,77.779],["Akola",20.702,77.002],["Nanded",19.138,77.321],["Sangli",16.852,74.581],["Jalgaon",21.003,75.566],["Latur",18.408,76.576],["Ahilyanagar (Ahmednagar)",19.095,74.749],["Satara",17.680,74.018],["Kalyan",19.244,73.130],["Vasai-Virar",19.391,72.839],["Ratnagiri",16.990,73.312]],
    "Manipur": [["Imphal",24.817,93.937]],
    "Meghalaya": [["Shillong",25.578,91.893],["Tura",25.514,90.203]],
    "Mizoram": [["Aizawl",23.727,92.718]],
    "Nagaland": [["Kohima",25.675,94.110],["Dimapur",25.906,93.727]],
    "Odisha": [["Bhubaneswar",20.296,85.825],["Cuttack",20.462,85.883],["Rourkela",22.260,84.854],["Berhampur",19.315,84.793],["Sambalpur",21.467,83.973],["Puri",19.813,85.831],["Balasore",21.494,86.933]],
    "Puducherry": [["Puducherry",11.942,79.808],["Karaikal",10.925,79.838]],
    "Punjab": [["Ludhiana",30.901,75.857],["Amritsar",31.634,74.873],["Jalandhar",31.326,75.576],["Patiala",30.340,76.386],["Bathinda",30.211,74.945],["Mohali",30.704,76.718],["Pathankot",32.274,75.652],["Hoshiarpur",31.532,75.917]],
    "Rajasthan": [["Jaipur",26.912,75.787],["Jodhpur",26.238,73.024],["Udaipur",24.585,73.712],["Kota",25.213,75.865],["Ajmer",26.450,74.640],["Bikaner",28.022,73.312],["Alwar",27.553,76.635],["Bhilwara",25.347,74.641],["Sikar",27.610,75.140],["Sri Ganganagar",29.904,73.877],["Pali",25.771,73.323]],
    "Sikkim": [["Gangtok",27.339,88.607]],
    "Tamil Nadu": [["Chennai",13.083,80.271],["Coimbatore",11.017,76.956],["Madurai",9.925,78.120],["Tiruchirappalli",10.790,78.705],["Salem",11.664,78.146],["Tirunelveli",8.714,77.757],["Vellore",12.916,79.133],["Erode",11.341,77.717],["Thoothukudi",8.764,78.135],["Thanjavur",10.787,79.138],["Tiruppur",11.108,77.341],["Kanchipuram",12.834,79.703],["Nagercoil",8.178,77.412],["Kumbakonam",10.962,79.391]],
    "Telangana": [["Hyderabad",17.385,78.487],["Secunderabad",17.440,78.499],["Warangal",17.969,79.594],["Nizamabad",18.672,78.094],["Karimnagar",18.439,79.129],["Khammam",17.247,80.151]],
    "Tripura": [["Agartala",23.831,91.287]],
    "Uttar Pradesh": [["Lucknow",26.847,80.947],["Kanpur",26.449,80.332],["Varanasi",25.318,82.974],["Prayagraj",25.436,81.846],["Agra",27.177,78.008],["Meerut",28.984,77.706],["Noida",28.535,77.391],["Ghaziabad",28.669,77.454],["Gorakhpur",26.760,83.373],["Bareilly",28.367,79.430],["Aligarh",27.898,78.088],["Moradabad",28.839,78.773],["Saharanpur",29.968,77.546],["Jhansi",25.448,78.569],["Mathura",27.492,77.674],["Ayodhya",26.799,82.204],["Firozabad",27.151,78.398],["Muzaffarnagar",29.473,77.704],["Azamgarh",26.068,83.184],["Sultanpur",26.264,82.072]],
    "Uttarakhand": [["Dehradun",30.317,78.032],["Haridwar",29.946,78.164],["Rishikesh",30.087,78.268],["Haldwani",29.218,79.513],["Nainital",29.380,79.464],["Roorkee",29.854,77.888],["Rudrapur",28.975,79.400]],
    "West Bengal": [["Kolkata",22.573,88.364],["Howrah",22.596,88.264],["Siliguri",26.727,88.395],["Durgapur",23.520,87.312],["Asansol",23.684,86.983],["Kharagpur",22.346,87.232],["Darjeeling",27.041,88.266],["Bardhaman",23.232,87.861],["Malda",25.011,88.145]],
    "Andaman and Nicobar": [["Port Blair",11.623,92.726]],
    "Dadra, Nagar Haveli, Daman and Diu": [["Daman",20.397,72.832],["Silvassa",20.274,73.012]],
    "Lakshadweep": [["Kavaratti",10.567,72.642]],
  });
  add("Nepal", 5.75, { "Bagmati": [["Kathmandu",27.717,85.324],["Lalitpur",27.667,85.317]], "Gandaki": [["Pokhara",28.210,83.986]], "Lumbini": [["Butwal",27.700,83.448]], "Koshi": [["Biratnagar",26.455,87.270]] });
  add("Bangladesh", 6, { "Dhaka": [["Dhaka",23.810,90.413]], "Chattogram": [["Chattogram",22.357,91.783]] });
  add("Sri Lanka", 5.5, { "Western": [["Colombo",6.927,79.861]], "Central": [["Kandy",7.291,80.636]], "Northern": [["Jaffna",9.661,80.025]] });
  add("Pakistan", 5, { "Sindh": [["Karachi",24.861,67.010]], "Punjab": [["Lahore",31.520,74.359],["Rawalpindi",33.565,73.016]], "Islamabad": [["Islamabad",33.684,73.048]] });
  add("United Arab Emirates", 4, { "Dubai": [["Dubai",25.205,55.271]], "Abu Dhabi": [["Abu Dhabi",24.454,54.377]], "Sharjah": [["Sharjah",25.346,55.421]] });
  add("Oman", 4, { "Muscat": [["Muscat",23.588,58.383]] });
  add("Qatar", 3, { "Doha": [["Doha",25.285,51.531]] });
  add("Saudi Arabia", 3, { "Riyadh": [["Riyadh",24.713,46.675]], "Makkah": [["Jeddah",21.486,39.192]] });
  add("Kuwait", 3, { "Al Asimah": [["Kuwait City",29.376,47.977]] });
  add("Bahrain", 3, { "Capital": [["Manama",26.228,50.586]] });
  add("Singapore", 8, { "Singapore": [["Singapore",1.352,103.820]] });
  add("Malaysia", 8, { "Kuala Lumpur": [["Kuala Lumpur",3.139,101.687]], "Penang": [["George Town",5.414,100.329]] });
  add("Hong Kong", 8, { "Hong Kong": [["Hong Kong",22.319,114.169]] });
  add("Japan", 9, { "Tokyo": [["Tokyo",35.676,139.650]] });
  add("Mauritius", 4, { "Port Louis": [["Port Louis",-20.161,57.501]] });
  add("Fiji", 12, { "Central": [["Suva",-18.124,178.450]] });
  add("Kenya", 3, { "Nairobi": [["Nairobi",-1.292,36.822]], "Mombasa": [["Mombasa",-4.043,39.668]] });
  add("South Africa", 2, { "Gauteng": [["Johannesburg",-26.204,28.047]], "KwaZulu-Natal": [["Durban",-29.858,31.022]], "Western Cape": [["Cape Town",-33.925,18.424]] });
  add("United Kingdom", 0, { "England": [["London",51.507,-0.128],["Birmingham",52.486,-1.890],["Manchester",53.481,-2.243],["Leicester",52.637,-1.140],["Leeds",53.801,-1.549]], "Scotland": [["Edinburgh",55.953,-3.188],["Glasgow",55.864,-4.252]], "Wales": [["Cardiff",51.481,-3.179]] });
  add("Ireland", 0, { "Leinster": [["Dublin",53.350,-6.260]] });
  add("France", 1, { "Ile-de-France": [["Paris",48.857,2.352]] });
  add("Germany", 1, { "Berlin": [["Berlin",52.520,13.405]], "Bavaria": [["Munich",48.135,11.582]], "Hesse": [["Frankfurt",50.110,8.682]] });
  add("Netherlands", 1, { "North Holland": [["Amsterdam",52.368,4.904]] });
  add("United States", -5, {
    "New York": [["New York City",40.713,-74.006],["Buffalo",42.886,-78.878]], "New Jersey": [["Edison",40.519,-74.412],["Jersey City",40.718,-74.043]], "Massachusetts": [["Boston",42.360,-71.059]], "Pennsylvania": [["Philadelphia",39.953,-75.165],["Pittsburgh",40.441,-79.996]], "District of Columbia": [["Washington",38.907,-77.037]], "Virginia": [["Richmond",37.541,-77.436]], "Georgia": [["Atlanta",33.749,-84.388]], "Florida": [["Miami",25.762,-80.192],["Orlando",28.538,-81.379],["Tampa",27.951,-82.457]], "North Carolina": [["Charlotte",35.227,-80.843],["Raleigh",35.780,-78.639]], "Michigan": [["Detroit",42.331,-83.046]], "Ohio": [["Columbus",39.961,-82.999]],
    "Illinois": [["Chicago",41.878,-87.630,-6]], "Texas": [["Houston",29.760,-95.370,-6],["Dallas",32.777,-96.797,-6],["Austin",30.267,-97.743,-6],["San Antonio",29.424,-98.494,-6]], "Minnesota": [["Minneapolis",44.978,-93.265,-6]],
    "Colorado": [["Denver",39.739,-104.990,-7]], "Arizona": [["Phoenix",33.448,-112.074,-7]],
    "California": [["Los Angeles",34.052,-118.244,-8],["San Francisco",37.775,-122.419,-8],["San Jose",37.338,-121.886,-8],["San Diego",32.716,-117.161,-8],["Sacramento",38.582,-121.494,-8]], "Washington": [["Seattle",47.606,-122.332,-8]], "Oregon": [["Portland",45.515,-122.678,-8]], "Nevada": [["Las Vegas",36.170,-115.140,-8]],
  });
  add("Canada", -5, { "Ontario": [["Toronto",43.653,-79.383],["Brampton",43.731,-79.762],["Mississauga",43.589,-79.644],["Ottawa",45.421,-75.697]], "Quebec": [["Montreal",45.502,-73.567]], "Alberta": [["Calgary",51.045,-114.072,-7],["Edmonton",53.546,-113.494,-7]], "British Columbia": [["Vancouver",49.283,-123.121,-8],["Surrey",49.191,-122.849,-8]], "Manitoba": [["Winnipeg",49.895,-97.138,-6]] });
  add("Australia", 10, { "New South Wales": [["Sydney",-33.869,151.209]], "Victoria": [["Melbourne",-37.814,144.963]], "Queensland": [["Brisbane",-27.470,153.026]], "Western Australia": [["Perth",-31.951,115.861,8]], "South Australia": [["Adelaide",-34.929,138.601,9.5]], "Australian Capital Territory": [["Canberra",-35.281,149.130]] });
  add("New Zealand", 12, { "Auckland": [["Auckland",-36.849,174.763]], "Wellington": [["Wellington",-41.287,174.776]] });
  return out;
})();
const DST_COUNTRIES = new Set(["United States", "Canada", "United Kingdom", "Ireland", "France", "Germany", "Netherlands", "Australia", "New Zealand"]);
/* ===== World places: every country, state and city (with its IANA time zone), loaded per country ===== */
const WORLD_COUNTRIES = /*WORLD_COUNTRIES*/[];
const IN_DATA = /*IN_DATA*/null;
const PLACE_DATA = {};
const CC_OF = Object.fromEntries(WORLD_COUNTRIES.map(w => [w[1], w[0]]));
const PLACE_BASE = (typeof window !== "undefined" && window.TAARA_CONFIG && window.TAARA_CONFIG.placesBase) || "places/";
PLACES.forEach(p => { if (p[2] === "India") p[6] = "Asia/Kolkata"; });
function addCountryData(name, d) {
  if (PLACE_DATA[name]) return; PLACE_DATA[name] = d;
  const cur = new Map(PLACES.filter(p => p[2] === name).map(p => [norm(p[0]) + "|" + p[1], p]));
  for (const [n, si, lat, lon, zi] of d.c) {
    const st = d.s[si], k = norm(n) + "|" + st, have = cur.get(k);
    if (have) { if (!have[6]) have[6] = d.z[zi]; continue; }
    const row = [n, st, name, lat, lon, null, d.z[zi]]; cur.set(k, row); PLACES.push(row);
  }
  PLACES.forEach(p => { if (p[2] === name && !p[6]) { const twin = PLACES.find(q => q[2] === name && q[6] && norm(q[0]) === norm(p[0])); p[6] = twin ? twin[6] : ""; } });
}
const PLACE_LOADING = {};
function loadCountry(name) {
  if (PLACE_DATA[name]) return Promise.resolve(true);
  const cc = CC_OF[name]; if (!cc || typeof fetch === "undefined") return Promise.resolve(false);
  return PLACE_LOADING[name] || (PLACE_LOADING[name] = fetch(PLACE_BASE + cc + ".json").then(r => r.ok ? r.json() : null).then(d => { if (d) addCountryData(name, d); return !!d; }).catch(() => false));
}
let BIG_CITIES = null, BIG_LOADING = null;
function loadBig() {
  if (BIG_CITIES) return Promise.resolve(BIG_CITIES);
  if (typeof fetch === "undefined") return Promise.resolve(null);
  return BIG_LOADING || (BIG_LOADING = fetch(PLACE_BASE + "_big.json").then(r => r.ok ? r.json() : null).then(d => (BIG_CITIES = d)).catch(() => null));
}
const COUNTRIES = WORLD_COUNTRIES.length ? ["India", ...WORLD_COUNTRIES.map(w => w[1]).filter(n => n !== "India")] : [...new Set(PLACES.map(p => p[2]))];
const statesOf = c => [...new Set([...(PLACE_DATA[c] ? PLACE_DATA[c].a : []), ...PLACES.filter(p => p[2] === c).map(p => p[1])])].filter(Boolean).sort();
/* UTC offset in hours for an IANA zone at a local date and time (handles DST and historical changes, e.g. India's +6:30 war time) */
function tzOffset(zone, date, time) {
  try {
    const [y, m, d] = String(date || new Date().toISOString().slice(0, 10)).split("-").map(Number), [hh, mm] = String(time || "12:00").split(":").map(Number);
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    const offAt = ms => { const o = {}; fmt.formatToParts(new Date(ms)).forEach(x => o[x.type] = +x.value); const dt = new Date(0); dt.setUTCFullYear(o.year, o.month - 1, o.day); dt.setUTCHours(o.hour % 24, o.minute, o.second, 0); return (dt.getTime() - ms) / 36e5; };
    const g = new Date(0); g.setUTCFullYear(y, m - 1, d); g.setUTCHours(hh, mm, 0, 0); const local = g.getTime();
    let off = offAt(local); off = offAt(local - off * 36e5);
    return Math.round(off * 60) / 60;
  } catch (e) { return NaN; }
}
const placeTz = (rec, date, time) => rec && rec[6] ? tzOffset(rec[6], date, time) : (rec ? rec[5] : NaN);
const citiesOf = (c, s) => PLACES.filter(p => p[2] === c && (!s || p[1] === s));
const norm = s => String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z]/g, "");
const ALIAS = { bangalore: "Bengaluru", bombay: "Mumbai", calcutta: "Kolkata", madras: "Chennai", gurgaon: "Gurugram", mysore: "Mysuru", mangalore: "Mangaluru", trivandrum: "Thiruvananthapuram", cochin: "Kochi", ernakulam: "Kochi", calicut: "Kozhikode", poona: "Pune", baroda: "Vadodara", benares: "Varanasi", banaras: "Varanasi", kashi: "Varanasi", allahabad: "Prayagraj", pondicherry: "Puducherry", vizag: "Visakhapatnam", hubli: "Hubballi", belgaum: "Belagavi", gulbarga: "Kalaburagi", shimoga: "Shivamogga", tumkur: "Tumakuru", trichy: "Tiruchirappalli", tuticorin: "Thoothukudi", faizabad: "Ayodhya", delhi: "New Delhi", newyork: "New York City", nyc: "New York City", bhubneshwar: "Bhubaneswar", vishakhapatnam: "Visakhapatnam", rajamahendravaram: "Rajahmundry", panjim: "Panaji", sambhajinagar: "Chhatrapati Sambhajinagar (Aurangabad)", gauhati: "Guwahati", simla: "Shimla", mohali: "Mohali" };
function findPlace(city, state, country) {
  let n = norm(city); if (!n) return null;
  if (ALIAS[n] && !PLACES.some(p => norm(p[0]) === n)) { city = ALIAS[n]; n = norm(city); }
  const match = p => norm(p[0]) === n || p[0].toLowerCase().includes("(" + String(city).toLowerCase().trim() + ")");
  return PLACES.find(p => p[2] === country && p[1] === state && match(p)) || PLACES.find(p => p[2] === country && match(p)) || (country ? null : PLACES.find(match));
}
if (IN_DATA) addCountryData("India", IN_DATA);
