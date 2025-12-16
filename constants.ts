
import { Dealer, Vehicle, VehicleStatus, FuelType, Transmission, Customer, AiLog, DashboardStats } from './types';

// Mock Dealer Data (Authenticated User is 'D1')
export const CURRENT_USER_DEALER_ID = 'D1';

export const FEATURE_GROUPS = {
  "Güvenlik": [
    "ABS", "AEB", "ESP / VSA", "EBD", "TCS", "BAS", "Yokuş Kalkış Desteği", 
    "Şerit Takip Sistemi", "Kör Nokta Uyarı Sistemi", "Yorgunluk Tespit Sistemi", 
    "Hava Yastığı (Sürücü)", "Hava Yastığı (Yolcu)", "Hava Yastığı (Yan)", 
    "Isofix", "Merkezi Kilit", "Çocuk Kilidi", "Immobilizer"
  ],
  "İç Donanım": [
    "Deri Koltuk", "Kumaş Koltuk", "Elektrikli Camlar", "Klima (Dijital)", "Klima (Analog)",
    "Otm.Kararan Dikiz Aynası", "Ön Koltuk Kol Dayaması", "Anahtarsız Giriş ve Çalıştırma",
    "Fonksiyonel Direksiyon", "Isıtmalı Direksiyon", "Koltuklar (Elektrikli)", 
    "Koltuklar (Hafızalı)", "Koltuklar (Isıtmalı)", "Koltuklar (Soğutmalı)",
    "Hız Sabitleme Sistemi", "Start / Stop", "Geri Görüş Kamerası", "Head-up Display"
  ],
  "Dış Donanım": [
    "Sunroof", "Panoramik Cam Tavan", "Hardtop", "Far (LED)", "Far (Xenon)", 
    "Far (Adaptif)", "Sis Farı", "Aynalar (Elektrikli)", "Aynalar (Isıtmalı)", 
    "Aynalar (Katlanır)", "Park Sensörü (Arka)", "Park Sensörü (Ön)", 
    "Park Asistanı", "Alaşımlı Jant", "Yağmur Sensörü", "Arka Cam Buz Çözücü"
  ],
  "Multimedya": [
    "Radyo - CD Çalar", "Bluetooth", "USB / AUX", "Navigasyon", 
    "TV", "LCD Multimedya Ekran", "Apple CarPlay", "Android Auto", "Kablosuz Şarj"
  ]
};

