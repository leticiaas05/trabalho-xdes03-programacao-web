import {NextResponse} from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { z } from 'zod';

//Schema de validação dos dados de cadastro
const cadastroSchema = z.object({
    nome : z.string().min(1, {message: "O nome é obrigatório."}),
    email: z.string().email({message: "E-mail inválido"}),
    senha: z.string().min(4, {message: "A senha deve conter pelo menos 4 caracteres."}),
    confirmacaoSenha: z.string().min(4)
}).refine((data) => data.senha === data.confirmacaoSenha, {
    message: "As senhas devem ser iguais.",
    path: ["confirmacaoSenha"],
});

//caminho do arquivo onde os usuários serão salvos
const caminhoArquivo = path.join(process.cwd(), 'data', 'usuarios.json');

export async function POST (request){
    try{
        //dados enviados pelo front-end
        const body = await request.json();

        //validação do Zod
        const resultValidacao = cadastroSchema.parse(body);
    
        //manipulação do arquivo Json
        let usuarios = [];
        try{
            const conteudoArquivo = await fs.readFile(caminhoArquivo, 'utf-8');
            usuarios = JSON.parse(conteudoArquivo);
        }
        catch(erroLeitura){
            //se o arquivo não existir, inicia com um array vazio
            usuarios = []
        }

        //vVerificar se o email já existe
        const emailExistente = usuarios.some(usuario => usuario.email === resultValidacao.email);
        if(emailExistente){
            return NextResponse.json(
                {erro: "Este e-mail já está cadastrado."},
                {status: 400}
            );
        }

        //criptografia da senha
        const senhaHash = await bcrypt.hash(resultValidacao.senha, 10);

        //estrutura novo usuário
        const novoUsuario = {
            id: crypto.randomUUID(), //gera um id único
            nome: resultValidacao.nome,
            email: resultValidacao.email,
            senha: senhaHash
        };

        //salva o novo usuário no arquivo usuarios.json
        usuarios.push(novoUsuario);
        await fs.writeFile(caminhoArquivo, JSON.stringify(usuarios, null, 2), 'utf-8');

        //resposta de sucesso
        return NextResponse.json(
            {mensagem: "Cadastro realizado com sucesso!"},
            {status: 201}
        );
    }
    catch(error){
        //falha de validação do Zod
        console.error("Erro capturado no cadastro:", error);
        if (error instanceof z.ZodError || (error && error.errors)) {
            const listaErros = error.errors || [];
            const primeiraMensagem = listaErros[0]?.message || "Dados inválidos.";
            
            return NextResponse.json(
                { erro: primeiraMensagem },
                { status: 400 }
            );
        }
        //resposta genérica
        return NextResponse.json(
            {erro: "Erro interno desconhecido."},
            {status: 500}
        );
    }
}