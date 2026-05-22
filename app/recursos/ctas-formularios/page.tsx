import type { Metadata } from 'next';
import CtasLandingClient from './CtasLandingClient';

export const metadata: Metadata = {
  title: '30 CTAs para reemplazar el botón Enviar | La Vida de un Creativo',
  description:
    'Descarga una guía gratuita con ejemplos de CTAs para formularios, landings y lead magnets. Aprende a cambiar botones genéricos por mensajes enfocados en la recompensa.',
  openGraph: {
    title: '30 CTAs para reemplazar el botón Enviar',
    description:
      'Una guía práctica de Sutura Systems x La Vida de un Creativo para mejorar CTAs de formularios.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '30 CTAs para reemplazar el botón Enviar',
    description:
      'Una guía práctica de Sutura Systems x La Vida de un Creativo para mejorar CTAs de formularios.',
  },
};

export default function page() {
  return <CtasLandingClient />;
}
