import {NextResponse} from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const cadastroSchema = z.object({
    nome : z.string().min(1, {message: "O nome é obrigatório."}),
    email: z.string().email({message: "E-mail inválido"}),
    senha: z.string().min(4, {message: "A senha deve conter pelo menos 4 caracteres."}),
    confirmacaoSenha: z.string().min(4)
}).refine((data) => data.senha === data.confirmacaoSenha, {
    message: "As senhas devem ser iguais.",
    path: ["confirmacaoSenha"],
});

const caminhoArquivo = path.join(process.cwd(), 'data', 'usuarios.json');

export async function POST (request){
    try{
        const body = await request.json();
        const resultValidacao = cadastroSchema.parse(body);
    
        let usuarios = [];
        try{
            const conteudoArquivo = await fs.readFile(caminhoArquivo, 'utf-8');
            usuarios = JSON.parse(conteudoArquivo);
        }
        catch(erroLeitura){
            usuarios = []
        }

        const emailExistente = usuarios.some(usuario => usuario.email === resultValidacao.email);
        if(emailExistente){
            return NextResponse.json(
                {erro: "Este e-mail já está cadastrado."},
                {status: 400}
            );
        }

        const senhaHash = await bcrypt.hash(resultValidacao.senha, 10);

        const novoUsuario = {
            id: crypto.randomUUID(),
            nome: resultValidacao.nome,
            email: resultValidacao.email,
            senha: senhaHash
        };

        usuarios.push(novoUsuario);
        await fs.writeFile(caminhoArquivo, JSON.stringify(usuarios, null, 2), 'utf-8');

        return NextResponse.json(
            {mensagem: "Cadastro realizado com sucesso!"},
            {status: 201}
        );
    }
    catch (error) {
        console.error("Erro capturado no cadastro:", error);

        if (error instanceof z.ZodError) {
            const listaErros = error.issues || error.errors || [];
            
            const primeiraMensagem = listaErros[0]?.message || "Dados inválidos.";
            
            return NextResponse.json(
                { erro: primeiraMensagem },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { erro: "Erro interno desconhecido." },
            { status: 500 }
        );
    }
}