# Sistema de Gerenciamento de Tickets de Refeição

## Descrição

Este sistema é uma aplicação para gerenciamento de tickets de refeição, permitindo o controle de distribuição de tickets para funcionários. As principais funcionalidades incluem:

## Funcionalidades

- **Cadastro de Funcionários**:

  - Permite o registro de novos funcionários com validação de CPF e situação (Ativo/Inativo).
  - Cada funcionário possui um código único e pode ter múltiplos tickets associados.

- **Gerenciamento de Tickets**:

  - Criação de tickets para funcionários ativos.
  - Cada ticket possui uma quantidade e um status (Ativo/Inativo).
  - Relacionamento entre tickets e funcionários para fácil rastreamento.

- **Relatórios**:
  - Geração de relatórios sobre o total de tickets distribuídos.
  - Relatórios detalhados por funcionário, mostrando a quantidade total de tickets recebidos.
  - Filtragem de tickets por período específico.

## Tecnologias Utilizadas

- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB utilizando Prisma como ORM
- **Frontend**: HTML, CSS e JavaScript

## Como Executar

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd EmpresaProjeto
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a variável de ambiente `DATABASE_URL` no arquivo `.env` para conectar ao seu banco de dados MongoDB.

4. Inicie o servidor:

   ```bash
   npm start
   ```

5. Acesse a aplicação em `http://localhost:3001`.

## Melhorias Futuras

- **Autenticação e Autorização**: Implementar sistema de login com diferentes níveis de acesso.
- **Dashboard Administrativo**: Criar uma interface mais robusta para visualização e análise de dados.
- **Exportação de Relatórios**: Adicionar opção para exportar relatórios em formatos como PDF e Excel.
- **Notificações**: Sistema de alertas para funcionários com tickets prestes a expirar.
- **API REST mais robusta**: Implementar paginação, filtros avançados e documentação Swagger.
- **Testes Automatizados**: Adicionar testes unitários e de integração para garantir a qualidade do código.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir um pull request ou relatar problemas.
