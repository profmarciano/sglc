import path from 'path';
import { readPersistentJson, writePersistentJson } from './persistent-json';

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
const contratosBlobPath = 'data/contratos.json';

export async function readContratos(): Promise<Contrato[]> {
    return readPersistentJson<Contrato[]>(contratosBlobPath, contratosFilePath, []);
}

export async function writeContratos(contratos: Contrato[]) {
    await writePersistentJson<Contrato[]>(contratosBlobPath, contratosFilePath, contratos);
}
