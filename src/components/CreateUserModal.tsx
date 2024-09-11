import React, { useState, useEffect } from 'react';
import { createUser, CreateUserRequest, User } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (user: User) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onCreateUser }) => {
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    name: '',
    last_name: '',
    password: '',
    phone_number: 0,
    email: '',
    admin: false,
    enabled: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewUser({
        name: '',
        last_name: '',
        password: '',
        phone_number: 0,
        email: '',
        admin: false,
        enabled: true
      });
      setError('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(newUser.password)) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      const response = await createUser({
        ...newUser,
        phone_number: parseInt(newUser.phone_number.toString())
      });
      onCreateUser(response.usuario);
      onClose();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Error al crear el usuario. Por favor, intente nuevamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={newUser.name}
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
              value={newUser.last_name}
              onChange={handleInputChange}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Contraseña (mínimo 8 caracteres)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Teléfono</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={newUser.phone_number || ''}
              onChange={handleInputChange}
              placeholder="Teléfono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="admin"
              name="admin"
              checked={newUser.admin}
              onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, admin: checked as boolean }))}
            />
            <Label htmlFor="admin">Admin</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              name="enabled"
              checked={newUser.enabled}
              onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, enabled: checked as boolean }))}
            />
            <Label htmlFor="enabled">Habilitado</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit">Crear Usuario</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;