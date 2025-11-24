function SistemaBibliotecario(){
    const btnLivros = document.getElementById("btnLivros");
    const btnAlunos = document.getElementById("btnAlunos");
    const btnNaoDevolvidos = document.getElementById("btnNaoDevolvidos");
    const btnDevolvidos = document.getElementById("btnDevolvidos");
    const btnAdd = document.getElementById("btnAdd");
    const corpoDaTabela = document.getElementById("corpoDaTabela");
    const modalOverlay = document.getElementById("modalOverlay");
    const cancelModal = document.getElementById("cancelModal");
    const confirmAdd = document.getElementById("confirmAdd");
    const campoPesquisa = document.getElementById("campoPesquisa");
    // --- Dados ---
    const colunas = {
        livros: ["Nome", "Autor(a)", "Categoria", "Código", "Qtd."],
        alunos: ["Nome", "RA", "Retiradas", "Devoluções", "Classificação"],
        naodevolvidos: ["Livro", "Código do Livro", "Aluno", "RA", "Data de retirada"],
        devolvidos: ["Livro", "Código do Livro", "Aluno", "RA", "Data de devolução"]
    };








    // --- Funções auxiliares ---

    // Atualiza o nome das colunas
    function atualizarTitulo(titulo) {
        const atualizarTitulos = document.getElementById("titulo");
        if (colunas[titulo]) {
            atualizarTitulos.innerHTML = `<tr>${colunas[titulo].map(h => `<th>${h}</th>`).join('')}</tr>`;
        }
    }

    // Atualiza a tabela
    function atualizarTabela(data) {
        let html = "";
        data.forEach(item => {
        if (item.autor !== undefined) {
            html += `
                <tr>
                    <td><a href="#">${item.nome}</a></td>
                    <td>${item.autor}</td>
                    <td>${item.categoria}</td>
                    <td>${item.codigo}</td>
                    <td>${item.qtd}</td>
                </tr>`;
        } else if (item.classificacao !== undefined){
            html += `
                <tr>
                    <td><a href="#">${item.nome}</a></td>
                    <td>${item.ra}</td>
                    <td>${item.retiradas}</td>
                    <td>${item.devolucoes}</td>
                    <td>${item.classificacao}</td>
                </tr>`;
        } else if (item.dataderetirada !== undefined){
            html += `
                <tr>
                    <td><a href="#">${item.livro}</a></td>
                    <td>${item.codigodolivro}</td>
                    <td>${item.aluno}</td>
                    <td>${item.ra}</td>
                    <td>${item.dataderetirada}</td>
                </tr>`;
        } else {
            html += `
                <tr>
                    <td><a href="#">${item.livro}</a></td>
                    <td>${item.codigodolivro}</td>
                    <td>${item.aluno}</td>
                    <td>${item.ra}</td>
                    <td>${item.datadedevolucao}</td>
                </tr>`;
        }
        });
        corpoDaTabela.innerHTML = html;
    }
    
    // Sistema de pesquisa
    /*function pesquisarAlunos() {
        campoPesquisa.value = "";
      
        campoPesquisa.addEventListener("input", () => {
            const termo = campoPesquisa.value.toLowerCase();
            const alunosFiltrados = alunos.filter(aluno => aluno.nome.toLowerCase().includes(termo));
            atualizarTabela(alunosFiltrados);
        });
    }*/

    // Puxa informações do livro do banco de dados
    async function carregarLivros() {
        try {
            const res = await fetch('/consultar/livros');
            const livros = await res.json();

            atualizarTitulo('livros');
            atualizarTabela(livros);
            campoPesquisa.addEventListener("input", () => {
                const termo = campoPesquisa.value.toLowerCase();
                const livrosFiltrados = livros.filter(livro => livro.nome.toLowerCase().includes(termo));
                atualizarTabela(livrosFiltrados);
            });
        } catch (err) {
            console.error('Erro ao carregar livros:', err);
        }
    }

    // Puxa informações dos alunos do banco de dados
    async function carregarAlunos() {
        try {
            const res = await fetch('/consultar/alunos');
            const alunos = await res.json();

            atualizarTitulo('alunos');
            atualizarTabela(alunos);
            campoPesquisa.addEventListener("input", () => {
                const termo = campoPesquisa.value.toLowerCase();
                const alunosFiltrados = alunos.filter(aluno => aluno.nome.toLowerCase().includes(termo));
                atualizarTabela(alunosFiltrados);
            });
        } catch (err) {
            console.error('Erro ao carregar alunos:', err);
        }
    }

    // Puxa informações dos livros não devolvidos do banco de dados
    async function carregarLivrosNaoDevolvidos() {
        try {
            const res = await fetch('/consultar/naodevolvidos');
            const naoDevolvidos = await res.json();

            atualizarTitulo('naodevolvidos');
            atualizarTabela(naoDevolvidos);
            campoPesquisa.addEventListener("input", () => {
                const termo = campoPesquisa.value.toLowerCase();
                const naoDevolvidosFiltrados = naoDevolvidos.filter(naoDevolvido => naoDevolvido.nome.toLowerCase().includes(termo));
                atualizarTabela(naoDevolvidosFiltrados);
            });
        } catch (err) {
            console.error('Erro ao carregar livros não devolvidos:', err);
        }
    }

    // Puxa informações dos livros devolvidos do banco de dados
    async function carregarLivrosDevolvidos() {
        try {
            const res = await fetch('/consultar/devolvidos');
            const devolvidos = await res.json();

            atualizarTitulo('devolvidos');
            atualizarTabela(devolvidos);
            campoPesquisa.addEventListener("input", () => {
                const termo = campoPesquisa.value.toLowerCase();
                const devolvidosFiltrados = devolvidos.filter(devolvido => devolvido.nome.toLowerCase().includes(termo));
                atualizarTabela(devolvidosFiltrados);
            });
        } catch (err) {
            console.error('Erro ao carregar livros devolvidos:', err);
        }
    }

    // Cadastro novo livro no banco de dados
    async function cadastrar() { 
        const bookName = document.getElementById("bookName").value;
        const bookAuthor = document.getElementById("bookAuthor").value;
        const bookYear = document.getElementById("bookYear").value;
        const bookCategory = document.getElementById("bookCategory").value;
        const bookQuantity = document.getElementById("bookQuantity").value;
        
        if (bookYear <= 1000 || bookYear > new Date().getFullYear()) {
            mostrarMensagem("Ano de publicação inválido!", "erro");
            return;
        }

        if (bookQuantity <= 0) {
            mostrarMensagem("Quantidade deve ser maior que zero!", "erro");
            return;
        }

        const res = await fetch('/bibliotecario/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookName, bookAuthor, bookYear, bookCategory, bookQuantity })
        });
        const data = await res.json();
        //alert(data.erro);
        mostrarMensagem("Livro(s) cadastrado(s) com sucesso!", "sucesso");
        
        carregarLivros();
    }

    // Limpa campos de escrita
    function limparCamposModal() {
        const inputs = modalOverlay.querySelectorAll('input, select');
        inputs.forEach(input => input.value = "");
    }

    // Mostrar mensagem na tela
    function mostrarMensagem(texto, tipo) {
        const msg = document.getElementById("mensagem");

        msg.innerText = texto;

        msg.className = "msg"; // reset
        msg.classList.add(tipo === "sucesso" ? "msg-sucesso" : "msg-erro");

        msg.style.display = "block";

        // esconder automaticamente após 3s
        setTimeout(() => {
            msg.style.display = "none";
        }, 3000);
    }






    // --- Eventos ---
    
    // Dropdown para redirecionamento
    dropdown.addEventListener('change', function () {
        if (this.value) {
            window.location.href = this.value;
        }
    });
    
    // Inicializa com livros
    carregarLivros();
    
    // Mudar aba lateral
    let tabelaAtiva = "livros";
    btnLivros.addEventListener("click", () => {
        if (tabelaAtiva === "livros") return;
        tabelaAtiva = "livros";
        btnLivros.classList.add("active");
        btnAlunos.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        btnDevolvidos.classList.remove("active");
        btnAdd.style.display = "inline-block";
        carregarLivros();
    });
    btnAlunos.addEventListener("click", () => {
        if (tabelaAtiva === "alunos") return;
        tabelaAtiva = "alunos";
        btnAlunos.classList.add("active");
        btnLivros.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        btnDevolvidos.classList.remove("active");
        btnAdd.style.display = "none";
        carregarAlunos();
    });
    btnNaoDevolvidos.addEventListener("click", () => {
        if (tabelaAtiva === "naodevolvidos") return;
        tabelaAtiva = "naodevolvidos";
        btnNaoDevolvidos.classList.add("active");
        btnLivros.classList.remove("active");
        btnAlunos.classList.remove("active");
        btnDevolvidos.classList.remove("active");
        btnAdd.style.display = "none";
        carregarLivrosNaoDevolvidos();
    });
    btnDevolvidos.addEventListener("click", () => {
        if (tabelaAtiva === "devolvidos") return;
        tabelaAtiva = "devolvidos";
        btnDevolvidos.classList.add("active");
        btnLivros.classList.remove("active");
        btnAlunos.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        carregarLivrosDevolvidos();
    });
    
    // Abrir modal
    btnAdd.addEventListener("click", () => {
        modalOverlay.style.display = "flex";
    });

    // Confirmar modal
    confirmAdd.addEventListener("click", () => {
        cadastrar();
        limparCamposModal();
        modalOverlay.style.display = "none";
    });

    // Cancelar modal
    cancelModal.addEventListener("click", () => {
        limparCamposModal();
        modalOverlay.style.display = "none";
    });

    // Fechar modal ao clicar fora
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", SistemaBibliotecario);