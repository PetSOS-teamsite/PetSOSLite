import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PetBreed } from "@shared/schema";

interface BreedComboboxProps {
  species: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
}

export function BreedCombobox({
  species,
  value,
  onChange,
  placeholder = "Select or type breed...",
  disabled = false,
  testId = "combobox-breed"
}: BreedComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { language } = useLanguage();

  const { data: allBreeds = [], isLoading } = useQuery<PetBreed[]>({
    queryKey: ["/api/pet-breeds"],
  });

  // Filter breeds by species and active status
  const breeds = allBreeds
    .filter((breed) => breed.species === species && breed.active)
    .map((breed) => ({
      en: breed.breedEn,
      zh: breed.breedZh || breed.breedEn,
    }));

  const isZh = language === 'zh-HK';

  // Filter breeds based on search
  const filteredBreeds = breeds.filter(breed =>
    breed.en.toLowerCase().includes(searchValue.toLowerCase()) ||
    breed.zh.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (breedEn: string) => {
    onChange(breedEn);
    setOpen(false);
    setSearchValue("");
  };

  const handleInputChange = (search: string) => {
    setSearchValue(search);
    
    // Check if search matches a Chinese breed name
    const matchingBreed = breeds.find(b => b.zh.toLowerCase() === search.toLowerCase());
    if (matchingBreed) {
      onChange(matchingBreed.en);
      return;
    }
    
    // Check if search matches an English breed name
    const matchingEnBreed = breeds.find(b => b.en.toLowerCase() === search.toLowerCase());
    if (matchingEnBreed) {
      onChange(matchingEnBreed.en);
      return;
    }
    
    // Allow custom input: if user types something not in the list, use it as the value
    if (search) {
      onChange(search);
    }
  };

  // Get display text for the selected value
  const getDisplayText = (val: string) => {
    const breed = breeds.find(b => b.en === val);
    if (breed) {
      return isZh ? breed.zh : breed.en;
    }
    return val;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
          data-testid={testId}
        >
          <span className="truncate">
            {value ? getDisplayText(value) : (isLoading ? "Loading breeds..." : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search or type breed..." 
            value={searchValue}
            onValueChange={handleInputChange}
          />
          <CommandList
            className="max-h-64 overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>
              {searchValue ? (
                <div className="py-2 px-4 text-center text-sm">
                  <div className="text-green-600 dark:text-green-400 font-medium mb-1">
                    ✓ Custom breed ready!
                  </div>
                  <div className="text-muted-foreground">
                    Click anywhere outside or press Enter to save "{searchValue}"
                  </div>
                </div>
              ) : (
                "No breed found. Type to add custom breed."
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredBreeds.map((breed) => (
                <CommandItem
                  key={breed.en}
                  value={breed.en}
                  onSelect={() => handleSelect(breed.en)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === breed.en ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {isZh ? breed.zh : breed.en}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
