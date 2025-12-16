
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addBrand, addModel, addPackage } from '../store';
import { Vehicle, FuelType, Transmission, DamageStatus, ExpertiseReport, VehicleFeatures } from '../types';
import { FEATURE_GROUPS } from '../constants';
import { urlToBase64 } from '../lib/utils';

// Internal SVG ID Eşleşmesi
const EXPERTISE_MAPPING: Record<string, string> = {
    "Ön Tampon": "front-bumper", "Arka Tampon": "rear-bumper", 
    "Motor Kaputu": "hood", "Kaput": "hood", "Tavan": "roof",
    "Sağ Ön Çamurluk": "right-front-fender", "Sağ Ön Kapı": "right-front-door", 
    "Sağ Arka Kapı": "right-rear-door", "Sağ Arka Çamurluk": "right-rear-fender", 
    "Sol Ön Çamurluk": "left-front-fender", "Sol Ön Kapı": "left-front-door",
    "Sol Arka Kapı": "left-rear-door", "Sol Arka Çamurluk": "left-rear-fender", 
    "Bagaj Kapağı": "trunk", "Arka Kaput": "trunk", "Bagaj": "trunk"
};

interface UseVehicleImportProps {
    onDataReceived: (data: Partial<Vehicle>) => void;
}

export const useVehicleImport = ({ onDataReceived }: UseVehicleImportProps) => {
    const dispatch = useDispatch();
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState("");
    const [extensionDetected, setExtensionDetected] = useState(false);

    // Ortam Kontrolü (Eklenti veya Mobil WebView)
    useEffect(() => {
        const checkEnv = () => {
            const isDev = process.env.NODE_ENV === 'development';
            const isExtensionActive = document.getElementById('sahibinden-extension-active');
            // WebView tespiti için userAgent kontrolü veya window.ReactNativeWebView kontrolü yapılabilir.
            // Şimdilik basitçe mobil cihaz ise veya eklenti varsa "Detected" diyoruz.
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isExtensionActive || isDev || isMobile) {
                setExtensionDetected(true);
            }
        };
        
        // İlk yüklemede ve periyodik olarak kontrol et (Eklentiler bazen geç yüklenir)
        checkEnv();
        const interval = setInterval(checkEnv, 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper: Sayısal veri temizleme
    const parseNumber = (val: string | number | undefined): number => {
        if (!val) return 0;
        return Number(val.toString().replace(/[^0-9]/g, ''));
    };

    // Veri İşleme (Mapping) Fonksiyonu
    const processImportedData = useCallback(async (inputData: any, platform: string) => {
        const rawData = Array.isArray(inputData) ? inputData[0] : inputData;
        const result: Partial<Vehicle> = {
            images: [], features: {}, expertise: {},
            location: { city: '', district: '', neighborhood: '' }
        };

        // 1. Temel Bilgiler
        if (rawData.title) result.title = rawData.title.substring(0, 60);
        if (rawData.price) result.price = parseNumber(rawData.price);
        
        const info = { ...(rawData.short_info || {}), ...(rawData.technical_specs || {}) };

        if (info['Marka']) { result.brand = info['Marka']; dispatch(addBrand(info['Marka'])); }
        if (info['Model']) { result.model = info['Model']; dispatch(addModel(info['Model'])); }
        if (info['Seri']) { result.series = info['Seri']; dispatch(addPackage(info['Seri'])); }
        if (info['Yıl']) result.year = parseNumber(info['Yıl']);
        if (info['KM']) result.mileage = parseNumber(info['KM']);

        // Enum Eşleşmeleri
        const rawFuel = (info['Yakıt Tipi'] || info['Yakıt'] || '').toLowerCase();
        if (rawFuel.includes('dizel')) result.fuel = FuelType.DIESEL;
        else if (rawFuel.includes('benzin')) result.fuel = FuelType.GASOLINE;
        else if (rawFuel.includes('hibrit') || rawFuel.includes('hybrid')) result.fuel = FuelType.HYBRID;
        else if (rawFuel.includes('elektrik')) result.fuel = FuelType.ELECTRIC;
        else result.fuel = FuelType.GASOLINE;

        const rawGear = (info['Vites'] || info['Vites Tipi'] || '').toLowerCase();
        result.transmission = (rawGear.includes('otomatik') || rawGear.includes('dsg')) 
            ? Transmission.AUTOMATIC : Transmission.MANUAL;

        // Diğer Alanlar
        if (info['Kasa Tipi']) result.bodyType = info['Kasa Tipi'];
        if (info['Motor Gücü']) result.enginePower = parseNumber(info['Motor Gücü']);
        if (info['Motor Hacmi']) result.engineVolume = parseNumber(info['Motor Hacmi']);
        if (info['Çekiş']) result.traction = info['Çekiş'];
        if (info['Renk']) result.color = info['Renk'];
        if (info['Garanti']) result.warranty = info['Garanti']?.toLowerCase() === 'evet';
        
        const kimden = (info['Kimden'] || '').toLowerCase();
        result.fromWho = kimden.includes('sahibinden') ? 'Sahibinden' : kimden.includes('yetkili') ? 'Yetkili Bayiden' : 'Galeriden';

        // Konum
        if (rawData.location) {
            const parts = rawData.location.split(/[\/,]/).map((s: string) => s.trim());
            if (parts.length >= 1) result.location!.city = parts[0];
            if (parts.length >= 2) result.location!.district = parts[1];
            if (parts.length >= 3) result.location!.neighborhood = parts[2];
        }

        if (rawData.description) result.description = rawData.description;

        // Özellikler
        if (rawData.features) {
            const newFeatures: VehicleFeatures = {};
            Object.keys(FEATURE_GROUPS).forEach(systemGroup => {
                newFeatures[systemGroup] = {};
                const incomingGroupData = rawData.features[systemGroup] || {};
                FEATURE_GROUPS[systemGroup].forEach(featureName => {
                    if (incomingGroupData[featureName] === true) {
                        newFeatures[systemGroup][featureName] = true;
                    }
                });
            });
            result.features = newFeatures;
        }

        // Ekspertiz
        if (rawData.expertise) {
            const newExpertise: ExpertiseReport = {};
            const processExp = (list: string[], status: DamageStatus) => {
                if (!Array.isArray(list)) return;
                list.forEach(part => {
                    const mappedId = EXPERTISE_MAPPING[part];
                    if (mappedId) newExpertise[mappedId] = status;
                });
            };
            if (rawData.expertise['Boyalı']) processExp(rawData.expertise['Boyalı'], DamageStatus.PAINTED);
            if (rawData.expertise['Lokal Boyalı']) processExp(rawData.expertise['Lokal Boyalı'], DamageStatus.LOCAL_PAINTED);
            if (rawData.expertise['Değişen']) processExp(rawData.expertise['Değişen'], DamageStatus.CHANGED);
            result.expertise = newExpertise;
        }

        // Resimler
        if (rawData.images && Array.isArray(rawData.images)) {
            const processedImages: string[] = [];
            const imagesToProcess = rawData.images.slice(0, 20);
            
            for (let i = 0; i < imagesToProcess.length; i++) {
                setImportStatus(`Fotoğraf indiriliyor (${i + 1}/${imagesToProcess.length})...`);
                try {
                    const imgUrl = imagesToProcess[i];
                    if (imgUrl.startsWith('data:image')) {
                        processedImages.push(imgUrl);
                    } else {
                        const base64 = await urlToBase64(imgUrl); 
                        processedImages.push(base64 || imgUrl);
                    }
                } catch (e) {
                    processedImages.push(imagesToProcess[i]);
                }
            }
            result.images = processedImages;
        }

        return result;
    }, [dispatch]);

    // GLOBAL LISTENER: Dışarıdan gelen veriyi her an dinle (Push Yöntemi)
    useEffect(() => {
        const handleGlobalMessage = async (event: MessageEvent) => {
            // WebView ortamlarında event.data bazen string olarak gelir, parse etmek gerekebilir.
            let messageData = event.data;
            if (typeof messageData === 'string') {
                try {
                    messageData = JSON.parse(messageData);
                } catch (e) {
                    // JSON değilse ve bizim formatımız değilse yoksay
                    return;
                }
            }

            if (messageData && (messageData.type === 'EXTERNAL_DATA_RESPONSE' || messageData.type === 'SAHIBINDEN_DATA')) {
                console.log("OtoVizyon: Dış veri algılandı", messageData);
                
                const payload = messageData.payload || messageData; // Legacy desteği
                const platform = messageData.platform || 'sahibinden';

                setIsImporting(true);
                setImportStatus("WebView veri akışı algılandı, işleniyor...");

                try {
                    const vehicleData = await processImportedData(payload, platform);
                    onDataReceived(vehicleData);
                } catch (error) {
                    console.error("Otomatik import hatası:", error);
                } finally {
                    setIsImporting(false);
                }
            }
        };

        // Hem 'message' hem de React Native WebView için 'document' üzerine dinleyici eklenebilir
        window.addEventListener('message', handleGlobalMessage);
        document.addEventListener('message', handleGlobalMessage as any); // Android WebView desteği

        return () => {
            window.removeEventListener('message', handleGlobalMessage);
            document.removeEventListener('message', handleGlobalMessage as any);
        };
    }, [processImportedData, onDataReceived]);

    // Manuel Import Tetikleyicisi (Pull Yöntemi)
    const startImport = async (url: string, platform: 'sahibinden' | 'arabam') => {
        setIsImporting(true);
        setImportStatus(`${platform === 'sahibinden' ? 'Sahibinden' : 'Arabam.com'} verisi isteniyor...`);

        // Eklentiye veya WebView'a mesaj gönder
        // WebView bridge kullanımı için window.ReactNativeWebView.postMessage kullanılabilir.
        const requestMessage = { type: "FETCH_EXTERNAL_DATA", url, platform };
        
        window.postMessage(requestMessage, "*");
        
        // Eğer React Native WebView ise
        if ((window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify(requestMessage));
        }
        
        // Timeout
        setTimeout(() => {
            if (isImporting) {
                // setIsImporting(false); 
            }
        }, 15000);
    };

    return {
        startImport,
        isImporting,
        importStatus,
        extensionDetected
    };
};
