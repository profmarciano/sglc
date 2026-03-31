'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Nav } from '@/components/Nav';
import { Modal } from '@/components/Modal';
import { AlertToast } from '@/components/AlertToast';
import { PhaseStepper } from '@/components/PhaseStepper';
import { fasesLic } from '@/lib/fases';
import Link from 'next/link';
import { ArrowRightIcon, PencilSquareIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface PhaseHistory {
    from: string;
    to: string;
    date: string;
    responsible: string;
}

interface Licitacao {
    id: string;
    numero: string;
    objeto: string;
    fase: string;
    dataInicio: string;
    valorEstimado: number;
    history: PhaseHistory[];
}

const mockLicitacoes: Licitacao[] = [
    {
        id: '1',
        numero: '001/2024',
        objeto: 'Aquisição de material de escritório',
        fase: 'Elaboração do DFD',
        dataInicio: '2024-01-15',
        valorEstimado: 50000,
        history: [],
    },
    {
        id: '2',
        numero: '002/2024',
        objeto: 'Contratação de serviços de limpeza',
        fase: 'Levantamento dos Itens',
        dataInicio: '2024-02-01',
        valorEstimado: 120000,
        history: [],
    },
    {
        id: '3',
        numero: '003/2024',
        objeto: 'Compra de equipamentos de informática',
        fase: 'Especificação',
        dataInicio: '2024-01-20',
        valorEstimado: 200000,
        history: [],
    },
    {
        id: '4',
        numero: '004/2024',
        objeto: 'Manutenção predial',
        fase: 'Quantitativos',
        dataInicio: '2024-03-01',
        valorEstimado: 80000,
        history: [],
    },
    {
        id: '5',
        numero: '005/2024',
        objeto: 'Serviços de consultoria',
        fase: 'Cadastro SIPAC',
        dataInicio: '2024-02-15',
        valorEstimado: 150000,
        history: [],
    },
    {
        id: '6',
        numero: '006/2024',
        objeto: 'Aquisição de mobiliário',
        fase: 'Pesquisa Preços',
        dataInicio: '2024-01-10',
        valorEstimado: 75000,
        history: [],
    },
    {
        id: '7',
        numero: '007/2024',
        objeto: 'Contratação de vigilância',
        fase: 'Consolidação da Pesquisa de Preços',
        dataInicio: '2024-03-10',
        valorEstimado: 100000,
        history: [],
    },
    {
        id: '8',
        numero: '008/2024',
        objeto: 'Fornecimento de alimentos',
        fase: 'Email DCOM',
        dataInicio: '2024-02-20',
        valorEstimado: 60000,
        history: [],
    },
];

export default function LicitacoesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advancingLicitacaoId, setAdvancingLicitacaoId] = useState<string | null>(null);
    const [responsavelAvanco, setResponsavelAvanco] = useState('');
    const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' | 'info' } | null>(null);

    const loadLicitacoes = async () => {
        try {
            const response = await fetch('/api/licitacoes');
            if (!response.ok) throw new Error('Erro ao buscar licitações');
            const data = await response.json();
            setLicitacoes(data);
        } catch (error) {
            console.error(error);
            setLicitacoes(mockLicitacoes);
        }
    };

    useEffect(() => {
        loadLicitacoes();
    }, []);

    const confirmAdvanceFase = async () => {
        const id = advancingLicitacaoId;
        if (!id) return;
        if (!responsavelAvanco || responsavelAvanco.trim() === '') {
            setFeedback({ message: 'Responsável é obrigatório para avançar de fase.', variant: 'error' });
            return;
        }

        const item = licitacoes.find((l) => l.id === id);
        if (!item) return;

        const idx = fasesLic.findIndex((f) => f === item.fase);
        if (idx === -1 || idx === fasesLic.length - 1) {
            setShowAdvanceModal(false);
            setAdvancingLicitacaoId(null);
            setResponsavelAvanco('');
            return;
        }

        const next = fasesLic[idx + 1];
        const novoHistorico = [
            ...item.history,
            { from: item.fase, to: next, date: new Date().toISOString(), responsible: responsavelAvanco.trim() },
        ];

        const response = await fetch(`/api/licitacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fase: next, history: novoHistorico }),
        });

        if (!response.ok) {
            setFeedback({ message: 'Erro ao avançar fase.', variant: 'error' });
            return;
        }

        await response.json();
        setFeedback({ message: 'Fase avançada com sucesso!', variant: 'success' });
        setShowAdvanceModal(false);
        setAdvancingLicitacaoId(null);
        setResponsavelAvanco('');
        await loadLicitacoes();
    };

    const avancarFase = (id: string) => {
        setAdvancingLicitacaoId(id);
        setResponsavelAvanco('');
        setShowAdvanceModal(true);
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) router.push('/login');
    }, [session, status, router]);

    useEffect(() => {
        if (!feedback) return;

        const timer = setTimeout(() => setFeedback(null), 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    const selectedLicitacao = selectedId ? licitacoes.find((l) => l.id === selectedId) : null;

    const handleStepClick = (phase: string) => {
        if (!selectedLicitacao) {
            setFeedback({ message: 'Selecione uma licitação para aplicar a transição.', variant: 'info' });
            return;
        }

        if (selectedLicitacao.fase === phase) {
            setFeedback({ message: `Licitação já está em '${phase}'.`, variant: 'info' });
            return;
        }

        const currentIdx = fasesLic.findIndex((f) => f === selectedLicitacao.fase);
        const targetIdx = fasesLic.findIndex((f) => f === phase);

        if (targetIdx === -1 || currentIdx === -1) {
            setFeedback({ message: 'Fase inválida selecionada.', variant: 'error' });
            return;
        }

        if (targetIdx !== currentIdx + 1) {
            setFeedback({ message: 'Só é permitido avançar uma fase por vez no fluxo.', variant: 'info' });
            return;
        }

        setSelectedId(selectedLicitacao.id);
        setAdvancingLicitacaoId(selectedLicitacao.id);
        setResponsavelAvanco('');
        setShowAdvanceModal(true);
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
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Controle de Licitações</h1>
                        <Link href="/licitacoes/nova" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Adicionar Nova Licitação
                        </Link>
                    </div>

                    <PhaseStepper phases={fasesLic} currentPhase={selectedLicitacao?.fase} onStepClick={handleStepClick} />

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left">Número</th>
                                    <th className="px-4 py-2 text-left">Objeto</th>
                                    <th className="px-4 py-2 text-left">Fase</th>
                                    <th className="px-4 py-2 text-left">Data Início</th>
                                    <th className="px-4 py-2 text-left">Última Atualização</th>
                                    <th className="px-4 py-2 text-left">Valor Estimado</th>
                                    <th className="px-4 py-2 text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {licitacoes.map((licitacao) => (
                                    <tr
                                        key={licitacao.id}
                                        className={`border-t ${selectedId === licitacao.id ? 'bg-blue-50' : ''} hover:bg-slate-50 cursor-pointer`}
                                        onClick={() => setSelectedId(licitacao.id)}
                                    >
                                        <td className="px-4 py-2">{licitacao.numero}</td>
                                        <td className="px-4 py-2">{licitacao.objeto}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-sm ${licitacao.fase === 'Elaboração do DFD' ? 'bg-gray-200 text-gray-800' :
                                                licitacao.fase === 'Levantamento dos Itens' ? 'bg-sky-200 text-sky-800' :
                                                    licitacao.fase === 'Especificação' ? 'bg-blue-200 text-blue-800' :
                                                        licitacao.fase === 'Quantitativos' ? 'bg-cyan-200 text-cyan-800' :
                                                            licitacao.fase === 'Cadastro SIPAC' ? 'bg-emerald-200 text-emerald-800' :
                                                                licitacao.fase === 'Elaboração do ETP' ? 'bg-lime-200 text-lime-800' :
                                                                    licitacao.fase === 'Requisições SIPAC' ? 'bg-amber-200 text-amber-800' :
                                                                        licitacao.fase === 'Pesquisa Preços' ? 'bg-yellow-200 text-yellow-800' :
                                                                            licitacao.fase === 'Consolidação da Pesquisa de Preços' ? 'bg-orange-200 text-orange-800' :
                                                                                licitacao.fase === 'Email DCOM' ? 'bg-red-200 text-red-800' :
                                                                                    licitacao.fase === 'MAPA DE RISCO' ? 'bg-rose-200 text-rose-800' :
                                                                                        licitacao.fase === 'Elaboração do TR' ? 'bg-fuchsia-200 text-fuchsia-800' :
                                                                                            licitacao.fase === 'Análise de proposta' ? 'bg-violet-200 text-violet-800' :
                                                                                                licitacao.fase === 'Elaboração contrato' ? 'bg-indigo-200 text-indigo-800' :
                                                                                                    licitacao.fase === 'Assinatura contrato' ? 'bg-pink-200 text-pink-800' :
                                                                                                        licitacao.fase === 'STATUS FINAL' ? 'bg-green-200 text-green-800' :
                                                                                                            licitacao.fase === 'Nº PROCESSO SEI' ? 'bg-stone-200 text-stone-800' :
                                                                                                                'bg-zinc-200 text-zinc-800'
                                                }`}>
                                                {licitacao.fase}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{new Date(licitacao.dataInicio).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-2">{licitacao.history.length > 0 ? new Date(licitacao.history[licitacao.history.length - 1].date).toLocaleDateString('pt-BR') : new Date(licitacao.dataInicio).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-2">{licitacao.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => avancarFase(licitacao.id)}
                                                    disabled={licitacao.fase === 'Nº PROCESSO SEI'}
                                                    title="Avançar para a próxima fase"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 hover:scale-110 transform transition-transform duration-200 disabled:bg-gray-400"
                                                >
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/licitacoes/${licitacao.id}/editar`}
                                                    title="Editar licitação"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-110 transform transition-transform duration-200"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setSelectedId(licitacao.id)}
                                                    title="Ver detalhes e histórico"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 transform transition-transform duration-200"
                                                >
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <h3 className="font-semibold mb-2">Legenda de ações</h3>
                        <ul className="grid grid-cols-3 gap-2">
                            <li className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                                    <ArrowRightIcon className="h-4 w-4" />
                                </span>
                                Avançar fase
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
                                    <PencilSquareIcon className="h-4 w-4" />
                                </span>
                                Editar
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                                    <InformationCircleIcon className="h-4 w-4" />
                                </span>
                                Detalhes
                            </li>
                        </ul>
                    </div>

                    <AlertToast message={feedback?.message ?? ''} variant={feedback?.variant ?? 'info'} onClose={() => setFeedback(null)} />

                    <Modal
                        isOpen={showAdvanceModal}
                        title="Avançar fase"
                        description="Informe o responsável pela mudança de fase"
                        onClose={() => {
                            setShowAdvanceModal(false);
                            setAdvancingLicitacaoId(null);
                            setResponsavelAvanco('');
                        }}
                        actions={
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdvanceModal(false);
                                        setAdvancingLicitacaoId(null);
                                        setResponsavelAvanco('');
                                    }}
                                    className="rounded border border-gray-300 px-4 py-2 text-sm text-slate-700 hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmAdvanceFase}
                                    className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                >
                                    Confirmar
                                </button>
                            </>
                        }
                    >
                        <input
                            type="text"
                            value={responsavelAvanco}
                            onChange={(e) => setResponsavelAvanco(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Nome do responsável"
                        />
                    </Modal>

                    {selectedId && (
                        <div className="mt-8 bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-2xl font-semibold">Histórico de fases</h2>
                                <button onClick={() => setSelectedId(null)} className="text-sm text-gray-600 hover:text-gray-900">
                                    Fechar
                                </button>
                            </div>

                            {(() => {
                                const selected = licitacoes.find((l) => l.id === selectedId);
                                if (!selected) return <p>Licitação não encontrada.</p>;

                                if (selected.history.length === 0) {
                                    return <p className="text-sm text-gray-500">Nenhuma movimentação de fase registrada.</p>;
                                }

                                return (
                                    <table className="min-w-full table-auto">
                                        <thead>
                                            <tr className="bg-white border-b">
                                                <th className="px-3 py-2 text-left">De</th>
                                                <th className="px-3 py-2 text-left">Para</th>
                                                <th className="px-3 py-2 text-left">Data</th>
                                                <th className="px-3 py-2 text-left">Responsável</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selected.history.map((entry, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-3 py-2">{entry.from}</td>
                                                    <td className="px-3 py-2">{entry.to}</td>
                                                    <td className="px-3 py-2">{new Date(entry.date).toLocaleString('pt-BR')}</td>
                                                    <td className="px-3 py-2">{entry.responsible}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}