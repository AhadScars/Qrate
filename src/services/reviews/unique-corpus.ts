import { BANDS, LANGUAGES, LENGTHS, TONES, type RatingBand, type ReviewLanguage, type ReviewLength, type ReviewTone } from "@/services/reviews/patterns";

export type CorpusRow = {
  slug: string;
  language: ReviewLanguage;
  tone: ReviewTone;
  length: ReviewLength;
  ratingBand: RatingBand;
  content: string;
};

const PER_CELL = 8;

type Slots = { o: string; n: string; p: string };
type Lists = { o: string[]; n: string[]; p: string[] };
type Role = "open" | "detail" | "attribute" | "close";

type Copy = { o: string[]; n: string[] };

const categories: { slug: string; en: Copy; hi: Copy; hinglish: Copy }[] = [
  {
    slug: "restaurant",
    en: {
      o: ["a family dinner", "a quick lunch", "a late supper", "a Sunday meal", "a weekday dinner", "an unplanned lunch", "a celebration dinner", "a quiet meal"],
      n: ["butter chicken", "dal makhani", "biryani", "paneer tikka", "thali", "garlic naan", "house dessert", "main gravy"],
    },
    hi: {
      o: ["पारिवारिक खाने", "जल्दी के लंच", "देर रात के खाने", "रविवार के भोज", "काम के दिन के डिनर", "अचानक लंच", "जश्न के डिनर", "शांत खाने"],
      n: ["बटर चिकन", "दाल मखनी", "बिरयानी", "पनीर टिक्का", "थाली", "लहसुन नान", "मिठाई", "ग्रेवी"],
    },
    hinglish: {
      o: ["family dinner", "jaldi wale lunch", "late dinner", "Sunday wale khane", "weekday dinner", "bina plan ke lunch", "celebration dinner", "shaant dinner"],
      n: ["butter chicken", "dal makhani", "biryani", "paneer tikka", "thali", "garlic naan", "mithai", "gravy"],
    },
  },
  {
    slug: "cafe",
    en: {
      o: ["a slow coffee", "a morning cup", "an afternoon break", "a catch-up over coffee", "a quiet drink", "a short sweet stop", "a rainy-day coffee", "a pre-errand coffee"],
      n: ["cappuccino", "filter coffee", "masala chai", "cold coffee", "croissant", "brownie", "grilled sandwich", "cardamom tea"],
    },
    hi: {
      o: ["आराम की कॉफी", "सुबह के कप", "दोपहर के ब्रेक", "दोस्तों वाली कॉफी", "शांत ड्रिंक", "मीठे स्टॉप", "बारिश वाली कॉफी", "काम से पहले की कॉफी"],
      n: ["कैपुचीनो", "फिल्टर कॉफी", "मसाला चाय", "कोल्ड कॉफी", "क्रोसां", "ब्राउनी", "ग्रिल सैंडविच", "इलायची चाय"],
    },
    hinglish: {
      o: ["aram ki coffee", "subah ka cup", "dopahar ka break", "doston wali coffee", "shaant drink", "meetha stop", "baarish wali coffee", "kaam se pehle ki coffee"],
      n: ["cappuccino", "filter coffee", "masala chai", "cold coffee", "croissant", "brownie", "grilled sandwich", "elaichi chai"],
    },
  },
  {
    slug: "hotel",
    en: {
      o: ["a one-night stay", "a weekend stay", "an overnight stop", "a business night", "a family night", "a late arrival", "a two-night stay", "a quiet night"],
      n: ["bed", "shower", "pillow", "room lighting", "towel", "kettle", "blackout curtain", "work desk"],
    },
    hi: {
      o: ["एक रात के ठहराव", "वीकेंड स्टे", "रात के पड़ाव", "काम वाली रात", "परिवार वाली रात", "देर से आगमन", "दो रात के ठहराव", "शांत रात"],
      n: ["बिस्तर", "शावर", "तकिया", "कमरे की रोशनी", "तौलिया", "केतली", "काले पर्दे", "काम की मेज"],
    },
    hinglish: {
      o: ["ek raat ke stay", "weekend stay", "raat ke padav", "kaam wali raat", "family wali raat", "late arrival", "do raat ke stay", "shaant raat"],
      n: ["bed", "shower", "pillow", "room light", "towel", "kettle", "blackout curtain", "work desk"],
    },
  },
  {
    slug: "gym",
    en: {
      o: ["a morning workout", "an evening session", "a leg session", "a short cardio visit", "a strength hour", "a stretch session", "a coached hour", "a weekend workout"],
      n: ["treadmill corner", "free-weight area", "squat rack", "locker room", "stretching mat", "cable machine", "water station", "floor layout"],
    },
    hi: {
      o: ["सुबह की कसरत", "शाम के सत्र", "पैर वाले सत्र", "छोटे कार्डियो", "ताकत के घंटे", "स्ट्रेच सत्र", "कोच वाले घंटे", "वीकेंड कसरत"],
      n: ["ट्रेडमिल कोना", "फ्री वेट एरिया", "स्क्वाट रैक", "लॉकर रूम", "स्ट्रेचिंग मैट", "केबल मशीन", "पानी की जगह", "फर्श का लेआउट"],
    },
    hinglish: {
      o: ["subah ki kasrat", "shaam ka session", "leg session", "chhota cardio", "strength hour", "stretch session", "coach wala hour", "weekend workout"],
      n: ["treadmill corner", "free-weight area", "squat rack", "locker room", "stretching mat", "cable machine", "water station", "floor layout"],
    },
  },
  {
    slug: "salon",
    en: {
      o: ["a trim", "a colour appointment", "a morning booking", "a refresh visit", "a weekend slot", "a quick tidy-up", "a full styling visit", "a scheduled cut"],
      n: ["haircut", "beard line", "colour work", "blow dry", "shampoo", "final style", "head wash", "fringe"],
    },
    hi: {
      o: ["ट्रिम", "कलर अपॉइंटमेंट", "सुबह की बुकिंग", "रिफ्रेश विज़िट", "वीकेंड स्लॉट", "जल्दी वाला कट", "पूरा स्टाइलिंग विज़िट", "तय कट"],
      n: ["हेयरकट", "दाढ़ी की लाइन", "कलर का काम", "ब्लो ड्राई", "शैम्पू", "आखिरी स्टाइल", "सिर की धुलाई", "फ्रिंज"],
    },
    hinglish: {
      o: ["ek trim", "colour appointment", "subah ki booking", "refresh visit", "weekend slot", "jaldi tidy-up", "full styling visit", "scheduled cut"],
      n: ["haircut", "beard line", "colour work", "blow dry", "shampoo", "final style", "head wash", "fringe"],
    },
  },
  {
    slug: "retail-shop",
    en: {
      o: ["a weekly shop", "a quick top-up", "a monthly basket", "an evening errand", "a neighbourhood stop", "a refill run", "a festival shop", "a short grocery run"],
      n: ["rice shelf", "spice row", "snack shelf", "oil stock", "flour display", "tea shelf", "soap row", "billing queue"],
    },
    hi: {
      o: ["हफ्ते की खरीद", "जल्दी टॉप-अप", "महीने की टोकरी", "शाम का काम", "मोहल्ले का पड़ाव", "रिफिल चक्कर", "त्योहार की खरीद", "छोटी किराना"],
      n: ["चावल की शेल्फ", "मसाले की कतार", "स्नैक शेल्फ", "तेल का स्टॉक", "आटे का डिस्प्ले", "चाय की शेल्फ", "साबुन की कतार", "बिलिंग कतार"],
    },
    hinglish: {
      o: ["hafte ki kharid", "jaldi top-up", "mahine ki tokri", "shaam ka kaam", "mohalle ka padav", "refill round", "tyohar ki kharid", "chhoti kirana"],
      n: ["chawal ki shelf", "masale ki line", "snack shelf", "tel ka stock", "aate ka display", "chai ki shelf", "sabun ki line", "billing queue"],
    },
  },
  {
    slug: "clothing-store",
    en: {
      o: ["a shirt hunt", "a weekend browse", "a festive shop", "a size check", "a gift look", "a wardrobe refresh", "a quick try-on", "a seasonal visit"],
      n: ["shirt rack", "denim wall", "kurta section", "trial room", "jacket rail", "saree stack", "size range", "checkout fold"],
    },
    hi: {
      o: ["शर्ट की तलाश", "वीकेंड ब्राउज़", "त्योहार की खरीद", "साइज़ चेक", "गिफ्ट देखना", "अलमारी का रिफ्रेश", "जल्दी ट्राई-ऑन", "मौसम वाली विज़िट"],
      n: ["शर्ट रैक", "डेनिम वॉल", "कुर्ता सेक्शन", "ट्रायल रूम", "जैकेट रेल", "साड़ी का ढेर", "साइज़ रेंज", "चेकआउट फोल्ड"],
    },
    hinglish: {
      o: ["shirt ki talaash", "weekend browse", "tyohar ki kharid", "size check", "gift dekhna", "wardrobe refresh", "jaldi try-on", "mausam wali visit"],
      n: ["shirt rack", "denim wall", "kurta section", "trial room", "jacket rail", "saree stack", "size range", "checkout fold"],
    },
  },
  {
    slug: "medical-clinic",
    en: {
      o: ["a booked visit", "a morning slot", "a follow-up", "a short consult", "a scheduled check", "an on-time visit", "a family appointment", "a routine visit"],
      n: ["consultation room", "waiting chairs", "front desk", "examination bed", "report folder", "appointment slot", "cabin light", "medicine note"],
    },
    hi: {
      o: ["बुक विज़िट", "सुबह का स्लॉट", "फॉलो-अप", "छोटा परामर्श", "तय जाँच", "समय पर विज़िट", "परिवार की अपॉइंटमेंट", "नियमित विज़िट"],
      n: ["परामर्श कक्ष", "इंतज़ार की कुर्सियाँ", "फ्रंट डेस्क", "जाँच की चारपाई", "रिपोर्ट फोल्डर", "अपॉइंटमेंट स्लॉट", "केबिन की रोशनी", "दवाई की पर्ची"],
    },
    hinglish: {
      o: ["booked visit", "subah ka slot", "follow-up", "chhota consult", "scheduled check", "time par visit", "family appointment", "routine visit"],
      n: ["consult room", "waiting chairs", "front desk", "examination bed", "report folder", "appointment slot", "cabin light", "dawai ki parchi"],
    },
  },
  {
    slug: "dental-clinic",
    en: {
      o: ["a routine checkup", "a cleaning visit", "a booked slot", "a follow-up", "a morning appointment", "a short consult", "a planned visit", "a polish appointment"],
      n: ["cleaning chair", "x-ray step", "polishing", "checkup room", "rinse station", "bite test", "tool setup", "treatment chair"],
    },
    hi: {
      o: ["नियमित जाँच", "क्लीनिंग विज़िट", "बुक स्लॉट", "फॉलो-अप", "सुबह की अपॉइंटमेंट", "छोटा परामर्श", "तय विज़िट", "पॉलिश अपॉइंटमेंट"],
      n: ["क्लीनिंग कुर्सी", "एक्स-रे चरण", "पॉलिशिंग", "जाँच कक्ष", "कुल्ला जगह", "बाइट टेस्ट", "औज़ार सेटअप", "ट्रीटमेंट कुर्सी"],
    },
    hinglish: {
      o: ["routine checkup", "cleaning visit", "booked slot", "follow-up", "subah ki appointment", "chhota consult", "planned visit", "polish appointment"],
      n: ["cleaning chair", "x-ray step", "polishing", "checkup room", "rinse station", "bite test", "tool setup", "treatment chair"],
    },
  },
  {
    slug: "spa",
    en: {
      o: ["a one-hour booking", "an evening slot", "a weekend session", "a short reset", "a gift visit", "a calm hour", "a planned session", "a late booking"],
      n: ["massage table", "steam room", "aroma oil", "quiet room", "robe", "foot soak", "hot-stone set", "music level"],
    },
    hi: {
      o: ["एक घंटे की बुकिंग", "शाम का स्लॉट", "वीकेंड सत्र", "छोटा विश्राम", "गिफ्ट विज़िट", "शांत घंटा", "तय सत्र", "देर की बुकिंग"],
      n: ["मसाज टेबल", "स्टीम रूम", "सुगंधित तेल", "शांत कमरा", "गाउन", "पैरों का स्नान", "हॉट स्टोन सेट", "संगीत का स्तर"],
    },
    hinglish: {
      o: ["ek ghante ki booking", "shaam ka slot", "weekend session", "chhota reset", "gift visit", "shaant ghanta", "planned session", "late booking"],
      n: ["massage table", "steam room", "aroma oil", "quiet room", "robe", "foot soak", "hot-stone set", "music level"],
    },
  },
  {
    slug: "shopping-store",
    en: {
      o: ["a full shop", "a weekend stock-up", "a quick basket", "an evening run", "a household shop", "a monthly haul", "a short list run", "a family shop"],
      n: ["checkout lane", "main aisle", "grocery bay", "price board", "trolley bay", "packing desk", "household shelf", "offer end"],
    },
    hi: {
      o: ["पूरी खरीद", "वीकेंड स्टॉक", "जल्दी की टोकरी", "शाम का चक्कर", "घर का सामान", "महीने का ढेर", "छोटी लिस्ट", "परिवार की खरीद"],
      n: ["चेकआउट लेन", "मुख्य गलियारा", "किराना बे", "भाव बोर्ड", "ट्रॉली बे", "पैकिंग डेस्क", "घरेलू शेल्फ", "ऑफर छोर"],
    },
    hinglish: {
      o: ["poori kharid", "weekend stock-up", "jaldi ki tokri", "shaam ka chakkar", "ghar ka samaan", "mahine ka haul", "chhoti list", "family ki kharid"],
      n: ["checkout lane", "main aisle", "grocery bay", "price board", "trolley bay", "packing desk", "household shelf", "offer end"],
    },
  },
  {
    slug: "service-business",
    en: {
      o: ["a home visit", "a booked job", "a morning call-out", "a repair slot", "an installation day", "a short job", "a follow-up visit", "a scheduled task"],
      n: ["finished repair", "installation", "written quote", "final finish", "cleanup", "agreed hour", "written invoice", "return call"],
    },
    hi: {
      o: ["घर की विज़िट", "बुक काम", "सुबह की कॉल", "मरम्मत स्लॉट", "इंस्टॉलेशन दिन", "छोटा काम", "फॉलो-अप विज़िट", "तय कार्य"],
      n: ["पूरी मरम्मत", "इंस्टॉलेशन", "लिखित कोट", "आखिरी फिनिश", "काम के बाद का हाल", "तय घंटा", "लिखित बिल", "वापसी कॉल"],
    },
    hinglish: {
      o: ["ghar ki visit", "booked job", "subah ki call", "repair slot", "installation day", "chhota kaam", "follow-up visit", "scheduled task"],
      n: ["finished repair", "installation", "written quote", "final finish", "cleanup", "agreed hour", "written invoice", "return call"],
    },
  },
  {
    slug: "other",
    en: {
      o: ["a normal visit", "a short appointment", "an errand", "a booked slot", "a morning stop", "a return visit", "a simple job", "a planned stop"],
      n: ["front counter", "waiting chair", "main process", "final result", "clock pace", "help desk", "written note", "finished work"],
    },
    hi: {
      o: ["सामान्य विज़िट", "छोटी अपॉइंटमेंट", "एक काम", "बुक स्लॉट", "सुबह का पड़ाव", "दोबारा विज़िट", "सरल काम", "तय पड़ाव"],
      n: ["सामने का काउंटर", "इंतज़ार की कुर्सी", "मुख्य प्रक्रिया", "आखिरी नतीजा", "घड़ी की रफ्तार", "हेल्प डेस्क", "लिखित नोट", "पूरा काम"],
    },
    hinglish: {
      o: ["normal visit", "chhoti appointment", "ek kaam", "booked slot", "subah ka padav", "dobara visit", "saral kaam", "planned stop"],
      n: ["front counter", "waiting chair", "main process", "final result", "clock pace", "help desk", "written note", "finished work"],
    },
  },
];