export const DEALERS: Dealer[] = [
  {
    id: 'D1',
    name: 'OtoVizyon Merkez (Siz)',
    location: { lat: 41.0082, lng: 28.9784 }, // Istanbul Center
    address: 'Vatan Caddesi No:12, Fatih/İstanbul',
    phone: '+90 555 111 22 33',
    rating: 4.8
  },
  {
    id: 'D2',
    name: 'İstoç Mega Motors',
    location: { lat: 41.0667, lng: 28.8052 }, // İstoç Area
    address: 'İstoç Oto Ticaret Merkezi P Blok, Bağcılar',
    phone: '+90 555 444 55 66',
    rating: 4.5
  },
  {
    id: 'D3',
    name: 'Otocenter Elit Galeri',
    location: { lat: 41.0543, lng: 28.8687 }, // Otocenter Area
    address: 'Otocenter Galericiler Sitesi K Blok, Bağcılar',
    phone: '+90 532 999 88 77',
    rating: 4.9
  },
  {
    id: 'D4',
    name: 'Kadıköy Premium Auto',
    location: { lat: 40.9920, lng: 29.0430 }, // Kadıköy
    address: 'Fahrettin Kerim Gökay Cd., Kadıköy',
    phone: '+90 216 333 22 11',
    rating: 4.2
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'V1',
    dealerId: 'D1',
    title: "HATASIZ BOYASIZ İLK SAHİBİNDEN A3",
    category: 'Otomobil',
    brand: 'Audi',
    model: 'A3 Sedan 35 TFSI',
    series: 'Advanced',
    year: 2021,
    price: 1550000,
    b2bPrice: 1500000,
    mileage: 45000,
    fuel: FuelType.GASOLINE,
    transmission: Transmission.AUTOMATIC,
    status: VehicleStatus.FOR_SALE,
    images: ['https://picsum.photos/400/300?random=1'],
    tramer: 0,
    description: 'Hatasız boyasız, ilk sahibinden. Tüm bakımları yetkili serviste yapılmıştır.',
    bodyType: 'Sedan',
    enginePower: 150,
    engineVolume: 1498,
    traction: 'Önden Çekiş',
    color: 'Beyaz',
    warranty: true,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Fatih', neighborhood: 'Vatan Cd.' }
  },
  {
    id: 'V2',
    dealerId: 'D2',
    title: "2020 PASSAT ELEGANCE CAM TAVAN",
    category: 'Otomobil',
    brand: 'Volkswagen',
    model: 'Passat 1.5 TSI Elegance',
    series: 'Elegance',
    year: 2020,
    price: 1800000,
    b2bPrice: 1750000,
    mileage: 62000,
    fuel: FuelType.GASOLINE,
    transmission: Transmission.AUTOMATIC,
    status: VehicleStatus.CONSIGNMENT,
    images: ['https://picsum.photos/400/300?random=2'],
    tramer: 5000,
    description: 'Sol çamurluk lokal boyalı. Cam tavan.',
    bodyType: 'Sedan',
    enginePower: 150,
    engineVolume: 1498,
    traction: 'Önden Çekiş',
    color: 'Gri',
    warranty: false,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Bağcılar', neighborhood: 'İstoç' }
  },
  {
    id: 'V3',
    dealerId: 'D2',
    title: "BORUSAN ÇIKIŞLI 520i M SPORT",
    category: 'Otomobil',
    brand: 'BMW',
    model: '520i M Sport',
    series: 'M Sport',
    year: 2022,
    price: 3200000,
    b2bPrice: 3100000,
    mileage: 28000,
    fuel: FuelType.GASOLINE,
    transmission: Transmission.AUTOMATIC,
    status: VehicleStatus.CONSIGNMENT,
    images: ['https://picsum.photos/400/300?random=3'],
    tramer: 0,
    description: 'Borusan çıkışlı, vakumlu kapı.',
    bodyType: 'Sedan',
    enginePower: 170,
    engineVolume: 1597,
    traction: 'Arkadan İtiş',
    color: 'Siyah',
    warranty: true,
    heavyDamage: false,
    exchange: false,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Bağcılar', neighborhood: 'İstoç' }
  },
  {
    id: 'V4',
    dealerId: 'D3',
    title: "AMG PAKET C200d",
    category: 'Otomobil',
    brand: 'Mercedes-Benz',
    model: 'C 200 d AMG',
    series: 'AMG',
    year: 2019,
    price: 2100000,
    b2bPrice: 2050000,
    mileage: 85000,
    fuel: FuelType.DIESEL,
    transmission: Transmission.AUTOMATIC,
    status: VehicleStatus.CONSIGNMENT,
    images: ['https://picsum.photos/400/300?random=4'],
    tramer: 12000,
    description: 'Tüm bakımları yetkili serviste yapılmıştır.',
    bodyType: 'Sedan',
    enginePower: 160,
    engineVolume: 1597,
    traction: 'Arkadan İtiş',
    color: 'Beyaz',
    warranty: false,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Bağcılar', neighborhood: 'Otocenter' }
  },
  {
    id: 'V5',
    dealerId: 'D4',
    title: "EGEA CROSS 1.4 FIRE",
    category: 'Arazi, SUV & Pickup',
    brand: 'Fiat',
    model: 'Egea Cross 1.4 Fire',
    series: 'Street',
    year: 2023,
    price: 950000,
    b2bPrice: 920000,
    mileage: 15000,
    fuel: FuelType.GASOLINE,
    transmission: Transmission.MANUAL,
    status: VehicleStatus.CONSIGNMENT,
    images: ['https://picsum.photos/400/300?random=5'],
    tramer: 0,
    description: 'Sıfır ayarında, garantisi devam ediyor.',
    bodyType: 'SUV',
    enginePower: 95,
    engineVolume: 1368,
    traction: 'Önden Çekiş',
    color: 'Turuncu',
    warranty: true,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Fenerbahçe' }
  },
  {
    id: 'V6',
    dealerId: 'D1',
    title: "CLIO 1.0 TCE JOY",
    category: 'Otomobil',
    brand: 'Renault',
    model: 'Clio 1.0 TCe',
    series: 'Joy',
    year: 2021,
    price: 850000,
    mileage: 55000,
    fuel: FuelType.GASOLINE,
    transmission: Transmission.AUTOMATIC,
    status: VehicleStatus.SOLD,
    images: ['https://picsum.photos/400/300?random=6'],
    tramer: 3500,
    description: 'Şirket aracı olarak kullanıldı.',
    bodyType: 'Hatchback',
    enginePower: 100,
    engineVolume: 999,
    traction: 'Önden Çekiş',
    color: 'Kırmızı',
    warranty: false,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: 'İstanbul', district: 'Fatih', neighborhood: 'Vatan Cd.' }
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'C1',
    name: 'Ahmet Yılmaz',
    phone: '+90 532 123 45 67',
    email: 'ahmet.y@gmail.com',
    lastPurchaseDate: '2023-11-15',
    purchasedVehicleId: 'V6',
    notes: 'Kasko teklifi istiyor. Kış lastiği ihtiyacı var.'
  },
  {
    id: 'C2',
    name: 'Ayşe Demir',
    phone: '+90 544 234 56 78',
    lastPurchaseDate: '2023-01-20',
    notes: 'Ekspertiz raporunu dijital olarak arşivledik.'
  },
  {
    id: 'C3',
    name: 'Mehmet Öz',
    phone: '+90 555 987 65 43',
    email: 'mehmet.oz@kurumsal.com',
    notes: 'Filo kiralama için görüşüldü, takas teklif etti.'
  }
];

