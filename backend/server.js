import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";

// Inicialização Prisma
const prisma = new PrismaClient();

const app = express();

// IMPORTANTE: NÃO usar express.json() antes do multer em upload
app.use(express.json());

// Caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar pasta uploads se não existir
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// CONFIGURAÇÃO DO MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Middleware log
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ===============================
// PRODUTOS (COM UPLOAD)
// ===============================

app.get("/api/produtos", async (_req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPLOAD DE IMAGEM
app.post("/api/produtos", upload.single("imagem"), async (req, res) => {
  try {
    const { nome, preco, categoria } = req.body;

    let imagemPath = null;

    if (req.file) {
      imagemPath = `/uploads/${req.file.filename}`;
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        preco: parseFloat(preco),
        categoria,
        imagem: imagemPath,
      },
    });

    res.status(201).json(novoProduto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
//  PEDIDOS
// ===============================

app.get("/api/pedidos", async (_req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: { in: ["PENDENTE", "PREPARANDO", "PRONTO"] },
      },
      orderBy: { data: "asc" },
    });

    const formatados = pedidos.map((p) => ({
      ...p,
      itens: JSON.parse(p.itens),
    }));

    res.json(formatados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pedidos", async (req, res) => {
  try {
    const { itens, senha, total } = req.body;

    const novoPedido = await prisma.pedido.create({
      data: {
        itens: JSON.stringify(itens),
        senha: senha.toString(),
        total: parseFloat(total),
        status: "PENDENTE",
        data: new Date(),
      },
    });

    res.status(201).json(novoPedido);
  } catch (err) {
    res.status(500).json({ error: "Erro ao processar pedido" });
  }
});

app.patch("/api/pedidos/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const atualizado = await prisma.pedido.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// ===============================
// SERVIR IMAGENS UPLOAD
// ===============================

app.use("/uploads", express.static(uploadDir));

// ===============================
// FRONTEND
// ===============================

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Rota API não encontrada" });
  }

  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// ===============================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
