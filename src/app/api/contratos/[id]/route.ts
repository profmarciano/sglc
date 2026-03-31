import { NextResponse } from 'next/server';
import { readContratos, writeContratos, Contrato } from '@/lib/contratos.server';
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

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = await context.params;
    const contratos = await readContratos();
    const found = contratos.find((c) => c.id === params.id);
    if (!found) return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });

    return NextResponse.json(found);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    try {
        const params = await context.params;
        const payload = (await request.json()) as Partial<Contrato>;
        const contratos = await readContratos();
        const idx = contratos.findIndex((c) => c.id === params.id);

        if (idx === -1) return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });

        const current = contratos[idx];
        const updated: Contrato = {
            ...current,
            ...payload,
            ordensServico: payload.ordensServico ?? current.ordensServico,
            notasFiscais: payload.notasFiscais ?? current.notasFiscais,
        };

        contratos[idx] = updated;
        await writeContratos(contratos);

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: 'Erro no servidor', error }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const params = await context.params;
    const contratos = await readContratos();
    const filtered = contratos.filter((c) => c.id !== params.id);

    if (filtered.length === contratos.length) {
        return NextResponse.json({ message: 'Não encontrado' }, { status: 404 });
    }

    await writeContratos(filtered);
    return NextResponse.json({ message: 'Removido' });
}
