import fs from 'fs/promises';
import path from 'path';

export interface Contrato {
    id: string;
    numero: string;
    fornecedor: string;
    objeto: string;
    valorTotal: number;
    dataInicio: string;
    dataFim: string;
    ordensServico: Array<{ id: string; descricao: string; status: string; valor: number }>;
    notasFiscais: Array<{ id: string; numero: string; valor: number; dataEmissao: string; statusPagamento: string }>;
}

const contratosFilePath = path.join(process.cwd(), 'data', 'contratos.json');

export async function readContratos(): Promise<Contrato[]> {
    try {
        const content = await fs.readFile(contratosFilePath, 'utf-8');
        return JSON.parse(content || '[]');
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            await fs.writeFile(contratosFilePath, JSON.stringify([], null, 2));
            return [];
        }
        throw err;
    }
}

export async function writeContratos(contratos: Contrato[]) {
    await fs.mkdir(path.dirname(contratosFilePath), { recursive: true });
    await fs.writeFile(contratosFilePath, JSON.stringify(contratos, null, 2));
}
