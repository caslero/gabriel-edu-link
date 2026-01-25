// Registro EduLink
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroUsuario");
  if (!form) return;
  const alertContainer = document.getElementById("alertContainer");

  const get = (id) => document.getElementById(id);

  // Pasos
  const step1 = get("step1");
  const step2 = get("step2");
  const step3 = get("step3");

  const step1Next = get("step1Next");
  const step2Next = get("step2Next");
  const step2Prev = get("step2Prev");
  const step3Prev = get("step3Prev");

  // Campos
  const email = get("correo");
  const password = get("clave");
  const confirmPassword = get("confirmarClave");
  const name = get("nombre");
  const cedulaInput = get("cedula");
  const pais = get("pais");
  const terms = get("termsCheck");

  // --- CAMBIOS DE ROL ---
  const roleId = 3;             // ID que espera el backend
  const roleLabel = "Estudiante"; // Texto para el usuario

  // --- VER/OCULTAR CONTRASEÑA ---
  const eyeOpenPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
  const eyeSlashedPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />`;

  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = button.getAttribute("data-target");
      const input = get(targetId);
      const svg = button.querySelector("svg");

      if (input.type === "password") {
        input.type = "text";
        svg.innerHTML = eyeSlashedPath;
        svg.classList.remove("text-gray-500");
        svg.classList.add("text-blue-600");
      } else {
        input.type = "password";
        svg.innerHTML = eyeOpenPath;
        svg.classList.remove("text-blue-600");
        svg.classList.add("text-gray-500");
      }
    });
  });

  // Resumen
  const summaryEmail = get("summaryEmail");
  const summaryName = get("summaryName");
  const summaryRol = get("summaryRol");

  function mostrarAlerta(mensaje, tipo = "error") {
    const colores = {
      error: "bg-red-100 text-red-800 border-red-300",
      success: "bg-green-100 text-green-800 border-green-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    alertContainer.innerHTML = `
      <div class="border ${colores[tipo]} px-4 py-3 rounded relative mb-4 transition-all" role="alert">
        <strong class="font-semibold">${tipo === "success" ? "¡Éxito!" : "Atención"}:</strong>
        <span class="block sm:inline">${mensaje}</span>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activarPaso(paso) {
    const pasos = ["step1Item", "step2Item", "step3Item"];
    pasos.forEach((id, index) => {
      const circulo = document.querySelector(`#${id} .step-circle`);
      if (circulo) {
        if (index + 1 <= paso) {
          circulo.classList.remove("bg-gray-300", "text-gray-700");
          circulo.classList.add("bg-blue-600", "text-white");
        } else {
          circulo.classList.remove("bg-blue-600", "text-white");
          circulo.classList.add("bg-gray-300", "text-gray-700");
        }
      }
    });
  }

  if (step1Next) {
    step1Next.addEventListener("click", () => {
      if (!email.value || !password.value || !confirmPassword.value) {
        mostrarAlerta("Completa todos los campos del paso 1.");
        return;
      }
      if (password.value !== confirmPassword.value) {
        mostrarAlerta("Las contraseñas no coinciden.");
        return;
      }
      alertContainer.innerHTML = "";
      step1.classList.add("hidden");
      step2.classList.remove("hidden");
      activarPaso(2);
    });
  }

  if (step2Next) {
    step2Next.addEventListener("click", () => {
      if (!name.value || !cedulaInput.value) {
        mostrarAlerta("Completa el nombre y la cédula.");
        return;
      }

      // --- MOSTRAR NOMBRE DEL ROL AL USUARIO ---
      summaryEmail.textContent = email.value;
      summaryName.textContent = name.value;
      summaryRol.textContent = roleLabel; 

      alertContainer.innerHTML = "";
      step2.classList.add("hidden");
      step3.classList.remove("hidden");
      activarPaso(3);
    });
  }

  if (step2Prev) step2Prev.onclick = () => {
    step2.classList.add("hidden");
    step1.classList.remove("hidden");
    activarPaso(1);
  };
  if (step3Prev) step3Prev.onclick = () => {
    step3.classList.add("hidden");
    step2.classList.remove("hidden");
    activarPaso(2);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!terms.checked) {
      mostrarAlerta("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    // --- ENVIAR ID DEL ROL AL SERVIDOR ---
    const datos = {
      cedula: `${pais.value}${cedulaInput.value}`,
      pais: pais.value,
      nombre: name.value,
      correo: email.value,
      clave: password.value,
      confirmarClave: confirmPassword.value,
      rol: roleId, 
      texto: "",
    };

    try {
      const res = await fetch("/api/usuarios/crear-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await res.json();

      if (resultado.status === "ok") {
        mostrarAlerta(resultado.message, "success");
        const btnSubmit = form.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.disabled = true;

        setTimeout(() => {
          window.location.href = resultado.redirect || "/login";
        }, 2000);
      } else {
        mostrarAlerta(resultado.message || "No se pudo procesar el registro.", "error");
      }
    } catch (error) {
      console.error("Error en la petición fetch:", error);
      mostrarAlerta("Hubo un error de conexión con el servidor.");
    }
  });
});