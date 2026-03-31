import { promises as fs } from 'fs';
import path from 'path';
import { fasesLic, isValidFase } from './fases';

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

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'licitacoes.json');

async function ensureDataFile() {
    try {
        await fs.access(dataFile);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(dataFile, JSON.stringify([]), 'utf8');
    }
}

export async function readLicitacoes(): Promise<Licitacao[]> {
    await ensureDataFile();
    const raw = await fs.readFile(dataFile, 'utf8');
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function writeLicitacoes(list: Licitacao[]) {
    await ensureDataFile();
    await fs.writeFile(dataFile, JSON.stringify(list, null, 2), 'utf8');
}
