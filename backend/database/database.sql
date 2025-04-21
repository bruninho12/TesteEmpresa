-- Script de criação do banco de dados para o Sistema de Tickets de Refeição
-- Compatível com MySQL/MariaDB

CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- Tabela de funcionários
CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    situacao CHAR(1) NOT NULL DEFAULT 'A' CHECK (situacao IN ('A', 'I')),
    data_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de tickets
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT NOT NULL,
    quantidade INT NOT NULL,
    situacao CHAR(1) NOT NULL DEFAULT 'A' CHECK (situacao IN ('A', 'I')),
    data_modificacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados iniciais para teste
INSERT INTO funcionarios (nome, cpf, situacao) VALUES
('João Silva', '12345678901', 'A'),
('Maria Santos', '98765432109', 'A'),
('Carlos Oliveira', '45678912301', 'I');

INSERT INTO tickets (funcionario_id, quantidade) VALUES
(1, 10),
(1, 5),
(2, 8),
(2, 7),
(2, 3);

-- Views úteis
CREATE VIEW vw_tickets_por_funcionario AS
SELECT 
    f.id AS funcionario_id,
    f.nome,
    f.situacao AS status_funcionario,
    COUNT(t.id) AS qtd_entregas,
    SUM(t.quantidade) AS total_tickets
FROM funcionarios f
LEFT JOIN tickets t ON f.id = t.funcionario_id
GROUP BY f.id, f.nome, f.situacao;

CREATE VIEW vw_tickets_por_periodo AS
SELECT
    DATE(data_modificacao) AS data,
    COUNT(id) AS qtd_entregas,
    SUM(quantidade) AS total_tickets
FROM tickets
GROUP BY DATE(data_modificacao);

-- Procedimentos Armazenados
DELIMITER //
CREATE PROCEDURE sp_relatorio_tickets(
    IN p_funcionario_id INT,
    IN p_data_inicio DATE,
    IN p_data_fim DATE
)
BEGIN
    SELECT
        f.nome,
        t.data_modificacao,
        t.quantidade
    FROM tickets t
    JOIN funcionarios f ON t.funcionario_id = f.id
    WHERE 
        (p_funcionario_id IS NULL OR t.funcionario_id = p_funcionario_id)
        AND (p_data_inicio IS NULL OR DATE(t.data_modificacao) >= p_data_inicio)
        AND (p_data_fim IS NULL OR DATE(t.data_modificacao) <= p_data_fim)
    ORDER BY t.data_modificacao DESC;
END //
DELIMITER ;