import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser, User } from '../services/api';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import Swal from 'sweetalert2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="loading-indicator">
        <div className="loading-indicator__dot"></div>
        <div className="loading-indicator__dot"></div>
        <div className="loading-indicator__dot"></div>
      </div>
    </div>
  );

  const UserCard = ({ user }: { user: User }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{user.name} {user.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Teléfono:</strong> {user.phone_number}</p>
        <p><strong>Admin:</strong> {user.admin ? 'Sí' : 'No'}</p>
        <p><strong>Habilitado:</strong> {user.enabled ? 'Sí' : 'No'}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleEditUser(user)}
          >
            <Edit2 className="h-4 w-4 mr-2" /> Editar
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteUser(user.uuid)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Usuarios</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Button 
        onClick={() => setIsCreateModalOpen(true)} 
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
      >
        <UserPlus className="mr-2 h-4 w-4" /> Crear Usuario
      </Button>
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">UUID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Habilitado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uuid} className="hover:bg-gray-50">
                <TableCell className="font-medium">{user.uuid.slice(0, 8)}...</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.admin ? 'Sí' : 'No'}</TableCell>
                <TableCell>{user.enabled ? 'Sí' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.uuid)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden">
        {users.map((user) => (
          <UserCard key={user.uuid} user={user} />
        ))}
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