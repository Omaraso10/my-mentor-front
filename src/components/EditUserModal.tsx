import React, { useState, useEffect } from 'react';
import { updateUser, User, UpdateUserRequest } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, User as UserIcon, Phone, ShieldCheck, Power } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  user: User;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUpdateUser, user }) => {
  const [editedUser, setEditedUser] = useState<UpdateUserRequest>({
    name: user.name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    admin: user.admin,
    enabled: user.enabled
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedUser({
        name: user.name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        admin: user.admin,
        enabled: user.enabled
      });
      setError('');
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateUser(user.uuid, {
        ...editedUser,
        phone_number: parseInt(editedUser.phone_number.toString()),
        admin: editedUser.admin,
        enabled: editedUser.enabled
      });
      onUpdateUser(response.usuario);
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error al actualizar el usuario. Por favor, intente nuevamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifique los detalles del usuario a continuación.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
              <div className="relative">
                <UserIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">Apellido</Label>
              <div className="relative">
                <UserIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="last_name"
                  name="last_name"
                  value={editedUser.last_name}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={editedUser.phone_number || ''}
                onChange={handleInputChange}
                placeholder="Teléfono"
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                name="admin"
                checked={editedUser.admin}
                onCheckedChange={(checked) => setEditedUser(prev => ({ ...prev, admin: checked as boolean }))}
              />
              <Label htmlFor="admin" className="text-sm font-medium flex items-center">
                <ShieldCheck className="mr-1 h-4 w-4" /> Admin
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                name="enabled"
                checked={editedUser.enabled}
                onCheckedChange={(checked) => setEditedUser(prev => ({ ...prev, enabled: checked as boolean }))}
              />
              <Label htmlFor="enabled" className="text-sm font-medium flex items-center">
                <Power className="mr-1 h-4 w-4" /> Habilitado
              </Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Actualizar Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;