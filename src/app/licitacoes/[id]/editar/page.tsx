'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { AlertToast } from '@/components/AlertToast';
import { Modal } from '@/components/Modal';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';

type Licitacao = {
    id: string;
    numero: string;
    objeto: string;
    fase: string;
    dataInicio: string;
    valorEstimado: number;
    history: Array<{ from: string; to: string; date: string; responsible: string }>;
};

const fasesLic: string[] = [
    'Elaboração do DFD',
    'Levantamento dos Itens',
    'Especificação',
    'Quantitativos',
    'Cadastro SIPAC',
    'Elaboração do ETP',
    'Requisições SIPAC',
    'Pesquisa Preços',
    'Consolidação da Pesquisa de Preços',
    'Email DCOM',
    'MAPA DE RISCO',
    'Elaboração do TR',
    'Análise de proposta',
    'Elaboração contrato',
    'Assinatura contrato',
    'STATUS FINAL',
    'Nº PROCESSO SEI',
];

export default function EditarLicitacaoPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : undefined;
    const [lic, setLic] = useState<Licitacao | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [justificativa, setJustificativa] = useState('');
    const [formData, setFormData] = useState({
        numero: '',
        objeto: '',
        fase: 'Elaboração do DFD',
        dataInicio: '',
        valorEstimado: '0.00',
    });
    const [valorEstimadoDisplay, setValorEstimadoDisplay] = useState('R$ 0,00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canReturn = lic && fasesLic.indexOf(lic.fase) > 0;

    const formatToBRL = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
            return;
        }

        if (!id) return;

        (async () => {
            const response = await fetch(`/api/licitacoes/${id}`);
            if (!response.ok) {
                setFeedback({ message: 'Nenhuma licitação encontrada', variant: 'error' });
                router.push('/licitacoes');
                return;
            }
            const data: Licitacao = await response.json();
            setLic(data);
            setFormData({
                numero: data.numero,
                objeto: data.objeto,
                fase: data.fase,
                dataInicio: data.dataInicio,
                valorEstimado: data.valorEstimado.toFixed(2),
            });
            setValorEstimadoDisplay(formatToBRL(data.valorEstimado));
        })();
    }, [session, status, router, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, '');
        const cents = Number(cleaned || '0');
        const value = cents / 100;
        setFormData((prev) => ({ ...prev, valorEstimado: value.toFixed(2) }));
        setValorEstimadoDisplay(formatToBRL(value));
    };

    const handleFocusCurrency = () => {
        setValorEstimadoDisplay(formData.valorEstimado ? formData.valorEstimado.replace('.', ',') : '');
    };

    const handleBlurCurrency = () => {
        setValorEstimadoDisplay(formatToBRL(Number(formData.valorEstimado)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!id) return;

            const response = await fetch(`/api/licitacoes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objeto: formData.objeto,
                    valorEstimado: Number(formData.valorEstimado),
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar licitação');
            }

            setFeedback({ message: 'Licitação atualizada com sucesso!', variant: 'success' });
            setIsSubmitting(false);
            window.setTimeout(() => router.push('/licitacoes'), 1200);
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Erro ao atualizar licitação.', variant: 'error' });
            setIsSubmitting(false);
        }
    };

    const confirmReturnPhase = async () => {
        if (!justificativa.trim()) {
            setFeedback({ message: 'Justificativa é obrigatória', variant: 'error' });
            return;
        }

        if (!lic || !id) return;

        const currentIndex = fasesLic.indexOf(lic.fase);
        if (currentIndex <= 0) return;

        const previousPhase = fasesLic[currentIndex - 1];

        try {
            const response = await fetch(`/api/licitacoes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fase: previousPhase,
                    justificativa: justificativa.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao retornar fase');
            }

            setFeedback({ message: 'Fase retornada com sucesso!', variant: 'success' });
            setShowReturnModal(false);
            setJustificativa('');
            // Reload the page to reflect changes
            window.location.reload();
        } catch (error) {
            console.error(error);
            setFeedback({ message: 'Erro ao retornar fase.', variant: 'error' });
        }
    };

    useEffect(() => {
        if (!feedback) return;

        const timer = setTimeout(() => setFeedback(null), 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    if (status === 'loading' || !lic) {
        return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            <AlertToast message={feedback?.message ?? ''} variant={feedback?.variant ?? 'info'} onClose={() => setFeedback(null)} />
            <main className="container mx-auto p-8 max-w-2xl">
                <Modal
                    isOpen={showReturnModal}
                    title="Retornar Fase Anterior"
                    description="Informe a justificativa para o retorno de fase"
                    onClose={() => {
                        setShowReturnModal(false);
                        setJustificativa('');
                    }}
                    actions={
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setJustificativa('');
                                }}
                                className="rounded border border-gray-300 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmReturnPhase}
                                className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                            >
                                Confirmar Retorno
                            </button>
                        </>
                    }
                >
                    <textarea
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Justificativa para o retorno..."
                        rows={4}
                    />
                </Modal>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-6">Editar Licitação</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                                Número da Licitação
                            </label>
                            <input
                                id="numero"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="fase" className="block text-sm font-medium text-gray-700 mb-1">
                                Fase
                            </label>
                            <select
                                id="fase"
                                name="fase"
                                value={formData.fase}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                            >
                                {fasesLic.map((fase) => (
                                    <option key={fase} value={fase}>
                                        {fase}
                                    </option>
                                ))}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                disabled
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="valorEstimado" className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Estimado
                            </label>
                            <input
                                type="text"
                                id="valorEstimado"
                                name="valorEstimado"
                                value={valorEstimadoDisplay}
                                onChange={handleCurrencyChange}
                                onFocus={handleFocusCurrency}
                                onBlur={handleBlurCurrency}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                                {isSubmitting ? 'Atualizando...' : 'Salvar alterações'}
                            </button>
                            {canReturn && (
                                <button
                                    type="button"
                                    onClick={() => setShowReturnModal(true)}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 flex items-center space-x-2"
                                >
                                    <ArrowUturnLeftIcon className="h-5 w-5" />
                                    <span>Retornar Fase Anterior</span>
                                </button>
                            )}
                            <button type="button" onClick={() => router.push('/licitacoes')} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
                                Voltar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