const praise: Record<ReviewLanguage, Record<RatingBand, string[]>> = {
  en: {
    high: ["excellent", "better than I expected", "worth remembering", "the best part of the visit", "a clear strong point", "genuinely good", "above the usual standard", "easy to praise"],
    mid: ["average", "acceptable", "mixed", "ordinary", "just adequate", "nothing special", "middle of the road", "fine for one visit"],
    low: ["a letdown", "below what I expected", "not worth repeating", "a weak point", "below a basic standard", "hard to praise", "uneven", "a disappointment"],
  },
  hi: {
    high: ["बहुत अच्छा", "उम्मीद से बेहतर", "याद रखने लायक", "इस विज़िट का सबसे अच्छा हिस्सा", "साफ़ मज़बूत पक्ष", "सच में अच्छा", "आम स्तर से ऊपर", "दोबारा बताने लायक"],
    mid: ["औसत", "स्वीकार्य", "मिला-जुला", "साधारण", "बस काम चलाऊ", "कुछ खास नहीं", "बीच का", "एक बार के लिए ठीक"],
    low: ["निराशा वाला", "उम्मीद से कम", "दोहराने लायक नहीं", "कमज़ोर पक्ष", "बुनियादी स्तर से नीचे", "सुझाने लायक नहीं", "असमान", "अधूरा"],
  },
  hinglish: {
    high: ["bahut accha", "ummeed se better", "yaad rakhne layak", "is visit ka best hissa", "clear strong point", "sach mein accha", "aam level se upar", "dobara batane layak"],
    mid: ["average", "theek-thaak", "mixed", "sadharan", "bas kaam chalau", "kuch khaas nahi", "beech ka", "ek baar ke liye theek"],
    low: ["nirasha wala", "ummeed se kam", "dobara layak nahi", "weak point", "basic level se neeche", "suggest karne layak nahi", "uneven", "adhura"],
  },
};

