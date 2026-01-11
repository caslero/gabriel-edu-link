// Registro EduLink
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroUsuario");
  if (!form) return;
  const alertContainer = document.getElementById("alertContainer");

  const get = id => document.getElementById(id);

  // Pasos
  const step1 = get("step1");
  const step2 = get("step2");
  const step3 = get("step3");

  const step1Next = get("step1Next");
  const step2Next = get("step2Next");
  const step2Prev = get("step2Prev");
  const step3Prev = get("step3Prev");

  // Campos adaptados a EduLink
  const email = get("correo");
  const password = get("clave");
  const confirmPassword = get("confirmClave");
  const name = get("nombre");
  const role = get("rol");
  const cedula = get("idUsuario");
  const pais = get("pais");
  const terms = get("termsCheck");

  // Resumen
  const summaryEmail = get("summaryEmail");
  const summaryName = get("summaryName");
  const summaryRole = get("summaryRole");

  // Alertas
  function mostrarAlerta(mensaje, tipo = "error") {
    const colores = {
      error: "bg-red-100 text-red-800 border-red-300",
      success: "bg-green-100 text-green-800 border-green-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300"
    };

    alertContainer.innerHTML = `
      <div class="border ${colores[tipo]} px-4 py-3 rounded relative" role="alert">
        <strong class="font-semibold">${tipo === "success" ? "Éxito" : "Atención"}:</strong>
        <span class="block sm:inline">${mensaje}</span>
        <button class="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-gray-700" onclick="this.parentElement.remove()">×</button>
      </div>
    `;
  }

  // Activar pasos
  function activarPaso(paso) {
  const pasos = ["step1Item", "step2Item", "step3Item"];
  pasos.forEach((id, index) => {
    const circulo = document.querySelector(`#${id} .step-circle`);
    if (circulo) {
      if (index + 1 === paso) {
        // Paso actual → azul
        circulo.classList.remove("bg-gray-300", "text-gray-700");
        circulo.classList.add("bg-blue-600", "text-white");
      } else if (index + 1 < paso) {
        // Pasos anteriores → azul también
        circulo.classList.remove("bg-gray-300", "text-gray-700");
        circulo.classList.add("bg-blue-600", "text-white");
      } else {
        // Pasos siguientes → gris
        circulo.classList.remove("bg-blue-600", "text-white");
        circulo.classList.add("bg-gray-300", "text-gray-700");
      }
    }
  });
}


  // Validación de cédula
  function cedulaValida(valor) {
    const regex = /^[VE]-\d{6,8}$/;
    return regex.test(valor);
  }

  if (cedula && pais) {
    cedula.addEventListener("input", () => {
      const error = get("cedulaError");
      const cedulaCompleta = `${pais.value}-${cedula.value}`;
      if (!cedulaValida(cedulaCompleta)) {
        cedula.classList.add("border-red-500");
        if (error) error.classList.remove("hidden");
      } else {
        cedula.classList.remove("border-red-500");
        if (error) error.classList.add("hidden");
      }
    });
  }

  // Paso 1 → Paso 2
  if (step1Next) {
    step1Next.addEventListener("click", async () => {
      if (!email?.value || !password?.value || !confirmPassword?.value) {
        mostrarAlerta("Completa todos los campos del paso 1.");
        return;
      }
      if (password.value !== confirmPassword.value) {
        mostrarAlerta("Las contraseñas no coinciden.");
        return;
      }

      // Validar correo en backend EduLink
      try {
        const res = await fetch("usuario/api/validar-correo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo: email.value })
        });

        const resultado = await res.json();
        if (resultado.existe) {
          mostrarAlerta("Este correo ya está registrado. Intenta con otro.");
          return;
        }
      } catch (error) {
        console.error("Error al validar correo:", error);
        mostrarAlerta("No se pudo validar el correo.");
        return;
      }

      step1.classList.add("hidden");
      step2.classList.remove("hidden");
      activarPaso(2);
    });
  }

  // Paso 2 → Paso 3
  if (step2Next) {
    step2Next.addEventListener("click", () => {
      if (!name?.value || !role?.value || !cedula?.value) {
        mostrarAlerta("Completa todos los campos del paso 2.");
        return;
      }

      const cedulaCompleta = `${pais.value}-${cedula.value}`;
      if (!cedulaValida(cedulaCompleta)) {
        mostrarAlerta("La cédula no tiene un formato válido. Ejemplo: V-12345678");
        return;
      }

      summaryEmail.textContent = email.value;
      summaryName.textContent = name.value;
      summaryRole.textContent = role.options[role.selectedIndex].text;

      step2.classList.add("hidden");
      step3.classList.remove("hidden");
      activarPaso(3);
    });
  }

  // Botones atrás
  if (step2Prev) {
    step2Prev.addEventListener("click", () => {
      step2.classList.add("hidden");
      step1.classList.remove("hidden");
      activarPaso(1);
    });
  }

  if (step3Prev) {
    step3Prev.addEventListener("click", () => {
      step3.classList.add("hidden");
      step2.classList.remove("hidden");
      activarPaso(2);
    });
  }

  // Enviar formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!terms?.checked) {
      mostrarAlerta("Debes aceptar los términos y condiciones.");
      return;
    }

    const cedulaCompleta = `${pais.value}-${cedula.value}`;
    if (!cedulaValida(cedulaCompleta)) {
      mostrarAlerta("La cédula no tiene un formato válido. Ejemplo: V-12345678");
      return;
    }

    const datos = {
      correo: email?.value,
      clave: password?.value,
      nombre: name?.value,
      id_usuario: cedulaCompleta,
      rol: role?.value
    };

    try {
      const res = await fetch("/usuario/api/registro-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await res.json();

      if (resultado.status === "ok") {
        mostrarAlerta("Registro exitoso. Redirigiendo...", "success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        mostrarAlerta(resultado.message || "Error desconocido", "error");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      mostrarAlerta("Error al conectar con el servidor.");
    }
  });
});
