
/**
 * [MODÜL: VALIDASYON]
 * Amaç: Araç ekleme formunun veri bütünlüğünü doğrulamak.
 * Prensip: Pure Functions (Yan etkisi yoktur, test edilebilir).
 */

import { Vehicle } from '../types';

export const validateVehicleForm = (formData: Partial<Vehicle>) => {
  const errors: Record<string, string> = {};
  let firstErrorStep = 0;

  // --- Adım 1: Temel Bilgiler ---
  if (!formData.title || formData.title.length < 5) {
      errors.title = "Başlık en az 5 karakter olmalıdır.";
      if(!firstErrorStep) firstErrorStep = 1;
  }
  if (!formData.brand) { errors.brand = "Marka seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; }
  if (!formData.model) { errors.model = "Model seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; }
  if (!formData.series) { errors.series = "Seri / Paket seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; } // YENİ
  if (!formData.year) { errors.year = "Yıl seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; }
  
  // Cast to any to avoid "types 'number' and 'string' have no overlap" error since form state might hold strings temporarily
  if (formData.mileage === undefined || formData.mileage === null || (formData.mileage as any) === '') { 
      errors.mileage = "Kilometre zorunludur."; 
      if(!firstErrorStep) firstErrorStep = 1; 
  }
  
  if (!formData.color) { errors.color = "Renk seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; } // YENİ
  if (!formData.fromWho) { errors.fromWho = "Kimden bilgisi zorunludur."; if(!firstErrorStep) firstErrorStep = 1; } // YENİ

  // --- Adım 2: Teknik Özellikler ---
  if (!formData.bodyType) { 
      errors.bodyType = "Kasa tipi seçimi zorunludur."; 
      if(!firstErrorStep) firstErrorStep = 2; 
  }
  if (!formData.traction) { errors.traction = "Çekiş tipi zorunludur."; if(!firstErrorStep) firstErrorStep = 2; } // YENİ
  
  if (!formData.enginePower) { 
      errors.enginePower = "Motor gücü zorunludur."; 
      if(!firstErrorStep) firstErrorStep = 2; 
  }
  if (!formData.engineVolume) { errors.engineVolume = "Motor hacmi zorunludur."; if(!firstErrorStep) firstErrorStep = 2; } // YENİ
  
  if (!formData.fuel) { errors.fuel = "Yakıt tipi zorunludur."; if(!firstErrorStep) firstErrorStep = 2; } // YENİ
  if (!formData.transmission) { errors.transmission = "Vites tipi zorunludur."; if(!firstErrorStep) firstErrorStep = 2; } // YENİ

  // --- Adım 4: Medya ---
  if (!formData.images || formData.images.length === 0) { 
      errors.images = "En az 1 adet fotoğraf yüklemelisiniz."; 
      if(!firstErrorStep) firstErrorStep = 4;
  }

  // --- Adım 5: Fiyat ve Konum ---
  if (!formData.price) { 
      errors.price = "Satış fiyatı zorunludur."; 
      if(!firstErrorStep) firstErrorStep = 5;
  }
  
  if (!formData.location?.city) { errors['location.city'] = "İl seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 5; }
  if (!formData.location?.district) { errors['location.district'] = "İlçe seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 5; }
  if (!formData.location?.neighborhood) { errors['location.neighborhood'] = "Mahalle seçimi zorunludur."; if(!firstErrorStep) firstErrorStep = 5; } // YENİ

  return { isValid: Object.keys(errors).length === 0, errors, firstErrorStep };
};
