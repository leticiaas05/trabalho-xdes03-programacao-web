import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    senha: z.string().min(1, { message: "A senha não pode estar vazia." })
});

const caminhoArquivo = path.join(process.cwd(), 'data', 'usuarios.json');

const JWT_SECRET = process.env.JWT_SECRET || 'senha_testes_env';

export async function POST(request) {
    try {
        const body = await request.json();
        const resultValidacao = loginSchema.parse(body);

        let usuarios = [];
        try {
            const conteudoArquivo = await fs.readFile(caminhoArquivo, 'utf-8');
            usuarios = JSON.parse(conteudoArquivo);
        }
        catch (e) {
            return NextResponse.json(
                { erro: 'Credenciais inválidas.' },
                { status: 401 }
            );
        }

        const usuarioEncontrado = usuarios.find(usuario => usuario.email === resultValidacao.email);
        if (!usuarioEncontrado) {
            return NextResponse.json(
                { erro: 'E-mail não cadastrado.' },
                { status: 401 }
            );
        }

        const senhaCorreta = await bcrypt.compare(resultValidacao.senha, usuarioEncontrado.senha);
        if (!senhaCorreta) {
            return NextResponse.json(
                { erro: "Senha incorreta." }, 
                { status: 401 }
            );
        }

        // Geração do token JWT
        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const resposta = NextResponse.json(
            { mensagem: "Login realizado com sucesso." },
            { status: 200 }
        );

        resposta.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 
        });

        return resposta;

    } catch (error) {
        if (error instanceof z.ZodError || (error && error.errors)) {
            const listaErros = error.errors || [];
            const primeiraMensagem = listaErros[0]?.message || "Dados inválidos.";
            
            return NextResponse.json(
                { erro: primeiraMensagem },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { erro: "Erro interno no servidor ao tentar fazer login." }, 
            { status: 500 }
        );
    }
}