
import React, { useState, useEffect, useRef } from 'react';
import { DamageStatus, ExpertiseReport } from '../types';
import { Hand } from 'lucide-react';
import { cn } from '../lib/utils';

interface CarDamageSelectorProps {
  value: ExpertiseReport;
  onChange: (report: ExpertiseReport) => void;
  readOnly?: boolean;
}

const CarDamageSelector: React.FC<CarDamageSelectorProps> = ({ value, onChange, readOnly = false }) => {
  // Animation state: 'idle' -> 'hover' -> 'click1' -> 'click2' -> 'hover' ... (loops) -> 'done' (on user interaction)
  const [demoState, setDemoState] = useState<'idle' | 'hover' | 'click1' | 'click2' | 'done'>('idle');
  const animationRef = useRef<any>(null);

  // Animation Sequence Loop
  useEffect(() => {
    if (readOnly) return;

    let currentStep = 0; // 0: hover, 1: click1, 2: click2

    const runStep = () => {
        if (currentStep === 0) {
            setDemoState('hover');
            currentStep = 1;
        } else if (currentStep === 1) {
            setDemoState('click1');
            currentStep = 2;
        } else if (currentStep === 2) {
            setDemoState('click2');
            currentStep = 0; // Loop back
        }
    };

    // Initial Start Delay
    const startTimeout = setTimeout(() => {
        setDemoState('hover');
        currentStep = 1;
        
        // Loop interval (changes state every 1.2 seconds)
        animationRef.current = setInterval(runStep, 1200);
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [readOnly]);

  const stopAnimation = () => {
      if (demoState !== 'done') {
          if (animationRef.current) {
              clearInterval(animationRef.current);
              animationRef.current = null;
          }
          setDemoState('done');
      }
  };

  const getStatusColor = (status?: DamageStatus, partId?: string) => {
    // Demo Override logic for 'hood' (Path 2)
    if (partId === 'hood' && demoState !== 'idle' && demoState !== 'done') {
        if (demoState === 'click1') return 'rgba(234, 179, 8, 0.8)'; // Yellow (Local Painted)
        if (demoState === 'click2') return 'rgba(249, 115, 22, 0.8)'; // Orange (Painted)
        return 'rgba(34, 197, 94, 0.15)'; // Green (Original/Hover)
    }

    switch (status) {
      case DamageStatus.LOCAL_PAINTED: return 'rgba(234, 179, 8, 0.8)'; // Yellow-500
      case DamageStatus.PAINTED: return 'rgba(249, 115, 22, 0.8)'; // Orange-500
      case DamageStatus.CHANGED: return 'rgba(239, 68, 68, 0.8)'; // Red-500
      default: return 'rgba(34, 197, 94, 0.15)'; // Green-500
    }
  };

  const getStatusStroke = (status?: DamageStatus, partId?: string) => {
    // Demo Override logic
    if (partId === 'hood' && demoState !== 'idle' && demoState !== 'done') {
         if (demoState === 'click1') return '#eab308';
         if (demoState === 'click2') return '#f97316';
         return '#22c55e';
    }

    switch (status) {
      case DamageStatus.LOCAL_PAINTED: return '#eab308';
      case DamageStatus.PAINTED: return '#f97316';
      case DamageStatus.CHANGED: return '#ef4444';
      default: return '#22c55e';
    }
  };

  const handlePartClick = (partId: string) => {
    if (readOnly) return;
    
    // User interacted, stop demo loop immediately
    stopAnimation();

    const currentStatus = value[partId] || DamageStatus.ORIGINAL;
    let nextStatus = DamageStatus.ORIGINAL;

    if (currentStatus === DamageStatus.ORIGINAL) nextStatus = DamageStatus.LOCAL_PAINTED;
    else if (currentStatus === DamageStatus.LOCAL_PAINTED) nextStatus = DamageStatus.PAINTED;
    else if (currentStatus === DamageStatus.PAINTED) nextStatus = DamageStatus.CHANGED;
    else nextStatus = DamageStatus.ORIGINAL;

    const newValue = { ...value };
    if (nextStatus === DamageStatus.ORIGINAL) {
        delete newValue[partId]; // Keep state object clean
    } else {
        newValue[partId] = nextStatus;
    }

    onChange(newValue);
  };

  // Render Helper
  const RenderPart = ({ id, d }: { id: string, d: string }) => {
    const status = value[id] || DamageStatus.ORIGINAL;
    return (
      <path
        id={id}
        d={d}
        fill={getStatusColor(status, id)}
        stroke={getStatusStroke(status, id)}
        strokeWidth="1.5"
        className={`transition-all duration-300 ${!readOnly ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={() => handlePartClick(id)}
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs font-medium">
        <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm border border-green-600/20"></div> Orijinal</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 shadow-sm border border-yellow-600/20"></div> Lokal Boyalı</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2 shadow-sm border border-orange-600/20"></div> Boyalı</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm border border-red-600/20"></div> Değişen</div>
      </div>
      
      <div className="relative w-full max-w-lg aspect-[4/3]">
        {/* SVG Structure based on provided public/car.svg */}
        <svg
           version="1.1"
           id="svg1"
           viewBox="0 0 367.35999 272.64001"
           xmlns="http://www.w3.org/2000/svg"
           className="w-full h-full drop-shadow-sm select-none"
        >
          <g id="g1">
            {/* Image background is omitted to allow pure vector interaction */}
            
            {/* Path 1: Left Front Fender */}
            <RenderPart id="left-front-fender" d="M 53.050136,16.323119 V 18.7153 h -2.673614 l 0.07036,10.272308 3.588272,1.19609 c 0,0 0.02759,3.258609 1.055374,6.472961 1.042239,3.259543 1.758957,3.940063 1.758957,3.940063 l 30.53549,0.140717 0.140716,-1.336807 c 0,0 -6.779662,-1.283033 -12.101623,-8.865142 -4.842892,-6.899589 -5.065795,-14.212371 -5.065795,-14.212371 z" />
            
            {/* Path 2: Hood (Kaput) - This is the target for animation */}
            <RenderPart id="hood" d="M 120.5957 16.119141 C 120.5957 16.119141 120.94082 23.506935 115.37305 31.044922 C 110.72421 37.338785 101.5918 40.199219 101.5918 40.199219 C 101.5918 40.199219 116.2374 59.400195 142.98438 72.089844 C 165.1851 82.622602 192.13672 85.472656 192.13672 85.472656 C 192.13672 85.472656 186.76509 62.519734 184.47656 50.994141 C 182.18802 39.468548 178.40625 16.318359 178.40625 16.318359 L 120.5957 16.119141 z M 181.29102 52.835938 L 188.05859 82.087891 C 188.05859 82.087891 179.15344 81.688355 152.98438 71.890625 C 131.66408 63.908275 120.09766 52.935547 120.09766 52.935547 L 181.29102 52.835938 z " />
            
            {/* Path 3: Roof (Tavan) */}
            <RenderPart id="roof" d="M 180.69531 16.21875 C 180.69531 16.21875 184.37656 39.436303 186.71484 50.945312 C 189.05313 62.454322 194.72461 85.273438 194.72461 85.273438 L 236.41602 85.472656 L 254.02734 43.482422 L 253.92773 40.894531 C 253.92773 40.894531 244.96115 40.019223 238.10742 33.482422 C 231.05678 26.757807 230.44531 16.318359 230.44531 16.318359 L 180.69531 16.21875 z M 190.84375 52.835938 L 245.37109 53.035156 L 233.53125 82.087891 L 197.41211 82.087891 L 190.84375 52.835938 z " />
            
            {/* Path 5: Trunk (Bagaj) */}
            <RenderPart id="trunk" d="m 281.98759,16.268515 15.82076,0.04975 c 0,0 -0.0828,2.084693 2.41292,4.00494 2.45508,1.888962 4.10444,1.815905 4.10444,1.815905 l 0.0995,7.014864 -5.27359,5.024832 0.0498,6.368104 -34.17881,0.199003 0.0498,-1.19402 c 0,0 8.04389,-2.475597 12.63666,-9.900411 4.84771,-7.836955 4.27852,-13.382967 4.27852,-13.382967 z" />
            
            {/* Path 6: Right Rear Fender */}
            <RenderPart id="right-rear-fender" d="M 319.28516 89.496094 L 317.17578 91.607422 L 317.31641 178.42773 L 319.84961 180.67969 L 335.46875 180.53906 L 337.4375 178.28711 L 337.4375 92.029297 L 335.04688 89.636719 L 319.28516 89.496094 z M 326.84961 93.277344 C 330.73104 93.283207 331.10547 97.023438 331.10547 97.023438 L 331.14062 107.29688 C 331.14062 107.29687 330.49654 110.9903 326.79688 110.9375 C 323.09721 110.88473 322.45117 107.40234 322.45117 107.40234 L 322.38086 96.777344 C 322.38086 96.777344 322.96817 93.271444 326.84961 93.277344 z M 326.81445 159.25586 C 330.29719 159.31449 331.17578 162.98438 331.17578 162.98438 L 331.10547 173.39844 C 331.10547 173.39844 330.10961 176.71671 326.74414 176.75781 C 323.37867 176.79885 322.52148 173.43359 322.52148 173.43359 L 322.31055 162.84375 C 322.31055 162.84375 323.33172 159.19726 326.81445 159.25586 z " />
            
            {/* Path 8: Left Rear Fender */}
            <RenderPart id="left-rear-fender" d="m 280.30735,91.887902 c 0,0 5.17133,-1.254722 7.91531,-1.653419 2.74397,-0.398697 8.54853,-0.738762 8.54853,-0.738762 0,0 8.76334,18.904069 8.51335,45.873599 -0.26826,28.94071 -8.37264,45.02929 -8.37264,45.02929 0,0 -4.78044,0.25228 -8.05779,-0.2551 -3.86275,-0.598 -8.40604,-1.99637 -8.40604,-1.99637 0,0 6.79778,-20.31105 6.96547,-42.84819 0.16456,-22.11684 -7.10619,-43.411048 -7.10619,-43.411048 z" />
            
            {/* Path 9: Right Front Door */}
            <RenderPart id="right-front-door" d="m 189.9486,103.18318 0.0995,63.38253 c 0,0 15.19058,-0.96185 22.83562,-0.94527 7.64504,0.0166 23.03462,1.04477 23.03462,1.04477 l 0.19901,-63.28304 c 0,0 -15.38958,1.02819 -23.08438,0.99502 -7.69479,-0.0332 -23.08437,-1.19401 -23.08437,-1.19401 z" />
            
            {/* Path 10: Left Front Door */}
            <RenderPart id="left-front-door" d="m 117.92046,86.540673 c 0,0 -27.053425,1.880421 -36.892985,2.644471 -13.060508,1.01416 -22.067244,2.843475 -22.067244,2.843475 0,0 -10.741363,7.973941 -10.764815,42.637111 -0.02345,34.66318 10.483382,43.05927 10.483382,43.05927 0,0 7.22345,2.25146 18.785659,3.16612 9.89172,0.7825 40.596723,2.60325 40.596723,2.60325 0,0 -8.1719,-17.84824 -7.63248,-48.07884 0.53941,-30.23061 7.49176,-48.874857 7.49176,-48.874857 z" />
            
            {/* Path 11: Front Bumper */}
            <RenderPart id="front-bumper" d="M 22.716797 87.515625 C 22.296634 87.522598 21.333968 87.660863 20.349609 88.650391 C 18.91418 90.093358 19.253906 91.267578 19.253906 91.267578 L 19.335938 177.63477 C 19.335938 177.63477 19.448577 178.70584 20.216797 179.66211 C 21.039875 180.68636 21.951172 180.67969 21.951172 180.67969 L 36.386719 180.67969 C 36.386719 180.67969 37.523747 180.34715 38.123047 179.48242 C 38.624777 178.75847 38.697266 177.44336 38.697266 177.44336 L 38.837891 90.621094 C 38.837891 90.621094 38.755873 89.872097 37.779297 88.794922 C 36.706881 87.612035 36.023438 87.666016 36.023438 87.666016 L 22.9375 87.525391 C 22.9375 87.525391 22.856851 87.513301 22.716797 87.515625 z M 25.505859 94.095703 C 25.598184 94.09356 25.694486 94.098364 25.792969 94.109375 C 27.085788 94.253927 29.44209 94.004073 31.59375 96.056641 C 33.238942 97.626066 33.419922 99.626953 33.419922 99.626953 L 33.630859 113.98047 C 33.630859 113.98047 33.622256 114.9193 33.265625 114.93945 C 32.179552 115.00075 31.873047 114.75391 31.873047 114.75391 C 31.873047 114.75391 27.182479 112.31792 25.787109 111.06445 C 24.415057 109.83192 23.570312 107.29688 23.570312 107.29688 L 23.429688 95.546875 C 23.429688 95.546875 24.120994 94.127857 25.505859 94.095703 z M 32.515625 155.22266 C 33.299725 155.25354 33.490234 156.05469 33.490234 156.05469 L 33.560547 170.54883 C 33.560547 170.54883 33.140974 173.10912 31.376953 174.57031 C 29.875493 175.81401 27.270581 176.18103 26.34375 176.27734 C 23.558501 176.56678 23.535156 174.98047 23.535156 174.98047 L 23.675781 163.01953 C 23.675781 163.01953 23.895145 160.70174 25.552734 159.52539 C 26.51302 158.8439 29.310117 157.02741 31.041016 155.80469 C 31.680208 155.35316 32.159216 155.20862 32.515625 155.22266 z " />
            
            {/* Path 12: Front Grille */}
            <RenderPart id="front-grille" d="m 56.715924,229.64974 c 0,0 -1.562522,3.38 -2.001987,5.0964 -0.439466,1.7164 -0.634806,5.20202 -0.634806,5.20202 l -3.582058,1.39302 v 10.14917 l 2.537291,5e-5 0.02488,2.46267 17.393943,0.0746 c 0,0 -0.06663,-7.92463 4.907906,-14.15442 6.178222,-7.73723 12.051085,-9.07921 12.051085,-9.07921 v -1.14427 z" />
            
            {/* Path 13: Right Rear Door */}
            <RenderPart id="right-rear-door" d="M 192.13672 184.77539 C 192.13672 184.77539 171.05745 185.38659 142.26172 198.65039 C 118.0444 209.8053 101.29297 229.94922 101.29297 229.94922 C 101.29297 229.94922 110.38806 232.23282 115.23047 238.91602 C 120.07287 245.5992 120.79492 253.92773 120.79492 253.92773 L 178.60547 254.12695 C 178.60547 254.12695 182.03294 231.26402 184.24414 219.93164 C 186.54368 208.1465 192.13672 184.77539 192.13672 184.77539 z M 187.95898 188.25781 L 181.58984 217.41016 L 120.35938 217 C 120.35938 217 136.92234 204.37693 153.97852 197.89258 C 174.31971 190.15934 187.95898 188.25781 187.95898 188.25781 z " />
            
            {/* Path 14: Right Front Fender */}
            <RenderPart id="right-front-fender" d="M 194.52539 184.57617 C 194.52539 184.57617 189.15748 207.17706 186.87109 218.52734 C 184.51408 230.22824 180.5957 253.72852 180.5957 253.72852 L 230.54492 253.92773 C 230.54492 253.92773 230.62943 244.00261 237.41211 237.40234 C 244.1948 230.80208 253.92773 229.25195 253.92773 229.25195 L 253.92773 226.66406 L 236.2168 184.57617 L 194.52539 184.57617 z M 197.41211 187.85938 L 233.23242 187.95898 L 245.27148 217.3125 L 190.84375 217.01367 L 197.41211 187.85938 z " />
            
            {/* Path 15: Rear Bumper */}
            <RenderPart id="rear-bumper" d="m 264.96038,229.59999 -0.0124,1.29352 c 0,0 7.3661,2.58006 12.27131,9.03071 4.90521,6.45066 4.9176,14.05367 4.9176,14.05367 l 15.89538,0.0497 c 0,0 -0.0236,-2.34918 2.10745,-3.88316 2.13099,-1.53399 4.23578,-1.76356 4.23578,-1.76356 l -0.0995,-7.38799 -5.07458,-4.87558 v -6.46761 z" />
          </g>
        </svg>

        {/* Animation Hand Overlay */}
        {demoState !== 'idle' && demoState !== 'done' && (
            <div 
                className={cn(
                    "absolute transition-all duration-300 pointer-events-none text-slate-900 drop-shadow-xl z-20",
                    (demoState === 'click1' || demoState === 'click2') ? "scale-90" : "scale-100"
                )}
                style={{ top: '15%', left: '42%' }}
            >
                <div className="relative">
                    <Hand size={42} fill="white" className="animate-pulse" />
                    <div className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full transition-colors duration-300 border-2 border-white",
                        demoState === 'click1' ? 'bg-yellow-500' : demoState === 'click2' ? 'bg-orange-500' : 'bg-transparent'
                    )}></div>
                </div>
            </div>
        )}
      </div>
      
      {!readOnly && (
        <div className="mt-4 flex flex-col items-center animate-in fade-in duration-700">
            <p className="text-slate-500 text-xs italic mb-1">Durumu değiştirmek için parçalara tıklayın.</p>
            {demoState !== 'done' && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg animate-pulse">Nasıl çalıştığını izleyin...</span>
            )}
        </div>
      )}
    </div>
  );
};

export default CarDamageSelector;
