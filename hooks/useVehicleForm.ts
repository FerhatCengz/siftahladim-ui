
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, addVehicle } from '../store';
import { Vehicle, VehicleStatus, FuelType, Transmission, ExpertiseReport, VehicleFeatures } from '../types';
import { CURRENT_USER_DEALER_ID } from '../constants';
import { validateVehicleForm } from '../lib/validation';
import { useImageUpload } from './useImageUpload';
import { getCoordinatesFromAddress } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * [HOOK: ARAÇ FORM YÖNETİCİSİ]
 * Amaç: Araç ekleme sürecindeki state, navigasyon ve kayıt işlemlerini yönetmek.
 * Not: AI özellikleri kaldırılmıştır. Manuel giriş ve Import odaklıdır.
 */
export const useVehicleForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const config = useSelector((state: RootState) => state.config);

  // -- States --
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<VehicleFeatures>({});
  const [expertiseReport, setExpertiseReport] = useState<ExpertiseReport>({});
  
  // Image Hook Entegrasyonu
  const { 
    images, setImages, handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDrop 
  } = useImageUpload();

  // Ana Form Datası
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    dealerId: CURRENT_USER_DEALER_ID,
    // GÜNCELLEME: Varsayılan olarak Konsinye (B2B) açık
    status: VehicleStatus.CONSIGNMENT, 
    fuel: FuelType.GASOLINE,
    transmission: Transmission.AUTOMATIC,
    warranty: false,
    heavyDamage: false,
    exchange: true,
    fromWho: 'Galeriden',
    location: { city: '', district: '', neighborhood: '' },
    description: '',
    tramer: 0,
    year: new Date().getFullYear()
  });

  // -- Handlers --

  const updateField = (field: string, value: any) => {
    // Nested alan kontrolü (location.city gibi)
    if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [child]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Hata temizleme
    if (errors[field]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }
  };

  // Form Gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resimleri forma ekle
    const dataToValidate = { ...formData, images };
    // Validasyon kütüphanesi tüm yeni kuralları kontrol edecek
    const { isValid, errors: newErrors, firstErrorStep } = validateVehicleForm(dataToValidate);

    if (!isValid) {
      setErrors(newErrors);
      if (firstErrorStep > 0) setStep(firstErrorStep);
      alert("Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }

    setIsSubmitting(true);

    // [YENİ] Adres verisinden koordinatları bul
    let coordinates = undefined;
    if (formData.location?.city && formData.location?.district) {
        try {
            coordinates = await getCoordinatesFromAddress(
                formData.location.city,
                formData.location.district,
                formData.location.neighborhood || ''
            );
        } catch (error) {
            console.error("Koordinat alınamadı:", error);
        }
    }

    // Mock API Call Simulation
    setTimeout(() => {
      const newVehicle: Vehicle = {
        ...(formData as Vehicle),
        id: uuidv4(),
        dealerId: CURRENT_USER_DEALER_ID,
        images: images,
        features: features,
        expertise: expertiseReport,
        coordinates: coordinates, // Koordinatları ekle
        // Sayısal değerleri garantiye al
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        enginePower: Number(formData.enginePower),
        engineVolume: Number(formData.engineVolume),
        tramer: Number(formData.tramer)
      };

      dispatch(addVehicle(newVehicle));
      setIsSubmitting(false);
      navigate('/consignment'); // Ekleme sonrası direkt haritaya yönlendir
    }, 800);
  };

  return {
    step, setStep,
    formData, updateField, setFormData,
    features, setFeatures,
    expertiseReport, setExpertiseReport,
    images, setImages, handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDrop,
    isSubmitting,
    errors, handleSubmit,
    config, dispatch
  };
};
