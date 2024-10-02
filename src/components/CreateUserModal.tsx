import React, { useState, useEffect } from 'react';
import { createUser, CreateUserRequest, User } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, User as UserIcon, Mail, Phone, Lock, ShieldCheck, Power } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo usuario a continuación.
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
                  value={newUser.name}
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
                  value={newUser.last_name}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="pl-8"
                required
              />
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
                value={newUser.phone_number || ''}
                onChange={handleInputChange}
                placeholder="Teléfono"
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="Contraseña (mínimo 8 caracteres)"
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
                checked={newUser.admin}
                onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, admin: checked as boolean }))}
              />
              <Label htmlFor="admin" className="text-sm font-medium flex items-center">
                <ShieldCheck className="mr-1 h-4 w-4" /> Admin
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                name="enabled"
                checked={newUser.enabled}
                onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, enabled: checked as boolean }))}
              />
              <Label htmlFor="enabled" className="text-sm font-medium flex items-center">
                <Power className="mr-1 h-4 w-4" /> Habilitado
              </Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Crear Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;