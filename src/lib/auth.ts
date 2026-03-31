import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';
import bcrypt from 'bcryptjs';

const users = [
    {
        id: '1',
        email: 'admin@sglc.gov',
        password: '$2b$10$qXPK51P5Rq4EhUWyrmHfseI/vXnMwvnlsDty7.qtmIDEYOW2S.HXy', // hash for 'password123'
        name: 'Administrador',
        role: 'admin',
    },
    // Add more users as needed
];

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Record<string, string> | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = users.find((u) => u.email === credentials.email);
                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt' as const,
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User | undefined }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                if (!session.user) {
                    session.user = { name: '', email: '', image: '' } as any;
                }
                session.user.id = token.sub ?? '';
                session.user.role = (token.role as string) ?? 'user';
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};

export default NextAuth(authOptions);