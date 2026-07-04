# Sétima Crítica - Sistema de Avaliação de Filmes

## Descrição do Projeto e Regras de Negócio
O Sétima Crítica é uma aplicação web FullStack desenvolvida como projeto final para a disciplina XDES03 - Programação Web. 
O objetivo central do sistema é permitir que usuários gerenciem suas bibliotecas cinematográficas pessoais por meio de uma interface intuitiva e dinâmica.

### Regras de Negócio Implementadas:
1. **Autenticação e Registro de Usuários**: O acesso à aplicação é condicionado à criação de uma conta. O sistema valida o preenchimento de todos os campos, a integridade do formato do e-mail, e exige senhas com no mínimo 4 dígitos. Há também uma verificação de unicidade, impedindo o cadastro de e-mails duplicados na base de dados.
2. **Rotas Privadas**: O ecossistema interno do painel de controle (Dashboard) é protegido contra acessos diretos maliciosos ("forçados"), redirecionando ou bloqueando requisições sem tokens válidos.
3. **Gerenciamento de Biblioteca (CRUD)**: O usuário cadastrado pode ler, adicionar, atualizar críticas com notas e comentários e remover registros de sua lista de filmes.
4. **Consumo de API Externa**: A aplicação integra a API externa do The Movie Database para carregar recomendações de tendências em tempo real e permitir a busca detalhada de títulos diretamente da base global de dados.

---

## Tecnologias Utilizadas

### Frontend e Frameworks
- **Next.js**: Utilizado como framework FullStack React para a estruturação de rotas, componentes reutilizáveis e renderização otimizada.
- **JavaScript e React hooks**: Empregado para o gerenciamento de estados locais, efeitos colaterais  e manipulação de referências de interface.
- **CSS Modular**: Responsável pela estilização avançada, design responsivo, transições e efeitos visuais do carrossel e dos modais.

### Backend e Persistência
- **Node.js**: Plataforma de execução do código do lado do servidor.
- **API Routes (Next.js)**: Substituição e aprofundamento do Express tradicional para criação de endpoints internos.
- **JSON Web Tokens (JWT)**: Mecanismo de autenticação e geração de tokens de validação para a proteção de rotas privadas.
- **Persistência em Arquivos / Banco de Dados**: Estrutura de armazenamento persistente para simular o comportamento de criação, leitura, atualização e deleção dos filmes.
- **NPM**: Gerenciador de dependências do projeto.

---

## Screenshots da Aplicação
### 1. Tela de Login e Cadastro
<img width="1920" height="917" alt="image" src="https://github.com/user-attachments/assets/9d15c251-6599-4f71-9ff0-196554c55ef4" />
<img width="1920" height="917" alt="image" src="https://github.com/user-attachments/assets/5167ec97-669d-49a1-aaa8-f8a3439e845a" />

### 2.Dashboard e Carrossel de Recomendações
<img width="1904" height="918" alt="image" src="https://github.com/user-attachments/assets/47918a41-1406-4b35-9ba4-4499cf83095e" />
<img width="1907" height="919" alt="image" src="https://github.com/user-attachments/assets/471c6ecf-8aed-4c8f-9c75-a6736495008d" />
<img width="1920" height="919" alt="image" src="https://github.com/user-attachments/assets/5b4540e5-6889-477e-a7db-df7513ef2f71" />

### 3. Busca de filmes
<img width="1920" height="916" alt="image" src="https://github.com/user-attachments/assets/bc460a1f-676d-4515-8a93-436acbaa379d" />

### 4. Modal de Inserção e Edição de Críticas
<img width="458" height="380" alt="image" src="https://github.com/user-attachments/assets/ad5a782f-3854-4bad-9642-1809c64a19b9" />
<img width="453" height="413" alt="image" src="https://github.com/user-attachments/assets/fcf1923e-7efd-4581-98c7-c6f14c579990" />

## Integrantes do Grupo
- **Leticia Aparecida Silva**
  - Contribuição técnica: Desenvolvimento integral do backend do sistema, englobando a arquitetura de persistência de dados para o CRUD de filmes, implementação do sistema de rotas privadas protegidas por tokens de autenticação (JWT), validação de e-mails únicos na base e estruturação lógica dos endpoints da API interna.
  - Link para o perfil: [github.com/leticiaas05](https://github.com/leticiaas05)
 
- **[Kléverton Lucas da Silva Teixeira]**
  - Contribuição técnica: Desenvolvimento do bloco de frontend da aplicação, abrangendo a criação da interface gráfica responsiva em React/Next.js, consumo assíncrono de dados da API externa do TMDB para exibição de recomendações e buscas, manipulação do estado dos modais de interface e tratamento visual das validações de formulário.
  - Link para o perfil: [github.com/KlevertonTX](https://github.com/KlevertonTX)

---

## Instruções para Execução do Projeto

1. Instale as dependências gerenciadas pelo NPM:
   ```bash
     npm install
3. Configuração das Variáveis de Ambiente
   Crie um arquivo na raiz do projeto chamado .env.local 
   ```javascript
    JWT_SECRET=senha_testes_env
    TMDB_API_KEY=379bd211dff380c96cd46d5f1873fd9c
4. Execute o servidor de desenvolvimento:
   ```bash
     npm run dev
5. Acesse a aplicação por meio do navegador no endereço http://localhost:3000
