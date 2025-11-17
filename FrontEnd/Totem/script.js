function Toten() {
    const dropdown = document.getElementById("dropdown");
    const retirarLivro = document.getElementById("retirar");
    const devolverLivro = document.getElementById("devolver");
    
    
    // --- Funções auxiliares ---
    
    // Retirar livro
    async function retirar() { 
        const ra = document.getElementById("ra").value;
        const codlivro = document.getElementById("codlivro").value;
        
        const res = await fetch('/totem/retirada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, codlivro })
        });
        const data = await res.json();
        alert(data.mensagem || data.erro);
    }

    // Devolver livro
    async function devolver() { 
        const ra = document.getElementById("ra").value;
        const codlivro = document.getElementById("codlivro").value;
        
        const res = await fetch('/totem/devolucao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, codlivro })
        });
        const data = await res.json();
        alert(data.mensagem || data.erro);
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