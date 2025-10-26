function SistemaBibliotecario(){
    const btnLivros = document.getElementById("btnLivros");
    const btnAlunos = document.getElementById("btnAlunos");
    const btnNaoDevolvidos = document.getElementById("btnNaoDevolvidos");
    const btnRegistros = document.getElementById("btnRegistros");
    const addButton = document.getElementById("addButton");
    const tableBody = document.getElementById("tableBody");
    const modalOverlay = document.getElementById("modalOverlay");
    const cancelModal = document.getElementById("cancelModal");
    const confirmAdd = document.getElementById("confirmAdd");
    const campoPesquisa = document.getElementById("campoPesquisa");
    // --- Dados ---
    const livros = [
        { nome: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance Clássico", codigo: 101, qtd: 10 },
        { nome: "Cem Anos de Solidão", autor: "Gabriel García Márquez", categoria: "Realismo Mágico", codigo: 102, qtd: 6 },
        { nome: "Revolução dos Bichos", autor: "George Orwell", categoria: "Sátira Política", codigo: 103, qtd: 8 },
        { nome: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", categoria: "Fantasia", codigo: 104, qtd: 5 }
    ];
    const alunos = [
        { nome: "Caio Lucena Andrade", ra: "25011275", retiradas: "2", devolucoes: "4", classificacao: "Regular" },
        { nome: "Teste da Silva", ra: "124324234", retiradas: "2", devolucoes: "2", classificacao: "Ativo" }
    ];
    const naodevolvidos = [
        { livro: "Dom Casmurro", codigodolivro: "101", aluno: "Caio Lucena Andrade", ra: "25011275", codigoderetirada: "48" },
        { livro: "Cem Anos de Solidão", codigodolivro: "102", aluno: "Teste da Silva", ra: "124324234", codigoderetirada: "47" }
    ];
    const registros = [
        { livro: "Dom Casmurro", codigodolivro: "101", aluno: "Caio Lucena Andrade", ra: "25011275", movimentacao: "Retirada" },
        { livro: "Cem Anos de Solidão", codigodolivro: "102", aluno: "Teste da Silva", ra: "124324234", movimentacao: "Retirada" }
    ];
    const headers = {
        livros: ["Nome", "Autor(a)", "Categoria", "Cód.", "Qtd."],
        alunos: ["Nome", "RA", "Retiradas", "Devoluções", "Classificação"],
        naodevolvidos: ["Livro", "Código do Livro", "Aluno", "RA", "Código de retirada"],
        registros: ["Livro", "Código do Livro", "Aluno", "RA", "Movimentação"]
    };








    // --- Funções auxiliares ---

    function updateTableHeader(titulo) {
        const tableHeader = document.getElementById("tableHeader");
        if (headers[titulo]) {
            tableHeader.innerHTML = `<tr>${headers[titulo].map(h => `<th>${h}</th>`).join('')}</tr>`;
        }
    }

    function renderTable(data) {
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
        } else if (item.codigoderetirada !== undefined){
            html += `
                <tr>
                    <td><a href="#">${item.livro}</a></td>
                    <td>${item.codigodolivro}</td>
                    <td>${item.aluno}</td>
                    <td>${item.ra}</td>
                    <td>${item.codigoderetirada}</td>
                </tr>`;
        } else {
            html += `
                <tr>
                    <td><a href="#">${item.livro}</a></td>
                    <td>${item.codigodolivro}</td>
                    <td>${item.aluno}</td>
                    <td>${item.ra}</td>
                    <td>${item.movimentacao}</td>
                </tr>`;
        }
        });
        tableBody.innerHTML = html;
    }

    function pesquisarLivros() {
        campoPesquisa.value = "";
      
        campoPesquisa.addEventListener("input", () => {
            const termo = campoPesquisa.value.toLowerCase();
            const livrosFiltrados = livros.filter(livro => livro.nome.toLowerCase().includes(termo));
            renderTable(livrosFiltrados);
        });
    }
    
    function pesquisarAlunos() {
        campoPesquisa.value = "";
      
        campoPesquisa.addEventListener("input", () => {
            const termo = campoPesquisa.value.toLowerCase();
            const alunosFiltrados = alunos.filter(aluno => aluno.nome.toLowerCase().includes(termo));
            renderTable(alunosFiltrados);
        });
    }
        
    function pesquisarLivrosNaoDevolvidos() {
        campoPesquisa.value = "";
      
        campoPesquisa.addEventListener("input", () => {
            const termo = campoPesquisa.value.toLowerCase();
            const naodevolvidosFiltrados = naodevolvidos.filter(naodevolvidos => naodevolvidos.livro.toLowerCase().includes(termo));
            renderTable(naodevolvidosFiltrados);
        });
    }
        
    function pesquisarRegistros() {
        campoPesquisa.value = "";
      
        campoPesquisa.addEventListener("input", () => {
            const termo = campoPesquisa.value.toLowerCase();
            const registros = registros.filter(registros => registros.livro.toLowerCase().includes(termo));
            renderTable(registros);
        });
    }

    function limparCamposModal() {
        const inputs = modalOverlay.querySelectorAll('input, select');
        inputs.forEach(input => input.value = "");
    }








    // --- Eventos ---
    
    // Dropdown para redirecionamento
    dropdown.addEventListener('change', function () {
        if (this.value) {
            window.location.href = this.value;
        }
    });
    
    // Inicializa com livros
    updateTableHeader("livros");
    renderTable(livros);
    pesquisarLivros();
    
    // Mudar aba lateral
    let activeTable = "livros";
    btnLivros.addEventListener("click", () => {
        if (activeTable === "livros") return;
        activeTable = "livros";
        btnLivros.classList.add("active");
        btnAlunos.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        btnRegistros.classList.remove("active");
        addButton.style.display = "inline-block";
        updateTableHeader("livros");
        renderTable(livros);
        pesquisarLivros();
    });
    btnAlunos.addEventListener("click", () => {
        if (activeTable === "alunos") return;
        activeTable = "alunos";
        btnAlunos.classList.add("active");
        btnLivros.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        btnRegistros.classList.remove("active");
        addButton.style.display = "none";
        updateTableHeader("alunos");
        renderTable(alunos);
        pesquisarAlunos();
    });
    btnNaoDevolvidos.addEventListener("click", () => {
        if (activeTable === "naodevolvidos") return;
        activeTable = "naodevolvidos";
        btnNaoDevolvidos.classList.add("active");
        btnLivros.classList.remove("active");
        btnAlunos.classList.remove("active");
        btnRegistros.classList.remove("active");
        addButton.style.display = "none";
        updateTableHeader("naodevolvidos");
        renderTable(naodevolvidos);
        pesquisarLivrosNaoDevolvidos();
    });
    btnRegistros.addEventListener("click", () => {
        if (activeTable === "registros") return;
        activeTable = "registros";
        btnRegistros.classList.add("active");
        btnLivros.classList.remove("active");
        btnAlunos.classList.remove("active");
        btnNaoDevolvidos.classList.remove("active");
        updateTableHeader("registros");
        renderTable(registros);
        pesquisarRegistros();
    });
    
    // Abrir modal
    addButton.addEventListener("click", () => {
        modalOverlay.style.display = "flex";
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
