require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const oracledb = require('oracledb');
const path = require('path');
const router = express.Router();

app.use(cors());
app.use(express.json());

module.exports = app;







// disponibiliza arquivos do frontend
app.use(express.static(path.join(__dirname, '../../../FrontEnd')));

// rota principal (carrega o index da pagina aluno)
app.get('/', (req, res) => {
  res.redirect('/Aluno');
});

// rota coringa: permite acessar outras paginas
app.get('/:pagina', (req, res) => {
  const pagina = req.params.pagina;
  const arquivo = path.join(__dirname, `../../../FrontEnd/${pagina}/index.html`);
  res.sendFile(arquivo, (err) => {
    if (err) {
      res.status(404).send('Página não encontrada');
    }
  });
});

// rotas de insert ou select no BD, cada uma fazendo sua própria conexão
app.post('/aluno/cadastro', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { alunoRA2, alunoNome } = req.body;

    console.log('Tipo de alunoRA2:', typeof alunoRA2, alunoRA2);
    console.log('Tipo de alunoNome:', typeof alunoNome, alunoNome);

    await conn.execute(
      `INSERT INTO ALUNOS (
        REGISTRO,
        NOME,
        RETIRADAS,
        DEVOLUCOES,
        CLASSIFICACOES
      ) VALUES (
        :alunoRA2,
        :alunoNome,
        0,
        0,
        'Leitor Iniciante'
      )`,
      { alunoRA2, alunoNome },
      { autoCommit: true }
    );

    res.json({ sucesso: true, mensagem: 'Aluno cadastrado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/bibliotecario/cadastro', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { bookName, bookAuthor, bookYear, bookCategory, bookQuantity } = req.body;

    console.log('Tipo de nome:', typeof bookName, bookName);
    console.log('Tipo de autor:', typeof bookAuthor, bookAuthor);
    console.log('Tipo de ano:', typeof bookYear, bookYear);
    console.log('Tipo de categoria:', typeof bookCategory, bookCategory);
    console.log('Tipo de autor:', typeof bookQuantity, bookQuantity);

    await conn.execute(
      `INSERT INTO LIVROS (
        COD_LIVRO, 
        NOME, 
        AUTOR, 
        ANO_PUB, 
        CATEGORIA
      ) VALUES (
        SEQ_LIVROS.NEXTVAL, 
        :bookName, 
        :bookAuthor, 
        :bookYear, 
        :bookCategory
      )`,
      { bookName, bookAuthor, bookYear, bookCategory },
      { autoCommit: false }
    );

    await conn.execute(
      `INSERT INTO EXEMPLARES (
        COD_EXEMPLAR, 
        QUANTIDADE, 
        CODIGO_LIVRO
      ) VALUES (
        SEQ_EXEMPLARES.NEXTVAL, 
        :bookQuantity, 
        SEQ_LIVROS.CURRVAL
      )`,
      { bookQuantity },
      { autoCommit: true }
    );

    res.json({ sucesso: true, mensagem: 'Livro(s) cadastrado(s) com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/consultar/livros', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const result = await conn.execute(
      `SELECT
        LIVROS.NOME,
        LIVROS.AUTOR,
        LIVROS.CATEGORIA,
        LIVROS.COD_LIVRO,
        EXEMPLARES.QUANTIDADE
      FROM LIVROS
      INNER JOIN EXEMPLARES
        ON LIVROS.COD_LIVRO = EXEMPLARES.CODIGO_LIVRO`
    );

    // Transforma o resultado do Oracle em um array de objetos mais fácil de usar no front
    const livros = result.rows.map(row => ({
      nome: row[0],
      autor: row[1],
      categoria: row[2],
      codigo: row[3],
      qtd: row[4]
    }));

    res.json(livros);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

//module.exports = router;