import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Verificar conexão com o banco de dados na inicialização
prisma
  .$connect()
  .then(() => console.log("✅ Connected to database successfully"))
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

const app = express();
app.use(express.json());

// Rota de depuração para buscar dados brutos de funcionários por ID
app.get("/api/debug/funcionarios/:id", async (req, res) => {
  try {
    const funcionario = await prisma.$queryRaw`
      SELECT * FROM funcionarios WHERE id = ${req.params.id}
    `;
    console.log("Raw funcionario data for id", req.params.id, ":", funcionario);
    res.json(funcionario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware para log de todas as requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Obter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend/public")));

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
  console.log("Recebendo requisição para cadastrar funcionário:", req.body);
  try {
    const { nome, cpf, situacao = "A", codigo } = req.body;

    // Validação dos campos
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        error: "Nome é obrigatório",
        field: "nome",
      });
    }

    // Validação básica de formato (11 dígitos numéricos)
    if (!cpf || !/^\d{11}$/.test(cpf)) {
      return res.status(400).json({
        error: "CPF deve conter exatamente 11 dígitos numéricos",
        field: "cpf",
      });
    }

    // Validar situação
    if (situacao && !["A", "I"].includes(situacao)) {
      return res.status(400).json({
        error: "Situação deve ser 'A' (Ativo) ou 'I' (Inativo)",
        field: "situacao",
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

    const now = new Date();

    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nome: nome.trim(),
        cpf,
        situacao,
        codigo: employeeCode,
        dataCriacao: now,
        dataAlteracao: now,
      },
    });
    console.log("Funcionário cadastrado com sucesso:", novoFuncionario);

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

    // Incluir detalhes adicionais de erro para tratamento do lado do cliente
    const enhancedError = {
      ...errorResponse,
      timestamp: new Date().toISOString(),
      endpoint: "/api/funcionarios",
      statusCode: err.code === "P2002" ? 409 : 500,
    };
    res.status(enhancedError.statusCode).json(enhancedError);
  }
});