const opens: Record<ReviewLanguage, Record<ReviewTone, string[]>> = {
  en: {
    natural: [
      "I went to {business} for $o, and the $n was $p.",
      "{business} was an easy choice for $o, and the $n was $p.",
      "I picked {business} for $o, and the $n was $p.",
      "For $o I chose {business}, and the $n was $p.",
      "Stopping at {business} for $o worked out, and the $n was $p.",
      "I remember {business} from $o, and the $n was $p.",
      "I came to {business} for $o, and the $n was $p.",
      "{business} handled $o smoothly, and the $n was $p.",
    ],
    professional: [
      "I visited {business} for $o, and the $n was $p.",
      "{business} was a measured choice for $o, and the $n was $p.",
      "I attended {business} for $o, and the $n was $p.",
      "For $o I used {business}, and the $n was $p.",
      "My purpose at {business} was $o, and the $n was $p.",
      "I can describe {business} after $o, and the $n was $p.",
      "During $o at {business}, the $n was $p.",
      "Following $o at {business}, the $n was $p.",
    ],
    friendly: [
      "I tried {business} for $o, and the $n was $p.",
      "I gave {business} a go for $o, and the $n was $p.",
      "I popped into {business} for $o, and the $n was $p.",
      "I spent $o at {business}, and the $n was $p.",
      "I sat with {business} for $o, and the $n was $p.",
      "I checked {business} for $o, and the $n was $p.",
      "I showed up at {business} for $o, and the $n was $p.",
      "I ended up at {business} for $o, and the $n was $p.",
    ],
    simple: [
      "For $o at {business}, the $n was $p.",
      "The $n was $p when I came to {business} for $o.",
      "I came for $o, and at {business} the $n was $p.",
      "{business} was where I went for $o, and the $n was $p.",
      "While I was at {business} for $o, the $n was $p.",
      "The visit to {business} for $o showed a $n that was $p.",
      "I stopped for $o, and {business} had a $n that was $p.",
      "After choosing {business} for $o, I found the $n was $p.",
    ],
  },
  hi: {
    natural: [
      "मैं $o के लिए {business} गया और $n का अनुभव $p रहा।",
      "{business} $o के लिए मेरा चुनाव रहा और $n का अनुभव $p रहा।",
      "मैंने $o के लिए {business} चुना और $n का अनुभव $p रहा।",
      "$o के लिए मैं {business} गया और $n का अनुभव $p रहा।",
      "{business} पर $o हुआ और $n का अनुभव $p रहा।",
      "मुझे {business} का $o याद है और $n का अनुभव $p रहा।",
      "$o के वक्त मैं {business} में था और $n का अनुभव $p रहा।",
      "{business} में $o के दौरान $n का अनुभव $p रहा।",
    ],
    professional: [
      "मैंने {business} का दौरा $o के लिए किया और $n का अनुभव $p रहा।",
      "मेरे आकलन में {business} पर $o हुआ और $n का अनुभव $p रहा।",
      "मैं $o के सिलसिले में {business} गया और $n का अनुभव $p रहा।",
      "{business} को मैंने $o के लिए चुना और $n का अनुभव $p रहा।",
      "मेरा मकसद {business} पर $o था और $n का अनुभव $p रहा।",
      "$o के बाद मैं {business} के बारे में इतना कहूँगा कि $n का अनुभव $p रहा।",
      "$o के दौरान {business} में $n का अनुभव $p रहा।",
      "$o के बाद {business} में $n का अनुभव $p रहा।",
    ],
    friendly: [
      "मैं {business} $o के लिए गया और $n का अनुभव $p रहा।",
      "मैंने {business} को $o के लिए आज़माया और $n का अनुभव $p रहा।",
      "मैं $o के लिए {business} चला गया और $n का अनुभव $p रहा।",
      "{business} में मैं $o के लिए रुका और $n का अनुभव $p रहा।",
      "मैं $o लेकर {business} पहुँचा और $n का अनुभव $p रहा।",
      "{business} मेरा $o वाला ठिकाना रहा और $n का अनुभव $p रहा।",
      "मैं सीधे $o के लिए {business} गया और $n का अनुभव $p रहा।",
      "आखिर में मैं $o के लिए {business} गया और $n का अनुभव $p रहा।",
    ],
    simple: [
      "{business} में $o हुआ और $n का अनुभव $p रहा।",
      "$o पर मैं {business} गया, जहाँ $n का अनुभव $p रहा।",
      "मैं {business} गया, $o के लिए, और $n का अनुभव $p रहा।",
      "$n का अनुभव {business} में $o के वक्त $p रहा।",
      "{business} $o का स्थान रहा और $n का अनुभव $p रहा।",
      "$o मुझे {business} ले गया और $n का अनुभव $p रहा।",
      "{business} जाकर $o पूरा हुआ और $n का अनुभव $p रहा।",
      "सीधे {business} गया $o के लिए और $n का अनुभव $p रहा।",
    ],
  },
  hinglish: {
    natural: [
      "Main $o ke liye {business} gaya, aur $n ka experience $p raha.",
      "{business} $o ke liye easy choice raha, aur $n ka experience $p raha.",
      "Maine $o ke liye {business} chuna, aur $n ka experience $p raha.",
      "$o ke liye main {business} gaya, aur $n ka experience $p raha.",
      "{business} par $o hua, aur $n ka experience $p raha.",
      "Mujhe {business} wala $o yaad hai, aur $n ka experience $p raha.",
      "$o ke waqt main {business} mein tha, aur $n ka experience $p raha.",
      "{business} mein $o ke dauran $n ka experience $p raha.",
    ],
    professional: [
      "Maine {business} $o ke liye visit kiya, aur $n ka experience $p raha.",
      "Mere hisaab se {business} par $o hua, aur $n ka experience $p raha.",
      "Main $o ke silsile mein {business} gaya, aur $n ka experience $p raha.",
      "{business} ko maine $o ke liye choose kiya, aur $n ka experience $p raha.",
      "Mera maksad {business} par $o tha, aur $n ka experience $p raha.",
      "$o ke baad main {business} ke baare mein keh sakta hoon ki $n ka experience $p raha.",
      "$o ke dauran {business} mein $n ka experience $p raha.",
      "$o ke baad {business} mein $n ka experience $p raha.",
    ],
    friendly: [
      "Main {business} $o ke liye try kiya, aur $n ka experience $p raha.",
      "Maine {business} ko $o ke liye choose kiya, aur $n ka experience $p raha.",
      "Main $o ke liye {business} chala gaya, aur $n ka experience $p raha.",
      "{business} mein main $o ke liye ruka, aur $n ka experience $p raha.",
      "Main $o lekar {business} pahuncha, aur $n ka experience $p raha.",
      "{business} mera $o wala stop raha, aur $n ka experience $p raha.",
      "Main seedha $o ke liye {business} gaya, aur $n ka experience $p raha.",
      "Aakhir mein main $o ke liye {business} gaya, aur $n ka experience $p raha.",
    ],
    simple: [
      "{business} mein $o hua aur $n ka experience $p raha.",
      "$o par main {business} gaya, jahan $n ka experience $p raha.",
      "Main {business} gaya $o ke liye, aur $n ka experience $p raha.",
      "$n ka experience {business} mein $o ke waqt $p raha.",
      "{business} $o ki jagah raha, aur $n ka experience $p raha.",
      "$o mujhe {business} le gaya, aur $n ka experience $p raha.",
      "{business} jaakar $o poora hua, aur $n ka experience $p raha.",
      "Seedha {business} gaya $o ke liye, aur $n ka experience $p raha.",
    ],
  },
};

