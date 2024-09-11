import React from 'react';
import { Advice } from '../services/api';
import Swal from 'sweetalert2';
import '../styles/AdviceList.css';

interface AdviceListProps {
  advisories: Advice[];
  onSelectAdvice: (advice: Advice) => void;
  onDeleteAdvice: (adviceId: number) => void;
  selectedAdviceId: number | undefined;
}

const AdviceList: React.FC<AdviceListProps> = ({ advisories, onSelectAdvice, onDeleteAdvice, selectedAdviceId }) => {
  const handleDelete = async (e: React.MouseEvent, adviceId: number) => {
    e.stopPropagation();
    
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
      onDeleteAdvice(adviceId);
      Swal.fire(
        'Eliminado!',
        'La asesoría ha sido eliminada.',
        'success'
      );
    }
  };

  const sortedAdvisories = [...advisories].sort((a, b) => b.id - a.id);

  return (
    <div className="advice-list">
      <h2>Asesorías anteriores</h2>
      {sortedAdvisories.length === 0 ? (
        <p className="no-advisories">Sin asesorías aún.</p>
      ) : (
        <ul>
          {sortedAdvisories.map((advice) => (
            <li 
              key={advice.id} 
              onClick={() => onSelectAdvice(advice)}
              className={advice.id === selectedAdviceId ? 'selected' : ''}
            >
              <span>{advice.description}</span>
              <button 
                className="delete-button"
                onClick={(e) => handleDelete(e, advice.id)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdviceList;