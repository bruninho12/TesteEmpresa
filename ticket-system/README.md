# Sistema de Gerenciamento de Tickets de Refeição

## Descrição

Sistema para controle de distribuição de tickets de refeição para funcionários, com:

- Cadastro de funcionários
- Registro de entrega de tickets
- Relatórios de distribuição
- Exportação de dados para planilha Excel

## Tecnologias Utilizadas

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Banco de Dados: IndexedDB (navegador)
- Não requer instalação ou servidor

## Como Executar

1. Clone o repositório ou faça download dos arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno

## Estrutura do Banco de Dados (IndexedDB)

### Tabela: funcionarios

- id (auto-incremento)
- nome (texto)
- cpf (texto, único)
- situacao (texto: 'A' ou 'I')
- dataAlteracao (data)

### Tabela: tickets

- id (auto-incremento)
- funcionarioId (número)
- quantidade (número)
- situacao (texto: 'A' ou 'I')
- dataModificacao (data)

## Script SQL Equivalente

```sql
CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    situacao CHAR(1) NOT NULL CHECK (situacao IN ('A', 'I')),
    data_alteracao DATETIME NOT NULL
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT NOT NULL,
    quantidade INT NOT NULL,
    situacao CHAR(1) NOT NULL CHECK (situacao IN ('A', 'I')),
    data_modificacao DATETIME NOT NULL,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);
```

## Pontos Relevantes para Análise

1. **Validações**:

   - CPF com 11 dígitos
   - Funcionário deve estar ativo para receber tickets
   - Não permite exclusão de registros (apenas inativação)

2. **Regras de Negócio Implementadas**:

   - Situação padrão 'A' (Ativo) para novos registros
   - Data de modificação automática
   - Relatórios com filtros por funcionário e período

3. **Organização do Código**:

   - Separação clara entre:
     - Camada de dados (database.js)
     - Camada de apresentação (app.js)
     - Estilos (style.css)
   - Uso de módulos ES6
   - Tratamento de erros

4. **Boas Práticas**:
   - Nomenclatura consistente
   - Comentários explicativos
   - Funções pequenas e especializadas
   - Promises para operações assíncronas

## Melhorias Futuras

1. Adicionar autenticação de usuários
3. Adicionar gráficos para visualização de dados
4. Versão mobile responsiva

