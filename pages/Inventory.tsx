
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { CURRENT_USER_DEALER_ID } from '../constants';
import { 
    Plus, Filter, MoreHorizontal, AlertCircle, Search, 
    ChevronDown, SlidersHorizontal, Fuel, Settings2, Gauge
} from 'lucide-react';
import { DamageStatus, Vehicle } from '../types';
import { 
    useReactTable, 
    getCoreRowModel, 
    getFilteredRowModel, 
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    SortingState
} from '@tanstack/react-table';
import { Button, Input } from '../components/ui/UIComponents';
import { cn } from '../lib/utils';

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    let colors = "bg-slate-100 text-slate-700 border-slate-200";
    if (status === 'Satıldı') colors = "bg-red-50 text-red-700 border-red-100";
    if (status === 'Satılık') colors = "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === 'Opsiyonlu') colors = "bg-amber-50 text-amber-700 border-amber-100";
    if (status === 'Konsinye (B2B)') colors = "bg-indigo-50 text-indigo-700 border-indigo-100";

    return (
        <span className={cn("px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wide", colors)}>
            {status}
        </span>
    );
};

const ExpertiseBadge = ({ vehicle }: { vehicle: Vehicle }) => {
    const localCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.LOCAL_PAINTED).length : 0;
    const paintedCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.PAINTED).length : 0;
    const changedCount = vehicle.expertise ? Object.values(vehicle.expertise).filter(s => s === DamageStatus.CHANGED).length : 0;

    if (localCount === 0 && paintedCount === 0 && changedCount === 0) {
        return <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-100 ring-2 ring-green-500/10">Hatasız</span>;
    }

    return (
        <div className="flex gap-1.5 flex-wrap">
            {changedCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200" title="Değişen">{changedCount} D</span>}
            {paintedCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200" title="Boyalı">{paintedCount} B</span>}
            {localCount > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200" title="Lokal Boyalı">{localCount} L</span>}
        </div>
    );
};

// --- Main Page Component ---

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const allVehicles = useSelector((state: RootState) => state.inventory.vehicles);
  // Redux'tan gelen veriyi sadece kendi bayimize göre filtrele
  const data = useMemo(() => allVehicles.filter(v => v.dealerId === CURRENT_USER_DEALER_ID), [allVehicles]);
  
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<Vehicle>();

  // Sütun Tanımları
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
        id: 'vehicleInfo',
        header: 'Araç Bilgisi',
        cell: info => {
            const v = info.row.original;
            return (
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 group-hover:border-blue-400 transition-colors">
                        <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{v.year} {v.brand} {v.model}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center"><Fuel size={10} className="mr-1"/> {v.fuel}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="flex items-center"><Settings2 size={10} className="mr-1"/> {v.transmission}</span>
                        </div>
                    </div>
                </div>
            )
        }
    }),
    columnHelper.accessor('price', {
        header: 'Fiyat',
        cell: info => (
            <div className="flex flex-col">
                <span className="font-bold text-slate-900 tracking-tight">₺{info.getValue().toLocaleString('tr-TR')}</span>
                {info.row.original.b2bPrice && (
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-fit mt-1">
                        B2B: ₺{info.row.original.b2bPrice.toLocaleString('tr-TR')}
                    </span>
                )}
            </div>
        )
    }),
    columnHelper.accessor('mileage', {
        header: 'Kilometre',
        cell: info => (
            <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg w-fit border border-slate-100">
                <Gauge size={14} className="mr-1.5 text-slate-400"/>
                {info.getValue().toLocaleString('tr-TR')} km
            </div>
        )
    }),
    columnHelper.accessor('expertise', {
        header: 'Ekspertiz',
        cell: info => <ExpertiseBadge vehicle={info.row.original} />
    }),
    columnHelper.accessor('status', {
        header: 'Durum',
        cell: info => <StatusBadge status={info.getValue()} />
    }),
    columnHelper.display({
        id: 'actions',
        cell: () => (
            <div className="flex justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={18} />
                </Button>
            </div>
        )
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Stok Yönetimi</h1>
           <p className="text-slate-500 mt-1">Mevcut araçlarınızın listesi ve durumu.</p>
        </div>
        <Button 
            onClick={() => navigate('/add-vehicle')}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
        >
            <Plus size={18} className="mr-2" />
            Yeni Araç Ekle
        </Button>
      </div>

      {/* --- Filter & Controls Bar --- */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Marka, model veya ilan başlığı ara..." 
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium transition-all outline-none"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
            />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <Button variant="outline" className="h-11 border-slate-200 text-slate-600 hover:border-slate-300 bg-white">
                <SlidersHorizontal size={16} className="mr-2" /> Filtrele
            </Button>
            <div className="h-8 w-px bg-slate-200 my-auto mx-1 hidden md:block"></div>
            <select className="h-11 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 outline-none cursor-pointer hover:bg-slate-50 transition-colors">
                <option>Sıralama: Yeniden Eskiye</option>
                <option>Fiyat: Artan</option>
                <option>Fiyat: Azalan</option>
            </select>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      
      {/* Mobile Card View (Visible on < md) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows.map(row => {
            const v = row.original;
            return (
                <div key={row.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.99] transition-transform">
                    {/* Header */}
                    <div className="flex gap-4 mb-4">
                        <div className="relative w-24 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            <img src={v.images[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900 truncate pr-2">{v.brand} {v.model}</h3>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2 text-slate-400"><MoreHorizontal size={16}/></Button>
                            </div>
                            <p className="text-xs text-slate-500 mb-2 truncate">{v.title}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-blue-600">₺{v.price.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Yıl</span>
                            <span className="text-sm font-semibold text-slate-700">{v.year}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">KM</span>
                            <span className="text-sm font-semibold text-slate-700">{v.mileage.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Footer Tags */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <ExpertiseBadge vehicle={v} />
                        <StatusBadge status={v.status} />
                    </div>
                </div>
            )
        })}
      </div>

      {/* Desktop Table View (Visible on >= md) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
                {table.getRowModel().rows.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <Search size={24} className="text-slate-400" />
                                </div>
                                <p className="font-medium">Sonuç bulunamadı</p>
                                <p className="text-sm mt-1">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-6 py-4 align-middle">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
        
        {/* Simple Pagination Footer */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
                Toplam <span className="text-slate-900 font-bold">{data.length}</span> araç listeleniyor
            </span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 text-xs">
                    Önceki
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 text-xs">
                    Sonraki
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
