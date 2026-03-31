'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { AlertToast } from '@/components/AlertToast';

interface ContratoForm {
    numero: string;
    fornecedor: string;
    objeto: string;
    valorTotal: string;
    dataInicio: string;
    dataFim: string;
}

export default function ContratosNovaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);
    const [formData, setFormData] = useState<ContratoForm>({
        numero: '',
        fornecedor: '',
        objeto: '',
        valorTotal: '0',
        dataInicio: '',
        dataFim: '',
    });

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) router.push('/login');
    }, [session, status, router]);

    useEffect(() => {
        if (!feedback) return;

        const timer = setTimeout(() => setFeedback(null), 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const newContrato = {
                numero: formData.numero,
                fornecedor: formData.fornecedor,
                objeto: formData.objeto,
                valorTotal: Number(formData.valorTotal),
                dataInicio: formData.dataInicio,
                dataFim: formData.dataFim,
                ordensServico: [],
                notasFiscais: [],
            };

            const response = await fetch('/api/contratos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContrato),
            });

            if (!response.ok) {
                throw new Error('Falha ao cadastrar contrato');
            }

            setFeedback({ message: 'Contrato cadastrado com sucesso!', variant: 'success' });
            setIsSubmitting(false);
            window.setTimeout(() => router.push('/contratos'), 1200);
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Erro ao cadastrar contrato.', variant: 'error' });
            setIsSubmitting(false);
        }
    };

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
                <AlertToast message={feedback?.message ?? ''} variant={feedback?.variant ?? 'info'} onClose={() => setFeedback(null)} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-6">Novo Contrato</h1>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        <input value={formData.numero} onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))} required placeholder="Número do contrato" className="border p-3 rounded" />
                        <input value={formData.fornecedor} onChange={(e) => setFormData((prev) => ({ ...prev, fornecedor: e.target.value }))} required placeholder="Fornecedor" className="border p-3 rounded" />
                        <input value={formData.objeto} onChange={(e) => setFormData((prev) => ({ ...prev, objeto: e.target.value }))} required placeholder="Objeto" className="border p-3 rounded" />
                        <input type="number" value={formData.valorTotal} onChange={(e) => setFormData((prev) => ({ ...prev, valorTotal: e.target.value }))} required step="0.01" min="0" placeholder="Valor total" className="border p-3 rounded" />
                        <input type="date" value={formData.dataInicio} onChange={(e) => setFormData((prev) => ({ ...prev, dataInicio: e.target.value }))} required className="border p-3 rounded" />
                        <input type="date" value={formData.dataFim} onChange={(e) => setFormData((prev) => ({ ...prev, dataFim: e.target.value }))} required className="border p-3 rounded" />
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Enviando...' : 'Salvar contrato'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
