# Sistema de Gerenciamento de Tickets de Refeição

## Descrição

Este sistema é uma aplicação para gerenciamento de tickets de refeição, permitindo o controle de distribuição de tickets para funcionários. As principais funcionalidades incluem cadastro de funcionários, gerenciamento de tickets e geração de relatórios detalhados.

## Funcionalidades

- **Cadastro de Funcionários**:

  - Registro de novos funcionários com validação de CPF e situação (Ativo/Inativo).
  - Cada funcionário possui um código único e pode ter múltiplos tickets associados.
  - Atualização e consulta de dados dos funcionários.

- **Gerenciamento de Tickets**:

  - Criação de tickets para funcionários ativos.
  - Cada ticket possui quantidade, status (Ativo/Inativo), data de entrega e modificação.
  - Relacionamento entre tickets e funcionários para fácil rastreamento.

- **Relatórios**:
  - Geração de relatórios sobre o total de tickets distribuídos.
  - Relatórios detalhados por funcionário, mostrando a quantidade total de tickets recebidos.
  - Filtragem de tickets por período específico.
  - Relatórios detalhados com resumo e histórico por funcionário.



## Tecnologias Utilizadas

- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB utilizando Prisma como ORM
- **Frontend**: HTML, CSS (Bootstrap 5) e JavaScript (ES Modules)

## Como Executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
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


## Script da criação do Danco de Dados

backend/database/database.sql
