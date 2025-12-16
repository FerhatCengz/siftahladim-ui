
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Coordinates } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Turkish safe lowercase for search comparison
export function turkishToLower(text: string): string {
  if (!text) return '';
  return text.replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');
}

// Data sanitization utility (Title Case with Turkish support)
export function normalizeInput(value: string): string {
  if (!value) return '';
  // Remove extra spaces, lowercase everything properly, then uppercase first letters
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

// JWT Payload Decoder (Base64Url to JSON)
export function decodeJWTPayload(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding payload", e);
        return null;
    }
}

// Image URL to Base64 Converter
export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image:", error);
    return ""; // Return empty string on failure
  }
}

// Türkçe Sayı Formatlama (Örn: 1000 -> 1.000)
export function formatTurkishNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  // Eğer string gelirse önce sayıya çevir
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('tr-TR').format(num);
}

// Türkçe Formatlı Stringi Sayıya Çevirme (Örn: 1.000 -> 1000)
export function parseTurkishNumber(value: string): number | string {
  if (!value) return '';
  // Noktaları kaldır, sadece rakamları bırak
  const cleanValue = value.replace(/\./g, '');
  const num = Number(cleanValue);
  return isNaN(num) ? '' : num;
}

// [YENİ] Haversine Formülü ile iki koordinat arası mesafe hesaplama (KM cinsinden)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Mesafe (km)
  
  return Math.round(d * 10) / 10; // 1 ondalık basamak yuvarla
}

/**
 * [MİMARİ: GEOSPATIAL SERVICE]
 * Nominatim API Kullanım Politikası (Fair Usage Policy) Uyumluluğu
 * 
 * 1. Rate Limiting: İstemci başına saniyede max 1 istek.
 * 2. Caching: Aynı sorguları tekrar tekrar sormamak için LocalStorage önbelleği.
 * 3. User-Agent/Email: İsteklerde kimlik belirtme.
 */
class GeocodingService {
    private lastRequestTime: number = 0;
    private queue: Array<() => Promise<void>> = [];
    private isProcessing: boolean = false;
    private readonly CACHE_KEY = 'geocoding_cache';
    private cache: Map<string, Coordinates>;

    constructor() {
        // Önbelleği LocalStorage'dan yükle
        this.cache = new Map();
        try {
            const stored = localStorage.getItem(this.CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.keys(parsed).forEach(key => this.cache.set(key, parsed[key]));
            }
        } catch (e) {
            console.warn("Geocoding cache load failed", e);
        }
    }

    private saveCache() {
        try {
            const obj = Object.fromEntries(this.cache);
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(obj));
        } catch (e) {
            console.warn("Geocoding cache save failed", e);
        }
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            
            // Rate Limiting: Son istekten bu yana 1 saniye geçtiğinden emin ol
            const now = Date.now();
            const timeSinceLast = now - this.lastRequestTime;
            if (timeSinceLast < 1100) { // 1.1 saniye güvenlik payı
                await this.delay(1100 - timeSinceLast);
            }

            if (task) await task();
            
            this.lastRequestTime = Date.now();
        }

        this.isProcessing = false;
    }

    public async getCoordinates(city: string, district: string, neighborhood: string): Promise<Coordinates | undefined> {
        // 1. Önbellek Kontrolü
        const cleanNeighborhood = neighborhood.trim().replace(/\s+(mahallesi|mah\.?|mh\.?)$/i, '');
        const cacheKey = `${cleanNeighborhood}|${district}|${city}`.toLowerCase();
        
        if (this.cache.has(cacheKey)) {
            // console.debug("[Geocoding] Cache Hit:", cacheKey);
            return this.cache.get(cacheKey);
        }

        // 2. Kuyruğa Ekle
        return new Promise((resolve) => {
            this.queue.push(async () => {
                try {
                    const query = `${cleanNeighborhood}, ${district}, ${city}, Turkey`;
                    // console.debug("[Geocoding] Fetching API:", query);
                    
                    // Nominatim API Call
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&email=app@otovizyon.com`;
                    
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'OtoVizyonPro/1.0 (Web Application)'
                        }
                    });

                    const data = await response.json();
                    let result: Coordinates | undefined = undefined;

                    if (data && data.length > 0) {
                        result = {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon)
                        };
                    } else {
                        // Fallback: Sadece İlçe/İl
                        console.warn("[Geocoding] Mahalle bulunamadı, fallback deneniyor...");
                        const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${district}, ${city}, Turkey`)}&limit=1`;
                        const fbRes = await fetch(fallbackUrl);
                        const fbData = await fbRes.json();
                        if (fbData && fbData.length > 0) {
                            result = {
                                lat: parseFloat(fbData[0].lat),
                                lng: parseFloat(fbData[0].lon)
                            };
                        }
                    }

                    if (result) {
                        this.cache.set(cacheKey, result);
                        this.saveCache();
                    }
                    
                    resolve(result);

                } catch (error) {
                    console.error("[Geocoding] API Error:", error);
                    resolve(undefined);
                }
            });

            this.processQueue();
        });
    }
}

// Singleton Instance
export const geocodingService = new GeocodingService();

// Wrapper Function (Eski kodlarla uyumluluk için)
export async function getCoordinatesFromAddress(city: string, district: string, neighborhood: string): Promise<Coordinates | undefined> {
    if (!city) return undefined;
    return geocodingService.getCoordinates(city, district, neighborhood);
}
