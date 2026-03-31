import path from 'path';
import { readPersistentJson, writePersistentJson } from './persistent-json';

export interface PhaseHistory {
    from: string;
    to: string;
    date: string;
    responsible: string;
}

export interface Licitacao {
    id: string;
    numero: string;
    objeto: string;
    fase: string;
    dataInicio: string;
    valorEstimado: number;
    history: PhaseHistory[];
}

const dataFile = path.join(process.cwd(), 'data', 'licitacoes.json');
const licitacoesBlobPath = 'data/licitacoes.json';

export async function readLicitacoes(): Promise<Licitacao[]> {
    return readPersistentJson<Licitacao[]>(licitacoesBlobPath, dataFile, []);
}

export async function writeLicitacoes(list: Licitacao[]) {
    await writePersistentJson<Licitacao[]>(licitacoesBlobPath, dataFile, list);
}
