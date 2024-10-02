import React, { useState, useEffect } from 'react';
import { createAdvisor, CreateAdvisorRequest, Advisor, Area } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAdvisor: (advisor: Advisor) => void;
  areas: Area[];
}

const CreateAdvisorModal: React.FC<CreateAdvisorModalProps> = ({ isOpen, onClose, onCreateAdvisor, areas }) => {
  const [newAdvisor, setNewAdvisor] = useState<CreateAdvisorRequest>({
    name: '',
    description: '',
    id_area: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewAdvisor({
        name: '',
        description: '',
        id_area: 0
      });
      setError('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAdvisor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAreaChange = (value: string) => {
    setNewAdvisor(prev => ({
      ...prev,
      id_area: parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvisor.name || !newAdvisor.description || newAdvisor.id_area === 0) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    try {
      const response = await createAdvisor(newAdvisor);
      onCreateAdvisor(response.asesor);
      onClose();
    } catch (err) {
      console.error('Error creating advisor:', err);
      setError('Error al crear el asesor. Por favor, intente nuevamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crear Nuevo Asesor</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo asesor a continuación.
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
              value={newAdvisor.name}
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
              value={newAdvisor.description}
              onChange={handleInputChange}
              placeholder="Descripción del asesor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_area" className="text-sm font-medium">Área</Label>
            <Select onValueChange={handleAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Crear Asesor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdvisorModal;