export type CatalogAttribute = {
  key: string;
  label: string;
  labelHi: string;
  labelHinglish: string;
};

export type CatalogCategory = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  welcomeMessage: string;
  attributes: CatalogAttribute[];
};

const shop: CatalogAttribute[] = [
  { key: "product-quality", label: "Product quality", labelHi: "प्रोडक्ट क्वालिटी", labelHinglish: "product quality" },
  { key: "staff-assistance", label: "Staff assistance", labelHi: "स्टाफ की मदद", labelHinglish: "staff assistance" },
  { key: "product-variety", label: "Product variety", labelHi: "प्रोडक्ट वैरायटी", labelHinglish: "product variety" },
  { key: "pricing", label: "Pricing", labelHi: "कीमत", labelHinglish: "pricing" },
  { key: "shopping-experience", label: "Shopping experience", labelHi: "खरीदारी का अनुभव", labelHinglish: "shopping experience" },
];

export const catalog: CatalogCategory[] = [
  {
    name: "Restaurant",
    slug: "restaurant",
    icon: "utensils",
    description: "Dining rooms, cloud kitchens, and food counters.",
    welcomeMessage: "How was your experience at our restaurant?",
    attributes: [
      { key: "food-quality", label: "Food quality", labelHi: "खाने की क्वालिटी", labelHinglish: "food quality" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "service-speed", label: "Service speed", labelHi: "सर्विस की स्पीड", labelHinglish: "service speed" },
      { key: "ambience", label: "Ambience", labelHi: "माहौल", labelHinglish: "ambience" },
      { key: "pricing", label: "Pricing", labelHi: "कीमत", labelHinglish: "pricing" },
    ],
  },
  {
    name: "Cafe",
    slug: "cafe",
    icon: "coffee",
    description: "Coffee shops and bakeries.",
    welcomeMessage: "How was your experience at our cafe?",
    attributes: [
      { key: "coffee-quality", label: "Coffee quality", labelHi: "कॉफी की क्वालिटी", labelHinglish: "coffee quality" },
      { key: "food-quality", label: "Food quality", labelHi: "खाने की क्वालिटी", labelHinglish: "food quality" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "ambience", label: "Ambience", labelHi: "माहौल", labelHinglish: "ambience" },
      { key: "service-speed", label: "Service speed", labelHi: "सर्विस की स्पीड", labelHinglish: "service speed" },
    ],
  },
  {
    name: "Hotel",
    slug: "hotel",
    icon: "hotel",
    description: "Hotels, guest houses, and stays.",
    welcomeMessage: "How was your stay with us?",
    attributes: [
      { key: "room-quality", label: "Room quality", labelHi: "कमरे की क्वालिटी", labelHinglish: "room quality" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "check-in", label: "Check-in experience", labelHi: "चेक-इन अनुभव", labelHinglish: "check-in experience" },
      { key: "location", label: "Location", labelHi: "लोकेशन", labelHinglish: "location" },
      { key: "value", label: "Value for money", labelHi: "पैसे की वैल्यू", labelHinglish: "value for money" },
    ],
  },
  {
    name: "Gym",
    slug: "gym",
    icon: "dumbbell",
    description: "Gyms and fitness studios.",
    welcomeMessage: "How was your experience at our gym?",
    attributes: [
      { key: "equipment", label: "Equipment quality", labelHi: "इक्विपमेंट क्वालिटी", labelHinglish: "equipment quality" },
      { key: "trainer", label: "Trainer behaviour", labelHi: "ट्रेनर का व्यवहार", labelHinglish: "trainer behaviour" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "environment", label: "Workout environment", labelHi: "वर्कआउट माहौल", labelHinglish: "workout environment" },
      { key: "membership", label: "Membership experience", labelHi: "मेंबरशिप अनुभव", labelHinglish: "membership experience" },
    ],
  },
  {
    name: "Salon",
    slug: "salon",
    icon: "scissors",
    description: "Salons and barber shops.",
    welcomeMessage: "How was your experience at our salon?",
    attributes: [
      { key: "haircut", label: "Haircut quality", labelHi: "हेयरकट क्वालिटी", labelHinglish: "haircut quality" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "hygiene", label: "Hygiene", labelHi: "हाइजीन", labelHinglish: "hygiene" },
      { key: "overall-service", label: "Overall service", labelHi: "कुल सर्विस", labelHinglish: "overall service" },
    ],
  },
  {
    name: "Retail Shop",
    slug: "retail-shop",
    icon: "store",
    description: "Neighbourhood retail shops.",
    welcomeMessage: "How was your experience at our shop?",
    attributes: shop,
  },
  {
    name: "Clothing Store",
    slug: "clothing-store",
    icon: "shirt",
    description: "Apparel and fashion stores.",
    welcomeMessage: "How was your shopping experience?",
    attributes: shop,
  },
  {
    name: "Medical Clinic",
    slug: "medical-clinic",
    icon: "stethoscope",
    description: "Clinics and consultation rooms.",
    welcomeMessage: "How was your visit to our clinic?",
    attributes: [
      { key: "consultation", label: "Doctor consultation", labelHi: "डॉक्टर कंसल्टेशन", labelHinglish: "doctor consultation" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "waiting-time", label: "Waiting time", labelHi: "इंतज़ार का समय", labelHinglish: "waiting time" },
      { key: "overall-care", label: "Overall care", labelHi: "कुल देखभाल", labelHinglish: "overall care" },
    ],
  },
  {
    name: "Dental Clinic",
    slug: "dental-clinic",
    icon: "smile",
    description: "Dental clinics.",
    welcomeMessage: "How was your visit to our dental clinic?",
    attributes: [
      { key: "treatment", label: "Treatment quality", labelHi: "ट्रीटमेंट क्वालिटी", labelHinglish: "treatment quality" },
      { key: "dentist", label: "Dentist behaviour", labelHi: "डेंटिस्ट का व्यवहार", labelHinglish: "dentist behaviour" },
      { key: "hygiene", label: "Hygiene", labelHi: "हाइजीन", labelHinglish: "hygiene" },
      { key: "waiting-time", label: "Waiting time", labelHi: "इंतज़ार का समय", labelHinglish: "waiting time" },
      { key: "overall-care", label: "Overall care", labelHi: "कुल देखभाल", labelHinglish: "overall care" },
    ],
  },
  {
    name: "Spa",
    slug: "spa",
    icon: "sparkles",
    description: "Spas and wellness studios.",
    welcomeMessage: "How was your experience at our spa?",
    attributes: [
      { key: "treatment", label: "Treatment quality", labelHi: "ट्रीटमेंट क्वालिटी", labelHinglish: "treatment quality" },
      { key: "therapist", label: "Therapist behaviour", labelHi: "थेरेपिस्ट का व्यवहार", labelHinglish: "therapist behaviour" },
      { key: "hygiene", label: "Hygiene", labelHi: "हाइजीन", labelHinglish: "hygiene" },
      { key: "ambience", label: "Ambience", labelHi: "माहौल", labelHinglish: "ambience" },
      { key: "relaxation", label: "Relaxation experience", labelHi: "आराम का अनुभव", labelHinglish: "relaxation experience" },
    ],
  },
  {
    name: "Shopping Store",
    slug: "shopping-store",
    icon: "shopping-bag",
    description: "Larger shopping stores.",
    welcomeMessage: "How was your shopping experience?",
    attributes: shop,
  },
  {
    name: "Service Business",
    slug: "service-business",
    icon: "wrench",
    description: "Local service businesses.",
    welcomeMessage: "How was the service you received?",
    attributes: [
      { key: "work-quality", label: "Work quality", labelHi: "काम की क्वालिटी", labelHinglish: "work quality" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "timeliness", label: "Timeliness", labelHi: "समय पर काम", labelHinglish: "timeliness" },
      { key: "communication", label: "Communication", labelHi: "बातचीत", labelHinglish: "communication" },
      { key: "pricing", label: "Pricing", labelHi: "कीमत", labelHinglish: "pricing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
    icon: "map-pin",
    description: "Any other local business.",
    welcomeMessage: "How was your experience with us?",
    attributes: [
      { key: "service-quality", label: "Service quality", labelHi: "सर्विस क्वालिटी", labelHinglish: "service quality" },
      { key: "staff-behaviour", label: "Staff behaviour", labelHi: "स्टाफ का व्यवहार", labelHinglish: "staff behaviour" },
      { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
      { key: "pricing", label: "Pricing", labelHi: "कीमत", labelHinglish: "pricing" },
      { key: "overall", label: "Overall experience", labelHi: "कुल अनुभव", labelHinglish: "overall experience" },
    ],
  },
];
