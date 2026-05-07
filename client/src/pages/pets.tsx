import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useStorageStatus } from "@/hooks/useStorageStatus";
import { PawPrint, Plus, Pencil, Trash2, ArrowLeft, Check, ChevronsUpDown, Camera, X, Upload, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Pet, Clinic, User } from "@shared/schema";
import { PET_SPECIES, getBreedOptions } from "@shared/pet-data";
import { cn } from "@/lib/utils";
import { BreedCombobox } from "@/components/BreedCombobox";
import { MedicalRecordsSection } from "@/components/MedicalRecordsSection";
import { analytics } from "@/lib/analytics";

// Schema factory to access translation function
const createPetSchema = (t: (key: string, fallback: string) => string) => z.object({
  name: z.string().min(1, t("pets.validation.name_required", "Pet name is required")),
  species: z.string().min(1, t("pets.validation.species_required", "Species is required")),
  breed: z.string().optional(),
  age: z.coerce.number().positive().optional(),
  weight: z.coerce.number().positive().optional(),
  medicalNotes: z.string().optional(),
  lastVisitHospitalId: z.string().optional(),
  lastVisitDate: z.string().optional(),
});

// Type helper
type PetSchemaType = ReturnType<typeof createPetSchema>;
type PetFormData = z.infer<PetSchemaType>;

const emptyPetFormValues = {
  name: "",
  species: "",
  breed: "",
  age: undefined,
  weight: undefined,
  medicalNotes: "",
  lastVisitHospitalId: undefined,
  lastVisitDate: undefined,
} satisfies PetFormData;

