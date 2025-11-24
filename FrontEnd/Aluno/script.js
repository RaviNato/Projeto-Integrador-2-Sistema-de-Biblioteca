function SistemaAluno() {
    // --- Referências a elementos do DOM ---
    const btnLivros = document.getElementById("btnLivros");
    const btnLogin = document.getElementById("btnLogin");
    const btnCadastro = document.getElementById("btnCadastro");
    const corpoDaTabela = document.getElementById("corpoDaTabela");
    const titulos = document.getElementById("titulos");
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
    const colunas = {
        livros: ["Nome", "Autor(a)", "Categoria", "Código", "Qtd."]
    };

    // --- Restaurar sessão se existir ---
    const RA = localStorage.getItem("alunoRA");
    if (RA) {
        // Reconstrói URL
        history.replaceState({}, "", `/Aluno/${RA}`);
        // Reconstrói o perfil
        mostrarInfoUsuario({
            ra: RA,
            aluno: localStorage.getItem("alunoNome"),
            classificacao: localStorage.getItem("alunoClassificacao")
        });
        // Executa passos pós-login automaticamente
        aposLogin();
    }







    // --- Funções auxiliares ---

    // Atualiza titulo das colunas
    function atualizarTitulos(titulo) {
        if (colunas[titulo]) {
            titulos.innerHTML = `<tr>${colunas[titulo].map(h => `<th>${h}</th>`).join('')}</tr>`;
        }
    }

    // Carrega tabela
    function atualizarTabela(data) {
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
        corpoDaTabela.innerHTML = html;
    }

    // Puxa informações dos livros do banco de dados
    async function carregarLivros() {
        try {
            const res = await fetch('/consultar/livros');
            const livros = await res.json();

            atualizarTitulos('livros');
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

    // Limpa campos de escrita
    function limparCamposModal() {
        modalOverlay1.querySelectorAll('input, select').forEach(input => input.value = "");
        modalOverlay2.querySelectorAll('input, select').forEach(input => input.value = "");
    }

    // Cadastrar novo aluno no banco de dados
    async function cadastrar() { 
        const alunoRA2 = document.getElementById("alunoRA2").value;
        const alunoNome = document.getElementById("alunoNome").value;

        if ((await validarRA(alunoRA2)).existe) {
            mostrarMensagem("RA já cadastrado!", "erro");
            return;
        }
        
        const res = await fetch('/aluno/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alunoRA2, alunoNome })
        });
        const alunoRetornado = await res.json();
        if (alunoRetornado){
            mostrarMensagem("Cadastro realizado com sucesso!", "sucesso");
            // Salva sessão
            localStorage.setItem("alunoRA", alunoRetornado.ra);
            localStorage.setItem("alunoNome", alunoRetornado.aluno);
            localStorage.setItem("alunoClassificacao", alunoRetornado.classificacao);

            // Muda a URL
            history.pushState({}, "", `/Aluno/${alunoRetornado.ra}`);

            // Atualiza a interface
            mostrarInfoUsuario(alunoRetornado);
        }
    }

    // Entrar como aluno
    async function logar() { 
        const alunoRA1 = document.getElementById("alunoRA1").value;

        if (!(await validarRA(alunoRA1)).existe) {
            mostrarMensagem("RA não cadastrado!", "erro");
            return;
        }
        
        const res = await fetch('/aluno/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alunoRA1 })
        });
        const alunoRetornado = await res.json();

        if (alunoRetornado){
            mostrarMensagem("Login realizado com sucesso!", "sucesso");
            // Salva sessão
            localStorage.setItem("alunoRA", alunoRetornado.ra);
            localStorage.setItem("alunoNome", alunoRetornado.aluno);
            localStorage.setItem("alunoClassificacao", alunoRetornado.classificacao);

            // Muda a URL
            history.pushState({}, "", `/Aluno/${alunoRetornado.ra}`);

            // Atualiza a interface
            mostrarInfoUsuario(alunoRetornado);
        }
    }

    // Atualiza informações do usuário após login
    function mostrarInfoUsuario(data) {
        profile.innerHTML = `
            <button id="btnLogout">X</button>
            <img src="../Midias/user-icon.png" alt="Imagem online">
            <p id="aluno">${data.aluno}</p>
            <p id="classificacao">${data.classificacao}</p>
        `;

        // Evento logout
        document.getElementById("btnLogout").addEventListener("click", () => {
            // Remove sessão
            localStorage.removeItem("alunoRA");
            localStorage.removeItem("alunoNome");
            localStorage.removeItem("alunoClassificacao");
            // Volta para URL base
            history.pushState({}, "", `/Aluno`);
            // limpa a interface
            location.reload(); 
        });

        aposLogin();
    }

    // Puxa classificação atual do aluno
    async function classificacaoAtual(ra) {
        const res = await fetch('/sistema/classificacaoAtual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra })
        });

        const data = await res.json();
        //alert(data.erro);

        return data.classificacao;
    }

    // Salva classificação atual no localStorage
    async function salvarClassificacao() {
        const classificacao = await classificacaoAtual(localStorage.getItem("alunoRA"));
        localStorage.setItem("alunoClassificacao", classificacao);
    }

    // Puxa funções após login
    function aposLogin() {
        modalOverlay1.style.display = "none";
        modalOverlay2.style.display = "none";
        btnLivros.classList.remove("inactive");
        btnLivros.classList.add("active");
        limparCamposModal();
        atualizarTitulos("livros");
        document.body.classList.add("logado");
        campoPesquisa.value = "";
        carregarLivros();

        // Carregar classificação ao entrar na página
        window.addEventListener("load", () => {
            salvarClassificacao();
        });
    }

    // Valida RA
    async function validarRA(ra) {
        const res = await fetch('/sistema/validarRA', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra })
        });
        return res.json();   
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
        logar();
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
        cadastrar();
    });


}

// Inicializa ao carregar DOM
document.addEventListener("DOMContentLoaded", () => {
    SistemaAluno();
});