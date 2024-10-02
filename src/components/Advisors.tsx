import React, { useState, useEffect } from 'react';
import { getAdvisorsPaginated, deleteAdvisor, getAreas, Advisor, Area } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import CreateAdvisorModal from './CreateAdvisorModal';
import EditAdvisorModal from './EditAdvisorModal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Advisors: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAdvisors();
    fetchAreas();
  }, [currentPage, pageSize]);

  const fetchAdvisors = async () => {
    try {
      const response = await getAdvisorsPaginated(currentPage, pageSize);
      setAdvisors(response.content);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching advisors:', err);
      setError('Error al cargar los asesores. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await getAreas();
      setAreas(response.areas);
    } catch (err) {
      console.error('Error fetching areas:', err);
      setError('Error al cargar las áreas. Por favor, recargue la página.');
    }
  };

  const handleCreateAdvisor = (newAdvisor: Advisor) => {
    setAdvisors(prev => [newAdvisor, ...prev.slice(0, pageSize - 1)]);
    setIsCreateModalOpen(false);
    Swal.fire('Éxito', 'Asesor creado correctamente', 'success');
  };

  const handleUpdateAdvisor = (updatedAdvisor: Advisor) => {
    setAdvisors(prev => prev.map(advisor => advisor.id === updatedAdvisor.id ? updatedAdvisor : advisor));
    setIsEditModalOpen(false);
    Swal.fire('Éxito', 'Asesor actualizado correctamente', 'success');
  };

  const handleEditAdvisor = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsEditModalOpen(true);
  };

  const handleDeleteAdvisor = async (id: number) => {
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
        await deleteAdvisor(id);
        setAdvisors(advisors.filter(advisor => advisor.id !== id));
        Swal.fire(
          'Eliminado!',
          'El asesor ha sido eliminado.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting advisor:', err);
        Swal.fire(
          'Error!',
          'No se pudo eliminar el asesor.',
          'error'
        );
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
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

  const AdvisorCard = ({ advisor }: { advisor: Advisor }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{advisor.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>ID:</strong> {advisor.id}</p>
        <p><strong>Descripción:</strong> {advisor.description.substring(0, 100)}...</p>
        <p><strong>Área:</strong> {advisor.area.name}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleEditAdvisor(advisor)}
          >
            <Edit2 className="h-4 w-4 mr-2" /> Editar
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteAdvisor(advisor.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Asesores</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <Button 
        onClick={() => setIsCreateModalOpen(true)} 
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
      >
        <UserPlus className="mr-2 h-4 w-4" /> Crear Asesor
      </Button>
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Área</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisors.map((advisor) => (
              <TableRow key={advisor.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{advisor.id}</TableCell>
                <TableCell>{advisor.name}</TableCell>
                <TableCell>{advisor.description.substring(0, 100)}...</TableCell>
                <TableCell>{advisor.area.name}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAdvisor(advisor)}
                    className="mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAdvisor(advisor.id)}
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
        {advisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button 
          onClick={handlePrevPage} 
          disabled={currentPage === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        <span>Página {currentPage + 1} de {totalPages}</span>
        <Button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages - 1}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Siguiente <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <label htmlFor="pageSize" className="mr-2">Registros por página:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border rounded p-1"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <CreateAdvisorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAdvisor={handleCreateAdvisor}
        areas={areas}
      />
      {selectedAdvisor && (
        <EditAdvisorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateAdvisor={handleUpdateAdvisor}
          advisor={selectedAdvisor}
          areas={areas}
        />
      )}
    </div>
  );
};

export default Advisors;