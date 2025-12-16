
import React, { useState, useEffect } from 'react';
import { Smartphone, Plug, AlertCircle, Sparkles, Link, X, Search, Download, ExternalLink, QrCode, ArrowLeft, CheckCircle2, RefreshCw, Chrome, AppWindow } from 'lucide-react';
import { cn } from '../lib/utils';
import { Drawer, Button } from './ui/UIComponents';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useVehicleImport } from '../hooks/useVehicleImport';
import { Vehicle } from '../types';

interface VehicleImportWizardProps {
    onDataReceived: (data: Partial<Vehicle>) => void;
}

// Platform Konfigürasyonu
const SUPPORTED_PLATFORMS = [
    {
        id: 'sahibinden',
        label: 'Sahibinden',
        homeUrl: 'https://www.sahibinden.com/kategori/otomobil',
        logo: 'https://s0.shbdn.com/assets/images/sahibindencom-logo-s:6af6f8af6cb352097d43a6709122523d.png',
        borderColor: 'hover:border-[#FFD000]',
        ringColor: 'hover:ring-[#FFD000]/20',
        activeBorder: 'focus:border-[#FFD000]',
        activeRing: 'focus:ring-[#FFD000]/10',
        btnBg: 'bg-[#FFD000] hover:bg-[#FFD930]',
        btnText: 'text-black',
        placeholder: 'https://www.sahibinden.com/ilan/...'
    },
    {
        id: 'arabam',
        label: 'Arabam.com',
        homeUrl: 'https://www.arabam.com/ikinci-el/otomobil',
        logo: 'https://avatars.mds.yandex.net/i?id=754406a7cb786852bc0d337ad2723a7ef20c1366-5219731-images-thumbs&n=13',
        borderColor: 'hover:border-red-500',
        ringColor: 'hover:ring-red-500/20',
        activeBorder: 'focus:border-red-600',
        activeRing: 'focus:ring-red-600/10',
        btnBg: 'bg-red-600 hover:bg-red-700',
        btnText: 'text-white',
        placeholder: 'https://www.arabam.com/ilan/...'
    }
] as const;

type PlatformType = typeof SUPPORTED_PLATFORMS[number]['id'];

