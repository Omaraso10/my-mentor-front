import React from 'react';
import { Advice } from '../services/api';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import '../styles/AdviceList.css';
import '../styles/ChatPage.css';

interface AdviceListProps {
  advisories: Advice[];
  onSelectAdvice: (advice: Advice) => void;
  onDeleteAdvice: (adviceId: number) => void;
  selectedAdviceId: number | undefined;
}

const AdviceList: React.FC<AdviceListProps> = ({ advisories, onSelectAdvice, onDeleteAdvice, selectedAdviceId }) => {
  const sortedAdvisories = [...advisories].sort((a, b) => b.id - a.id);

  return (
    <div className="advice-list">
      <h2 className="advice-list-title">Asesorías anteriores</h2>
      {sortedAdvisories.length === 0 ? (
        <p className="no-advisories">¡Listo para comenzar! Inicia tu primera asesoría.</p>
      ) : (
        <ul className="advice-items">
          {sortedAdvisories.map((advice) => (
            <li 
              key={advice.id} 
              onClick={() => onSelectAdvice(advice)}
              className={`advice-item ${advice.id === selectedAdviceId ? 'selected' : ''}`}
            >
              <div className="advice-info">
                <span className="advice-description">{advice.description || 'Nueva asesoría'}</span>
                <span className="asesor-name" title="Nombre del asesor">{advice.asesorName}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button 
                    className="delete-button"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Eliminar asesoría"
                  >
                    <Trash2 size={18} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="AlertDialogContent">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="AlertDialogTitle">¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription className="AlertDialogDescription">
                      Esta acción no se puede deshacer. Esto eliminará permanentemente la asesoría.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="AlertDialogFooter">
                    <AlertDialogCancel className="AlertDialogCancel">Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="AlertDialogAction" onClick={() => onDeleteAdvice(advice.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdviceList;