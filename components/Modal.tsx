import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  customContent?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, customContent }) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const backdropClasses = isOpen ? 'opacity-100' : 'opacity-0';
  const modalClasses = isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out ${backdropClasses}`}
      onClick={onClose}
    >
      <div
        className={`bg-card rounded-2xl p-4 shadow-xl max-w-md w-full border-2 border-primary/10 relative transition-all duration-300 ease-out ${modalClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {customContent}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button onClick={onClose} className="font-bold text-2xl text-secondary hover:text-primary transform hover:rotate-90">&times;</button>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
