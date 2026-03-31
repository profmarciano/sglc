'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function Nav() {
    const { data: session } = useSession();

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="text-xl font-bold">
                        SGLC
                    </Link>
                    <Link href="/licitacoes" className="hover:underline">
                        Licitações
                    </Link>
                    <Link href="/contratos" className="hover:underline">
                        Contratos
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <span>Olá, {session?.user?.name}</span>
                    <button
                        onClick={() => signOut()}
                        className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </nav>
    );
}