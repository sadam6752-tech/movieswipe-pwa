import { create } from 'zustand';

interface UIState {
  // State
  isOffline: boolean;
  currentRoute: string;
  showInstallPrompt: boolean;
  deferredPrompt: any | null;
  
  // Actions
  setOfflineStatus: (isOffline: boolean) => void;
  navigate: (route: string) => void;
  dismissInstallPrompt: () => void;
  showInstallPromptDialog: () => void;
  setDeferredPrompt: (prompt: any) => void;
  triggerInstall: () => Promise<boolean>;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isOffline: !navigator.onLine,
  currentRoute: '/',
  showInstallPrompt: false,
  deferredPrompt: null,
  
  // Set offline status
  setOfflineStatus: (isOffline: boolean) => {
    set({ isOffline });
  },
  
  // Navigate to route
  navigate: (route: string) => {
    set({ currentRoute: route });
  },
  
  // Dismiss install prompt
  dismissInstallPrompt: () => {
    set({ showInstallPrompt: false });
  },
  
  // Show install prompt
  showInstallPromptDialog: () => {
    set({ showInstallPrompt: true });
  },
  
  // Set deferred prompt
  setDeferredPrompt: (prompt: any) => {
    set({ deferredPrompt: prompt });
  },
  
  // Trigger install
  triggerInstall: async () => {
    const { deferredPrompt } = get();
    
    if (!deferredPrompt) {
      return false;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the deferred prompt
    set({ deferredPrompt: null, showInstallPrompt: false });
    
    return outcome === 'accepted';
  }
}));

// Setup online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useUIStore.getState().setOfflineStatus(false);
    console.log('🌐 Connection restored');
  });
  
  window.addEventListener('offline', () => {
    useUIStore.getState().setOfflineStatus(true);
    console.log('📡 Connection lost');
  });
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Save the event so it can be triggered later
    useUIStore.getState().setDeferredPrompt(e);
    
    // Show custom install prompt
    useUIStore.getState().showInstallPromptDialog();
    
    console.log('📱 Install prompt available');
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    useUIStore.getState().setDeferredPrompt(null);
    useUIStore.getState().dismissInstallPrompt();
  });
}
