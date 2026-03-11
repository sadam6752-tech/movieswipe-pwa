import React from 'react';
import { useUIStore } from '../../store/uiStore';
import './InstallPrompt.css';

export const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, dismissInstallPrompt, triggerInstall } = useUIStore();

  if (!showInstallPrompt) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await triggerInstall();
    if (accepted) {
      console.log('✅ User accepted the install prompt');
    } else {
      console.log('❌ User dismissed the install prompt');
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
  };

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <div className="install-prompt-header">
          <div className="install-prompt-icon">📱</div>
          <h3 className="install-prompt-title">Установить приложение</h3>
        </div>

        <div className="install-prompt-content">
          <p className="install-prompt-text">
            Установите MovieSwipe на ваше устройство для быстрого доступа и работы без интернета
          </p>

          <ul className="install-prompt-features">
            <li>⚡ Быстрый запуск</li>
            <li>📴 Работает офлайн</li>
            <li>🎬 Полный доступ к каталогу</li>
            <li>💾 Сохранение избранного</li>
          </ul>
        </div>

        <div className="install-prompt-actions">
          <button
            className="install-prompt-button install-prompt-button--primary"
            onClick={handleInstall}
          >
            Установить
          </button>
          <button
            className="install-prompt-button install-prompt-button--secondary"
            onClick={handleDismiss}
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
};
