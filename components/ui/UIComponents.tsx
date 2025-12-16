
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn, turkishToLower } from "../../lib/utils";
import { ChevronDown, Check, HelpCircle, X, AlertCircle, Info } from "lucide-react";

// --- Button ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-md": variant === "destructive",
            "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900": variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
            "hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
            "text-slate-900 underline-offset-4 hover:underline": variant === "link",
            "h-11 px-5 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-14 rounded-2xl px-8 text-base": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// --- Switch (Toggle) ---
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}
export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, className }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-slate-900" : "bg-slate-200",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};

// --- Drawer (Bottom Sheet for Mobile, Modal-like) ---
export const Drawer = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title?: string; children?: React.ReactNode }) => {
  const [animate, setAnimate] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      // Small delay to ensure render before animation starts
      requestAnimationFrame(() => {
         requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const portalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-center items-end md:items-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
          animate ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative bg-white w-full md:w-[550px] md:rounded-3xl rounded-t-[2rem] shadow-2xl transform transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col max-h-[90dvh]",
          animate 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-8 opacity-0 scale-95"
        )}
      >
        {/* Mobile Drag Indicator */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 shrink-0">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
           <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 z-10"
            >
              <X size={20} />
            </button>
        )}

        {/* Body */}
        <div className="p-0 overflow-y-auto no-scrollbar rounded-b-3xl">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
};

// --- Dialog (Center Modal) ---
export const Dialog = ({ isOpen, onClose, title, description, children, footer }: { isOpen: boolean; onClose: () => void; title?: string; description?: string; children?: React.ReactNode, footer?: React.ReactNode }) => {
    const [animate, setAnimate] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
  
    useEffect(() => {
      if (isOpen) {
        setShouldRender(true);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      } else {
        setAnimate(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
          document.body.style.overflow = 'unset';
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);
  
    if (!shouldRender) return null;
  
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className={cn(
            "fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ease-out",
            animate ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        
        {/* Modal Window */}
        <div 
          className={cn(
            "relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 transform transition-all duration-200 scale-95 opacity-0",
            animate && "scale-100 opacity-100"
          )}
        >
            {title && <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>}
            {description && <p className="text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>}
            
            <div className="mt-2">
                {children}
            </div>

            {footer && (
                <div className="mt-6 flex justify-end gap-3 pt-2">
                    {footer}
                </div>
            )}

            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
                <X size={18} />
            </button>
        </div>
      </div>,
      document.body
    );
};

// --- Advanced Tooltip ---
interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  delay?: number;
}

export const Tooltip = ({ content, children, position = "top", className, delay = 200 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent",
  };

  return (
    <div className="relative inline-flex items-center align-middle" 
         onMouseEnter={showTooltip} 
         onMouseLeave={hideTooltip}
         onClick={() => setIsVisible(!isVisible)}
    >
      {children ? children : <HelpCircle size={15} className="text-slate-400 hover:text-blue-600 cursor-help transition-colors" />}
      
      {isVisible && (
        <div className={cn(
            "absolute z-[100] w-max max-w-[240px] px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200 text-center leading-relaxed tracking-wide pointer-events-none",
            positionClasses[position],
            className
        )}>
          {content}
          <div className={cn("absolute border-4", arrowClasses[position])}></div>
        </div>
      )}
    </div>
  );
};

// --- Form Label ---
export const FormLabel = ({ children, tooltip, className }: { children?: React.ReactNode, tooltip?: string | React.ReactNode, className?: string }) => (
  <div className={cn("flex items-center mb-2.5 select-none", className)}>
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {children}
    </label>
    {tooltip && (
        <div className="ml-1.5">
            <Tooltip content={tooltip} />
        </div>
    )}
  </div>
);

// --- Input ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-14 w-full rounded-2xl border bg-white px-4 py-2 text-base text-slate-900 font-semibold placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-4 transition-all shadow-sm",
            error 
              ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30" 
              : "border-slate-200 focus:border-slate-400 focus:ring-slate-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <div className="mt-1.5 flex items-center text-red-500 text-xs font-bold animate-in slide-in-from-top-1">
            <AlertCircle size={12} className="mr-1.5" />
            {error}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// --- Select (Custom Shadcn-like) ---
interface SelectProps {
  options: { value: string | number; label: string | number }[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder = "Seçiniz", className, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value == value)?.label;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div 
        className={cn(
          "flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-4 py-2 text-base font-medium cursor-pointer transition-all shadow-sm hover:border-slate-300",
          error 
            ? "border-red-300 ring-red-100 hover:border-red-400 bg-red-50/30" 
            : isOpen ? "border-slate-400 ring-4 ring-slate-100" : "border-slate-200",
          !value && !error && "text-slate-400 font-normal",
          error && !value && "text-red-400"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn("block truncate", !value ? (error ? "text-red-400" : "text-slate-400") : "text-slate-900 font-semibold")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180", error ? "text-red-400" : "text-slate-400")} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 py-2">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50",
                value == opt.value && "bg-slate-50 text-slate-900"
              )}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <span className="flex-1">{opt.label}</span>
              {value == opt.value && <Check className="h-4 w-4 text-slate-900" />}
            </div>
          ))}
        </div>
      )}
      {error && (
          <div className="mt-1.5 flex items-center text-red-500 text-xs font-bold animate-in slide-in-from-top-1">
            <AlertCircle size={12} className="mr-1.5" />
            {error}
          </div>
      )}
    </div>
  );
};