export const MOCK_AI_LOGS: AiLog[] = [
  {
    id: 'L1',
    customerName: 'Bilinmeyen (0533***)',
    platform: 'WhatsApp',
    query: '2021 Audi A3 için son fiyat nedir ve takas olur mu?',
    response: 'Merhaba! Audi A3 aracımız için liste fiyatımız 1.550.000 TL\'dir. Takas değerlendiriyoruz, aracınızın bilgilerini gönderirseniz ön değerlendirme yapabiliriz. (Otomatik Yanıt)',
    timestamp: '10:42',
    sentiment: 'Positive'
  },
  {
    id: 'L2',
    customerName: 'Hakan Bey',
    platform: 'WhatsApp',
    query: 'Aracın tramer kaydı ne kadar?',
    response: 'Veritabanı kontrol edildi: İlgilendiğiniz Passat aracının tramer kaydı 5.000 TL (Sol Çamurluk Boya) olarak görünmektedir.',
    timestamp: '09:15',
    sentiment: 'Neutral'
  },
  {
    id: 'L3',
    customerName: 'Selin Hanım',
    platform: 'Web',
    query: 'Haftasonu açık mısınız?',
    response: 'Evet, Cumartesi 09:00 - 18:00, Pazar 11:00 - 17:00 saatleri arasında hizmet veriyoruz. Kahveye bekleriz! ☕',
    timestamp: 'Dün 21:30',
    sentiment: 'Positive'
  }
];

export const DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 24500000,
  netProfit: 3200000,
  activeListings: 14,
  totalCustomers: 128,
  pendingInquiries: 5
};

export const MONTHLY_SALES_DATA = [
  { name: 'Oca', satis: 400000 },
  { name: 'Şub', satis: 300000 },
  { name: 'Mar', satis: 550000 },
  { name: 'Nis', satis: 450000 },
  { name: 'May', satis: 700000 },
  { name: 'Haz', satis: 900000 },
];
