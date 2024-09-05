import React, { useState, useEffect } from 'react';
import { createUser, CreateUserRequest, User } from '../services/api';
import '../styles/CreateUserModal.css';

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crear Nuevo Usuario</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="user-form">
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={handleInputChange}
            placeholder="Nombre"
            required
          />
          <input
            type="text"
            name="last_name"
            value={newUser.last_name}
            onChange={handleInputChange}
            placeholder="Apellido"
            required
          />
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            placeholder="Contraseña (mínimo 8 caracteres)"
            required
          />
          <input
            type="tel"
            name="phone_number"
            value={newUser.phone_number || ''}
            onChange={handleInputChange}
            placeholder="Teléfono"
            required
          />
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <label>
            <input
              type="checkbox"
              name="admin"
              checked={newUser.admin}
              onChange={handleInputChange}
            />
            Admin
          </label>
          <label>
            <input
              type="checkbox"
              name="enabled"
              checked={newUser.enabled}
              onChange={handleInputChange}
            />
            Habilitado
          </label>
          <div className="modal-buttons">
            <button type="submit">Crear Usuario</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;