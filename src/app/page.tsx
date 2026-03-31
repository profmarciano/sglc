'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Nav } from '@/components/Nav';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/login');
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <main className="container mx-auto p-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Bem-vindo ao SGLC</h1>
          <p className="text-lg mb-6">
            Sistema de Gestão de Licitações e Contratos do órgão.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Controle de Licitações</h2>
              <p className="mb-4">Gerencie os processos de licitação e acompanhe as fases.</p>
              <Link href="/licitacoes" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Acessar Licitações
              </Link>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Controle de Contratos</h2>
              <p className="mb-4">Fiscalize contratos em execução, ordens de serviço e pagamentos.</p>
              <Link href="/contratos" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Acessar Contratos
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
