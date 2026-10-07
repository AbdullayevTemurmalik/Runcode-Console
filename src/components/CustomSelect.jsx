import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Tanlang...',
  icon: Icon,
  disabled = false,
  className = '',
  dropdownClassName = '',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label ?? opt.value,
        subtext: opt.subtext,
        disabled: opt.disabled
      };
    }
    return {
      value: opt,
      label: String(opt),
      subtext: null,
      disabled: false
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-xs rounded-xl',
    md: 'py-2.5 px-3.5 text-xs sm:text-sm rounded-xl',
    lg: 'py-3.5 px-4 text-sm sm:text-base rounded-2xl'
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
          sizeClasses[size] || sizeClasses.md
        } ${
          isOpen
            ? 'bg-white dark:bg-[#101422] border-brand-500 ring-2 ring-brand-500/20 shadow-lg'
            : 'bg-white dark:bg-[#101422] border-gray-200 dark:border-white/[0.08] hover:border-brand-500/50'
        } border ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate mr-2">
          {Icon && (
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isOpen ? 'text-brand-500' : 'text-gray-400'
              }`}
            />
          )}
          <span
            className={`truncate font-medium ${
              selectedOption
                ? 'text-gray-900 dark:text-white font-semibold'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-2xl shadow-black/40 backdrop-blur-xl animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto ${dropdownClassName}`}
          style={{ minWidth: '100%' }}
        >
          {normalizedOptions.length === 0 ? (
            <div className="py-3 px-3 text-center text-xs text-gray-400">
              Variantlar yo'q
            </div>
          ) : (
            <div className="space-y-0.5">
              {normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-sm'
                        : opt.disabled
                        ? 'opacity-40 cursor-not-allowed text-gray-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="block truncate">{opt.label}</span>
                      {opt.subtext && (
                        <span
                          className={`block text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
