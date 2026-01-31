import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";

interface SearchFormProps extends React.ComponentProps<"form"> {
  inputValue?: string;
  inputOnChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchInput({
  placeholder,
  disabled,
  inputOnChange,
  inputValue,
  ...formProps
}: SearchFormProps) {
  return (
    <form {...formProps}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          value={inputValue}
          onChange={inputOnChange}
          placeholder={placeholder}
          className="h-8 pl-7 bg-light"
          disabled={disabled}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  );
}
