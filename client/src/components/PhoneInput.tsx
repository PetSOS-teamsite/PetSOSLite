import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { Country } from "@shared/schema";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  testId?: string;
  autoComplete?: string;
  name?: string;
}

const FALLBACK_COUNTRIES: Partial<Country>[] = [
  { code: 'HK', nameEn: 'Hong Kong', phonePrefix: '+852', flag: '🇭🇰', active: true },
  { code: 'US', nameEn: 'United States', phonePrefix: '+1', flag: '🇺🇸', active: true },
  { code: 'GB', nameEn: 'United Kingdom', phonePrefix: '+44', flag: '🇬🇧', active: true },
];

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  placeholder = "1234 5678",
  testId,
  autoComplete,
  name,
}: PhoneInputProps) {
  const { data: countries = [], isLoading, isError } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // Use fallback countries if API fails or returns empty
  const countryList = (countries.length > 0 ? countries : FALLBACK_COUNTRIES) as Country[];

  // Filter to only active countries with valid phone prefix, remove duplicates, and sort by name
  const activeCountries = countryList
    .filter((c) => c.active && c.phonePrefix) // Must have phonePrefix to avoid empty SelectItem values
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

  // Remove duplicate phone prefixes - keep only first country for each prefix
  const uniqueCountries = activeCountries.reduce((acc, country) => {
    if (country.phonePrefix && !acc.find(c => c.phonePrefix === country.phonePrefix)) {
      acc.push(country);
    }
    return acc;
  }, [] as Country[]);

  // Handle input change with proper event handling for React Hook Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Don't render Select with empty items - causes Radix UI crash
  const hasCountries = uniqueCountries.length > 0;

  return (
    <div className="flex gap-2">
      {hasCountries ? (
        <Select value={countryCode} onValueChange={onCountryCodeChange} disabled={isLoading}>
          <SelectTrigger className="w-[140px]" data-testid={`${testId}-country`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uniqueCountries.map((country) => (
              <SelectItem key={country.code} value={country.phonePrefix!}>
                {country.flag} {country.phonePrefix}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="w-[140px] h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground text-sm">
          {isLoading ? "Loading..." : isError ? "+852" : "+852"}
        </div>
      )}
      <Input
        type="tel"
        name={name}
        value={value || ""}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="flex-1"
        data-testid={testId}
        autoComplete={autoComplete ?? "tel"}
        inputMode="tel"
      />
    </div>
  );
}
