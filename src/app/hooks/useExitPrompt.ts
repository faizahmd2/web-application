import { useEffect } from 'react';

export default function useExitPrompt(uploading: boolean, onConfirm: any) {
  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (uploading) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener('unload', onConfirm)

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('unload', onConfirm)
    };
  }, [uploading, onConfirm]);
}

