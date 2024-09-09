import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser, User } from '../services/api';
import CreateUserModal from './CreateUserModal';
import Swal from 'sweetalert2';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(false);
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
    <div className="users-container">
      <h1>Gestión de Usuarios</h1>
      {error && <div className="error-message">{error}</div>}
      <button className="create-user-button" onClick={() => setIsModalOpen(true)}>
        Crear Usuario
      </button>
      <table className="users-table">
        <thead>
          <tr>
            <th>UUID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Habilitado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uuid}>
              <td>{user.uuid}</td>
              <td>{user.name}</td>
              <td>{user.last_name}</td>
              <td>{user.phone_number}</td>
              <td>{user.email}</td>
              <td>{user.admin ? 'Sí' : 'No'}</td>
              <td>{user.enabled ? 'Sí' : 'No'}</td>
              <td>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteUser(user.uuid)}
                  aria-label="Eliminar usuario"
                >
                  &#10005;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
};

export default Users;