app.get("/api/funcionarios/:id", async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.params.id },
    });

    console.log("Funcionario fetched for id", req.params.id, ":", funcionario);

    if (!funcionario) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.json({
      ...funcionario,
      dataCriacao:
        funcionario.dataCriacao ||
        (funcionario.createdAt ? funcionario.createdAt.toISOString() : null),
      dataAlteracao:
        funcionario.dataAlteracao ||
        (funcionario.updatedAt ? funcionario.updatedAt.toISOString() : null),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const { funcionarioId, quantidade, situacao = "A" } = req.body;

    // Verificar se funcionário existe
    console.log("Buscando funcionário por ID:", funcionarioId);
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      console.log("Funcionário não encontrado");
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }
    if (funcionario.situacao !== "A") {
      console.log("Funcionário inativo");
      return res.status(400).json({
        error: "Não é possível criar ticket para funcionário inativo",
      });
    }

    console.log("Criando novo ticket...");
    const ticket = await prisma.ticket.create({
      data: {
        quantidade: parseInt(quantidade),
        funcionarioId: funcionario.id,
        codigoFuncionario: funcionario.codigo,
        situacao,
        dataModificacao: new Date(),
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

app.get("/api/relatorios/detalhado", async (req, res) => {
  try {
    const { funcionarioId, inicio, fim } = req.query;

    console.log("Relatório detalhado - funcionarioId:", funcionarioId);

    const whereClause = {
      situacao: "A",
      dataEntrega: {
        gte: inicio ? new Date(inicio) : undefined,
        lte: fim ? new Date(fim) : undefined,
      },
    };

    if (
      funcionarioId === undefined ||
      funcionarioId === null ||
      funcionarioId === "" ||
      funcionarioId === "todos"
    ) {
      console.log("Retornando resumo para todos os funcionários");

      const result = await prisma.ticket.groupBy({
        by: ["funcionarioId"],
        where: {
          ...whereClause,
          dataEntrega: {
            not: null,
          },
        },
        _sum: {
          quantidade: true,
        },
        _max: {
          dataEntrega: true,
        },
      });

      if (result.length === 0) {
        return res.json({
          summary: [],
          total: 0,
        });
      }

      // Obter detalhes do funcionário
      const funcionarios = await prisma.funcionario.findMany({
        where: {
          id: { in: result.map((r) => r.funcionarioId) },
        },
        select: {
          id: true,
          nome: true,
          codigo: true,
          situacao: true,
        },
      });
      // Rotas para Funcionários
      app.get("/api/funcionarios", async (_req, res) => {
        try {
          const funcionarios = await prisma.funcionario.findMany({
            include: { tickets: true },
            orderBy: { nome: "asc" },
          });
          res.json(funcionarios);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      app.post("/api/funcionarios", async (req, res) => {
        console.log(
          "Recebendo requisição para cadastrar funcionário:",
          req.body
        );
        try {
          const { nome, cpf, situacao = "A", codigo } = req.body;

          // Validação dos campos
          if (!nome || !nome.trim()) {
            return res.status(400).json({
              error: "Nome é obrigatório",
              field: "nome",
            });
          }

          // Validação básica de formato (11 dígitos numéricos)
          if (!cpf || !/^\d{11}$/.test(cpf)) {
            return res.status(400).json({
              error: "CPF deve conter exatamente 11 dígitos numéricos",
              field: "cpf",
            });
          }

          // Validar situação
          if (situacao && !["A", "I"].includes(situacao)) {
            return res.status(400).json({
              error: "Situação deve ser 'A' (Ativo) ou 'I' (Inativo)",
              field: "situacao",
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

          const now = new Date();

          const novoFuncionario = await prisma.funcionario.create({
            data: {
              nome: nome.trim(),
              cpf,
              situacao,
              codigo: employeeCode,
              createdAt: now,
              updatedAt: now,
            },
          });
          console.log("Funcionário cadastrado com sucesso:", novoFuncionario);

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

          // Incluir detalhes adicionais de erro para tratamento do lado do cliente
          const enhancedError = {
            ...errorResponse,
            timestamp: new Date().toISOString(),
            endpoint: "/api/funcionarios",
            statusCode: err.code === "P2002" ? 409 : 500,
          };
          res.status(enhancedError.statusCode).json(enhancedError);
        }
      });

      app.get("/api/funcionarios/:id", async (req, res) => {
        try {
          const funcionario = await prisma.funcionario.findUnique({
            where: { id: req.params.id },
            include: { tickets: true },
          });

          console.log(
            "Funcionario fetched for id",
            req.params.id,
            ":",
            funcionario
          );

          if (!funcionario) {
            return res
              .status(404)
              .json({ error: "Funcionário não encontrado" });
          }

          res.json({
            ...funcionario,
            dataCriacao: funcionario.createdAt
              ? funcionario.createdAt.toISOString()
              : null,
            dataAlteracao: funcionario.updatedAt
              ? funcionario.updatedAt.toISOString()
              : null,
          });
        } catch (err) {
          res.status(500).json({ error: err.message });
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
            },
          });
          res.json(funcionario);
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      // Calcular total geral
      const totalGeral = result.reduce(
        (sum, item) => sum + (item._sum.quantidade || 0),
        0
      );

      const formattedResult = result.map((item) => {
        const funcionario = funcionarios.find(
          (f) => f.id === item.funcionarioId
        );
        return {
          data: item._max.dataEntrega,
          funcionario: {
            nome: funcionario.nome,
            codigo: funcionario.codigo,
            situacao: funcionario.situacao,
          },
          totalTickets: item._sum.quantidade || 0,
        };
      });

      return res.json({
        summary: formattedResult,
        total: totalGeral,
      });
    } else {
      console.log("Retornando detalhes para funcionário específico");

      // Modo detalhado para funcionário específico - adicionar filtro explícito
      const tickets = await prisma.ticket.findMany({
        where: {
          ...whereClause,
          funcionarioId: funcionarioId,
        },
        include: {
          funcionario: {
            select: {
              id: true,
              nome: true,
              codigo: true,
              situacao: true,
              cpf: true,
            },
          },
        },
        orderBy: {
          dataModificacao: "desc",
        },
      });

      return res.json(tickets);
    }
  } catch (err) {
    console.error("Erro no relatório detalhado:", err);
    res.status(500).json({
      error: "Falha ao gerar relatório",
      details: err.message,
    });
  }
});

// Rota de histórico de funcionários
app.get("/api/funcionarios/historico", async (_req, res) => {
  console.log("Recebida requisição para /api/funcionarios/historico");
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: {
        tickets: true,
      },
      orderBy: { nome: "asc" },
    });

    console.log(`Retornando ${funcionarios.length} funcionários`);
    res.json(funcionarios);
  } catch (err) {
    console.error("Erro ao buscar funcionários:", err);
    res.status(500).json({
      error: "Falha ao carregar funcionários",
      details: err.message,
    });
  }
});

// Rota de fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