// --- Combobox ---
interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCreate?: (value: string) => void;
  className?: string;
  error?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, placeholder = "Seçiniz...", onCreate, className, error }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    turkishToLower(opt).includes(turkishToLower(query))
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (onCreate && query) {
      onCreate(query);
      onChange(query);
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div 
        className={cn(
            "flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-4 py-2 text-base font-medium cursor-pointer transition-all shadow-sm hover:border-slate-300",
            error 
              ? "border-red-300 ring-red-100 hover:border-red-400 bg-red-50/30" 
              : isOpen ? "border-slate-400 ring-4 ring-slate-100" : "border-slate-200",
            !value && !error && "text-slate-400 font-normal",
            error && !value && "text-red-400"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn("block truncate text-slate-900 font-semibold", !value ? (error ? "text-red-400" : "text-slate-400 font-normal") : "")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180", error ? "text-red-400" : "text-slate-400")} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 p-2">
          <div className="flex items-center border-b border-slate-50 px-2 pb-2 mb-1" onClick={(e) => e.stopPropagation()}>
            <input
              className="flex h-10 w-full rounded-xl bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-400 text-slate-900 font-medium"
              placeholder="Ara veya ekle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && onCreate && query && filteredOptions.length === 0) {
                      e.preventDefault();
                      handleCreate();
                  }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-0.5">
            {onCreate && query && !options.some(o => turkishToLower(o) === turkishToLower(query)) && (
              <div 
                className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm font-semibold outline-none bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
                onClick={handleCreate}
              >
                <span className="font-bold">"{query}"</span>&nbsp;olarak ekle
              </div>
            )}
            
            {filteredOptions.length === 0 && !query && (
              <p className="p-3 text-xs text-slate-400 text-center font-medium">Sonuç yok.</p>
            )}
            
            {filteredOptions.map((opt) => (
              <div
                key={opt}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm font-medium outline-none transition-colors",
                  value === opt ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                )}
                onClick={() => handleSelect(opt)}
              >
                <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
          <div className="mt-1.5 flex items-center text-red-500 text-xs font-bold animate-in slide-in-from-top-1">
            <AlertCircle size={12} className="mr-1.5" />
            {error}
          </div>
      )}
    </div>
  );
};

// --- Card Components ---
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm", className)} {...props} />
));
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 md:p-8", className)} {...props} />
));
export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-xl font-bold leading-none tracking-tight text-slate-900", className)} {...props} />
));
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 md:p-8 pt-0", className)} {...props} />
));
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 md:p-8 pt-0", className)} {...props} />
));
