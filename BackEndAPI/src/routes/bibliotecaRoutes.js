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

// rota que permite qualquer URL do tipo /Aluno/:id também carregue a pagina do Aluno
app.get('/Aluno/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../FrontEnd/Aluno/index.html'));
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
        'Iniciante'
      )`,
      { alunoRA2, alunoNome },
      { autoCommit: true }
    );

    res.json({ sucesso: true, mensagem: 'Aluno cadastrado com sucesso!', ra: alunoRA2, aluno: alunoNome, classificacao: 'Iniciante'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/aluno/login', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { alunoRA1 } = req.body;

    console.log('Tipo de alunoRA1:', typeof alunoRA1, alunoRA1);

    const result = await conn.execute(
      `SELECT
        REGISTRO,
        NOME,
        CLASSIFICACOES
      FROM ALUNOS
      WHERE REGISTRO = :alunoRA1`,
      { alunoRA1 }
    );

    // Transforma o resultado do Oracle em um array de objetos mais fácil de usar no front
    const alunoRetornado = result.rows.map(row => ({
      ra: row[0],
      aluno: row[1],
      classificacao: row[2]
    }));

    res.json(alunoRetornado[0] || null);

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

    await conn.execute(`
      MERGE INTO LIVROS t
      USING (
        SELECT 
          :bookName AS NOME,
          :bookAuthor AS AUTOR,
          :bookYear AS ANO_PUB,
          :bookCategory AS CATEGORIA
        FROM dual
      ) s
      ON (t.NOME = s.NOME AND t.AUTOR = s.AUTOR)
      WHEN MATCHED THEN
        UPDATE SET
          t.ANO_PUB = s.ANO_PUB,
          t.CATEGORIA = s.CATEGORIA
      WHEN NOT MATCHED THEN
        INSERT (COD_LIVRO, NOME, AUTOR, ANO_PUB, CATEGORIA)
        VALUES (SEQ_LIVROS.NEXTVAL, s.NOME, s.AUTOR, s.ANO_PUB, s.CATEGORIA)
    `,
    { bookName, bookAuthor, bookYear, bookCategory },
    { autoCommit: false }
    );

    const resultId = await conn.execute(`
      SELECT COD_LIVRO 
      FROM LIVROS
      WHERE NOME = :bookName AND AUTOR = :bookAuthor
    `,
    { bookName, bookAuthor }
    );
    const codLivro = resultId.rows[0][0];

    await conn.execute(`
      MERGE INTO EXEMPLARES t
      USING (SELECT :codLivro AS COD_LIVRO FROM dual) s
      ON (t.CODIGO_LIVRO = s.COD_LIVRO)
      WHEN MATCHED THEN
        UPDATE SET t.QUANTIDADE = t.QUANTIDADE + :bookQuantity
      WHEN NOT MATCHED THEN
        INSERT (COD_EXEMPLAR, QUANTIDADE, CODIGO_LIVRO)
        VALUES (SEQ_EXEMPLARES.NEXTVAL, :bookQuantity, s.COD_LIVRO)
    `,
    { codLivro, bookQuantity },
    { autoCommit: true }
    );

    /*
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
    );*/

    res.json({ sucesso: true });
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
        l.NOME,
        l.AUTOR,
        l.CATEGORIA,
        ex.COD_EXEMPLAR,
        ex.QUANTIDADE
      FROM LIVROS l
      JOIN EXEMPLARES ex ON l.COD_LIVRO = ex.CODIGO_LIVRO
      AND ex.QUANTIDADE > 0
      `
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

