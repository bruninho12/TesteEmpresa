import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Verify database connection on startup
prisma
  .$connect()
  .then(() => console.log("✅ Connected to database successfully"))
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

const app = express();
app.use(express.json());

// Middleware para log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Obter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "ticket-system")));

// Rotas para Funcionários
app.get("/api/funcionarios", async (_req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: { tickets: true },
    });
    res.json(funcionarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/funcionarios", async (req, res) => {
  try {
    const { nome, cpf, situacao = "A", codigo } = req.body;

    // Validação dos campos
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        error: "Nome é obrigatório",
        field: "nome",
      });
    }

    if (!cpf || !/^\d{11}$/.test(cpf)) {
      return res.status(400).json({
        error: "CPF deve conter exatamente 11 dígitos numéricos",
        field: "cpf",
      });
    }

    // Verificar se CPF já existe
    const existingCpf = await prisma.funcionario.findUnique({
      where: { cpf },
    });
    if (existingCpf) {
      return res.status(409).json({
        error: "CPF já cadastrado no sistema",
        field: "cpf",
      });
    }

    // Gerar código único se não fornecido
    let employeeCode = codigo;
    if (!employeeCode) {
      const lastEmployee = await prisma.funcionario.findFirst({
        orderBy: { codigo: "desc" },
      });
      employeeCode = lastEmployee ? lastEmployee.codigo + 1 : 1000;
    }

    // Verificar se código já existe
    const existingCode = await prisma.funcionario.findUnique({
      where: { codigo: employeeCode },
    });
    if (existingCode) {
      return res.status(409).json({
        error: "Código de funcionário já existe",
        field: "codigo",
      });
    }

    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome: nome.trim(),
        cpf,
        situacao,
        codigo: employeeCode,
      },
    });

    res.status(201).json({
      ...novoFuncionario,
      message: "Funcionário cadastrado com sucesso",
    });
  } catch (err) {
    console.error("Error details during employee registration:", err);

    let errorResponse = {
      error: "Database operation failed",
      message: err.message,
    };

    if (err.code === "P2002") {
      errorResponse = {
        error: "Validation error",
        message: "CPF já cadastrado no sistema",
        field: err.meta?.target?.includes("cpf") ? "cpf" : undefined,
      };
    }

    // Include additional error details for client-side handling
    const enhancedError = {
      ...errorResponse,
      timestamp: new Date().toISOString(),
      endpoint: "/api/funcionarios",
      statusCode: err.code === "P2002" ? 409 : 500,
    };
    res.status(enhancedError.statusCode).json(enhancedError);
  }
});

app.put("/api/funcionarios/:id", async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.update({
      where: { id: req.params.id },
      data: {
        nome: req.body.nome,
        cpf: req.body.cpf,
        situacao: req.body.situacao || "A",
        dataAlteracao: new Date(),
      },
    });
    res.json(funcionario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas para Tickets
app.get("/api/tickets", async (_req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { funcionario: true },
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tickets", async (req, res) => {
  console.log("Recebendo requisição para criar ticket:", req.body);

  try {
    if (!req.body.funcionarioId || !req.body.quantidade) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verificar se funcionário existe e está ativo
    console.log("Buscando funcionário por código:", req.body.funcionarioId);
    const funcionario = await prisma.funcionario.findFirst({
      where: { codigo: parseInt(req.body.funcionarioId) },
    });

    if (!funcionario) {
      console.log("Funcionário não encontrado");
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    if (funcionario.situacao !== "A") {
      console.log("Funcionário inativo");
      return res
        .status(400)
        .json({ error: "Funcionário inativo não pode receber tickets" });
    }

    console.log("Criando novo ticket...");
    const ticket = await prisma.ticket.create({
      data: {
        quantidade: parseInt(req.body.quantidade),
        funcionarioId: funcionario.id,
        codigoFuncionario: parseInt(req.body.funcionarioId),
      },
    });

    console.log("Ticket criado com sucesso:", ticket);
    res.status(201).json(ticket);
  } catch (err) {
    console.error("Erro ao criar ticket:", err);
    res.status(500).json({
      error: "Erro interno no servidor",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Relatórios
app.get("/api/relatorios/total", async (_req, res) => {
  try {
    const total = await prisma.ticket.aggregate({
      _sum: { quantidade: true },
      where: { situacao: "A" },
    });
    res.json({ totalTickets: total._sum.quantidade || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/relatorios/funcionarios", async (_req, res) => {
  try {
    const result = await prisma.funcionario.findMany({
      where: { situacao: "A" },
      include: {
        tickets: {
          where: { situacao: "A" },
          select: { quantidade: true },
        },
      },
    });

    const relatorio = result.map((f) => ({
      funcionario: f.nome,
      totalTickets: f.tickets.reduce((sum, t) => sum + t.quantidade, 0),
    }));

    res.json(relatorio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/relatorios/periodo", async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    const tickets = await prisma.ticket.findMany({
      where: {
        situacao: "A",
        dataEntrega: {
          gte: new Date(inicio),
          lte: new Date(fim),
        },
      },
      include: { funcionario: true },
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota de fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "ticket-system", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
