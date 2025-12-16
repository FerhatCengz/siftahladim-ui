import React from 'react';
import { MOCK_AI_LOGS } from '../constants';
import { MessageSquare, Bot, Search, Phone, MoreVertical, Database, RefreshCw } from 'lucide-react';

const AiAssistant: React.FC = () => {
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar / Config */}
      <div className="w-80 hidden lg:flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg text-white">
                    <Bot size={24} />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900">Asistan Ayarları</h2>
                    <span className="text-xs text-green-600 font-semibold flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Sistem Aktif
                    </span>
                </div>
            </div>
         </div>
         
         <div className="p-4 space-y-6 overflow-y-auto">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Veri Tabanı Bağlantısı</label>
                <div className="flex items-center space-x-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Database size={16} />
                    <span>SQL_Main_DB (Bağlı)</span>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Otomatik Yanıt Kuralları</label>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600">Fiyat Sorgusu</span>
                    <input type="checkbox" checked className="toggle-checkbox" readOnly />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600">Tramer / Hasar</span>
                    <input type="checkbox" checked className="toggle-checkbox" readOnly />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600">Konum İsteği</span>
                    <input type="checkbox" checked className="toggle-checkbox" readOnly />
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2">n8n Entegrasyonu</h4>
                <p className="text-xs text-blue-700">Webhook uç noktası aktif. Son senkronizasyon: 2 dk önce.</p>
                <button className="mt-3 w-full py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 flex items-center justify-center">
                    <RefreshCw size={12} className="mr-2" /> Test Et
                </button>
            </div>
         </div>
      </div>

      {/* Main Chat Log */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-gray-900">Canlı Mesaj İzleme</h2>
                <p className="text-xs text-gray-500">Müşterilerden gelen sorular ve AI yanıtları</p>
            </div>
            <div className="flex items-center space-x-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Mesajlarda ara..." 
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
            {MOCK_AI_LOGS.map((log) => (
                <div key={log.id} className="flex flex-col gap-2">
                    <div className="flex items-end space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <Phone size={16} className="text-gray-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm max-w-xl border border-gray-100">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-bold text-gray-900">{log.customerName}</span>
                                <span className="text-xs text-gray-400">{log.timestamp}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{log.query}</p>
                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Platform: {log.platform}</span>
                        </div>
                    </div>

                    <div className="flex items-end space-x-2 justify-end">
                        <div className="bg-green-600 p-4 rounded-2xl rounded-br-none shadow-sm max-w-xl text-white">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-sm font-bold text-green-100 flex items-center">
                                    <Bot size={14} className="mr-1" /> OtoVizyon AI
                                </span>
                            </div>
                            <p className="text-green-50 text-sm">{log.response}</p>
                            <div className="mt-2 flex items-center justify-end space-x-2">
                                <span className="text-[10px] text-green-200 opacity-75">Veritabanı: OK</span>
                                <span className="text-[10px] text-green-200 opacity-75">Analiz: {log.sentiment}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                n8n Worker Dinleniyor...
            </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;