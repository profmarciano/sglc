import { NextResponse } from 'next/server';
import { readLicitacoes, writeLicitacoes, Licitacao } from '@/lib/licitacoes.server';
import { isValidFase } from '@/lib/fases';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }
    return session;
}

async function requireAdmin() {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    if (!session.user?.role || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Acesso restrito' }, { status: 403 });
    }

    return session;
}

export async function GET(request: Request, context: { params?: Promise<{ id: string }> }) {
    try {
        const auth = await requireAuth();
        if (auth instanceof NextResponse) return auth;

        if (!context?.params) {
            return NextResponse.json({ message: 'Parâmetros ausentes' }, { status: 400 });
        }

        const params = await context.params;
        if (!params?.id || typeof params.id !== 'string') {
            return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
        }

        const licitacoes = await readLicitacoes();
        const found = licitacoes.find((l) => l.id === params.id);
        if (!found) return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });

        return NextResponse.json(found);
    } catch (err) {
        console.error('API /api/licitacoes/[id] GET error', err);
        return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params?: Promise<{ id: string }> }) {
    try {
        const auth = await requireAdmin();
        if (auth instanceof NextResponse) return auth;

        if (!context?.params) {
            return NextResponse.json({ message: 'Parâmetros ausentes' }, { status: 400 });
        }

        const params = await context.params;
        if (!params?.id || typeof params.id !== 'string') {
            return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
        }

        const payload = (await request.json()) as Partial<Licitacao & { justificativa?: string }>;
        if (payload.fase && !isValidFase(payload.fase)) {
            return NextResponse.json({ message: 'Fase inválida' }, { status: 400 });
        }

        const licitacoes = await readLicitacoes();
        const idx = licitacoes.findIndex((l) => l.id === params.id);

        if (idx === -1) return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });

        const current = licitacoes[idx];
        const updated: Licitacao = {
            ...current,
            ...payload,
            history: payload.fase && payload.fase !== current.fase
                ? [
                    ...current.history,
                    {
                        from: current.fase,
                        to: payload.fase,
                        date: new Date().toISOString(),
                        responsible: auth.user?.email || 'Sistema',
                    },
                ]
                : current.history,
        };

        licitacoes[idx] = updated;
        await writeLicitacoes(licitacoes);

        return NextResponse.json(updated);
    } catch (error) {
        console.error('API /api/licitacoes/[id] PUT error', error);
        return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const params = await context.params;
    const licitacoes = await readLicitacoes();
    const filtered = licitacoes.filter((l) => l.id !== params.id);

    if (filtered.length === licitacoes.length) {
        return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });
    }

    await writeLicitacoes(filtered);
    return NextResponse.json({ message: 'Removido' });
}