export default function PetsPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const { isStorageAvailable } = useStorageStatus();
  
  const petSchema = createPetSchema(t);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [clinicSearchOpen, setClinicSearchOpen] = useState(false);
  const [breedInputMode, setBreedInputMode] = useState<"select" | "input">("select");

  // Fetch user profile to check if complete
  const { data: userProfile, isLoading: profileLoading } = useQuery<User>({
    queryKey: ['/api/users', authUser?.id],
    enabled: !!authUser?.id,
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ['/api/users', authUser?.id, 'pets'],
    enabled: !!authUser?.id,
  });

  const { data: clinics = [] } = useQuery<Clinic[]>({
    queryKey: ['/api/clinics'],
  });

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: emptyPetFormValues,
  });

  // Watch species to update breed options
  const watchSpecies = form.watch("species");
  useEffect(() => {
    if (watchSpecies && watchSpecies !== selectedSpecies) {
      setSelectedSpecies(watchSpecies);
      form.setValue("breed", ""); // Reset breed when species changes
    }
  }, [watchSpecies, selectedSpecies, form]);

  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const payload = {
        ...data,
        userId: authUser?.id,
        weight: data.weight !== undefined ? String(data.weight) : undefined,
        lastVisitDate: data.lastVisitDate ? new Date(data.lastVisitDate).toISOString() : undefined,
        lastVisitHospitalId: data.lastVisitHospitalId && data.lastVisitHospitalId.trim() !== '' ? data.lastVisitHospitalId : undefined,
      };
      const response = await apiRequest(
        'POST',
        '/api/pets',
        payload
      );
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', authUser?.id, 'pets'] });
      
      // Track pet creation in analytics
      analytics.trackPetCreation({
        petType: variables.species,
        breed: variables.breed,
      });
      
      toast({
        title: t("pets.success.add", "Pet added successfully!"),
        description: t("pets.success.add_desc", "Your pet has been added to your profile."),
      });
      setIsDialogOpen(false);
      form.reset(emptyPetFormValues);
    },
    onError: (error: Error) => {
      toast({
        title: t("pets.error.add", "Failed to add pet"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PetFormData }) => {
      const payload = {
        ...data,
        weight: data.weight !== undefined ? String(data.weight) : undefined,
        lastVisitDate: data.lastVisitDate ? new Date(data.lastVisitDate).toISOString() : undefined,
        lastVisitHospitalId: data.lastVisitHospitalId && data.lastVisitHospitalId.trim() !== '' ? data.lastVisitHospitalId : undefined,
      };
      const response = await apiRequest(
        'PATCH',
        `/api/pets/${id}`,
        payload
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', authUser?.id, 'pets'] });
      toast({
        title: t("pets.success.update", "Pet updated successfully!"),
        description: t("pets.success.update_desc", "Your pet's information has been updated."),
      });
      setIsDialogOpen(false);
      setEditingPet(null);
      form.reset(emptyPetFormValues);
    },
    onError: (error: Error) => {
      toast({
        title: t("pets.error.update", "Failed to update pet"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const response = await apiRequest(
        'DELETE',
        `/api/pets/${petId}`,
        {}
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', authUser?.id, 'pets'] });
      toast({
        title: t("pets.success.delete", "Pet removed"),
        description: t("pets.success.delete_desc", "Your pet has been removed from your profile."),
      });
      setDeletingPetId(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("pets.error.delete", "Failed to delete pet"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Track photo upload state
  const [uploadingPhotoForPetId, setUploadingPhotoForPetId] = useState<string | null>(null);

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ petId, file }: { petId: string; file: File }) => {
      // Get upload URL (signed URL for PUT) with content type for proper CORS handling
      const urlResponse = await apiRequest('POST', `/api/pets/${petId}/photo-upload-url`, {
        contentType: file.type
      });
      const { uploadURL } = await urlResponse.json();
      
      // Upload file directly to object storage via PUT
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload photo');
      }
      
      // The filePath is the uploadURL without query params (signed URL base)
      const filePath = uploadURL.split('?')[0];
      
      // Update pet with photo URL
      const photoResponse = await apiRequest('POST', `/api/pets/${petId}/photo`, { filePath });
      return await photoResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', authUser?.id, 'pets'] });
      toast({
        title: t("pets.success.photo_upload", "Photo uploaded!"),
        description: t("pets.success.photo_upload_desc", "Your pet's photo has been updated."),
      });
      setUploadingPhotoForPetId(null);
    },
    onError: (error: Error) => {
      // Try to parse backend error message if available
      let errorMessage = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) errorMessage = parsed.message;
        else if (parsed.error) errorMessage = parsed.error;
      } catch {
        // Use the original error message
      }
      
      toast({
        title: t("pets.error.photo_upload", "Failed to upload photo"),
        description: errorMessage,
        variant: "destructive",
      });
      setUploadingPhotoForPetId(null);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (petId: string) => {
      const response = await apiRequest('DELETE', `/api/pets/${petId}/photo`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', authUser?.id, 'pets'] });
      toast({
        title: t("pets.success.photo_delete", "Photo removed"),
        description: t("pets.success.photo_delete_desc", "Your pet's photo has been removed."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("pets.error.photo_delete", "Failed to remove photo"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (petId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t("pets.error.invalid_file", "Invalid file type"),
          description: t("pets.error.invalid_file_desc", "Please select an image file (JPEG, PNG, etc.)"),
          variant: "destructive",
        });
        // Reset the input to allow retry
        event.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("pets.error.file_too_large", "File too large"),
          description: t("pets.error.file_too_large_desc", "Maximum file size is 5MB"),
          variant: "destructive",
        });
        // Reset the input to allow retry
        event.target.value = '';
        return;
      }
      
      setUploadingPhotoForPetId(petId);
      uploadPhotoMutation.mutate({ petId, file });
    }
    
    // Reset the input to allow re-selecting the same file
    event.target.value = '';
  };

  const onSubmit = (data: PetFormData) => {
    if (editingPet) {
      updatePetMutation.mutate({ id: editingPet.id, data });
    } else {
      createPetMutation.mutate(data);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setSelectedSpecies(pet.species);
    
    // Format date for HTML date input
    let formattedDate = "";
    if (pet.lastVisitDate) {
      try {
        const date = new Date(pet.lastVisitDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
    
    form.reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age ? Number(pet.age) : undefined,
      weight: pet.weight ? Number(pet.weight) : undefined,
      medicalNotes: pet.medicalNotes || "",
      lastVisitHospitalId: pet.lastVisitHospitalId || "",
      lastVisitDate: formattedDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (petId: string) => {
    setDeletingPetId(petId);
  };

  const handleAddNew = () => {
    setEditingPet(null);
    setSelectedSpecies("");
    setBreedInputMode("select");
    form.reset(emptyPetFormValues);
    setIsDialogOpen(true);
  };

  // Check if profile is incomplete and redirect
  // Profile is complete if user has at least one contact method (email OR phone)
  const isProfileIncomplete = userProfile && (!userProfile.email && !userProfile.phone);

  // Handle redirects in useEffect to avoid setState-in-render
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!authUser) {
        setLocation('/');
      } else if (isProfileIncomplete) {
        setLocation('/profile');
      }
    }
  }, [authUser, authLoading, profileLoading, isProfileIncomplete, setLocation]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">{t("loading.pets", "Loading...")}</div>
      </div>
    );
  }

  if (!authUser || isProfileIncomplete) {
    return null;
  }

  return (
    <>
      <SEO noindex={true} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/profile">
              <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("pets.back_to_profile", "Back to Profile")}
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="w-6 h-6" />
                {t("pets.title", "My Pets")}
              </CardTitle>
              <CardDescription>
                {t("pets.desc", "Manage your pets for faster emergency requests")}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew} data-testid="button-add-pet">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("pets.add", "Add Pet")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPet ? t("pets.edit", "Edit Pet") : t("pets.add_new", "Add New Pet")}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pets.name", "Name")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder=""
                              data-testid="input-pet-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pets.species", "Species")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-pet-species">
                                <SelectValue placeholder={t("pets.select_species", "Select species")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PET_SPECIES).map(([key, value]) => (
                                <SelectItem key={key} value={key} data-testid={`species-${key}`}>
                                  {language === "en" ? value.en : value.zh}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pets.breed", "Breed (Optional)")}</FormLabel>
                          <FormControl>
                            <BreedCombobox
                              species={selectedSpecies}
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder={t("pets.select_breed", "Select or type breed...")}
                              testId="combobox-pet-breed"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            {language === "en" 
                              ? "💡 Can't find your pet's breed? No worries! Just type it in and press Enter."
                              : "💡 找不到品種？沒關係！直接輸入然後按Enter即可。"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("pets.age", "Age (Optional)")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? undefined : Number(event.target.value)
                                  )
                                }
                                placeholder=""
                                data-testid="input-pet-age"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("pets.weight", "Weight (kg, Optional)")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ""}
                                onBlur={field.onBlur}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? undefined : Number(event.target.value)
                                  )
                                }
                                placeholder=""
                                data-testid="input-pet-weight"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="medicalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pets.medical_notes", "Medical Notes (Optional)")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t("pets.medical_notes_placeholder", "Allergies, medications, conditions...")}
                              rows={3}
                              data-testid="textarea-pet-medical-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastVisitHospitalId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t("pets.last_visit_clinic", "Last Visit Clinic (Optional)")}</FormLabel>
                          <Popover open={clinicSearchOpen} onOpenChange={setClinicSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="button-select-clinic"
                                >
                                  {field.value
                                    ? clinics.find((clinic) => clinic.id === field.value)?.[language === "en" ? "name" : "nameZh"] || clinics.find((clinic) => clinic.id === field.value)?.name
                                    : t("pets.last_visit_clinic_placeholder", "Search clinic...")}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                              <Command>
                                <CommandInput placeholder={t("pets.last_visit_clinic_placeholder", "Search clinic...")} />
                                <CommandList
                                  className="max-h-64 overflow-y-auto overscroll-contain"
                                  onWheel={(e) => e.stopPropagation()}
                                >
                                  <CommandEmpty>{t("pets.no_clinic_selected", "No clinic selected")}</CommandEmpty>
                                  <CommandGroup>
                                    {clinics.map((clinic) => (
                                      <CommandItem
                                        key={clinic.id}
                                        value={clinic.name}
                                        onSelect={() => {
                                          form.setValue("lastVisitHospitalId", clinic.id);
                                          setClinicSearchOpen(false);
                                        }}
                                        data-testid={`clinic-${clinic.id}`}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            clinic.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div>
                                          <div className="font-medium">
                                            {language === "en" ? clinic.name : (clinic.nameZh || clinic.name)}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {language === "en" ? clinic.address : (clinic.addressZh || clinic.address)}
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastVisitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pets.last_visit_date", "Last Visit Date (Optional)")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-last-visit-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingPet(null);
                          form.reset(emptyPetFormValues);
                        }}
                        data-testid="button-cancel-pet"
                      >
                        {t("button.cancel", "Cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPetMutation.isPending || updatePetMutation.isPending}
                        data-testid="button-save-pet"
                      >
                        {createPetMutation.isPending || updatePetMutation.isPending
                          ? t("pets.saving", "Saving...")
                          : editingPet
                          ? t("pets.update", "Update Pet")
                          : t("pets.add", "Add Pet")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {petsLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t("loading.pets", "Loading pets...")}
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t("pets.no_pets", "No pets added yet")}
                </p>
                <Button onClick={handleAddNew} data-testid="button-add-first-pet">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("pets.add_first", "Add Your First Pet")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pets.map((pet) => (
                  <Card key={pet.id} data-testid={`card-pet-${pet.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        {/* Pet Photo Section */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                            {pet.photoUrl ? (
                              <img
                                src={pet.photoUrl}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                                data-testid={`img-pet-photo-${pet.id}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PawPrint className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          {/* Photo upload button - only show when storage is available */}
                          {isStorageAvailable && (
                            <label 
                              className="absolute bottom-0 right-0 w-7 h-7 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white dark:border-gray-900"
                              data-testid={`button-upload-photo-${pet.id}`}
                            >
                              {uploadingPhotoForPetId === pet.id ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4 text-white" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handlePhotoChange(pet.id, e)}
                                disabled={uploadingPhotoForPetId === pet.id}
                                data-testid={`input-photo-${pet.id}`}
                              />
                            </label>
                          )}
                          {/* Remove photo button (only show if photo exists) */}
                          {pet.photoUrl && !uploadingPhotoForPetId && (
                            <button
                              className="absolute top-0 right-0 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-sm"
                              onClick={() => deletePhotoMutation.mutate(pet.id)}
                              data-testid={`button-remove-photo-${pet.id}`}
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                        
                        {/* Pet Info */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="flex items-center justify-between">
                            <span className="truncate">{pet.name}</span>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(pet)}
                                data-testid={`button-edit-pet-${pet.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(pet.id)}
                                data-testid={`button-delete-pet-${pet.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            {pet.species}
                            {pet.breed && ` • ${pet.breed}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {pet.age && <div>{t("pets.age_years", "Age: {age} years").replace("{age}", String(pet.age))}</div>}
                        {pet.weight && <div>{t("pets.weight_kg", "Weight: {weight} kg").replace("{weight}", String(pet.weight))}</div>}
                        {pet.medicalNotes && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200">
                            <strong>{t("pets.medical_label", "Medical:")}</strong> {pet.medicalNotes}
                          </div>
                        )}
                      </div>
                      <MedicalRecordsSection petId={pet.id} petName={pet.name} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingPetId} onOpenChange={() => setDeletingPetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("pets.delete", "Delete Pet")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("pets.delete_confirm", "Are you sure you want to remove this pet from your profile? This action cannot be undone.")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">{t("button.cancel", "Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingPetId && deletePetMutation.mutate(deletingPetId)}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                data-testid="button-confirm-delete"
              >
                {t("button.delete", "Delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    </>
  );
}
