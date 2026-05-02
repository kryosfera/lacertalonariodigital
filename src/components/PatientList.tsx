import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Phone, Mail, FileText, Trash2, Edit, Loader2,
  UserPlus, Calendar, LayoutGrid, List,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  usePatients, useCreatePatient, useUpdatePatient, useDeletePatient, Patient,
} from "@/hooks/usePatients";
import { format, isAfter, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PatientListProps {
  onViewPatient?: (patient: Patient) => void;
}

type FilterType = "all" | "with_recipes" | "no_visits" | "recent";

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "with_recipes", label: "Con recetas" },
  { value: "no_visits", label: "Sin visitas" },
  { value: "recent", label: "Recientes" },
];

export const PatientList = ({ onViewPatient }: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const { data: patients = [], isLoading, error } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const filteredPatients = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);
      if (!matchesSearch) return false;

      if (activeFilter === "with_recipes") return (patient.recipe_count || 0) > 0;
      if (activeFilter === "no_visits") return !patient.last_recipe_date;
      if (activeFilter === "recent")
        return patient.last_recipe_date
          ? isAfter(new Date(patient.last_recipe_date), sevenDaysAgo)
          : false;
      return true;
    });
  }, [patients, searchTerm, activeFilter]);

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormData({ name: "", phone: "", email: "", notes: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone || "",
      email: patient.email || "",
      notes: patient.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    if (editingPatient) {
      await updatePatient.mutateAsync({ id: editingPatient.id, data: formData });
    } else {
      await createPatient.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (patientToDelete) {
      await deletePatient.mutateAsync(patientToDelete.id);
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return "Sin visitas";
    return format(new Date(dateString), "dd MMM yy", { locale: es });
  };
  const formatLongDate = (dateString: string | null) => {
    if (!dateString) return "Sin visitas";
    return format(new Date(dateString), "dd MMM yyyy", { locale: es });
  };

  const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Error al cargar los pacientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-8 pt-safe">
      {/* Header */}
      <div className="px-5 pt-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none">
          Pacientes
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Tu base de pacientes
        </p>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-full bg-background"
          />
        </div>

        {/* Filters + view toggle + add */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 active:scale-95",
                    isActive
                      ? "border-primary text-primary bg-background shadow-sm"
                      : "border-border text-muted-foreground bg-background hover:border-muted-foreground/40"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center bg-muted rounded-full p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === "card" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                viewMode === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
              aria-label="Vista lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            aria-label="Nuevo paciente"
            className="shrink-0 h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-sm hover:bg-primary/90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-12 text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || activeFilter !== "all"
                ? "No se encontraron pacientes"
                : "Aún no tienes pacientes. ¡Añade tu primer paciente!"}
            </p>
            {!searchTerm && activeFilter === "all" && (
              <Button
                onClick={handleOpenCreate}
                variant="outline"
                className="mt-4 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir paciente
              </Button>
            )}
          </div>
        ) : viewMode === "list" ? (
          <ul className="flex flex-col gap-2" role="list" aria-label="Listado de pacientes">
            {filteredPatients.map((patient) => {
              const titleId = `patient-title-${patient.id}`;
              return (
                <li key={patient.id}>
                  <article
                    aria-labelledby={titleId}
                    className="bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all duration-200 px-4 py-3"
                  >
                    {/* Row 1 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {initial(patient.name)}
                      </div>
                      <h3
                        id={titleId}
                        className="font-semibold text-sm text-foreground leading-tight flex-1 truncate"
                      >
                        {patient.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 shrink-0"
                      >
                        {patient.recipe_count || 0} recetas
                      </Badge>
                    </div>
                    {/* Row 2 */}
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground flex-1 truncate flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(patient.last_recipe_date)}
                        </span>
                        {patient.phone && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="inline-flex items-center gap-1 truncate min-w-0">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{patient.email}</span>
                          </span>
                        )}
                      </p>
                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          onClick={() => onViewPatient?.(patient)}
                          aria-label={`Ver recetas de ${patient.name}`}
                          className="w-8 h-8 rounded-full border border-primary/40 text-primary hover:bg-primary/5 hover:border-primary flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          aria-label={`Editar ${patient.name}`}
                          className="w-8 h-8 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/60 flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(patient)}
                          aria-label={`Eliminar ${patient.name}`}
                          className="w-8 h-8 rounded-full border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/40 flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          // CARD VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPatients.map((patient) => (
              <article
                key={patient.id}
                className="bg-card rounded-2xl border border-border/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {initial(patient.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {patient.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatLongDate(patient.last_recipe_date)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {patient.recipe_count || 0}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3 min-h-[2.5rem]">
                  {patient.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 shrink-0" />
                      {patient.phone}
                    </p>
                  )}
                  {patient.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 rounded-full text-xs"
                    onClick={() => onViewPatient?.(patient)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Recetas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => handleOpenEdit(patient)}
                    aria-label={`Editar ${patient.name}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive"
                    onClick={() => handleOpenDelete(patient)}
                    aria-label={`Eliminar ${patient.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? "Editar Paciente" : "Nuevo Paciente"}
            </DialogTitle>
            <DialogDescription>
              {editingPatient
                ? "Actualiza los datos del paciente"
                : "Introduce los datos del nuevo paciente"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34 612 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionales sobre el paciente..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name.trim() ||
                createPatient.isPending ||
                updatePatient.isPending
              }
            >
              {(createPatient.isPending || updatePatient.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingPatient ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paciente
              "{patientToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePatient.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
