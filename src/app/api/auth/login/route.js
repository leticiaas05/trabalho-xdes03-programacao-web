import {NextResponse} from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

//schema de validação dos dados de login
const loginSchema = z.object({
    email: z.string().email({message: "E-mail inválido"}),
    senha: z.string().min(1, {message: "A senha não pode estar vazia."})
});

const caminhoArquivo = path.join(process.cwd(), 'data', 'usuarios.json');

//definindo chave secreta para o JWT
const segredoJWD = process.env.segredoJWD || 'secret_key_desenvolvimento';

export async function POST(request) {
    try{
        const body = await request.json();

        const resultValidacao = loginSchema.parse(body);

        let usuarios = [];
        try{
            const conteudoArquivo = await fs.readFile(caminhoArquivo, 'utf-8');
            usuarios = JSON.parse(conteudoArquivo);
        }
        catch(e){
            //se o arquivo não existe, ainda não possui usuários cadastrados 
            return NextResponse.json(
                {erro: 'Credenciais inválidas.'},
                {status: 401}
            )
        }

        const usuarioEncontrado = usuarios.find(usuario => usuario.email === resultValidacao.email);
        if(!usuarioEncontrado){
            return NextResponse.json(
                {erro: 'E-mail não cadastrado.'},
                {status: 401}
            )
        }

        const senhaCorreta = await bcrypt.compare(resultValidacao.senha, usuarioEncontrado.senha);
        if(!senhaCorreta){
            return NextResponse.json(
                { erro: "Senha incorreta." }, 
                { status: 401 }
            );
        }

        //geração do token JWT
        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome
            },
            segredoJWD,
            {expiresIn: '1d'} //o token expira após 1 dia
        )

        return NextResponse.json(
            {
                mensagem: "Login realizado com sucesso.",
                token: token
            },
            {status: 200}
        );
    }
    catch(error){
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