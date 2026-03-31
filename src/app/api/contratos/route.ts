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

export async function GET() {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const contratos = await readContratos();
    return NextResponse.json(contratos);
}

export async function POST(request: Request) {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    try {
        const body = (await request.json()) as Partial<Contrato>;

        if (!body.numero || !body.fornecedor || !body.objeto || !body.valorTotal || !body.dataInicio || !body.dataFim) {
            return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
        }

        const contratos = await readContratos();
        const novo: Contrato = {
            id: crypto.randomUUID(),
            numero: body.numero,
            fornecedor: body.fornecedor,
            objeto: body.objeto,
            valorTotal: Number(body.valorTotal),
            dataInicio: body.dataInicio,
            dataFim: body.dataFim,
            ordensServico: body.ordensServico ?? [],
            notasFiscais: body.notasFiscais ?? [],
        };

        const updated = [...contratos, novo];
        await writeContratos(updated);

        return NextResponse.json(novo, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Erro no servidor', error }, { status: 500 });
    }
}
