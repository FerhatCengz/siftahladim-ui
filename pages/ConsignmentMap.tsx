
import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DEALERS } from '../constants';
import { VehicleStatus, Vehicle } from '../types';
import { MapPin, Navigation, Locate, Car, ListFilter, AlertTriangle, Phone } from 'lucide-react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog } from '../components/ui/UIComponents';
import { calculateDistance, formatTurkishNumber, cn } from '../lib/utils';
import * as ReactWindow from 'react-window';
import * as AutoSizerPkg from 'react-virtualized-auto-sizer';

// --- Safe Import Pattern for ESM/Vite Environments ---
const FixedSizeList = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList || ReactWindow;
const areEqual = (ReactWindow as any).areEqual || (ReactWindow as any).default?.areEqual || ((prev: any, next: any) => prev === next);
const AutoSizer = (AutoSizerPkg as any).default || AutoSizerPkg;

// --- Types ---
interface VehicleWithDistance extends Vehicle {
    distance: number;
    dealerName?: string;
    dealerLocation?: { lat: number; lng: number };
}

interface RowData {
    items: VehicleWithDistance[];
    onItemClick: (vehicle: VehicleWithDistance) => void;
    selectedId?: string;
}

// --- Components ---

const VehicleRow = memo(({ index, style, data }: { index: number, style: React.CSSProperties, data: RowData }) => {
    const vehicle = data.items[index];
    if (!vehicle) return null;

    const isSelected = data.selectedId === vehicle.id;

    return (
        <div style={style} className="px-2 py-2">
            <div 
              onClick={() => data.onItemClick(vehicle)}
              className={cn(
                "bg-white p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 h-full group select-none",
                isSelected 
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg bg-blue-50/5" 
                    : "border-slate-100 hover:border-blue-300 hover:shadow-md"
            )}>
                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                        <span className="text-[10px] font-bold text-white flex items-center">
                            {vehicle.year}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-900 text-sm truncate pr-2" title={`${vehicle.brand} ${vehicle.model}`}>
                                {vehicle.brand} {vehicle.model}
                            </h4>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 flex items-center",
                                vehicle.distance < 10 ? "bg-emerald-100 text-emerald-700" : 
                                vehicle.distance < 50 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                            )}>
                                <Navigation size={10} className="mr-1" />
                                {vehicle.distance.toFixed(1)} km
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-1.5">{vehicle.title}</p>
                        
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[9px] font-medium bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{vehicle.fuel}</span>
                            <span className="text-[9px] font-medium bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{vehicle.transmission}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center text-[10px] text-slate-400">
                            <MapPin size={12} className="mr-1 text-slate-300" />
                            {/* Detailed Location */}
                            <span className="truncate max-w-[120px]">
                                {vehicle.location?.district ? `${vehicle.location.district} / ` : ''}
                                {vehicle.location?.city || vehicle.dealerName}
                            </span>
                        </div>
                        <div className="text-right">
                             {vehicle.b2bPrice && (
                                <div className="text-[9px] text-slate-400 line-through">₺{formatTurkishNumber(vehicle.price)}</div>
                             )}
                             <div className="font-bold text-blue-600 text-sm">
                                ₺{formatTurkishNumber(vehicle.b2bPrice || vehicle.price)}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, areEqual);

