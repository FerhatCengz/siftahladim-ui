import React from 'react';
import { MOCK_CUSTOMERS } from '../constants';
import { Phone, Mail, FileText, Shield, Wrench, Calendar } from 'lucide-react';

const Customers: React.FC = () => {
  return (
    <div>
        <div className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900">Müşteri Portföyü & CRM</h1>
           <p className="text-gray-500">Müşterilerinize ek hizmetler (sigorta, kasko) sunarak gelirinizi artırın.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CUSTOMERS.map(customer => (
                <div key={customer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                            {customer.name.charAt(0)}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <FileText size={18} />
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                    
                    <div className="space-y-2 mt-4 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2" />
                            {customer.phone}
                        </div>
                        {customer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail size={14} className="mr-2" />
                                {customer.email}
                            </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={14} className="mr-2" />
                            Son Alım: {customer.lastPurchaseDate}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Çapraz Satış Fırsatları</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                                <Shield size={14} className="mr-1.5" />
                                Sigorta
                            </button>
                            <button className="flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors">
                                <Wrench size={14} className="mr-1.5" />
                                Bakım
                            </button>
                        </div>
                    </div>
                    
                    {customer.notes && (
                        <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500 italic">
                            "{customer.notes}"
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default Customers;