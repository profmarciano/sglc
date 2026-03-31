import { NextResponse } from 'next/server';
import { readLicitacoes, writeLicitacoes, Licitacao } from '@/lib/licitacoes.server';
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

export async function GET() {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const licitacoes = await readLicitacoes();
    return NextResponse.json(licitacoes);
}

export async function POST(request: Request) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    try {
        const body = (await request.json()) as Partial<Licitacao>;

        if (!body.numero || !body.objeto || !body.fase || !body.dataInicio || !body.valorEstimado) {
            return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
        }

        const licitacoes = await readLicitacoes();
        const novo: Licitacao = {
            id: crypto.randomUUID(),
            numero: body.numero,
            objeto: body.objeto,
            fase: body.fase,
            dataInicio: body.dataInicio,
            valorEstimado: Number(body.valorEstimado),
            history: body.history ?? [],
        };

        const updated = [...licitacoes, novo];
        await writeLicitacoes(updated);

        return NextResponse.json(novo, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro no servidor';
        return NextResponse.json({ message }, { status: 500 });
    }
}
