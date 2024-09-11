import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser, User } from '../services/api';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import Swal from 'sweetalert2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.usuarios);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const handleCreateUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => user.uuid === updatedUser.uuid ? updatedUser : user));
    setIsEditModalOpen(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (uuid: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(uuid);
        setUsers(users.filter(user => user.uuid !== uuid));
        Swal.fire(
          'Eliminado!',
          'El usuario ha sido eliminado.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting user:', err);
        Swal.fire(
          'Error!',
          'No se pudo eliminar el usuario.',
          'error'
        );
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Usuarios</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <Button onClick={() => setIsCreateModalOpen(true)} className="mb-6">
        Crear Usuario
      </Button>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UUID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Habilitado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uuid}>
                <TableCell>{user.uuid}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.admin ? 'Sí' : 'No'}</TableCell>
                <TableCell>{user.enabled ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                      aria-label="Editar usuario"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.uuid)}
                      aria-label="Eliminar usuario"
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateUser={handleUpdateUser}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;