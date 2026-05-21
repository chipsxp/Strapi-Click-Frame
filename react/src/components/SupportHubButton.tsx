import React, { useState } from 'react';
import SupportHubModal from './SupportHubModal';

interface SupportHubButtonProps {
  paypalClientId: string;
  isLoggedIn: boolean;
  defaultNickname: string;
}

export default function SupportHubButton({ paypalClientId, isLoggedIn, defaultNickname }: SupportHubButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className="donate-btn" 
        onClick={() => setIsModalOpen(true)}
      >
        Support the Hub
      </button>

      <SupportHubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paypalClientId={paypalClientId}
        isLoggedIn={isLoggedIn}
        defaultNickname={defaultNickname}
      />
    </>
  );
}
