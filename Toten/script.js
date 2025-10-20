function Toten() {
    const dropdown = document.getElementById("dropdown");
    
    
    
    
    
    
    
    
    
    
    // --- Eventos ---

    // Dropdown para redirecionamento
    dropdown.addEventListener('change', function () {
        if (this.value) {
        window.location.href = this.value;
        }
    });
}

// Inicializa ao carregar DOM
document.addEventListener("DOMContentLoaded", Toten);