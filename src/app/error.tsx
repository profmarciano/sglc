"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Erro de renderização do app:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Erro interno do servidor</h1>
        <p className="text-gray-700 mb-4">Algo deu errado ao carregar a aplicação. Por favor, tente novamente.</p>
        <button
          onClick={() => {
            reset();
            router.refresh();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Recarregar
        </button>
      </div>
    </div>
  );
}
