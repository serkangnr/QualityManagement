import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone",
      credentials: {
        phone: { label: "Telefon Numarası", type: "text", placeholder: "5551234567" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Lütfen telefon numaranızı ve şifrenizi girin.");
        }

        let rawPhone = credentials.phone.replace(/\D/g, "");
        if (rawPhone.startsWith("90")) rawPhone = rawPhone.slice(2);
        if (rawPhone.startsWith("0")) rawPhone = rawPhone.slice(1);

        const phone = "0" + rawPhone;

        const user = await prisma.user.findUnique({
          where: { phone },
        });

        if (!user) {
          throw new Error("Bu telefon numarasına ait bir kayıt bulunamadı.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Şifreniz hatalı.");
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          department: user.department,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone as string;
        token.department = (user as any).department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.department = token.department as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "kalite-yonetimi-gizli-anahtar-123",
};
