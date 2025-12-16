
import React, { useMemo } from 'react';
import { useVehicleForm } from '../hooks/useVehicleForm';
import { addBrand, addModel, addPackage } from '../store';
import { FuelType, Transmission, VehicleStatus } from '../types';
import { FEATURE_GROUPS } from '../constants';
import { 
    ChevronRight, Upload, ChevronLeft, Check, MapPin, Eye, 
    Crosshair, Zap, Bike, Box, Truck, Anchor, Plane, Accessibility, Car,
    LayoutGrid, Wrench, ArrowRight, X, Calendar, Gauge, Palette
} from 'lucide-react';
import { 
  Button, Input, FormLabel, Combobox, Select, Drawer, Switch, Tooltip
} from '../components/ui/UIComponents';
import CarDamageSelector from '../components/CarDamageSelector';
import { cn, formatTurkishNumber, parseTurkishNumber } from '../lib/utils';
import { getCities, getTowns, getNeighborhoods } from '../data/locations';
import VehicleImportWizard from '../components/VehicleImportWizard';

// --- Sabitler ---
const VEHICLE_CATEGORIES = [
    { id: 'Otomobil', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { id: 'Arazi, SUV & Pickup', icon: Crosshair, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { id: 'Elektrikli Araçlar', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { id: 'Motosiklet', icon: Bike, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
    { id: 'Minivan & Panelvan', icon: Box, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { id: 'Ticari Araçlar', icon: Truck, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
    { id: 'Deniz Araçları', icon: Anchor, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
    { id: 'Hava Araçları', icon: Plane, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    { id: 'Engelli Plakalı', icon: Accessibility, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
];

const AddVehicle: React.FC = () => {
  // Business Logic Hook'tan çekiliyor
  const {
    step, setStep,
    formData, updateField, setFormData,
    features, setFeatures,
    expertiseReport, setExpertiseReport,
    images, setImages, handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDrop,
    isSubmitting,
    errors, handleSubmit,
    config, dispatch
  } = useVehicleForm();

  // UI State
  const [stage, setStage] = React.useState<'category' | 'form'>('category');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  // Location Data Memos
  const cities = useMemo(() => getCities(), []);
  const districts = useMemo(() => formData.location?.city ? getTowns(formData.location.city) : [], [formData.location?.city]);
  const neighborhoods = useMemo(() => (formData.location?.city && formData.location?.district) ? getNeighborhoods(formData.location.city, formData.location.district) : [], [formData.location?.city, formData.location?.district]);

  const yearOptions = useMemo(() => Array.from({ length: 30 }, (_, i) => {
      const y = new Date().getFullYear() - i;
      return { value: y, label: y.toString() };
  }), []);

  // İçe aktarılan veriyi forma bas (Sahibinden/Arabam postMessage sonucu)
  const handleImportSuccess = (importedData: any) => {
      setFormData(prev => ({ ...prev, ...importedData }));
      
      if(importedData.images && Array.isArray(importedData.images)) {
          setImages(importedData.images);
      }
      
      if(importedData.features) setFeatures(importedData.features);
      if(importedData.expertise) setExpertiseReport(importedData.expertise);
      
      // Kategori seçili değilse forma otomatik geçiş yap
      setStage('form');
  };

  // Sayısal input değişimi (Maskeleme mantığı)
  const handleNumericChange = (field: string, value: string) => {
      // Sadece rakamları al
      const numericValue = parseTurkishNumber(value);
      updateField(field, numericValue);
  };

  // --- RENDER HELPERS ---
  const LivePreviewCard = () => {
    // Format helpers - formatTurkishNumber utilini kullanıyoruz
    // Veri yoksa "-" veya genel ifade döndür
    const formatPrice = (price?: number) => price ? `₺${formatTurkishNumber(price)}` : 'Fiyat Giriniz';
    const formatKM = (km?: number) => km ? `${formatTurkishNumber(km)}` : '-';

    return (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Canlı Önizleme</h3>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">Taslak</span>
            </div>
            
            <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                {/* Image Area */}
                <div className="h-56 bg-slate-100 relative group">
                    {images.length > 0 ? (
                        <img src={images[0]} className="w-full h-full object-cover" alt="Araç önizleme" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <Upload size={32} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium">Görsel Yok</span>
                        </div>
                    )}
                    {images.length > 1 && (
                         <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center">
                             <Eye size={12} className="mr-1"/> +{images.length - 1}
                         </div>
                    )}
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                        {formData.status || 'Satılık'}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                    {/* Title */}
                    <h4 className={cn(
                        "font-extrabold text-lg leading-snug mb-2 line-clamp-2",
                        formData.title ? "text-slate-900" : "text-slate-300 font-medium italic"
                    )}>
                        {formData.title || 'İlan Başlığı'}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                        <MapPin size={14} className="mr-1.5 text-slate-400" />
                        <span className="font-medium">
                            {formData.location?.city || 'İl'} 
                            <span className="mx-1 text-slate-300">/</span> 
                            {formData.location?.district || 'İlçe'}
                        </span>
                    </div>
                    
                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Calendar size={14} className="text-slate-400 mb-1" />
                            <span className={cn("text-xs font-bold", formData.year ? "text-slate-700" : "text-slate-300")}>
                                {formData.year || '-'}
                            </span>
                            <span className="text-[9px] text-slate-400">Yıl</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Gauge size={14} className="text-slate-400 mb-1" />
                            <span className={cn("text-xs font-bold", formData.mileage ? "text-slate-700" : "text-slate-300")}>
                                {formatKM(formData.mileage)}
                            </span>
                            <span className="text-[9px] text-slate-400">KM</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <Palette size={14} className="text-slate-400 mb-1" />
                            <span className={cn("text-xs font-bold truncate w-full text-center", formData.color ? "text-slate-700" : "text-slate-300")}>
                                {formData.color || '-'}
                            </span>
                            <span className="text-[9px] text-slate-400">Renk</span>
                        </div>
                    </div>
                    
                    {/* Price & Action */}
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="block text-[10px] text-slate-400 font-medium mb-0.5">Satış Fiyatı</span>
                            <div className={cn("text-2xl font-black tracking-tight", formData.price ? "text-emerald-600" : "text-slate-300 text-lg")}>
                                {formatPrice(formData.price)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  if (stage === 'category') {
      return (
          <div className="flex flex-col min-h-full">
              {/* Import Wizard - Veri Çekme Alanı */}
              <VehicleImportWizard onDataReceived={handleImportSuccess} />

              <div className="mb-6 flex items-center">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 mr-4">Kategori Seçimi</h1>
                  <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {VEHICLE_CATEGORIES.map((cat) => (
                      <button
                          key={cat.id}
                          onClick={() => {
                              updateField('category', cat.id);
                              setStage('form');
                          }}
                          className={cn(
                              "flex flex-col items-center justify-center p-6 bg-white border rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-center h-40",
                              "border-slate-100 hover:border-slate-300"
                          )}
                      >
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors", cat.bg, cat.color)}>
                              <cat.icon size={28} />
                          </div>
                          <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                              {cat.id}
                          </span>
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-full pb-24 lg:pb-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
           <button onClick={() => setStage('category')} className="text-xs text-slate-500 hover:text-slate-800 mb-1 flex items-center">
               <ChevronLeft size={12} className="mr-1"/> Kategori Değiştir
           </button>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">{formData.category || 'Araç'} Ekle</h1>
        </div>
        <div className="flex gap-1.5">
           {[1, 2, 3, 4, 5].map(s => (
             <button 
                key={s} 
                onClick={() => setStep(s)}
                className={cn(
                    "h-1.5 rounded-full transition-all duration-300 hover:h-2.5", 
                    step === s ? "w-8 bg-slate-900" : step > s ? "w-4 bg-slate-900/40" : "w-4 bg-slate-200"
                )} 
                title={`${s}. Adıma Git`}
             />
           ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 h-full min-h-[500px] flex flex-col">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                {/* --- STEP 1: Künye (MANUEL GİRİŞ) --- */}
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
                    <div>
                        <FormLabel className="text-sm" tooltip="İlanınızın vitrinde görünecek kısa ve çarpıcı başlığı. Örn: 'Hatasız Boyasız 2023 Model'.">İlan Başlığı</FormLabel>
                        <Input name="title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Örn: HATASIZ BOYASIZ..." className="font-bold" maxLength={60} error={errors.title} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <FormLabel tooltip="Aracın ruhsatta yazan model yılı.">Yıl</FormLabel>
                            <Select options={yearOptions} value={formData.year!} onChange={(val) => updateField('year', val)} />
                        </div>
                        <div>
                            <FormLabel tooltip="Aracın üretici markası. Listede yoksa yazarak ekleyebilirsiniz.">Marka</FormLabel>
                            <Combobox options={config.brands} value={formData.brand!} onChange={(val) => updateField('brand', val)} onCreate={(val) => dispatch(addBrand(val))} error={errors.brand} />
                        </div>
                        <div>
                            <FormLabel tooltip="Seçilen markaya ait model.">Model</FormLabel>
                            <Combobox options={config.models} value={formData.model!} onChange={(val) => updateField('model', val)} onCreate={(val) => dispatch(addModel(val))} error={errors.model} />
                        </div>
                        <div>
                            <FormLabel tooltip="Aracın donanım paketi veya serisi.">Seri / Paket</FormLabel>
                            <Combobox options={config.packages} value={formData.series!} onChange={(val) => updateField('series', val)} onCreate={(val) => dispatch(addPackage(val))} error={errors.series} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <div>
                            <FormLabel tooltip="Aracın göstergesindeki güncel kilometre bilgisi.">Kilometre</FormLabel>
                            <div className="relative">
                                {/* KM Input Maskeleme */}
                                <Input 
                                    name="mileage" 
                                    value={formatTurkishNumber(formData.mileage)} 
                                    onChange={(e) => handleNumericChange('mileage', e.target.value)} 
                                    className="pr-10" 
                                    error={errors.mileage} 
                                />
                                <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">KM</span>
                            </div>
                         </div>
                         <div><FormLabel tooltip="Aracın dış rengi.">Renk</FormLabel><Combobox options={['Beyaz', 'Siyah', 'Gri', 'Gümüş Gri', 'Kırmızı', 'Mavi', 'Lacivert', 'Yeşil', 'Kahverengi', 'Bej', 'Turuncu', 'Sarı', 'Mor', 'Bordo', 'Füme']} value={formData.color!} onChange={(val) => updateField('color', val)} error={errors.color} /></div>
                         <div><FormLabel tooltip="Aracı satan kişinin unvanı.">Kimden</FormLabel><Select options={[{value: 'Galeriden', label: 'Galeriden'}, {value: 'Sahibinden', label: 'Sahibinden'}, {value: 'Yetkili Bayiden', label: 'Yetkili Bayiden'}]} value={formData.fromWho!} onChange={(val) => updateField('fromWho', val)} /></div>
                    </div>
                  </div>
                )}

                {/* --- STEP 2: Teknik --- */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel tooltip="Aracın gövde tipi (Sedan, Hatchback, SUV vb.).">Kasa Tipi</FormLabel>
                                <Combobox options={['Sedan', 'Hatchback', 'Station Wagon', 'SUV', 'Coupe', 'Cabrio', 'MPV']} value={formData.bodyType!} onChange={(val) => updateField('bodyType', val)} error={errors.bodyType} />
                            </div>
                            <div>
                                <FormLabel tooltip="Aracın çekiş sistemi (Önden, Arkadan, 4x4).">Çekiş</FormLabel>
                                <Select options={[{value: 'Önden Çekiş', label: 'Önden'}, {value: 'Arkadan İtiş', label: 'Arkadan'}, {value: '4x4', label: '4x4'}]} value={formData.traction!} onChange={(val) => updateField('traction', val)} error={errors.traction} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel tooltip="Aracın motor gücü (Beygir Gücü).">Motor Gücü</FormLabel>
                                <div className="relative"><Input name="enginePower" value={formData.enginePower} onChange={(e) => updateField('enginePower', e.target.value)} className="pr-10" placeholder="100" error={errors.enginePower} /><span className="absolute right-3 top-4 text-xs font-bold text-slate-400">HP</span></div>
                            </div>
                            <div>
                                <FormLabel tooltip="Aracın motor hacmi (Silindir Hacmi).">Motor Hacmi</FormLabel>
                                <div className="relative"><Input name="engineVolume" value={formData.engineVolume} onChange={(e) => updateField('engineVolume', e.target.value)} className="pr-10" placeholder="1600" error={errors.engineVolume} /><span className="absolute right-3 top-4 text-xs font-bold text-slate-400">CC</span></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><FormLabel tooltip="Aracın kullandığı yakıt türü.">Yakıt</FormLabel><div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">{Object.values(FuelType).map((type) => (<button key={type} type="button" onClick={() => updateField('fuel', type)} className={cn("flex-1 py-2 text-[10px] font-bold rounded-lg transition-all", formData.fuel === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>{type}</button>))}</div></div>
                            <div><FormLabel tooltip="Aracın vites tipi.">Vites</FormLabel><div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">{Object.values(Transmission).map((type) => (<button key={type} type="button" onClick={() => updateField('transmission', type)} className={cn("flex-1 py-2 text-[10px] font-bold rounded-lg transition-all", formData.transmission === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>{type}</button>))}</div></div>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: Donanım --- */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <LayoutGrid size={20} className="mr-2" /> Araç Donanımı
                            </h3>
                            <div className="space-y-6">
                                {Object.entries(FEATURE_GROUPS).map(([groupName, items]) => (
                                    <div key={groupName} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-3">{groupName}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {items.map(feature => (
                                                <label key={feature} className="flex items-center space-x-2 cursor-pointer group">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                        features[groupName]?.[feature] ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300 group-hover:border-slate-400"
                                                    )}>
                                                        {features[groupName]?.[feature] && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={!!features[groupName]?.[feature]} 
                                                        onChange={() => setFeatures(prev => ({
                                                            ...prev,
                                                            [groupName]: { ...prev[groupName], [feature]: !prev[groupName]?.[feature] }
                                                        }))} 
                                                    />
                                                    <span className={cn("text-xs font-medium transition-colors select-none", features[groupName]?.[feature] ? "text-slate-900" : "text-slate-500")}>
                                                        {feature}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STEP 4: Medya & Ekspertiz --- */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center relative">
                             <h3 className="text-sm font-bold text-slate-900 mb-4 w-full border-b border-slate-200 pb-2 flex items-center">
                                <Wrench size={16} className="mr-2"/> Ekspertiz Durumu
                                <div className="ml-auto">
                                    <FormLabel tooltip="Aracın parçalarının boya ve değişen durumunu işaretleyin. Yeşil: Orijinal, Sarı: Lokal, Turuncu: Boyalı, Kırmızı: Değişen." className="mb-0"><span className="sr-only">Bilgi</span></FormLabel>
                                </div>
                             </h3>
                             <CarDamageSelector value={expertiseReport} onChange={setExpertiseReport} />
                        </div>

                        <div>
                             <FormLabel tooltip="Aracın fotoğraflarını buraya yükleyin. Sürükle bırak yaparak sıralamayı değiştirebilirsiniz. İlk fotoğraf vitrin fotoğrafı olacaktır.">Galeri ve Fotoğraflar</FormLabel>
                             <p className="text-xs text-slate-500 mb-4 -mt-2">Sürükleyerek sıralayabilirsiniz.</p>
                             
                             {images.length === 0 ? (
                                 <label className={cn(
                                     "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors group",
                                     errors.images ? "border-red-300 bg-red-50/20" : "border-slate-300"
                                 )}>
                                    <div className="p-4 rounded-full shadow-sm mb-3 bg-white group-hover:scale-110 transition-transform">
                                        <Upload size={32} className="text-slate-400"/>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Fotoğraf Yükle</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                 </label>
                             ) : (
                                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                     {images.map((img, idx) => (
                                         <div 
                                            key={idx} 
                                            className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-200 cursor-move"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, idx)}
                                         >
                                             <img src={img} className="w-full h-full object-cover" />
                                             <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                         </div>
                                     ))}
                                     <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 hover:border-slate-300">
                                        <Upload size={20} className="mb-1"/>
                                        <span className="text-[10px] font-bold">Ekle</span>
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </label>
                                 </div>
                             )}
                        </div>
                    </div>
                )}

                {/* --- STEP 5: Satış & Konum --- */}
                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <FormLabel tooltip="Son kullanıcıya sunulacak satış fiyatı.">Satış Fiyatı</FormLabel>
                                <div className="relative">
                                    {/* Fiyat Input Maskeleme */}
                                    <Input 
                                        name="price" 
                                        value={formatTurkishNumber(formData.price)} 
                                        onChange={(e) => handleNumericChange('price', e.target.value)} 
                                        className="pr-12 text-lg font-bold" 
                                        error={errors.price} 
                                    />
                                    <span className="absolute right-4 top-4 text-sm font-bold text-slate-400">TL</span>
                                </div>
                            </div>
                            <div>
                                <FormLabel tooltip="Sadece B2B ağındaki diğer galericilerin görebileceği, esnafa özel dip fiyat.">B2B (Esnaf) Fiyatı</FormLabel>
                                <div className="relative">
                                    {/* B2B Fiyat Input Maskeleme */}
                                    <Input 
                                        name="b2bPrice" 
                                        value={formatTurkishNumber(formData.b2bPrice)} 
                                        onChange={(e) => handleNumericChange('b2bPrice', e.target.value)} 
                                        className="bg-indigo-50/50 border-indigo-100 text-indigo-900 pr-12" 
                                        placeholder="Opsiyonel" 
                                    />
                                    <span className="absolute right-4 top-4 text-sm font-bold text-indigo-300">TL</span>
                                </div>
                            </div>
                        </div>

                        {/* Ek Bilgiler - Toggle Bölümü */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 flex items-center">Takas Olur <div className="ml-2"><Tooltip content="Müşterilerden gelecek takas tekliflerine açık olduğunuzu belirtir." /></div></h4>
                                    <p className="text-xs text-slate-500">Takas tekliflerini kabul et</p>
                                </div>
                                <Switch checked={!!formData.exchange} onCheckedChange={(v) => updateField('exchange', v)} />
                            </div>

                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 flex items-center">Garantili <div className="ml-2"><Tooltip content="Aracın üretici veya bayi garantisinin devam edip etmediği." /></div></h4>
                                    <p className="text-xs text-slate-500">Üretici/Bayi garantisi var</p>
                                </div>
                                <Switch checked={!!formData.warranty} onCheckedChange={(v) => updateField('warranty', v)} />
                            </div>

                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 flex items-center">Ağır Hasar Kayıtlı <div className="ml-2"><Tooltip content="Aracın pert kaydı veya ağır hasar kaydı varsa işaretleyin." /></div></h4>
                                    <p className="text-xs text-slate-500">Pert kaydı var mı?</p>
                                </div>
                                <Switch 
                                    checked={!!formData.heavyDamage} 
                                    onCheckedChange={(v) => updateField('heavyDamage', v)} 
                                    className="data-[state=checked]:bg-red-500" // Custom Red Color
                                />
                            </div>

                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-900 flex items-center">Konsinye (B2B) Paylaş <div className="ml-2"><Tooltip content="Bu aracı B2B ağında diğer galericilerle paylaşarak daha hızlı satılmasını sağlar." /></div></h4>
                                    <p className="text-xs text-indigo-500">Diğer galericiler görsün</p>
                                </div>
                                <Switch 
                                    checked={formData.status === VehicleStatus.CONSIGNMENT} 
                                    onCheckedChange={(v) => updateField('status', v ? VehicleStatus.CONSIGNMENT : VehicleStatus.FOR_SALE)} 
                                    className="data-[state=checked]:bg-indigo-600" // Custom Indigo Color
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-sm font-bold text-slate-900 flex items-center"><MapPin size={16} className="mr-2"/> Konum Bilgisi</h3>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                 <div>
                                     <FormLabel tooltip="Aracın bulunduğu il.">İl</FormLabel>
                                     <Combobox options={cities} value={formData.location?.city!} onChange={(val) => updateField('location.city', val)} error={errors['location.city']} />
                                 </div>
                                 <div>
                                     <FormLabel tooltip="Aracın bulunduğu ilçe.">İlçe</FormLabel>
                                     <Combobox options={districts} value={formData.location?.district!} onChange={(val) => updateField('location.district', val)} error={errors['location.district']} />
                                 </div>
                                 <div>
                                     <FormLabel tooltip="Aracın bulunduğu mahalle/semt.">Mahalle</FormLabel>
                                     <Combobox options={neighborhoods} value={formData.location?.neighborhood!} onChange={(val) => updateField('location.neighborhood', val)} error={errors['location.neighborhood']} />
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
            </form>
        </div>

        <div className="hidden lg:flex lg:col-span-4 h-full flex-col gap-6 sticky top-0">
            <LivePreviewCard />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-40 lg:hidden flex gap-3 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
        <Button variant="outline" className="flex-1" onClick={() => setIsPreviewOpen(true)}><Eye size={18} className="mr-2" /> Önizle</Button>
        {step > 1 && <Button variant="secondary" className="px-4" onClick={() => setStep(step - 1)}><ChevronLeft size={20} /></Button>}
        {step < 5 ? (
             <Button className="flex-[2]" onClick={() => setStep(step + 1)}>Sonraki <ChevronRight size={18} className="ml-2" /></Button>
        ) : (
            <Button className="flex-[2] bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "..." : "Yayınla"} <Check size={18} className="ml-2" /></Button>
        )}
      </div>

      <div className="hidden lg:flex justify-end mt-8 gap-4">
            {step > 1 && <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}><ChevronLeft size={18} className="mr-2" /> Geri</Button>}
            {step < 5 ? (
                <Button size="lg" onClick={() => setStep(step + 1)} className="min-w-[150px]">Sonraki <ArrowRight size={18} className="ml-2" /></Button>
            ) : (
                <Button size="lg" disabled={isSubmitting} onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 min-w-[200px]">{isSubmitting ? "Kaydediliyor..." : "İlanı Yayınla"} <Check size={18} className="ml-2" /></Button>
            )}
      </div>

      <Drawer isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="İlan Önizleme"><LivePreviewCard /><div className="mt-6"><Button className="w-full" onClick={() => setIsPreviewOpen(false)}>Kapat</Button></div></Drawer>
    </div>
  );
};

export default AddVehicle;
