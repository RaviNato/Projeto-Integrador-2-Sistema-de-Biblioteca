function SistemaAluno() {
    // --- Referências a elementos do DOM ---
    const btnLivros = document.getElementById("btnLivros");
    const btnLogin = document.getElementById("btnLogin");
    const btnCadastro = document.getElementById("btnCadastro");
    const tableBody = document.getElementById("tableBody");
    const tableHeader = document.getElementById("tableHeader");
    const modalOverlay1 = document.getElementById("modalOverlay1");
    const modalOverlay2 = document.getElementById("modalOverlay2");
    const cancelModal1 = document.getElementById("cancelModal1");
    const cancelModal2 = document.getElementById("cancelModal2");
    const loginConfirm = document.getElementById("loginConfirm");
    const cadastroConfirm = document.getElementById("cadastroConfirm");
    const alunoRA1 = document.getElementById("alunoRA1");
    const alunoRA2 = document.getElementById("alunoRA2");
    const alunoNome = document.getElementById("alunoNome");
    const profile = document.getElementById("profile");
    const campoPesquisa = document.getElementById("campoPesquisa");
    const dropdown = document.getElementById("dropdown");
    // --- Dados ---
    const livros = [
        { nome: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance Clássico", codigo: 101, qtd: 10 },
        { nome: "Cem Anos de Solidão", autor: "Gabriel García Márquez", categoria: "Realismo Mágico", codigo: 102, qtd: 6 },
        { nome: "Revolução dos Bichos", autor: "George Orwell", categoria: "Sátira Política", codigo: 103, qtd: 8 },
        { nome: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", categoria: "Fantasia", codigo: 104, qtd: 5 }
    ];
    const headers = {
        livros: ["Nome", "Autor(a)", "Categoria", "Cód.", "Qtd."]
    };







    // --- Funções auxiliares ---

    function updateTableHeader(titulo) {
        if (headers[titulo]) {
            tableHeader.innerHTML = `<tr>${headers[titulo].map(h => `<th>${h}</th>`).join('')}</tr>`;
        }
    }

    function renderTable(data) {
        const html = data.map(item => {
            if (item.autor !== undefined) {
                return `
                <tr>
                    <td><a href="#">${item.nome}</a></td>
                    <td>${item.autor}</td>
                    <td>${item.categoria}</td>
                    <td>${item.codigo}</td>
                    <td>${item.qtd}</td>
                </tr>`;
            }
            return '';
        }).join('');
        tableBody.innerHTML = html;
    }

    function limparCamposModal() {
        modalOverlay1.querySelectorAll('input, select').forEach(input => input.value = "");
        modalOverlay2.querySelectorAll('input, select').forEach(input => input.value = "");
    }

    function fazerLogin() {
        btnLivros.classList.remove("inactive");
        btnLivros.classList.add("active");
    }

    function mostrarInfoUsuario() {
        profile.innerHTML = `
            <button id="btnLogout">X</button>
            <img src="../Midias/user-icon.png" alt="Imagem online">
            <p id="aluno">Aluno</p>
            <p id="nota">A+</p>
        `
        // Evento logout
        document.getElementById("btnLogout").addEventListener("click", () => {
        location.reload();
        });
    }

    function aposLogin() {
        fazerLogin();
        limparCamposModal();
        updateTableHeader("livros");
        renderTable(livros);
        document.body.classList.add("logado");
        mostrarInfoUsuario();
        campoPesquisa.value = "";

        campoPesquisa.addEventListener("input", () => {
        const termo = campoPesquisa.value.toLowerCase();
        const livrosFiltrados = livros.filter(livro => livro.nome.toLowerCase().includes(termo));
        renderTable(livrosFiltrados);
        });
    }





    // --- Eventos ---

    // Dropdown para redirecionamento
    dropdown.addEventListener('change', function () {
        if (this.value) {
        window.location.href = this.value;
        }
    });

    // Abrir modais
    btnLogin.addEventListener("click", () => modalOverlay1.style.display = "flex");
    btnCadastro.addEventListener("click", () => modalOverlay2.style.display = "flex");

    // Cancelar modais e limpar campos
    cancelModal1.addEventListener("click", () => {
        limparCamposModal();
        modalOverlay1.style.display = "none";
    });
    cancelModal2.addEventListener("click", () => {
        limparCamposModal();
        modalOverlay2.style.display = "none";
    });

    // Fechar modal clicando fora do conteúdo
    modalOverlay1.addEventListener("click", e => {
        if (e.target === modalOverlay1) modalOverlay1.style.display = "none";
    });
    modalOverlay2.addEventListener("click", e => {
        if (e.target === modalOverlay2) modalOverlay2.style.display = "none";
    });

    // Confirmar login
    loginConfirm.addEventListener("click", e => {
        e.preventDefault();
        if (alunoRA1.value.trim() === "") {
            alunoRA1.focus();
            return;
        }
        modalOverlay1.style.display = "none";
        aposLogin();
    });

    // Confirmar cadastro
    cadastroConfirm.addEventListener("click", e => {
        e.preventDefault();
        if (alunoNome.value.trim() === "") {
            alunoNome.focus();
            return;
        }
        if (alunoRA2.value.trim() === "") {
            alunoRA2.focus();
            return;
        }
        modalOverlay2.style.display = "none";
        aposLogin();
    });
}

// Inicializa ao carregar DOM
document.addEventListener("DOMContentLoaded", SistemaAluno);