const details: Record<ReviewLanguage, Record<ReviewTone, string[]>> = {
  en: {
    natural: [
      "I also noticed the $n, which was $p.",
      "A separate part was the $n, which was $p.",
      "One thing I weighed was the $n, and it was $p.",
      "From where I sat, the $n was $p.",
      "I paid attention to the $n, which was $p.",
      "By the end, the $n was $p.",
      "I looked twice at the $n, and it was $p.",
      "What lingered was the $n, which was $p.",
    ],
    professional: [
      "I observed the $n, which was $p.",
      "A further point was the $n, which was $p.",
      "I weighed the $n, and it was $p.",
      "From my place, the $n was $p.",
      "I gave attention to the $n, which was $p.",
      "By the close, the $n was $p.",
      "I reviewed the $n, and it was $p.",
      "The telling detail was the $n, which was $p.",
    ],
    friendly: [
      "I also caught the $n, which was $p.",
      "Another bit I judged was the $n, which was $p.",
      "I kept an eye on the $n, and it was $p.",
      "Where I sat, the $n was $p.",
      "The $n got my attention, and it was $p.",
      "Near the end, the $n was $p.",
      "I glanced twice at the $n, and it was $p.",
      "The part that stayed with me was the $n, which was $p.",
    ],
    simple: [
      "The $n was $p.",
      "I saw that the $n was $p.",
      "To me the $n was $p.",
      "Yes, the $n was $p.",
      "And the $n was $p.",
      "Also, the $n was $p.",
      "Then the $n was $p.",
      "Still, the $n was $p.",
    ],
  },
  hi: {
    natural: [
      "साथ में $n का अनुभव $p रहा।",
      "अलग से $n का अनुभव $p रहा।",
      "मैंने $n को भी तौला और अनुभव $p रहा।",
      "मेरी जगह से $n का अनुभव $p रहा।",
      "मैंने $n पर ध्यान दिया और अनुभव $p रहा।",
      "अंत तक $n का अनुभव $p रहा।",
      "मैं $n को दो बार देख पाया और अनुभव $p रहा।",
      "जो रह गया वह $n था और अनुभव $p रहा।",
    ],
    professional: [
      "मैंने $n देखा और अनुभव $p रहा।",
      "एक और बात $n रही और अनुभव $p रहा।",
      "मैंने $n को तौला और अनुभव $p रहा।",
      "अपनी जगह से $n का अनुभव $p रहा।",
      "मैंने $n पर ध्यान रखा और अनुभव $p रहा।",
      "समापन पर $n का अनुभव $p रहा।",
      "मैंने $n की समीक्षा की और अनुभव $p रहा।",
      "असली बात $n रही और अनुभव $p रहा।",
    ],
    friendly: [
      "मैंने $n भी पकड़ा और अनुभव $p रहा।",
      "एक और हिस्सा $n रहा और अनुभव $p रहा।",
      "मैं $n पर नज़र रखे रहा और अनुभव $p रहा।",
      "जहाँ मैं बैठा, $n का अनुभव $p रहा।",
      "$n ने मेरा ध्यान खींचा और अनुभव $p रहा।",
      "अंत के पास $n का अनुभव $p रहा।",
      "मैंने $n पर दो बार नज़र डाली और अनुभव $p रहा।",
      "जो साथ रहा वह $n था और अनुभव $p रहा।",
    ],
    simple: [
      "$n का अनुभव $p रहा।",
      "मैंने देखा कि $n का अनुभव $p रहा।",
      "मेरे लिए $n का अनुभव $p रहा।",
      "हाँ, $n का अनुभव $p रहा।",
      "और $n का अनुभव $p रहा।",
      "साथ ही $n का अनुभव $p रहा।",
      "फिर $n का अनुभव $p रहा।",
      "फिर भी $n का अनुभव $p रहा।",
    ],
  },
  hinglish: {
    natural: [
      "Saath mein $n ka experience $p raha.",
      "Alag se $n ka experience $p raha.",
      "Maine $n ko bhi taula aur experience $p raha.",
      "Meri jagah se $n ka experience $p raha.",
      "Maine $n par dhyan diya aur experience $p raha.",
      "Ant tak $n ka experience $p raha.",
      "Main $n ko do baar dekh paya aur experience $p raha.",
      "Jo reh gaya woh $n tha aur experience $p raha.",
    ],
    professional: [
      "Maine $n dekha aur experience $p raha.",
      "Ek aur baat $n rahi aur experience $p raha.",
      "Maine $n ko taula aur experience $p raha.",
      "Apni jagah se $n ka experience $p raha.",
      "Maine $n par dhyan rakha aur experience $p raha.",
      "Samapan par $n ka experience $p raha.",
      "Maine $n ki review ki aur experience $p raha.",
      "Asli baat $n rahi aur experience $p raha.",
    ],
    friendly: [
      "Maine $n bhi pakda aur experience $p raha.",
      "Ek aur hissa $n raha aur experience $p raha.",
      "Main $n par nazar rakhe raha aur experience $p raha.",
      "Jahan main baitha, $n ka experience $p raha.",
      "$n ne mera dhyan khincha aur experience $p raha.",
      "Ant ke paas $n ka experience $p raha.",
      "Maine $n par do baar nazar daali aur experience $p raha.",
      "Jo saath raha woh $n tha aur experience $p raha.",
    ],
    simple: [
      "$n ka experience $p raha.",
      "Maine dekha ki $n ka experience $p raha.",
      "Mere liye $n ka experience $p raha.",
      "Haan, $n ka experience $p raha.",
      "Aur $n ka experience $p raha.",
      "Saath hi $n ka experience $p raha.",
      "Phir $n ka experience $p raha.",
      "Phir bhi $n ka experience $p raha.",
    ],
  },
};

