import {
  type User,
  type DefaultSession,
  type NextAuthConfig,
  CredentialsSignin,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { type JWT } from "next-auth/jwt";

import { eq } from "drizzle-orm";

import { signInSchema } from "@/validators/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { compare } from "bcrypt-ts";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";

  constructor(message: string) {
    super(message);

    this.code = message;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: number;
    fullName: string;
    email: string;
  }
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    userId: number;
    fullName: string;
    email: string;
    enrollmentNumber: string,
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signOut: `/sign-in`,
    signIn: `/admin`,
  },
  trustHost: true,
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log("[authorize]: ", credentials);
        if (!credentials) throw new Error("Necessário informar as credenciais!");

        const { email, password } = await signInSchema.parseAsync(credentials);

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) throw new InvalidLoginError("Usuário não encontrado");

       const passwordOk = await compare(password, user.passwordHash);

       if (!passwordOk) throw new InvalidLoginError("Senha incorreta");

        if (!users) {
          throw new InvalidLoginError("Usuário sem e-mail cadastrado.");
        }

        return {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email ?? "",
          enrollmentNumber: user.enrollmentNumber ?? "",
        } satisfies User;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token = {
          ...token,
          ...session,
        } as JWT;
      }

      // console.log("[token:1]: ", token);

      if (user) {
        token = {
          ...token,
          ...user,
        };
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          userId: token.userId,
          fullName: token.fullName,
          email: token.email,
        },
      };
    },
  },
} satisfies NextAuthConfig;
