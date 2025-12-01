function Toten() {
    const dropdown = document.getElementById("dropdown");
    const retirarLivro = document.getElementById("retirar");
    const devolverLivro = document.getElementById("devolver");
    
    
    // --- Funções auxiliares ---
    
    // Retirar livro
    async function retirar() { 
        const ra = document.getElementById("ra").value;
        const codlivro = document.getElementById("codlivro").value;

        if (!(await validarRA(ra)).existe) {
            mostrarMensagem("RA inválido ou não cadastrado!", "erro");
            return;
        }
        if (!(await validarCodLivro(codlivro)).existe) {
            mostrarMensagem("Código do livro não cadastrado ou não disponível!", "erro");
            return;
        }
        if ((await validarUltimoEmprestimo(ra, codlivro)).existe) {
            mostrarMensagem("Livro já retirado ou ainda não devolvido!", "erro");
            return; 
        }   
        
        const res = await fetch('/totem/retirada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, codlivro })
        });
        const data = await res.json();
        //alert(data.erro);
        mostrarMensagem("Retirada feita com sucesso!", "sucesso");
    }

    // Devolver livro
    async function devolver() { 
        const ra = document.getElementById("ra").value;
        const codlivro = document.getElementById("codlivro").value;

        if (!(await validarRA(ra)).existe) {
            mostrarMensagem("RA inválido ou não cadastrado!", "erro");
            return;
        }
        if (!(await validarCodLivro(codlivro)).existe) {
            mostrarMensagem("Código do livro inválido ou não cadastrado!", "erro");
            return;
        }
        if (!(await validarUltimoEmprestimo(ra, codlivro)).existe) {
            mostrarMensagem("Livro já retirado ou ainda não devolvido!", "erro");
            return; 
        }

        const res = await fetch('/totem/devolucao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, codlivro })
        });

        const data = await res.json();
        //alert(data.erro);
        mostrarMensagem("Devolução feita com sucesso!", "sucesso");

        atualizarClassificacao();
    }

    // Atualizar classificação do usuário
    async function atualizarClassificacao() { 
        const ra = document.getElementById("ra").value;

        const res = await fetch('/sistema/classificacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra })
        });


        const data = await res.json();
        alert(data.mensagem || data.erro);
    }
    
    // Valida RA
    async function validarRA(ra) {
        const res = await fetch("/sistema/validarRA", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ra })
        });
        return res.json();   
    }

    // Valida código do livro
    async function validarCodLivro(codlivro) {
        const res = await fetch("/sistema/validarCodLivro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codlivro })
        });
        return res.json();   
    }

    // Valida último empréstimo
    async function validarUltimoEmprestimo(ra, codlivro) {
        const res = await fetch("/sistema/validarUltimoEmprestimo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ra, codlivro })
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

    // Ao clicar em retirar livro
    retirarLivro.addEventListener("click", e => {
        e.preventDefault();
        if (ra.value.trim() === "") {
            ra.focus();
            return;
        }
        if (codlivro.value.trim() === "") {
            codlivro.focus();
            return;
        }
        retirar();
    });

    // Ao clicar em retirar livro
    devolverLivro.addEventListener("click", e => {
        e.preventDefault();
        if (ra.value.trim() === "") {
            ra.focus();
            return;
        }
        if (codlivro.value.trim() === "") {
            codlivro.focus();
            return;
        }
        devolver();
    });
}

// Inicializa ao carregar DOM
document.addEventListener("DOMContentLoaded", Toten);