const attributes: Record<ReviewLanguage, Record<ReviewTone, string[]>> = {
  en: {
    natural: [
      "My note stays with the {attributes}, and the $n was $p.",
      "I am writing about the {attributes}, and the $n was $p.",
      "The point of this visit is the {attributes}, and the $n was $p.",
      "I kept to the {attributes}, and the $n was $p.",
      "The honest part is the {attributes}, and the $n was $p.",
      "If one line matters, it is the {attributes}, and the $n was $p.",
      "I did not wander past the {attributes}, and the $n was $p.",
      "The {attributes} decided the visit, and the $n was $p.",
    ],
    professional: [
      "This assessment covers the {attributes}, and the $n was $p.",
      "I am reporting the {attributes}, and the $n was $p.",
      "The scope here is the {attributes}, and the $n was $p.",
      "I confined the note to the {attributes}, and the $n was $p.",
      "The material point is the {attributes}, and the $n was $p.",
      "The line I will stand by is the {attributes}, and the $n was $p.",
      "I stayed inside the {attributes}, and the $n was $p.",
      "The {attributes} settled my view, and the $n was $p.",
    ],
    friendly: [
      "I will talk about the {attributes}, and the $n was $p.",
      "I will keep this on the {attributes}, and the $n was $p.",
      "What I came to share is the {attributes}, and the $n was $p.",
      "I stuck with the {attributes}, and the $n was $p.",
      "The bit I mean is the {attributes}, and the $n was $p.",
      "Read this for the {attributes}, and the $n was $p.",
      "I am staying with the {attributes}, and the $n was $p.",
      "The {attributes} made up my mind, and the $n was $p.",
    ],
    simple: [
      "I talk here about the {attributes}, and the $n was $p.",
      "This is about the {attributes}, and the $n was $p.",
      "I mean the {attributes}, and the $n was $p.",
      "Only the {attributes} count here, and the $n was $p.",
      "Read the {attributes} in this note, and the $n was $p.",
      "The {attributes} are my point, and the $n was $p.",
      "I stick to the {attributes}, and the $n was $p.",
      "Judge this on the {attributes}, and the $n was $p.",
    ],
  },
  hi: {
    natural: [
      "मेरी बात {attributes} पर है और $n का अनुभव $p रहा।",
      "मैं {attributes} के बारे में लिख रहा हूँ और $n का अनुभव $p रहा।",
      "इस विज़िट का मुद्दा {attributes} है और $n का अनुभव $p रहा।",
      "मैं {attributes} तक रहा और $n का अनुभव $p रहा।",
      "ईमानदार हिस्सा {attributes} है और $n का अनुभव $p रहा।",
      "एक लाइन मायने रखे तो वह {attributes} है और $n का अनुभव $p रहा।",
      "मैं {attributes} से आगे नहीं गया और $n का अनुभव $p रहा।",
      "विज़िट {attributes} से तय हुई और $n का अनुभव $p रहा।",
    ],
    professional: [
      "यह आकलन {attributes} पर है और $n का अनुभव $p रहा।",
      "मैं {attributes} की रिपोर्ट लिख रहा हूँ और $n का अनुभव $p रहा।",
      "यहाँ दायरा {attributes} है और $n का अनुभव $p रहा।",
      "मैंने नोट {attributes} तक रखा और $n का अनुभव $p रहा।",
      "असली मुद्दा {attributes} है और $n का अनुभव $p रहा।",
      "जिस लाइन पर मैं टिकूँगा वह {attributes} है और $n का अनुभव $p रहा।",
      "मैं {attributes} के अंदर रहा और $n का अनुभव $p रहा।",
      "{attributes} ने मेरा मत तय किया और $n का अनुभव $p रहा।",
    ],
    friendly: [
      "मैं {attributes} की बात करूँगा और $n का अनुभव $p रहा।",
      "इस बार बात {attributes} पर रखता हूँ और $n का अनुभव $p रहा।",
      "मैं {attributes} बताने आया और $n का अनुभव $p रहा।",
      "मैं {attributes} पर अटका रहा और $n का अनुभव $p रहा।",
      "मेरा मतलब {attributes} है और $n का अनुभव $p रहा।",
      "इसे {attributes} के लिए पढ़ें और $n का अनुभव $p रहा।",
      "मैं {attributes} के साथ हूँ और $n का अनुभव $p रहा।",
      "{attributes} ने मन बना दिया और $n का अनुभव $p रहा।",
    ],
    simple: [
      "मैं यहाँ {attributes} की बात करता हूँ और $n का अनुभव $p रहा।",
      "यह {attributes} के बारे में है और $n का अनुभव $p रहा।",
      "मेरा मतलब {attributes} है और $n का अनुभव $p रहा।",
      "यहाँ सिर्फ {attributes} मायने रखता है और $n का अनुभव $p रहा।",
      "इस नोट में {attributes} पढ़ें और $n का अनुभव $p रहा।",
      "{attributes} मेरी बात है और $n का अनुभव $p रहा।",
      "मैं {attributes} पर टिका हूँ और $n का अनुभव $p रहा।",
      "इसे {attributes} पर आँकें और $n का अनुभव $p रहा।",
    ],
  },
  hinglish: {
    natural: [
      "Meri baat {attributes} par hai aur $n ka experience $p raha.",
      "Main {attributes} ke baare mein likh raha hoon aur $n ka experience $p raha.",
      "Is visit ka mudda {attributes} hai aur $n ka experience $p raha.",
      "Main {attributes} tak raha aur $n ka experience $p raha.",
      "Imaandar hissa {attributes} hai aur $n ka experience $p raha.",
      "Ek line maayne rakhe to woh {attributes} hai aur $n ka experience $p raha.",
      "Main {attributes} se aage nahi gaya aur $n ka experience $p raha.",
      "Visit {attributes} se tay hui aur $n ka experience $p raha.",
    ],
    professional: [
      "Yeh assessment {attributes} par hai aur $n ka experience $p raha.",
      "Main {attributes} ki report likh raha hoon aur $n ka experience $p raha.",
      "Yahan daayra {attributes} hai aur $n ka experience $p raha.",
      "Maine note {attributes} tak rakha aur $n ka experience $p raha.",
      "Asli mudda {attributes} hai aur $n ka experience $p raha.",
      "Jis line par main tikunga woh {attributes} hai aur $n ka experience $p raha.",
      "Main {attributes} ke andar raha aur $n ka experience $p raha.",
      "{attributes} ne mera mat tay kiya aur $n ka experience $p raha.",
    ],
    friendly: [
      "Main {attributes} ki baat karunga aur $n ka experience $p raha.",
      "Is baar baat {attributes} par rakhta hoon aur $n ka experience $p raha.",
      "Main {attributes} batane aaya aur $n ka experience $p raha.",
      "Main {attributes} par atka raha aur $n ka experience $p raha.",
      "Mera matlab {attributes} hai aur $n ka experience $p raha.",
      "Ise {attributes} ke liye padhein aur $n ka experience $p raha.",
      "Main {attributes} ke saath hoon aur $n ka experience $p raha.",
      "{attributes} ne mann bana diya aur $n ka experience $p raha.",
    ],
    simple: [
      "Main yahan {attributes} ki baat karta hoon aur $n ka experience $p raha.",
      "Yeh {attributes} ke baare mein hai aur $n ka experience $p raha.",
      "Mera matlab {attributes} hai aur $n ka experience $p raha.",
      "Yahan sirf {attributes} maayne rakhta hai aur $n ka experience $p raha.",
      "Is note mein {attributes} padhein aur $n ka experience $p raha.",
      "{attributes} meri baat hai aur $n ka experience $p raha.",
      "Main {attributes} par tika hoon aur $n ka experience $p raha.",
      "Ise {attributes} par aankein aur $n ka experience $p raha.",
    ],
  },
};

