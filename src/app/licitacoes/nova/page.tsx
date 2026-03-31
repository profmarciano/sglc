'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { AlertToast } from '@/components/AlertToast';

export default function NovaLicitacaoPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        numero: '',
        objeto: '',
        fase: 'Elaboração do DFD',
        dataInicio: '',
        valorEstimado: '0.00',
    });
    const [valorEstimadoDisplay, setValorEstimadoDisplay] = useState('R$ 0,00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const hoje = new Date().toISOString().slice(0, 10);
        setFormData((prev) => ({ ...prev, dataInicio: hoje }));
        setValorEstimadoDisplay('R$ 0,00');
    }, []);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) router.push('/login');
    }, [session, status, router]);

    useEffect(() => {
        if (!feedback) return;

        const timer = setTimeout(() => setFeedback(null), 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    const formatToBRL = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        const cents = Number(cleaned || '0');
        const value = cents / 100;
        setFormData((prev) => ({ ...prev, valorEstimado: value.toFixed(2) }));
        setValorEstimadoDisplay(formatToBRL(value));
    };

    const handleFocusCurrency = () => {
        setValorEstimadoDisplay(formData.valorEstimado ? `R$ ${Number(formData.valorEstimado).toFixed(2).replace('.', ',')}` : '');
    };

    const handleBlurCurrency = () => {
        setValorEstimadoDisplay(formatToBRL(Number(formData.valorEstimado)));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const newLicitacao = {
                numero: formData.numero,
                objeto: formData.objeto,
                fase: formData.fase,
                dataInicio: formData.dataInicio,
                valorEstimado: Number(formData.valorEstimado),
                history: [],
            };

            const response = await fetch('/api/licitacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLicitacao),
            });

            if (!response.ok) {
                throw new Error('Falha ao cadastrar licitação');
            }

            setFeedback({ message: 'Licitação cadastrada com sucesso!', variant: 'success' });
            setIsSubmitting(false);
            window.setTimeout(() => router.push('/licitacoes'), 1200);
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Erro ao cadastrar licitação.', variant: 'error' });
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
            <main className="container mx-auto p-8 max-w-2xl">
                <AlertToast message={feedback?.message ?? ''} variant={feedback?.variant ?? 'info'} onClose={() => setFeedback(null)} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-6">Nova Licitação</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                                Número da Licitação
                            </label>
                            <input
                                type="text"
                                id="numero"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ex: 001/2024"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="objeto" className="block text-sm font-medium text-gray-700 mb-1">
                                Objeto
                            </label>
                            <textarea
                                id="objeto"
                                name="objeto"
                                value={formData.objeto}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Descrição do objeto da licitação"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="fase" className="block text-sm font-medium text-gray-700 mb-1">
                                Fase Atual
                            </label>
                            <select
                                id="fase"
                                name="fase"
                                value={formData.fase}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="Elaboração do DFD">Elaboração do DFD</option>
                                <option value="Levantamento dos Itens">Levantamento dos Itens</option>
                                <option value="Especificação">Especificação</option>
                                <option value="Quantitativos">Quantitativos</option>
                                <option value="Cadastro SIPAC">Cadastro SIPAC</option>
                                <option value="Elaboração do ETP">Elaboração do ETP</option>
                                <option value="Requisições SIPAC">Requisições SIPAC</option>
                                <option value="Pesquisa Preços">Pesquisa Preços</option>
                                <option value="Consolidação da Pesquisa de Preços">Consolidação da Pesquisa de Preços</option>
                                <option value="Email DCOM">Email DCOM</option>
                                <option value="MAPA DE RISCO">MAPA DE RISCO</option>
                                <option value="Elaboração do TR">Elaboração do TR</option>
                                <option value="Análise de proposta">Análise de proposta</option>
                                <option value="Elaboração contrato">Elaboração contrato</option>
                                <option value="Assinatura contrato">Assinatura contrato</option>
                                <option value="STATUS FINAL">STATUS FINAL</option>
                                <option value="Nº PROCESSO SEI">Nº PROCESSO SEI</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Início
                            </label>
                            <input
                                type="date"
                                id="dataInicio"
                                name="dataInicio"
                                value={formData.dataInicio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="valorEstimado" className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Estimado (R$)
                            </label>
                            <input
                                type="text"
                                id="valorEstimado"
                                name="valorEstimado"
                                value={valorEstimadoDisplay}
                                onChange={handleCurrencyChange}
                                onFocus={handleFocusCurrency}
                                onBlur={handleBlurCurrency}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="R$ 0,00"
                                required
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Licitação'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/licitacoes')}
                                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}