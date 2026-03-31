'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';

interface OrdemServico {
    id: string;
    descricao: string;
    status: string;
    valor: number;
}

interface NotaFiscal {
    id: string;
    numero: string;
    valor: number;
    dataEmissao: string;
    statusPagamento: string;
}

interface Contrato {
    id: string;
    numero: string;
    fornecedor: string;
    objeto: string;
    valorTotal: number;
    dataInicio: string;
    dataFim: string;
    ordensServico: OrdemServico[];
    notasFiscais: NotaFiscal[];
}

export default function ContratosPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [contratos, setContratos] = useState<Contrato[]>([]);

    const loadContratos = async () => {
        try {
            const response = await fetch('/api/contratos');
            if (!response.ok) throw new Error('Erro ao buscar contratos');
            const data = await response.json();
            setContratos(data);
        } catch (error) {
            console.error(error);
            setContratos([]);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
        } else {
            loadContratos();
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            <main className="container mx-auto p-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Controle de Contratos</h1>
                        <button
                            onClick={() => router.push('/contratos/nova')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Novo Contrato
                        </button>
                    </div>

                    {contratos.length === 0 ? (
                        <p className="text-gray-500">Nenhum contrato encontrado.</p>
                    ) : (
                        contratos.map((contrato) => (
                            <div key={contrato.id} className="mb-8 border rounded-lg p-4">
                                <h2 className="text-xl font-semibold mb-2">Contrato {contrato.numero}</h2>
                                <p><strong>Fornecedor:</strong> {contrato.fornecedor}</p>
                                <p><strong>Objeto:</strong> {contrato.objeto}</p>
                                <p><strong>Valor Total:</strong> R$ {contrato.valorTotal.toLocaleString('pt-BR')}</p>
                                <p><strong>Período:</strong> {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} a {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}</p>

                                <div className="mt-4">
                                    <h3 className="text-lg font-medium mb-2">Ordens de Serviço</h3>
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Descrição</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                                <th className="px-4 py-2 text-left">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contrato.ordensServico.map((os) => (
                                                <tr key={os.id} className="border-t">
                                                    <td className="px-4 py-2">{os.descricao}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded text-sm ${os.status === 'Concluída' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                            {os.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">R$ {os.valor.toLocaleString('pt-BR')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-lg font-medium mb-2">Notas Fiscais</h3>
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Número</th>
                                                <th className="px-4 py-2 text-left">Valor</th>
                                                <th className="px-4 py-2 text-left">Data Emissão</th>
                                                <th className="px-4 py-2 text-left">Status Pagamento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contrato.notasFiscais.map((nf) => (
                                                <tr key={nf.id} className="border-t">
                                                    <td className="px-4 py-2">{nf.numero}</td>
                                                    <td className="px-4 py-2">R$ {nf.valor.toLocaleString('pt-BR')}</td>
                                                    <td className="px-4 py-2">{new Date(nf.dataEmissao).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded text-sm ${nf.statusPagamento === 'Pago' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                            {nf.statusPagamento}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}