const closes: Record<ReviewLanguage, Record<ReviewTone, Record<RatingBand, string[]>>> = {
  en: {
    natural: {
      high: [
        "I would come back for the $n, which was $p.",
        "The $n is why I would return, and it was $p.",
        "I left happy with the $n, which was $p.",
        "Next time I will ask for the $n again, because it was $p.",
        "The $n earned a second visit, and it was $p.",
        "I walked out pleased about the $n, which was $p.",
        "Friends will hear about the $n, which was $p.",
        "The $n is a strong reason to return, and it was $p.",
      ],
      mid: [
        "I might return for the $n if I am nearby, though it was $p.",
        "The $n kept the visit in the middle, and it was $p.",
        "I left unsure about the $n, which was $p.",
        "The $n would not decide my next visit, because it was $p.",
        "I can take or leave the $n, which was $p.",
        "Another visit would need more than the $n, which was $p.",
        "The $n was only a fair part of this, and it was $p.",
        "I would not rush back for the $n, which was $p.",
      ],
      low: [
        "I would not come back for the $n, which was $p.",
        "The $n is why I would skip a return, and it was $p.",
        "I left unhappy with the $n, which was $p.",
        "Next time I will not ask for the $n, because it was $p.",
        "The $n cost this visit, and it was $p.",
        "I walked out disappointed about the $n, which was $p.",
        "Friends will hear a warning about the $n, which was $p.",
        "The $n is a strong reason to stay away, and it was $p.",
      ],
    },
    professional: {
      high: [
        "I would recommend returning for the $n, which was $p.",
        "The $n justifies another visit, and it was $p.",
        "I left satisfied with the $n, which was $p.",
        "A future visit would be for the $n, which was $p.",
        "The $n met a standard I would endorse, and it was $p.",
        "I can support another visit because the $n was $p.",
        "The $n is the point I would cite, and it was $p.",
        "My recommendation rests on the $n, which was $p.",
      ],
      mid: [
        "I might consider a return for the $n, though it was $p.",
        "The $n leaves the case open, and it was $p.",
        "I left undecided about the $n, which was $p.",
        "A future visit is not settled by the $n, which was $p.",
        "The $n is only adequate grounds, and it was $p.",
        "I would not book solely for the $n, which was $p.",
        "The record on the $n is mixed, and it was $p.",
        "My view stays neutral on the $n, which was $p.",
      ],
      low: [
        "I would not recommend returning for the $n, which was $p.",
        "The $n argues against another visit, and it was $p.",
        "I left dissatisfied with the $n, which was $p.",
        "A future visit should not be for the $n, which was $p.",
        "The $n fell short of a standard I would endorse, and it was $p.",
        "I cannot support another visit because the $n was $p.",
        "The $n is the point I would warn about, and it was $p.",
        "My advice is to avoid the $n, which was $p.",
      ],
    },
    friendly: {
      high: [
        "I would happily come back for the $n, which was $p.",
        "The $n made me want to return, and it was $p.",
        "I left with a smile about the $n, which was $p.",
        "I already want the $n again, because it was $p.",
        "The $n is the bit I will praise, and it was $p.",
        "Coming back for the $n would be easy, since it was $p.",
        "I felt glad about the $n, which was $p.",
        "The $n is what I will remember fondly, and it was $p.",
      ],
      mid: [
        "I might pop back for the $n, though it was $p.",
        "The $n left me on the fence, and it was $p.",
        "I left shrugging about the $n, which was $p.",
        "I do not yet want the $n again, because it was $p.",
        "The $n is only a maybe, and it was $p.",
        "Coming back for the $n is not automatic, since it was $p.",
        "I felt so-so about the $n, which was $p.",
        "The $n is what I will remember as ordinary, and it was $p.",
      ],
      low: [
        "I will not come back for the $n, which was $p.",
        "The $n made me want to skip a return, and it was $p.",
        "I left without a smile about the $n, which was $p.",
        "I do not want the $n again, because it was $p.",
        "The $n is the bit I will not praise, and it was $p.",
        "Coming back for the $n would be hard, since it was $p.",
        "I felt let down about the $n, which was $p.",
        "The $n is what I will remember poorly, and it was $p.",
      ],
    },
    simple: {
      high: [
        "I will come again for the $n, which was $p.",
        "The $n is good enough to repeat, and it was $p.",
        "I left happy about the $n, which was $p.",
        "I want the $n again, because it was $p.",
        "The $n is why I will return, and it was $p.",
        "I liked the visit for the $n, which was $p.",
        "The $n worked for me, and it was $p.",
        "I would choose the $n again, because it was $p.",
      ],
      mid: [
        "I may come again for the $n, though it was $p.",
        "The $n is only fair to repeat, and it was $p.",
        "I left unsure about the $n, which was $p.",
        "I do not need the $n again, because it was $p.",
        "The $n is not why I will return, and it was $p.",
        "The visit was just fair on the $n, which was $p.",
        "The $n did not stand out, and it was $p.",
        "I might choose the $n again, because it was $p.",
      ],
      low: [
        "I will not come again for the $n, which was $p.",
        "The $n is not good enough to repeat, and it was $p.",
        "I left sad about the $n, which was $p.",
        "I do not want the $n again, because it was $p.",
        "The $n is why I will not return, and it was $p.",
        "I did not like the visit for the $n, which was $p.",
        "The $n did not work for me, and it was $p.",
        "I would not choose the $n again, because it was $p.",
      ],
    },
  },
  hi: {
    natural: {
      high: [
        "मैं $n के लिए दोबारा आना चाहूँगा क्योंकि अनुभव $p रहा।",
        "$n की वजह से लौटना बनता है क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर संतुष्ट निकला क्योंकि अनुभव $p रहा।",
        "अगली बार फिर $n लूँगा क्योंकि अनुभव $p रहा।",
        "$n ने दूसरी विज़िट कमाई क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर प्रसन्न गया क्योंकि अनुभव $p रहा।",
        "दोस्त $n के बारे में सुनेंगे क्योंकि अनुभव $p रहा।",
        "$n लौटने की ठोस वजह है क्योंकि अनुभव $p रहा।",
      ],
      mid: [
        "पास हुआ तो $n के लिए आ सकता हूँ क्योंकि अनुभव $p रहा।",
        "$n ने विज़िट को बीच में रखा क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर अनिश्चित निकला क्योंकि अनुभव $p रहा।",
        "$n अगली विज़िट तय नहीं करेगा क्योंकि अनुभव $p रहा।",
        "$n चले या न चले दोनों चलेंगे क्योंकि अनुभव $p रहा।",
        "अगली विज़िट के लिए $n से ज़्यादा चाहिए क्योंकि अनुभव $p रहा।",
        "$n इस बार का सामान्य हिस्सा रहा क्योंकि अनुभव $p रहा।",
        "मैं $n के लिए जल्दी नहीं लौटूँगा क्योंकि अनुभव $p रहा।",
      ],
      low: [
        "मैं $n के लिए दोबारा नहीं आना चाहूँगा क्योंकि अनुभव $p रहा।",
        "$n की वजह से लौटना नहीं बनता क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर नाखुश निकला क्योंकि अनुभव $p रहा।",
        "अगली बार $n नहीं लूँगा क्योंकि अनुभव $p रहा।",
        "$n ने इस विज़िट को गिराया क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर निराश गया क्योंकि अनुभव $p रहा।",
        "दोस्तों को $n की चेतावनी दूँगा क्योंकि अनुभव $p रहा।",
        "$n दूर रहने की ठोस वजह है क्योंकि अनुभव $p रहा।",
      ],
    },
    professional: {
      high: [
        "मैं $n के लिए वापसी की सलाह दूँगा क्योंकि अनुभव $p रहा।",
        "$n दूसरी विज़िट को उचित ठहराता है क्योंकि अनुभव $p रहा।",
        "मैं $n से संतुष्ट रहा क्योंकि अनुभव $p रहा।",
        "आगे की विज़िट $n के लिए होगी क्योंकि अनुभव $p रहा।",
        "$n उस स्तर पर रहा जिसकी मैं हिमायत करूँ क्योंकि अनुभव $p रहा।",
        "मैं दूसरी विज़िट का समर्थन कर सकता हूँ क्योंकि $n का अनुभव $p रहा।",
        "$n वह बात है जिसे मैं उद्धृत करूँगा क्योंकि अनुभव $p रहा।",
        "मेरी सिफारिश $n पर टिकी है क्योंकि अनुभव $p रहा।",
      ],
      mid: [
        "मैं $n के लिए वापसी पर विचार कर सकता हूँ क्योंकि अनुभव $p रहा।",
        "$n मामला खुला छोड़ता है क्योंकि अनुभव $p रहा।",
        "मैं $n पर अनिर्णय के साथ निकला क्योंकि अनुभव $p रहा।",
        "आगे की विज़िट $n से तय नहीं होती क्योंकि अनुभव $p रहा।",
        "$n सिर्फ पर्याप्त आधार है क्योंकि अनुभव $p रहा।",
        "मैं सिर्फ $n के लिए बुकिंग नहीं करूँगा क्योंकि अनुभव $p रहा।",
        "$n का रिकॉर्ड मिला-जुला है क्योंकि अनुभव $p रहा।",
        "$n पर मेरा मत तटस्थ है क्योंकि अनुभव $p रहा।",
      ],
      low: [
        "मैं $n के लिए वापसी की सलाह नहीं दूँगा क्योंकि अनुभव $p रहा।",
        "$n दूसरी विज़िट के खिलाफ है क्योंकि अनुभव $p रहा।",
        "मैं $n से असंतुष्ट रहा क्योंकि अनुभव $p रहा।",
        "आगे की विज़िट $n के लिए नहीं होनी चाहिए क्योंकि अनुभव $p रहा।",
        "$n उस स्तर से नीचे रहा जिसकी मैं हिमायत करूँ क्योंकि अनुभव $p रहा।",
        "मैं दूसरी विज़िट का समर्थन नहीं कर सकता क्योंकि $n का अनुभव $p रहा।",
        "$n वह बात है जिसके लिए मैं चेताऊँगा क्योंकि अनुभव $p रहा।",
        "मेरी सलाह $n से बचने की है क्योंकि अनुभव $p रहा।",
      ],
    },
    friendly: {
      high: [
        "मैं $n के लिए खुशी से लौटूँगा क्योंकि अनुभव $p रहा।",
        "$n ने लौटने का मन बनाया क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर मुस्कुराता निकला क्योंकि अनुभव $p रहा।",
        "मुझे $n फिर से चाहिए क्योंकि अनुभव $p रहा।",
        "$n वह हिस्सा है जिसकी तारीफ करूँगा क्योंकि अनुभव $p रहा।",
        "$n के लिए लौटना आसान होगा क्योंकि अनुभव $p रहा।",
        "मुझे $n से खुशी हुई क्योंकि अनुभव $p रहा।",
        "$n वह चीज़ है जो प्यार से याद रहेगी क्योंकि अनुभव $p रहा।",
      ],
      mid: [
        "शायद $n के लिए फिर आऊँ क्योंकि अनुभव $p रहा।",
        "$n ने मुझे बीच में छोड़ा क्योंकि अनुभव $p रहा।",
        "मैं $n पर कंधे उचका कर निकला क्योंकि अनुभव $p रहा।",
        "अभी $n फिर नहीं चाहिए क्योंकि अनुभव $p रहा।",
        "$n सिर्फ एक शायद है क्योंकि अनुभव $p रहा।",
        "$n के लिए लौटना अपने आप नहीं होगा क्योंकि अनुभव $p रहा।",
        "$n पर मन ठंडा-गरम रहा क्योंकि अनुभव $p रहा।",
        "$n साधारण याद रहेगा क्योंकि अनुभव $p रहा।",
      ],
      low: [
        "मैं $n के लिए नहीं लौटूँगा क्योंकि अनुभव $p रहा।",
        "$n ने लौटने का मन काट दिया क्योंकि अनुभव $p रहा।",
        "मैं $n पर बिना मुस्कान के निकला क्योंकि अनुभव $p रहा।",
        "मुझे $n फिर नहीं चाहिए क्योंकि अनुभव $p रहा।",
        "$n वह हिस्सा है जिसकी तारीफ नहीं करूँगा क्योंकि अनुभव $p रहा।",
        "$n के लिए लौटना कठिन होगा क्योंकि अनुभव $p रहा।",
        "$n ने निराश किया क्योंकि अनुभव $p रहा।",
        "$n बुरी तरह याद रहेगा क्योंकि अनुभव $p रहा।",
      ],
    },
    simple: {
      high: [
        "मैं $n के लिए फिर आऊँगा क्योंकि अनुभव $p रहा।",
        "$n दोहराने लायक अच्छा है क्योंकि अनुभव $p रहा।",
        "मैं $n से खुश निकला क्योंकि अनुभव $p रहा।",
        "मुझे $n फिर चाहिए क्योंकि अनुभव $p रहा।",
        "$n ही लौटने की वजह है क्योंकि अनुभव $p रहा।",
        "विज़िट $n की वजह से अच्छी लगी क्योंकि अनुभव $p रहा।",
        "$n मेरे काम आया क्योंकि अनुभव $p रहा।",
        "मैं $n फिर चुनूँगा क्योंकि अनुभव $p रहा।",
      ],
      mid: [
        "मैं $n के लिए शायद आऊँ क्योंकि अनुभव $p रहा।",
        "$n दोहराना सिर्फ ठीक है क्योंकि अनुभव $p रहा।",
        "मैं $n को लेकर असमंजस में निकला क्योंकि अनुभव $p रहा।",
        "मुझे $n फिर ज़रूरी नहीं क्योंकि अनुभव $p रहा।",
        "$n लौटने की वजह नहीं है क्योंकि अनुभव $p रहा।",
        "विज़िट $n पर बस ठीक रही क्योंकि अनुभव $p रहा।",
        "$n अलग नहीं दिखा क्योंकि अनुभव $p रहा।",
        "मैं $n शायद फिर चुनूँ क्योंकि अनुभव $p रहा।",
      ],
      low: [
        "मैं $n के लिए फिर नहीं आऊँगा क्योंकि अनुभव $p रहा।",
        "$n दोहराने लायक अच्छा नहीं है क्योंकि अनुभव $p रहा।",
        "मैं $n से उदास निकला क्योंकि अनुभव $p रहा।",
        "मुझे $n फिर नहीं चाहिए क्योंकि अनुभव $p रहा।",
        "$n ही न लौटने की वजह है क्योंकि अनुभव $p रहा।",
        "विज़िट $n की वजह से अच्छी नहीं लगी क्योंकि अनुभव $p रहा।",
        "$n मेरे काम नहीं आया क्योंकि अनुभव $p रहा।",
        "मैं $n फिर नहीं चुनूँगा क्योंकि अनुभव $p रहा।",
      ],
    },
  },
  hinglish: {
    natural: {
      high: [
        "Main $n ke liye dobara aana chahunga kyunki experience $p raha.",
        "$n ki wajah se lautna banta hai kyunki experience $p raha.",
        "Main $n ko lekar santusht nikla kyunki experience $p raha.",
        "Agli baar phir $n lunga kyunki experience $p raha.",
        "$n ne doosri visit kamai kyunki experience $p raha.",
        "Main $n ko lekar prasann gaya kyunki experience $p raha.",
        "Dost $n ke baare mein sunenge kyunki experience $p raha.",
        "$n lautne ki solid wajah hai kyunki experience $p raha.",
      ],
      mid: [
        "Paas hua to $n ke liye aa sakta hoon kyunki experience $p raha.",
        "$n ne visit ko beech mein rakha kyunki experience $p raha.",
        "Main $n ko lekar anishchit nikla kyunki experience $p raha.",
        "$n agli visit tay nahi karega kyunki experience $p raha.",
        "$n chale ya na chale dono chalega kyunki experience $p raha.",
        "Agli visit ke liye $n se zyada chahiye kyunki experience $p raha.",
        "$n is baar ka sadharan hissa raha kyunki experience $p raha.",
        "Main $n ke liye jaldi nahi lautunga kyunki experience $p raha.",
      ],
      low: [
        "Main $n ke liye dobara nahi aana chahunga kyunki experience $p raha.",
        "$n ki wajah se lautna nahi banta kyunki experience $p raha.",
        "Main $n ko lekar nakhush nikla kyunki experience $p raha.",
        "Agli baar $n nahi lunga kyunki experience $p raha.",
        "$n ne is visit ko gira diya kyunki experience $p raha.",
        "Main $n ko lekar nirash gaya kyunki experience $p raha.",
        "Doston ko $n ki warning dunga kyunki experience $p raha.",
        "$n door rehne ki solid wajah hai kyunki experience $p raha.",
      ],
    },
    professional: {
      high: [
        "Main $n ke liye wapsi ki salah dunga kyunki experience $p raha.",
        "$n doosri visit ko uchit thahrata hai kyunki experience $p raha.",
        "Main $n se santusht raha kyunki experience $p raha.",
        "Aage ki visit $n ke liye hogi kyunki experience $p raha.",
        "$n us level par raha jiski main himayat karun kyunki experience $p raha.",
        "Main doosri visit ka samarthan kar sakta hoon kyunki $n ka experience $p raha.",
        "$n woh baat hai jise main quote karunga kyunki experience $p raha.",
        "Meri sifarish $n par tiki hai kyunki experience $p raha.",
      ],
      mid: [
        "Main $n ke liye wapsi par vichar kar sakta hoon kyunki experience $p raha.",
        "$n mamla khula chhodta hai kyunki experience $p raha.",
        "Main $n par anirnay ke saath nikla kyunki experience $p raha.",
        "Aage ki visit $n se tay nahi hoti kyunki experience $p raha.",
        "$n sirf paryapt aadhar hai kyunki experience $p raha.",
        "Main sirf $n ke liye booking nahi karunga kyunki experience $p raha.",
        "$n ka record mila-jula hai kyunki experience $p raha.",
        "$n par mera mat tatsth hai kyunki experience $p raha.",
      ],
      low: [
        "Main $n ke liye wapsi ki salah nahi dunga kyunki experience $p raha.",
        "$n doosri visit ke khilaf hai kyunki experience $p raha.",
        "Main $n se asantusht raha kyunki experience $p raha.",
        "Aage ki visit $n ke liye nahi honi chahiye kyunki experience $p raha.",
        "$n us level se neeche raha jiski main himayat karun kyunki experience $p raha.",
        "Main doosri visit ka samarthan nahi kar sakta kyunki $n ka experience $p raha.",
        "$n woh baat hai jiske liye main chetaunga kyunki experience $p raha.",
        "Meri salah $n se bachne ki hai kyunki experience $p raha.",
      ],
    },
    friendly: {
      high: [
        "Main $n ke liye khushi se lautunga kyunki experience $p raha.",
        "$n ne lautne ka mann banaya kyunki experience $p raha.",
        "Main $n ko lekar muskurata nikla kyunki experience $p raha.",
        "Mujhe $n phir se chahiye kyunki experience $p raha.",
        "$n woh hissa hai jiski tareef karunga kyunki experience $p raha.",
        "$n ke liye lautna aasan hoga kyunki experience $p raha.",
        "Mujhe $n se khushi hui kyunki experience $p raha.",
        "$n woh cheez hai jo pyaar se yaad rahegi kyunki experience $p raha.",
      ],
      mid: [
        "Shayad $n ke liye phir aaun kyunki experience $p raha.",
        "$n ne mujhe beech mein chhoda kyunki experience $p raha.",
        "Main $n par kandhe uchka kar nikla kyunki experience $p raha.",
        "Abhi $n phir nahi chahiye kyunki experience $p raha.",
        "$n sirf ek shayad hai kyunki experience $p raha.",
        "$n ke liye lautna apne aap nahi hoga kyunki experience $p raha.",
        "$n par mann thanda-garam raha kyunki experience $p raha.",
        "$n sadharan yaad rahega kyunki experience $p raha.",
      ],
      low: [
        "Main $n ke liye nahi lautunga kyunki experience $p raha.",
        "$n ne lautne ka mann kaat diya kyunki experience $p raha.",
        "Main $n par bina muskan ke nikla kyunki experience $p raha.",
        "Mujhe $n phir nahi chahiye kyunki experience $p raha.",
        "$n woh hissa hai jiski tareef nahi karunga kyunki experience $p raha.",
        "$n ke liye lautna kathin hoga kyunki experience $p raha.",
        "$n ne nirash kiya kyunki experience $p raha.",
        "$n buri tarah yaad rahega kyunki experience $p raha.",
      ],
    },
    simple: {
      high: [
        "Main $n ke liye phir aaunga kyunki experience $p raha.",
        "$n doharane layak accha hai kyunki experience $p raha.",
        "Main $n se khush nikla kyunki experience $p raha.",
        "Mujhe $n phir chahiye kyunki experience $p raha.",
        "$n hi lautne ki wajah hai kyunki experience $p raha.",
        "Visit $n ki wajah se acchi lagi kyunki experience $p raha.",
        "$n mere kaam aaya kyunki experience $p raha.",
        "Main $n phir choosunga kyunki experience $p raha.",
      ],
      mid: [
        "Main $n ke liye shayad aaun kyunki experience $p raha.",
        "$n doharana sirf theek hai kyunki experience $p raha.",
        "Main $n ko lekar asmanjas mein nikla kyunki experience $p raha.",
        "Mujhe $n phir zaroori nahi kyunki experience $p raha.",
        "$n lautne ki wajah nahi hai kyunki experience $p raha.",
        "Visit $n par bas theek rahi kyunki experience $p raha.",
        "$n alag nahi dikha kyunki experience $p raha.",
        "Main $n shayad phir choon kyunki experience $p raha.",
      ],
      low: [
        "Main $n ke liye phir nahi aaunga kyunki experience $p raha.",
        "$n doharane layak accha nahi hai kyunki experience $p raha.",
        "Main $n se udas nikla kyunki experience $p raha.",
        "Mujhe $n phir nahi chahiye kyunki experience $p raha.",
        "$n hi na lautne ki wajah hai kyunki experience $p raha.",
        "Visit $n ki wajah se acchi nahi lagi kyunki experience $p raha.",
        "$n mere kaam nahi aaya kyunki experience $p raha.",
        "Main $n phir nahi choosunga kyunki experience $p raha.",
      ],
    },
  },
};

