
import React, { useState, useEffect } from "react";

interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, className }) => {

  const isControlled = typeof checked === "boolean";
  const [internalChecked, setInternalChecked] = useState(!!checked);
  useEffect(() => {
    if (isControlled) setInternalChecked(!!checked);
  }, [checked, isControlled]);
  const isChecked = isControlled ? !!checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(e.target.checked);
    onChange?.(e.target.checked);
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${className || ""}`}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isChecked}
        onChange={handleChange}
      />
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isChecked ? "bg-pink-500" : "bg-gray-200"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300`}> 
        <span
          className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white border border-gray-300 transition-transform duration-300 ${isChecked ? "translate-x-5" : "translate-x-0"}`}
        >
        </span>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
      )}
    </label>
  );
};

export default ToggleSwitch;
