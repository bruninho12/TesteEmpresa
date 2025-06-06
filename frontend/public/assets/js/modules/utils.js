// Funções utilitárias compartilhadas
export function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

export function formatCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return date.toLocaleDateString("pt-BR", options);
}
