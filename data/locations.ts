
// Bu veri yapısı sağladığınız JSON formatına göredir.
// Verinin tamamını buraya yapıştırarak listeyi genişletebilirsiniz.

const LOCATION_DATA = [
    {"name":"Adana","alpha_2_code":"TR-01","towns":[{"name":"Aladağ","districts":[{"name":"Karsantı","quarters":[{"name":"Mansurlu Mah."},{"name":"Sinanpaşa Mh."}]},{"name":"Köyler","quarters":[{"name":"Akören Mh."},{"name":"Akpınar Mh."},{"name":"Başpınar Mh."}]}]},{"name":"Ceyhan","districts":[{"name":"Çarşı","quarters":[{"name":"Aydemiroğlu Mh."},{"name":"Belediye Evleri Mah."}]}]}]},
    {"name":"Adıyaman","alpha_2_code":"TR-02","towns":[{"name":"Besni","districts":[{"name":"Merkez","quarters":[{"name":"Aşağısarhan Mh."}]}]}]},
    {"name":"Afyonkarahisar","alpha_2_code":"TR-03","towns":[{"name":"Merkez","districts":[{"name":"Merkez","quarters":[{"name":"Cumhuriyet Mah."}]}]}]},
    {"name":"Ağrı","alpha_2_code":"TR-04","towns":[{"name":"Doğubayazıt","districts":[{"name":"Merkez","quarters":[{"name":"Hürriyet Mh."}]}]}]},
    {"name":"Amasya","alpha_2_code":"TR-05","towns":[{"name":"Merzifon","districts":[{"name":"Merkez","quarters":[{"name":"Bahçelievler Mh."}]}]}]},
    {"name":"Ankara","alpha_2_code":"TR-06","towns":[{"name":"Çankaya","districts":[{"name":"Kızılay","quarters":[{"name":"Cumhuriyet Mah."}]}]},{"name":"Etimesgut","districts":[{"name":"Merkez","quarters":[{"name":"Eryaman Mah."}]}]}]},
    {"name":"Antalya","alpha_2_code":"TR-07","towns":[{"name":"Alanya","districts":[{"name":"Merkez","quarters":[{"name":"Saray Mah."}]}]},{"name":"Muratpaşa","districts":[{"name":"Lara","quarters":[{"name":"Çağlayan Mh."}]}]}]},
    {"name":"İstanbul","alpha_2_code":"TR-34","towns":[{"name":"Kadıköy","districts":[{"name":"Caddebostan","quarters":[{"name":"Caddebostan Mah."}]}]},{"name":"Beşiktaş","districts":[{"name":"Levent","quarters":[{"name":"Levent Mah."}]}]},{"name":"Bağcılar","districts":[{"name":"Güneşli","quarters":[{"name":"Güneşli Mh."},{"name":"15 Temmuz Mh."}]},{"name":"Mahmutbey","quarters":[{"name":"Mahmutbey Mah."}]}]}]},
    {"name":"İzmir","alpha_2_code":"TR-35","towns":[{"name":"Konak","districts":[{"name":"Alsancak","quarters":[{"name":"Alsancak Mah."}]}]},{"name":"Bornova","districts":[{"name":"Merkez","quarters":[{"name":"Erzene Mah."}]}]}]}
    // ... Buraya elinizdeki tüm JSON verisini yapıştırın.
] as const;

export interface City {
    name: string;
    alpha_2_code: string;
    towns: Town[];
}

export interface Town {
    name: string;
    districts: District[];
}

export interface District {
    name: string;
    quarters: Quarter[];
}

export interface Quarter {
    name: string;
}

// Tüm İlleri Getir
export const getCities = () => {
    return LOCATION_DATA.map(city => city.name).sort();
};

// Seçilen İle Göre İlçeleri Getir
export const getTowns = (cityName: string) => {
    const city = LOCATION_DATA.find(c => c.name === cityName);
    if (!city) return [];
    return city.towns.map(t => t.name).sort();
};

// Seçilen İlçe İçindeki Tüm Mahalleleri (Semt/District ayrımını düzleştirerek) Getir
export const getNeighborhoods = (cityName: string, townName: string) => {
    const city = LOCATION_DATA.find(c => c.name === cityName);
    if (!city) return [];
    
    const town = city.towns.find(t => t.name === townName);
    if (!town) return [];

    // JSON yapısında "town -> districts -> quarters" var.
    // Biz kullanıcıya direkt mahalleleri göstermek istiyoruz, bu yüzden ara katman olan "districts" (semt/bucak) dizilerini düzleştirip içindeki "quarters"ları topluyoruz.
    const allQuarters: string[] = [];
    
    town.districts.forEach(district => {
        district.quarters.forEach(quarter => {
            allQuarters.push(quarter.name);
        });
    });

    return [...new Set(allQuarters)].sort(); // Tekrarları kaldır ve sırala
};
