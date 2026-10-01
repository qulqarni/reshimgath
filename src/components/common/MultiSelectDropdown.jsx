import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search, RotateCcw } from 'lucide-react';

export const MultiSelectDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  allLabel = 'All Options',
  placeholder = 'Select options...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    if (optionValue === 'All') {
      onChange([]);
      return;
    }

    const currentList = Array.isArray(selectedValues) ? [...selectedValues] : [];
    const index = currentList.indexOf(optionValue);

    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(optionValue);
    }

    onChange(currentList);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchQuery('');
  };

  const isSelected = (val) => {
    if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
      return val === 'All';
    }
    return selectedValues.includes(val);
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = Array.isArray(selectedValues) ? selectedValues.length : 0;

  // Format trigger display text
  const getDisplayText = () => {
    if (selectedCount === 0) return allLabel;
    if (selectedCount === 1) {
      const single = selectedValues[0];
      return single.split('/')[0]; // Show main name
    }
    if (selectedCount === 2) {
      return `${selectedValues[0].split('/')[0]}, ${selectedValues[1].split('/')[0]}`;
    }
    return `${selectedValues[0].split('/')[0]} +${selectedCount - 1} more`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-[11px] text-gray-500 mb-1 font-semibold">{label}</label>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all duration-200 ${
          selectedCount > 0
            ? 'border-brand-plum bg-brand-rose/10 text-brand-plum shadow-sm ring-1 ring-brand-plum/30'
            : 'border-gray-200 bg-gray-50/50 text-brand-charcoal hover:border-gray-300'
        }`}
      >
        <span className="truncate pr-2 font-medium">
          {getDisplayText()}
        </span>

        <div className="flex items-center space-x-1 shrink-0">
          {selectedCount > 0 && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-brand-rose/20 text-brand-plum transition-colors mr-0.5"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-brand-rose/20 p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 flex flex-col min-w-[200px]">
          
          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-plum/20 bg-gray-50"
              autoFocus
            />
            {searchQuery && (
              <X
                onClick={() => setSearchQuery('')}
                className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              />
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 text-[11px] font-semibold shrink-0">
            <button
              type="button"
              onClick={() => onChange([])}
              className={`hover:underline flex items-center space-x-1 ${selectedCount === 0 ? 'text-brand-plum font-bold' : 'text-gray-500'}`}
            >
              <span>{allLabel}</span>
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-brand-kesari hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Scrollable Checkbox List */}
          <div className="overflow-y-auto flex-1 space-y-0.5 custom-scrollbar max-h-48 pr-1">
            {/* All Option */}
            <div
              onClick={() => onChange([])}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedCount === 0 ? 'bg-brand-rose/20 text-brand-plum font-bold' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{allLabel}</span>
              {selectedCount === 0 && <Check className="w-3.5 h-3.5 text-brand-plum" />}
            </div>

            {/* Option List */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const checked = isSelected(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => handleToggle(opt)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      checked ? 'bg-brand-rose/15 text-brand-plum font-bold' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}} // handled by row click
                        className="rounded text-brand-plum focus:ring-brand-plum/20 w-3.5 h-3.5 shrink-0"
                      />
                      <span className="truncate">{opt}</span>
                    </div>
                    {checked && <Check className="w-3.5 h-3.5 text-brand-plum shrink-0 ml-1" />}
                  </div>
                );
              })
            ) : (
              <p className="p-3 text-center text-gray-400 text-xs font-normal">No matching options</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
