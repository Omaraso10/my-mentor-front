import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAdvisorsPaginated, associateAdvisorToUser, disassociateAdvisorFromUser, Advisor, User, Asesor } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserAdvisorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const UserAdvisorsModal: React.FC<UserAdvisorsModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [associatedAdvisors, setAssociatedAdvisors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchAdvisors();
      updateAssociatedAdvisors();
    }
  }, [isOpen, currentPage, user]);

  const updateAssociatedAdvisors = () => {
    const associatedIds = new Set(user.asesores.map(a => a.professional.id));
    setAssociatedAdvisors(associatedIds);
  };

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
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

  const handleToggleAdvisor = async (advisor: Advisor) => {
    try {
      const isAssociated = associatedAdvisors.has(advisor.id);
      let updatedUser: User;

      if (isAssociated) {
        const mentorId = user.asesores.find(a => a.professional.id === advisor.id)?.id;
        if (mentorId) {
          await disassociateAdvisorFromUser(mentorId);
          updatedUser = {
            ...user,
            asesores: user.asesores.filter(a => a.professional.id !== advisor.id)
          };
          associatedAdvisors.delete(advisor.id);
        } else {
          throw new Error('No se pudo encontrar el ID del mentor para desasociar');
        }
      } else {
        const response = await associateAdvisorToUser(advisor.id, user.uuid);
        const newAsesor: Asesor = {
          id: response.asesor.id,
          advisorys: null,
          professional: response.asesor.professional
        };
        updatedUser = {
          ...user,
          asesores: [...user.asesores, newAsesor]
        };
        associatedAdvisors.add(advisor.id);
      }

      setAssociatedAdvisors(new Set(associatedAdvisors));
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error('Error toggling advisor:', err);
      setError('Error al actualizar los asesores. Por favor, intente nuevamente.');
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

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asesores asociados a {user.name} {user.last_name}</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mt-4">
          {advisors.map((advisor) => (
            <div key={advisor.id} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`advisor-${advisor.id}`}
                checked={associatedAdvisors.has(advisor.id)}
                onCheckedChange={() => handleToggleAdvisor(advisor)}
              />
              <label htmlFor={`advisor-${advisor.id}`}>{advisor.name}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={handlePrevPage} 
            disabled={currentPage === 0}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span>Página {currentPage + 1} de {totalPages}</span>
          <Button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages - 1}
            variant="outline"
            size="sm"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={onClose} className="mt-4 w-full">Cerrar</Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserAdvisorsModal;