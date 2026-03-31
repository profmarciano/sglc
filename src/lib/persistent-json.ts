import { list, put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

async function ensureLocalJsonFile<T>(filePath: string, defaultValue: T) {
    try {
        await fs.access(filePath);
    } catch {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
    }
}

async function readLocalJson<T>(filePath: string, defaultValue: T): Promise<T> {
    await ensureLocalJsonFile(filePath, defaultValue);
    const raw = await fs.readFile(filePath, 'utf8');

    try {
        return JSON.parse(raw) as T;
    } catch {
        return defaultValue;
    }
}

export async function readPersistentJson<T>(blobPathname: string, localFilePath: string, defaultValue: T): Promise<T> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return readLocalJson(localFilePath, defaultValue);
    }

    const { blobs } = await list({
        prefix: blobPathname,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const existingBlob = blobs.find((blob) => blob.pathname === blobPathname);

    if (!existingBlob) {
        const seedData = await readLocalJson(localFilePath, defaultValue);

        await put(blobPathname, JSON.stringify(seedData, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: 'application/json; charset=utf-8',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return seedData;
    }

    const response = await fetch(existingBlob.url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Falha ao carregar dados persistidos de ${blobPathname}.`);
    }

    try {
        return (await response.json()) as T;
    } catch {
        return defaultValue;
    }
}

export async function writePersistentJson<T>(blobPathname: string, localFilePath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        if (process.env.VERCEL) {
            throw new Error('Configure a variável BLOB_READ_WRITE_TOKEN na Vercel para habilitar gravações em produção.');
        }

        await fs.mkdir(path.dirname(localFilePath), { recursive: true });
        await fs.writeFile(localFilePath, content, 'utf8');
        return;
    }

    await put(blobPathname, content, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json; charset=utf-8',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });
}
