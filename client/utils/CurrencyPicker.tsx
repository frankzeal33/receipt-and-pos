"use client";

import { useState, useMemo } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { currencies } from "@/app/constants/data";
import { useTheme } from "next-themes";

// Transform to react-select options
export const currencyOptions = currencies.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.symbol})`,
  currency: c,
}));

export type CurrencyOption = typeof currencyOptions[number];

interface CurrencyPickerProps {
  onChange: (currency: CurrencyOption | null) => void; // handle clearing
  defaultValue?: CurrencyOption;
  placeholder?: string;
  customStyles?: StylesConfig<CurrencyOption, false>;
  isClearable?: boolean;
}

export default function CurrencyPicker({
  onChange,
  defaultValue,
  placeholder = "Select currency",
  customStyles,
  isClearable = true,
}: CurrencyPickerProps) {
  const [selected, setSelected] = useState<CurrencyOption | null>(defaultValue || null);
  const { theme } = useTheme();
  const handleChange = (option: SingleValue<CurrencyOption>) => {
    setSelected(option);
    onChange(option ?? null); // always call onChange, even if cleared
  };

  const isDark = theme === "dark";

  // react-select styles with dark/light mode
  const styles: StylesConfig<CurrencyOption, false> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#09090b" : "#ffffff",
      borderColor: isDark ? "#27272a" : "#d1d5db",
      color: isDark ? "#f9fafb" : "#111827",
      minHeight: 32,
      borderRadius: 6,
      boxShadow: "none",
      ":hover": {
        borderColor: isDark ? "#4b5563" : "#9ca3af",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#18181b" : "#ffffff",
      borderRadius: 8,
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      fontSize: 15,
      backgroundColor: state.isFocused
        ? isDark
          ? "#09090b"
          : "#f3f4f6"
        : "transparent",
      color: isDark ? "#f9fafb" : "#111827",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      fontSize: 15,
      gap: 8,
      color: isDark ? "#f9fafb" : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? "#f9fafb" : "#111827",
    }),
  };

  // Memoize options (optional optimization)
  const options = useMemo(() => currencyOptions, []);

  return (
    <Select
      options={options}
      value={selected}
      onChange={handleChange}
      placeholder={placeholder}
      isClearable={isClearable}
      styles={styles}
    />
  );
}
