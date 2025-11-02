const app = require('./routes/bibliotecaRoutes');

const PORT = process.env.PORT || 3000;


// inicializa o server local
(async () => {
  try {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (err) {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
})();


// checagem do acesso ao .env
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);