function compile(pattern: string) {
  return (slots: Slots) => pattern.replaceAll("$o", slots.o).replaceAll("$n", slots.n).replaceAll("$p", slots.p);
}

function sentenceKey(sentence: string) {
  return sentence
    .toLowerCase()
    .replace(/[.!?।]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function materialize(
  pattern: string,
  lists: Lists,
  serial: number,
  seen: Set<string>,
  usedNouns: Set<string>,
) {
  const frame = compile(pattern);
  for (let salt = 0; salt < 160; salt += 1) {
    const noun = lists.n[(serial + salt * 3) % lists.n.length] ?? "";
    if (salt < lists.n.length && usedNouns.has(noun)) continue;
    const slots = {
      o: lists.o[(serial + salt) % lists.o.length] ?? "",
      n: noun,
      p: lists.p[(serial + salt * 5) % lists.p.length] ?? "",
    };
    const line = frame(slots)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^([a-z])/, (letter) => letter.toUpperCase());
    const pieces = splitSentences(line);
    if (pieces.length !== 1) continue;
    const key = sentenceKey(pieces[0] ?? "");
    if (key.length < 8 || seen.has(key) || line.includes("$")) continue;
    seen.add(key);
    usedNouns.add(noun);
    return line;
  }
  throw new Error(`Could not build a unique sentence for: ${pattern}`);
}

function shape(length: ReviewLength): Role[] {
  if (length === "short") return ["open", "detail", "attribute"];
  if (length === "medium") return ["open", "detail", "detail", "attribute", "close"];
  return ["open", "detail", "detail", "detail", "attribute", "close", "close"];
}

function patternsFor(language: ReviewLanguage, tone: ReviewTone, band: RatingBand, role: Role) {
  if (role === "open") return opens[language][tone];
  if (role === "detail") return details[language][tone];
  if (role === "attribute") return attributes[language][tone];
  return closes[language][tone][band];
}

export function buildUniqueCorpus() {
  const seen = new Set<string>();
  const rows: CorpusRow[] = [];
  for (const category of categories) {
    for (const language of LANGUAGES) {
      const copy = category[language];
      for (const tone of TONES) {
        for (const band of BANDS) {
          const lists = { o: copy.o, n: copy.n, p: praise[language][band] };
          const serial = { open: 0, detail: 0, attribute: 0, close: 0 };
          for (const length of LENGTHS) {
            for (let index = 0; index < PER_CELL; index += 1) {
              const usedNouns = new Set<string>();
              const local = { open: 0, detail: 0, attribute: 0, close: 0 };
              const parts: string[] = [];
              for (const role of shape(length)) {
                const frames = patternsFor(language, tone, band, role);
                const frame = frames[(index + local[role]) % frames.length] ?? "";
                local[role] += 1;
                const cursor = serial[role];
                serial[role] += 1;
                parts.push(materialize(frame, lists, cursor + index * 11, seen, usedNouns));
              }
              const content = parts.join(" ");
              rows.push({ slug: category.slug, language, tone, length, ratingBand: band, content });
            }
          }
        }
      }
    }
  }
  return rows;
}
