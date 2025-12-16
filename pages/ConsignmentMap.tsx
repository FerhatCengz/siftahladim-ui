import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DEALERS } from '../constants';
import { VehicleStatus } from '../types';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

const ConsignmentMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get vehicles from Redux Store
  const allVehicles = useSelector((state: RootState) => state.inventory.vehicles);

  // Filter vehicles that are 'Consignment' (B2B)
  const consignmentVehicles = allVehicles.filter(v => v.status === VehicleStatus.CONSIGNMENT);

  // Filter vehicles based on selected dealer on map
  const filteredVehicles = selectedDealerId 
    ? consignmentVehicles.filter(v => v.dealerId === selectedDealerId)
    : consignmentVehicles;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize Map centered on Istanbul
    mapInstance.current = L.map(mapRef.current).setView([41.0082, 28.9784], 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance.current);

    // Add Markers for Dealers
    DEALERS.forEach(dealer => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      const marker = L.marker([dealer.location.lat, dealer.location.lng], { icon: customIcon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div class="font-sans">
            <h3 class="font-bold text-sm">${dealer.name}</h3>
            <p class="text-xs text-gray-500">${dealer.address}</p>
            <div class="mt-2 text-xs font-semibold text-blue-600">Puan: ${dealer.rating}/5.0</div>
          </div>
        `);
      
      marker.on('click', () => {
        setSelectedDealerId(dealer.id);
      });
    });

    // Reset filter when clicking on map background
    mapInstance.current.on('click', (e) => {
        // Simple check: if clicked on map (not marker), reset
        // Leaflet events are tricky, this is a basic implementation
         if ((e.originalEvent.target as HTMLElement).classList.contains('leaflet-container')) {
             setSelectedDealerId(null);
             mapInstance.current?.closePopup();
         }
    });

  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Map Section */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div id="map" ref={mapRef} className="w-full h-full z-0" />
        <div className="absolute top-4 left-14 bg-white px-4 py-2 rounded-lg shadow-md z-[1000] border border-gray-100">
          <p className="text-xs font-bold text-gray-700">İstanbul Bölgesi Aktif Galeriler</p>
        </div>
      </div>

      {/* List Section */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col">
        <div className="mb-4 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Konsinye Ağı (B2B Market)</h2>
                <p className="text-sm text-gray-500">Diğer galerilerin stoklarına ulaşın veya kendi aracınızı pazarlayın.</p>
            </div>
            <button 
                onClick={() => navigate('/add-vehicle')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center"
            >
                <ExternalLink size={16} className="mr-2"/>
                Kendi Aracını Paylaş
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedDealerId && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-800 font-medium">
                        {DEALERS.find(d => d.id === selectedDealerId)?.name} galerisinin araçları gösteriliyor.
                    </span>
                    <button onClick={() => setSelectedDealerId(null)} className="text-xs text-blue-600 hover:underline">Tümünü Göster</button>
                </div>
            )}

            {filteredVehicles.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p>Bu galeride konsinye araç bulunmamaktadır.</p>
                </div>
            ) : (
                filteredVehicles.map((vehicle) => {
                    const dealer = DEALERS.find(d => d.id === vehicle.dealerId);
                    return (
                        <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-40 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                                <img src={vehicle.images[0]} alt={vehicle.model} className="w-full h-full object-cover" />
                                <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">B2B Fırsat</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900">{vehicle.year} {vehicle.brand} {vehicle.model}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">B2B: ₺{(vehicle.b2bPrice || vehicle.price).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{vehicle.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{vehicle.fuel}</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{vehicle.transmission}</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{vehicle.mileage.toLocaleString()} km</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin size={14} className="mr-1" />
                                        <span>{dealer?.name} ({Math.floor(Math.random() * 15 + 1)}km uzakta)</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => window.open(`https://maps.google.com/?q=${dealer?.location.lat},${dealer?.location.lng}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Yol Tarifi"
                                        >
                                            <Navigation size={18} />
                                        </button>
                                        <button 
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                            title="Ara"
                                        >
                                            <Phone size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};

export default ConsignmentMap;