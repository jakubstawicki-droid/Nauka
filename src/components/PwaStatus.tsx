import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOnline } from '../hooks/usePwa';

/** Rejestracja service workera + komunikaty: „gotowe offline” i „brak sieci”. */
export function PwaStatus() {
  const online = useOnline();
  const { offlineReady: [offlineReady, setOfflineReady] } = useRegisterSW({
    onRegisterError: () => { /* bez service workera aplikacja po prostu działa online */ },
  });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!offlineReady) return;
    setShow(true);
    const t = setTimeout(() => { setShow(false); setOfflineReady(false); }, 5000);
    return () => clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  return (
    <>
      {!online && <div className="offline-bar" role="status">Jesteś offline — wszystko działa, poza reprodukcjami, których jeszcze nie oglądałaś.</div>}
      {show && <div className="toast" role="status">Aplikacja jest gotowa do pracy offline.</div>}
    </>
  );
}