const ConsignmentMap: React.FC = () => {
  // Refs & Hooks
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null); // [YENİ] Yarıçap dairesi referansı
  const navigate = useNavigate();
  
  // State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'denied'>('loading');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDistance | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(50000); 
  const [sortOrder, setSortOrder] = useState<'distance_asc' | 'price_asc' | 'price_desc'>('distance_asc');
  
  // Directions Modal State
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [directionsTarget, setDirectionsTarget] = useState<VehicleWithDistance | null>(null);

  // Redux Data
  const allVehicles = useSelector((state: RootState) => state.inventory.vehicles);

  // --- 1. Veri İşleme ve Sıralama ---
  const processedVehicles = useMemo(() => {
      let vehicles = allVehicles
          .filter(v => v.status === VehicleStatus.CONSIGNMENT)
          .map(v => {
              const dealer = DEALERS.find(d => d.id === v.dealerId);
              let lat, lng;

              if (v.coordinates && v.coordinates.lat && v.coordinates.lng) {
                  lat = v.coordinates.lat;
                  lng = v.coordinates.lng;
              } else if (dealer?.location) {
                  lat = dealer.location.lat;
                  lng = dealer.location.lng;
              } else {
                  // Fallback: İstanbul + Random offset
                  const baseLat = 41.0082;
                  const baseLng = 28.9784;
                  const pseudoRandom = v.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  lat = baseLat + (pseudoRandom % 100 - 50) / 1000;
                  lng = baseLng + (pseudoRandom % 100 - 50) / 1000;
              }

              const dist = userLocation 
                  ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
                  : 0;

              return {
                  ...v,
                  distance: dist,
                  dealerLocation: { lat, lng },
                  dealerName: dealer?.name || 'Bireysel Satıcı'
              } as VehicleWithDistance;
          });

      if (userLocation) {
          // "Tümü" (500km) seçili değilse filtrele
          if (searchRadius < 500000) {
              vehicles = vehicles.filter(v => v.distance <= (searchRadius / 1000));
          }
      }

      vehicles.sort((a, b) => {
          if (sortOrder === 'distance_asc') return a.distance - b.distance;
          if (sortOrder === 'price_asc') return a.price - b.price;
          if (sortOrder === 'price_desc') return b.price - a.price;
          return 0;
      });

      return vehicles;
  }, [allVehicles, userLocation, searchRadius, sortOrder]);

  // --- 2. Harita Başlatma ve Resize Fix ---
  useEffect(() => {
    // Harita zaten varsa tekrar başlatma (Strict Mode koruması)
    if (mapInstance.current) return;
    if (!mapRef.current) return;

    const defaultCenter: [number, number] = [41.0082, 28.9784]; 

    // Haritayı oluştur
    const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultCenter, 10);

    mapInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    // [KRİTİK] Harita konteyner boyutu değiştiğinde render'ı düzelt
    const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
    });
    resizeObserver.observe(mapRef.current);

    // Konum İzni
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setLocationStatus('success');
                
                if (mapInstance.current) {
                    mapInstance.current.setView([latitude, longitude], 11);
                    
                    // [FIX] Gri harita sorununu çözmek için render tetikle
                    setTimeout(() => {
                        mapInstance.current?.invalidateSize();
                    }, 250);

                    const userHtml = `<div class="relative flex items-center justify-center w-6 h-6">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-sm"></span>
                    </div>`;
                    
                    const userIcon = L.divIcon({
                        className: 'bg-transparent',
                        html: userHtml,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance.current!);
                }
            },
            (error) => {
                console.error("Konum hatası:", error);
                setLocationStatus('denied');
            }
        );
    } else {
        setLocationStatus('error');
    }

    // Cleanup Function
    return () => {
        resizeObserver.disconnect();
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, []);

  // --- [YENİ] 3. Yarıçap Dairesi ve Zoom Yönetimi ---
  useEffect(() => {
      if (!mapInstance.current || !userLocation) return;

      // Varsa eski daireyi sil
      if (radiusCircleRef.current) {
          radiusCircleRef.current.remove();
          radiusCircleRef.current = null;
      }

      // "Tümü" seçili değilse daire çiz
      if (searchRadius < 500000) {
          radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
              color: '#2563eb', // blue-600
              fillColor: '#3b82f6', // blue-500
              fillOpacity: 0.08,
              weight: 1,
              radius: searchRadius
          }).addTo(mapInstance.current);

          // Haritayı daireye sığdır (biraz padding ile)
          mapInstance.current.fitBounds(radiusCircleRef.current.getBounds(), {
              padding: [20, 20],
              animate: true,
              duration: 1
          });
      } else {
          // "Tümü" seçiliyse haritayı genel Türkiye görünümüne çek
          mapInstance.current.setView([39.0, 35.0], 6, {
              animate: true,
              duration: 1
          });
      }

  }, [searchRadius, userLocation]);

  // --- 4. Marker Güncelleme ---
  useEffect(() => {
      if (!mapInstance.current || !markersRef.current) return;

      markersRef.current.clearLayers();
      const mapVehicles = processedVehicles.slice(0, 100);

      mapVehicles.forEach(vehicle => {
          if (!vehicle.dealerLocation) return;

          const isSelected = selectedVehicle?.id === vehicle.id;
          
          const iconHtml = `
            <div class="transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
                <div class="w-10 h-10 ${isSelected ? 'bg-blue-600' : 'bg-slate-900'} text-white rounded-xl flex items-center justify-center border-2 border-white shadow-lg relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                    ${isSelected ? '<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded-full"></div>' : ''}
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          `;

          const icon = L.divIcon({
              className: 'bg-transparent',
              html: iconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -45]
          });

          const marker = L.marker([vehicle.dealerLocation.lat, vehicle.dealerLocation.lng], { icon });
          
          // Full Address String
          const address = [
              vehicle.location?.neighborhood,
              vehicle.location?.district,
              vehicle.location?.city
          ].filter(Boolean).join(', ');

          marker.bindPopup(`
              <div class="font-sans min-w-[200px] p-1">
                  <div class="h-28 bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                      <img src="${vehicle.images[0]}" class="w-full h-full object-cover" />
                      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs font-bold">
                        ${vehicle.year} ${vehicle.brand}
                      </div>
                  </div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-slate-900">${vehicle.model}</span>
                    <span class="text-xs font-bold text-blue-600">₺${formatTurkishNumber(vehicle.b2bPrice || vehicle.price)}</span>
                  </div>
                  <p class="text-xs text-slate-500 flex items-center mb-1">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    ${address || 'Konum Bilgisi Yok'}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    ${vehicle.distance.toFixed(1)} km uzakta
                  </p>
              </div>
          `);

          marker.on('click', () => {
              setSelectedVehicle(vehicle);
          });

          markersRef.current?.addLayer(marker);
      });

  }, [processedVehicles, selectedVehicle]);

  const handleItemClick = (vehicle: VehicleWithDistance) => {
      setSelectedVehicle(vehicle);
      if (vehicle.dealerLocation && mapInstance.current) {
          mapInstance.current.setView([vehicle.dealerLocation.lat, vehicle.dealerLocation.lng], 14, {
              animate: true,
              duration: 1
          });
      }
  };

  const handleGetDirections = () => {
      if (!selectedVehicle) return;
      setDirectionsTarget(selectedVehicle);
      setShowDirectionsModal(true);
  };

  const confirmDirections = () => {
      if (!directionsTarget?.dealerLocation) return;
      
      const { lat, lng } = directionsTarget.dealerLocation;
      // Universal maps link (works on iOS, Android and Web)
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
      setShowDirectionsModal(false);
  };

  const itemData = {
      items: processedVehicles,
      onItemClick: handleItemClick,
      selectedId: selectedVehicle?.id
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6 relative overflow-hidden">
      
      {/* MAP AREA */}
      <div className="flex-1 lg:flex-[2] bg-slate-100 rounded-3xl shadow-inner border border-slate-200 overflow-hidden relative order-1 min-h-[40vh] lg:min-h-0">
        <div id="map" ref={mapRef} className="w-full h-full z-0" />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2 pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/50 pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-xs font-bold text-slate-900">
                        {locationStatus === 'loading' ? 'Konum aranıyor...' : 
                         locationStatus === 'success' ? 'Konumunuz: İstanbul' : 'Varsayılan Konum'}
                    </p>
                </div>
            </div>
        </div>

        {/* Radius Filter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-auto">
             <div className="bg-slate-900/90 backdrop-blur text-white px-1.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700">
                 <div className="flex items-center px-3 gap-2">
                    <Locate size={14} className="text-blue-400"/>
                    <span className="text-xs font-medium">Mesafe:</span>
                 </div>
                 <select 
                    className="bg-slate-800 border-none text-xs font-bold rounded-full py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-blue-500 cursor-pointer text-white"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                 >
                     <option value={10000}>10 KM</option>
                     <option value={25000}>25 KM</option>
                     <option value={50000}>50 KM</option>
                     <option value={100000}>100 KM</option>
                     <option value={500000}>Tümü</option>
                 </select>
             </div>
        </div>
      </div>

      {/* LIST AREA */}
      <div className="w-full lg:w-[420px] bg-white rounded-t-3xl lg:rounded-3xl border border-slate-200 shadow-xl flex flex-col order-2 h-[50vh] lg:h-full z-10 -mt-6 lg:mt-0 relative">
        <div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="px-5 pb-4 pt-2 border-b border-slate-100 shrink-0">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <Car size={20} className="mr-2 text-blue-600"/> 
                        B2B Fırsatları
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Size en yakın araçlar listeleniyor.</p>
                </div>
                <div className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    {processedVehicles.length} Araç
                </div>
            </div>
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select 
                        className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                    >
                        <option value="distance_asc">En Yakın</option>
                        <option value="price_asc">Fiyat (Artan)</option>
                        <option value="price_desc">Fiyat (Azalan)</option>
                    </select>
                    <ListFilter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                </div>
            </div>
        </div>

        {/* Info Box if Vehicle Selected */}
        {selectedVehicle && (
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-blue-900 truncate">Seçili: {selectedVehicle.brand} {selectedVehicle.model}</p>
                        <p className="text-[10px] text-blue-700 truncate">
                            {[selectedVehicle.location?.neighborhood, selectedVehicle.location?.district, selectedVehicle.location?.city].filter(Boolean).join(', ')}
                        </p>
                    </div>
                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 ml-3 shrink-0" onClick={handleGetDirections}>
                        <Navigation size={12} className="mr-1.5" /> Yol Tarifi
                    </Button>
                </div>
            </div>
        )}

        <div className="flex-1 min-h-0 bg-slate-50/50">
            {processedVehicles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <MapPin size={32} className="opacity-20" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Bu mesafede araç bulunamadı.</p>
                    <Button variant="link" onClick={() => setSearchRadius(500000)} className="mt-2 text-blue-600">Tüm Türkiye'yi Göster</Button>
                </div>
            ) : (
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            height={height}
                            itemCount={processedVehicles.length}
                            itemSize={132}
                            width={width}
                            itemData={itemData}
                            className="no-scrollbar"
                        >
                            {VehicleRow}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            )}
        </div>
      </div>

      {/* Directions Disclaimer Modal */}
      <Dialog 
        isOpen={showDirectionsModal} 
        onClose={() => setShowDirectionsModal(false)}
        title="Yol Tarifi Alınıyor"
        description="Harita servisine yönlendiriliyorsunuz. Lütfen dikkat ediniz."
        footer={
            <>
                <Button variant="outline" onClick={() => setShowDirectionsModal(false)}>Vazgeç</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmDirections}>
                    Haritalarda Aç <Navigation size={16} className="ml-2"/>
                </Button>
            </>
        }
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <div className="text-sm text-amber-900">
                <p className="font-bold mb-1">Konum Sapması Olabilir</p>
                <p className="opacity-90 mb-2">
                    Haritadaki konum otomatik olarak belirlenmiştir ve %100 doğruluk payı içermeyebilir.
                </p>
                <div className="flex items-center text-amber-700 font-bold text-xs mt-2 bg-amber-100/50 p-2 rounded-lg">
                    <Phone size={14} className="mr-2" />
                    Konuma varmadan önce mutlaka araç sahibini arayınız.
                </div>
            </div>
        </div>
      </Dialog>

    </div>
  );
};

export default ConsignmentMap;
