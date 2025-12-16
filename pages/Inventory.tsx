
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { CURRENT_USER_DEALER_ID } from '../constants';
import { Plus, Filter, MoreHorizontal, AlertCircle } from 'lucide-react';
import { DamageStatus } from '../types';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const allVehicles = useSelector((state: RootState) => state.inventory.vehicles);
  const myVehicles = allVehicles.filter(v => v.dealerId === CURRENT_USER_DEALER_ID);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
           <p className="text-gray-500">Mevcut araçlarınızın listesi ve durumu.</p>
        </div>
        <button 
            onClick={() => navigate('/add-vehicle')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
            <Plus size={18} />
            <span>Yeni Araç Ekle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center space-x-4">
        <div className="flex items-center text-gray-500">
            <Filter size={18} className="mr-2" />
            <span className="font-medium text-sm">Filtrele:</span>
        </div>
        <select className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
            <option>Tüm Markalar</option>
            <option>Audi</option>
            <option>BMW</option>
        </select>
        <select className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
            <option>Durum: Hepsi</option>
            <option>Satılık</option>
            <option>Satıldı</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">Araç Bilgisi</th>
                        <th scope="col" className="px-6 py-3">Fiyat</th>
                        <th scope="col" className="px-6 py-3">Kilometre</th>
                        <th scope="col" className="px-6 py-3">Ekspertiz</th>
                        <th scope="col" className="px-6 py-3">Durum</th>
                        <th scope="col" className="px-6 py-3 text-right">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {myVehicles.map((vehicle) => {
                        const localCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.LOCAL_PAINTED).length : 0;
                        const paintedCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.PAINTED).length : 0;
                        const changedCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.CHANGED).length : 0;
                        
                        return (
                        <tr key={vehicle.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                                        <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{vehicle.year} {vehicle.brand} {vehicle.model}</div>
                                        <div className="text-xs text-gray-500">{vehicle.fuel} • {vehicle.transmission}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">₺{vehicle.price.toLocaleString()}</div>
                                {vehicle.b2bPrice && <div className="text-xs text-blue-600 font-medium">B2B: ₺{vehicle.b2bPrice.toLocaleString()}</div>}
                            </td>
                            <td className="px-6 py-4">
                                {vehicle.mileage.toLocaleString()} km
                            </td>
                            <td className="px-6 py-4">
                                {(localCount > 0 || paintedCount > 0 || changedCount > 0) ? (
                                    <div className="flex space-x-1">
                                        {localCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">{localCount} L</span>}
                                        {paintedCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">{paintedCount} B</span>}
                                        {changedCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">{changedCount} D</span>}
                                    </div>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">Hatasız</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${vehicle.status === 'Satıldı' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                                `}>
                                    {vehicle.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
