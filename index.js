const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { hash, compare } = require("bcryptjs");
const pool = require("./db");
var jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors());

app.get("/pegar/usuario", async (req, res) => {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM usuarios");
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "erro ao obter dados" });
  }
});

app.get("/pegar/pet", async (req, res) => {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM pets");
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "erro ao obter dados" });
  }
});
app.get("/pegar/usuario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows, fields] = await pool.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "erro ao obter dados" });
  }
});

app.post("/user", async (req, res) => {
  const { nome, senha, email, adm } = req.body;
  console.log(req.body);
  if (!nome || !senha || !email) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }
  if (adm == null) {
    const adm = false;
  }

  try {
    const [rows, fields] = await pool.query(
      "SELECT * FROM usuarios WHERE nome = ?",
      [nome]
    );
    if (rows.length > 0) {
      return res.status(400).json({ message: "Este nome já está em uso." });
    }

    const id = uuidv4();

    const senhahashed = await hash(senha, 10);

    await pool.query(
      "INSERT INTO usuarios (id, nome, senha, email, adm) VALUES (?, ?, ?, ?, ?)",
      [id, nome, senhahashed, email, adm]
    );

    return res.status(201).json({ message: "Usuário registrado com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Erro ao registrar usuário." });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  console.log(req.body);
  if (!senha || !email) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    console.log(rows);

    if (rows.length > 0) {
      const senhahash = rows[0].senha;
      const match2 = await compare(senha, senhahash);
      console.log(match2)
      if (match2) {
        var token = jwt.sign({ foo: "bar" }, "shhhhh");
        return res.status(201).json({ token: token, data: rows });
      } else {
        return res
          .status(401)
          .json({ message: "Erro, email ou senha incorretos" });
      }
    } else {
      return res
        .status(404)
        .json({ message: "Erro, email ou senha incorretos" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro no servidor" });
  }
});

app.patch("/editar/usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE id = "${id}"`
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const nomeatt = await pool.query(
      `SELECT nome FROM usuarios WHERE id = "${id}"`
    );

    const emailatt = await pool.query(
      `SELECT email FROM usuarios WHERE id = "${id}"`
    );

    const nomeantigo = nomeatt[0][0].nome;
    const emailantigo = emailatt[0][0].email;

    await pool.query(
      `UPDATE usuarios SET nome="${
        nome ? nome.toString() : nomeantigo
      }", email="${email ? email.toString() : emailantigo}" WHERE id = "${id}"`
    );
    const retorno = await pool.query(
      `SELECT * FROM usuarios WHERE id = "${id}"`
    );

    return res.status(200).json(retorno[0]);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Erro ao editar usuário." });
  }
});

app.delete("/deletar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM usuarios WHERE id = "${id}"`);

    return res.status(200).json({ message: "user deleted" });
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "erro ao obter dados" });
  }
});

app.listen(3000, () => {
  console.log("rodando na porta 3000");
});