const VehicleImportWizard: React.FC<VehicleImportWizardProps> = ({ onDataReceived }) => {
    const [selectedPlatformId, setSelectedPlatformId] = useState<PlatformType | null>(null);
    const [importLink, setImportLink] = useState("");
    const [showExtensionModal, setShowExtensionModal] = useState(false);
    
    // Hooks
    const { isMobile } = useDeviceDetect();
    const isReactNative = typeof window !== 'undefined' && (window as any).ReactNativeWebView;
    
    // Hook: Veri alma işlemleri
    const { startImport, isImporting, importStatus, extensionDetected } = useVehicleImport({
        onDataReceived: (data) => {
            onDataReceived(data);
            setSelectedPlatformId(null);
            setImportLink("");
        }
    });

    const activePlatform = SUPPORTED_PLATFORMS.find(p => p.id === selectedPlatformId);

    // Eklenti durumu değiştiğinde modalı kapat
    useEffect(() => {
        if (extensionDetected && showExtensionModal) {
            setShowExtensionModal(false);
        }
    }, [extensionDetected]);

    const handlePlatformSelect = (platformId: PlatformType) => {
        // 1. React Native Bridge Kontrolü
        // Eğer uygulama React Native WebView içindeyse, native tarafa sinyal gönder.
        if (isReactNative) {
            const targetPlatform = SUPPORTED_PLATFORMS.find(p => p.id === platformId);
            const message = {
                type: 'OPEN_EXTERNAL_BROWSER',
                platform: platformId,
                targetUrl: targetPlatform?.homeUrl
            };
            
            // Native tarafa mesajı post et
            (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
            return;
        }

        // 2. Normal Web/Mobil Web Akışı
        if (!isMobile && !extensionDetected) {
            setShowExtensionModal(true);
            return;
        }
        setSelectedPlatformId(platformId);
    };

    const handleImportClick = () => {
        if (!selectedPlatformId) return;
        
        if (!isMobile && !extensionDetected) {
            setShowExtensionModal(true);
            return;
        }
        
        if (importLink) {
            startImport(importLink, selectedPlatformId);
        }
    };

    const StepItem = ({ number, title, desc, icon: Icon }: any) => (
        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                {number}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1 flex items-center">
                    {title}
                    {Icon && <Icon size={16} className="ml-2 text-slate-400" />}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );

    return (
        <div className="mb-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden transition-all duration-300">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

            {/* Loading Overlay */}
            {isImporting && (
                <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-lg font-bold text-slate-900">Veriler Aktarılıyor</h3>
                        <p className="text-sm text-slate-500 mt-1">{importStatus}</p>
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-6 right-6 z-20">
                {isReactNative ? (
                    <div className="flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm">
                        <AppWindow size={12} className="mr-1.5" /> Native Mod
                    </div>
                ) : (
                    extensionDetected ? (
                        <div className="flex items-center text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full shadow-sm">
                            <Plug size={12} className="mr-1.5" /> {isMobile ? 'Mobil Web' : 'Eklenti Aktif'}
                        </div>
                    ) : (
                        <div className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                            <AlertCircle size={12} className="mr-1.5" /> Hazır Değil
                        </div>
                    )
                )}
            </div>

            {!selectedPlatformId ? (
                /* 1. SELECTION STATE */
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
                            <Sparkles size={20} className="mr-2" />
                            <span className="text-xs font-bold uppercase tracking-wide">Akıllı İçe Aktarma</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            İlanlarınızı Tek Tıkla Taşıyın
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
                            {isReactNative 
                                ? "Platform seçerek ilanı bulun, OtoVizyon gerisini halletsin."
                                : isMobile 
                                    ? "Mobil cihazınızda ilan linkini yapıştırarak veya native paylaşım ile verileri aktarın."
                                    : "Diğer platformlardaki ilan linkinizi kullanarak araç verilerini, fotoğrafları ve ekspertiz bilgilerini saniyeler içinde OtoVizyon'a aktarın."
                            }
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {SUPPORTED_PLATFORMS.map((platform) => (
                            <button 
                                key={platform.id}
                                onClick={() => handlePlatformSelect(platform.id)}
                                className={cn(
                                    "relative flex items-center justify-center bg-white border-2 border-slate-100 px-6 py-5 rounded-2xl shadow-sm hover:shadow-md transition-all group w-full sm:w-48",
                                    "hover:ring-2",
                                    platform.borderColor,
                                    platform.ringColor
                                )}
                            >
                                <div className="flex flex-col items-center">
                                    <img src={platform.logo} className="h-6 object-contain mb-2 opacity-80 group-hover:opacity-100 transition-opacity" alt={platform.label} />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                                        {isReactNative ? 'Araç Bul' : 'İlan Ekle'}
                                    </span>
                                </div>
                                
                                {!extensionDetected && !isMobile && !isReactNative && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <span className="text-xs font-bold text-white">!</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* 2. INPUT STATE (Sadece Web/Mobil Web için) */
                <div className="flex flex-col relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={() => setSelectedPlatformId(null)}
                            className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center">
                            {activePlatform && (
                                <img src={activePlatform.logo} className="h-6 object-contain mr-3" alt={activePlatform.label} />
                            )}
                            <span className="text-lg font-bold text-slate-900">Linkini Yapıştırın</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Link size={18} className={cn("text-slate-400 transition-colors", "group-focus-within:text-slate-800")} />
                            </div>
                            <input 
                                type="text" 
                                value={importLink}
                                onChange={(e) => setImportLink(e.target.value)}
                                placeholder={activePlatform?.placeholder}
                                className={cn(
                                    "w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-200 outline-none focus:ring-4 font-medium transition-all text-slate-700 placeholder:text-slate-300",
                                    activePlatform?.activeBorder,
                                    activePlatform?.activeRing
                                )}
                                autoFocus
                            />
                            {importLink && (
                                <button onClick={() => setImportLink('')} className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={handleImportClick}
                            className={cn(
                                "h-14 px-8 rounded-2xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center whitespace-nowrap min-w-[160px]",
                                activePlatform?.btnBg,
                                activePlatform?.btnText
                            )}
                        >
                            {(extensionDetected || isMobile) ? (<><Search size={20} className="mr-2" /> Verileri Getir</>) : (<><Download size={20} className="mr-2" /> Eklentiyi İndir</>)}
                        </button>
                    </div>
                    
                    <p className="mt-4 text-xs text-slate-400 pl-1">
                        * İlan detay sayfasındaki linki kopyalayıp buraya yapıştırın. {isMobile ? 'Uygulama arka planda verileri işleyecektir.' : 'Eklentimiz verileri otomatik olarak formata çevirecektir.'}
                    </p>
                </div>
            )}

            {/* Modal Components (Extension Guide) */}
            <Drawer isOpen={showExtensionModal} onClose={() => setShowExtensionModal(false)} title="OtoVizyon Asistan Kurulumu">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-3 ring-8 ring-blue-50/50">
                            <Chrome size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">3 Adımda Hızlı Kurulum</h3>
                        <p className="text-slate-500 text-xs">Diğer platformlardan veri çekebilmek için eklentimizi kurun.</p>
                    </div>
                    <div className="space-y-4 mb-8">
                        <StepItem number="1" title="Chrome Mağazasını Açın" desc="Aşağıdaki butona tıklayarak güvenli eklenti mağazamıza gidin." icon={ExternalLink} />
                        <StepItem number="2" title="'Chrome'a Ekle' Butonuna Basın" desc="Açılan sayfada sağ üstteki mavi butona tıklayarak kurulumu onaylayın." icon={Download} />
                        <StepItem number="3" title="Sayfayı Yenileyin" desc="Kurulum tamamlandıktan sonra bu sayfayı yenileyin veya 'Kontrol Et' butonuna basın." icon={CheckCircle2} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <a href="https://chromewebstore.google.com/" target="_blank" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20">
                            <ExternalLink size={20} className="mr-2" /> Mağazaya Git
                        </a>
                        <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => window.location.reload()}>
                            <RefreshCw size={20} className="mr-2" /> Sayfayı Yenile ve Kontrol Et
                        </Button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default VehicleImportWizard;
