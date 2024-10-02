import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { updateAdvisor, Advisor, Area, CreateAdvisorRequest } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateAdvisor: (advisor: Advisor) => void;
  advisor: Advisor;
  areas: Area[];
}

const EditAdvisorModal: React.FC<EditAdvisorModalProps> = ({ isOpen, onClose, onUpdateAdvisor, advisor, areas }) => {
  const [editedAdvisor, setEditedAdvisor] = useState<Advisor>(advisor);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedAdvisor(advisor);
      setError('');
    }
  }, [isOpen, advisor]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedAdvisor(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAreaChange = useCallback((value: string) => {
    const selectedArea = areas.find(area => area.id === parseInt(value));
    if (selectedArea) {
      setEditedAdvisor(prev => ({
        ...prev,
        area: selectedArea
      }));
    }
  }, [areas]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedAdvisor.name || !editedAdvisor.description || !editedAdvisor.area) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    try {
      const updateData: CreateAdvisorRequest = {
        name: editedAdvisor.name,
        description: editedAdvisor.description,
        id_area: editedAdvisor.area.id
      };
      const response = await updateAdvisor(editedAdvisor.id, updateData);
      if (response.asesor) {
        onUpdateAdvisor(response.asesor);
        onClose();
      } else {
        setError(response.mensaje || 'Error al actualizar el asesor.');
      }
    } catch (err) {
      console.error('Error updating advisor:', err);
      setError('Error al actualizar el asesor. Por favor, intente nuevamente.');
    }
  }, [editedAdvisor, onUpdateAdvisor, onClose]);

  const areaOptions = useMemo(() => 
    areas.map((area) => (
      <SelectItem key={area.id} value={area.id.toString()}>
        {area.name}
      </SelectItem>
    )),
    [areas]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Asesor</DialogTitle>
          <DialogDescription>
            Modifique los detalles del asesor a continuación.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={editedAdvisor.name}
              onChange={handleInputChange}
              placeholder="Nombre del asesor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={editedAdvisor.description}
              onChange={handleInputChange}
              placeholder="Descripción del asesor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">Área</Label>
            <Select 
              onValueChange={handleAreaChange} 
              value={editedAdvisor.area.id.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un área" />
              </SelectTrigger>
              <SelectContent>
                {areaOptions}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Actualizar Asesor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(EditAdvisorModal);