import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const { email, password } = credentials;
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`,
						{
							method: "POST",
							body: JSON.stringify({ email, password }),
							headers: { "Content-Type": "application/json" },
						}
					);

					const data = await res.json();
					console.log("Auth Response:", data);

					// Ensure the request was successful
					if (!res.ok || data.status !== "success") {
						console.error("Authentication failed:", data.message);
						return null;
					}

					// Return a properly structured user object
					return {
						id: data.data.id,
						name: `${data.data.first_name} ${data.data.last_name}`,
						image: data.data.pic,
						email: data.data.email,
						role: data.data.role,
						accessToken: data.token,
					};
				} catch (error) {
					console.error("Error in authorize function:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.accessToken;
				token.name = user.name;
				token.email = user.email;
				token.image = user.image;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.user = {
				name: token.name,
				email: token.email,
				image: token.image,
			};
			return session;
		},
	},
	pages: {
		signIn: "/(auth)/sign-in",
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