app.get('/consultar/alunos', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const result = await conn.execute(
      `SELECT
        NOME,
        REGISTRO,
        RETIRADAS,
        DEVOLUCOES,
        CLASSIFICACOES
      FROM ALUNOS`
    );

    // Transforma o resultado do Oracle em um array de objetos mais fácil de usar no front
    const alunos = result.rows.map(row => ({
      nome: row[0],
      ra: row[1],
      retiradas: row[2],
      devolucoes: row[3],
      classificacao: row[4]
    }));

    res.json(alunos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/consultar/naodevolvidos', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const result = await conn.execute(
      `SELECT
        l.NOME,
        em.CODIGO_EXEMPLAR,
        a.NOME,
        em.RA_ALUNO,
        TO_CHAR(em.DATA_RETIRADA, 'dd/mm/yyyy hh24:mi:ss')
      FROM EMPRESTIMOS em
      JOIN EXEMPLARES ex ON em.CODIGO_EXEMPLAR = ex.COD_EXEMPLAR
      JOIN LIVROS l ON ex.CODIGO_LIVRO = l.COD_LIVRO
      JOIN ALUNOS a ON em.RA_ALUNO = a.REGISTRO
      AND em.DATA_DEVOLUCAO IS NULL`
    );

    // Transforma o resultado do Oracle em um array de objetos mais fácil de usar no front
    const naoDevolvidos = result.rows.map(row => ({
      livro: row[0],
      codigodolivro: row[1],
      aluno: row[2],
      ra: row[3],
      dataderetirada: row[4]
    }));

    res.json(naoDevolvidos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.get('/consultar/devolvidos', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const result = await conn.execute(
      `SELECT
        l.NOME,
        em.CODIGO_EXEMPLAR,
        a.NOME,
        em.RA_ALUNO,
        TO_CHAR(em.DATA_DEVOLUCAO, 'dd/mm/yyyy hh24:mi:ss')
      FROM EMPRESTIMOS em
      JOIN EXEMPLARES ex ON em.CODIGO_EXEMPLAR = ex.COD_EXEMPLAR
      JOIN LIVROS l ON ex.CODIGO_LIVRO = l.COD_LIVRO
      JOIN ALUNOS a ON em.RA_ALUNO = a.REGISTRO
      AND em.DATA_DEVOLUCAO IS NOT NULL`
    );

    // Transforma o resultado do Oracle em um array de objetos mais fácil de usar no front
    const devolvidos = result.rows.map(row => ({
      livro: row[0],
      codigodolivro: row[1],
      aluno: row[2],
      ra: row[3],
      datadedevolucao: row[4]
    }));

    res.json(devolvidos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/totem/retirada', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra, codlivro } = req.body;

    console.log('Tipo de RA:', typeof ra, ra);
    console.log('Tipo de Colivro:', typeof codlivro, codlivro);

    await conn.execute(`
      INSERT INTO EMPRESTIMOS (
        ID_EMPRESTIMO,
        RA_ALUNO,
        CODIGO_EXEMPLAR,
        DATA_RETIRADA
      ) VALUES (
        SEQ_EMPRESTIMOS.NEXTVAL,
        :ra,
        :codlivro,
        (SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      )`,
      { ra, codlivro },
      { autoCommit: false }
    );
    await conn.execute(`
      UPDATE ALUNOS
      SET RETIRADAS = RETIRADAS + 1
      WHERE REGISTRO = :ra`,
      { ra },
      { autoCommit: false }
    );
    await conn.execute(`
      UPDATE EXEMPLARES
      SET QUANTIDADE = QUANTIDADE - 1
      WHERE COD_EXEMPLAR = :codlivro`,
      { codlivro },
      { autoCommit: true }
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/totem/devolucao', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra, codlivro } = req.body;

    console.log('Tipo de RA:', typeof ra, ra);
    console.log('Tipo de Colivro:', typeof codlivro, codlivro);

    await conn.execute(`
      UPDATE EMPRESTIMOS
      SET DATA_DEVOLUCAO = (SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      WHERE RA_ALUNO = :ra
      AND CODIGO_EXEMPLAR = :codlivro
      AND ID_EMPRESTIMO = (
        SELECT 
          MAX(ID_EMPRESTIMO)
        FROM EMPRESTIMOS
        WHERE RA_ALUNO = :ra
        AND CODIGO_EXEMPLAR = :codlivro
      )
      AND DATA_DEVOLUCAO IS NULL
      `,
      { ra, codlivro },
      { autoCommit: false }
    );
    await conn.execute(`
      UPDATE ALUNOS
      SET DEVOLUCOES = DEVOLUCOES + 1
      WHERE REGISTRO = :ra`,
      { ra },
      { autoCommit: false }
    );
    await conn.execute(`
      UPDATE EXEMPLARES
      SET QUANTIDADE = QUANTIDADE + 1
      WHERE COD_EXEMPLAR = :codlivro`,
      { codlivro },
      { autoCommit: true }
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/sistema/classificacaoAtualizada', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra } = req.body;

    console.log('Tipo de RA:', typeof ra, ra);

    const livrosLidos = await conn.execute(`
      SELECT COUNT(*) FROM EMPRESTIMOS
      WHERE RA_ALUNO = :ra
      AND DATA_RETIRADA IS NOT NULL
      AND DATA_DEVOLUCAO IS NOT NULL
      AND DATA_DEVOLUCAO >= (SYSTIMESTAMP AT TIME ZONE 'America/Sao_Paulo') - 180
      `,
      { ra },
      { autoCommit: false }
    );
    const quantidadeLivrosLidos = livrosLidos.rows[0][0];

    console.log("Total encontrado:", typeof quantidadeLivrosLidos, quantidadeLivrosLidos);

    let novaClassificacao = '';
    if (quantidadeLivrosLidos <= 5) {
      novaClassificacao = 'Iniciante';
    } else if (quantidadeLivrosLidos > 5 && quantidadeLivrosLidos <= 10) {
      novaClassificacao = 'Regular';
    } else if (quantidadeLivrosLidos > 10 && quantidadeLivrosLidos <= 20) {
      novaClassificacao = 'Ativo(a)';
    } else {
      novaClassificacao = 'Extremo(a)';
    }

    await conn.execute(`
      UPDATE ALUNOS
      SET CLASSIFICACOES = :novaClassificacao
      WHERE REGISTRO = :ra
      `,
      { novaClassificacao, ra },
      { autoCommit: true }
    );

    res.json({ sucesso: true, mensagem: 'Classificação atualizada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/sistema/classificacaoAtual', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra } = req.body;

    const classificacaoAtual = (await conn.execute(`
      SELECT CLASSIFICACOES FROM ALUNOS
      WHERE REGISTRO = :ra
      `,
      { ra }
    )).rows[0];//[0];

    res.json({ sucesso: true, classificacao: classificacaoAtual });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/sistema/validarRA', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra } = req.body;

    const result = await conn.execute(`
      SELECT COUNT(*) FROM ALUNOS 
      WHERE REGISTRO = :ra
      `,
      { ra }
    )

    if (result.rows[0][0] === 1) {
        return res.json({ existe: true });
    } else {
        return res.json({ existe: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.post('/sistema/validarCodLivroRetirada', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { codlivro } = req.body;

    const result = await conn.execute(`
      SELECT COUNT(*) FROM EXEMPLARES 
      WHERE COD_EXEMPLAR = :codlivro
      AND QUANTIDADE > 0
      `,
      { codlivro }
    )

    if (result.rows[0][0] === 1) {
        return res.json({ existe: true });
    } else {
        return res.json({ existe: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }

});

app.post('/sistema/validarCodLivroDevolucao', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { codlivro } = req.body;

    const result = await conn.execute(`
      SELECT COUNT(*) FROM EXEMPLARES 
      WHERE COD_EXEMPLAR = :codlivro
      `,
      { codlivro }
    )

    if (result.rows[0][0] === 1) {
        return res.json({ existe: true });
    } else {
        return res.json({ existe: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }

});

app.post('/sistema/validarUltimoEmprestimo', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
    });

    const { ra, codlivro } = req.body;

    const result = await conn.execute(`
      SELECT COUNT(*) FROM EMPRESTIMOS
      WHERE RA_ALUNO = :ra
      AND CODIGO_EXEMPLAR = :codlivro
      AND DATA_DEVOLUCAO IS NULL
      `,
      { ra, codlivro }
    )

    if (result.rows[0][0] === 1) {
        return res.json({ existe: true });
    } else {
        return res.json({ existe: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (conn) await conn.close();
  }

});

//module.exports = router;