import React, { useState, useEffect } from 'react';
import { updateUser, User, UpdateUserRequest } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
              placeholder="Nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              name="last_name"
              value={editedUser.last_name}
              onChange={handleInputChange}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Teléfono</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={editedUser.phone_number || ''}
              onChange={handleInputChange}
              placeholder="Teléfono"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="admin"
              name="admin"
              checked={editedUser.admin}
              onCheckedChange={(checked) => setEditedUser(prev => ({ ...prev, admin: checked as boolean }))}
            />
            <Label htmlFor="admin">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              name="enabled"
              checked={editedUser.enabled}
              onCheckedChange={(checked) => setEditedUser(prev => ({ ...prev, enabled: checked as boolean }))}
            />
            <Label htmlFor="enabled">Habilitado</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit">Actualizar Usuario</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;