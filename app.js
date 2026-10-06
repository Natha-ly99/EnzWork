// ============================================================
// EZNWORK
// Frontend real conectado a Supabase
// ============================================================

const SUPABASE_URL = "https://gjdzuhuhevyorupidyat.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_SLXF4C_-UviRH6iMNEBuRA_vKcXQ7Yo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================================
// ESTADO GLOBAL
// ============================================================

let currentUser = null;
let currentProfile = null;
let selectedRole = "client";
let currentAuthMode = "register";

let servicesCache = [];


// ============================================================
// UTILIDADES DOM
// ============================================================

const $ = (id) => document.getElementById(id);

function exists(id) {
    return !!$(id);
}

function showElement(element) {
    if (!element) return;

    element.classList.remove("hidden");
    element.style.display = "";
}

function hideElement(element) {
    if (!element) return;

    element.classList.add("hidden");
}

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatDate(value) {

    if (!value) {
        return "Sin fecha";
    }

    try {

        return new Date(value).toLocaleString(
            "es-ES",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch {

        return String(value);

    }
}


function formatMoney(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return escapeHtml(value);
    }

    return new Intl.NumberFormat(
        "es-ES",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(number);
}


function statusLabel(status) {

    const labels = {

        pending: "Pendiente",
        reviewing: "En revisión",
        accepted: "Aceptada",
        waiting_payment: "Esperando pago",
        paid: "Pagada",
        in_progress: "En progreso",
        completed: "Completada",
        rejected: "Rechazada",
        cancelled: "Cancelada",

        available: "Disponible",
        claimed: "Tomado",
        submitted: "Entregado"

    };

    return labels[status] || status || "Desconocido";
}


function statusClass(status) {

    if (!status) {
        return "";
    }

    return `status-${String(status)
        .toLowerCase()
        .replaceAll(" ", "_")}`;
}


function roleLabel(role) {

    const labels = {
        client: "Cliente",
        operator: "Operador",
        admin: "Administrador"
    };

    return labels[role] || role;
}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    const toast = $("toast");
    const toastMessage = $("toastMessage");
    const toastIcon = $("toastIcon");

    if (!toast || !toastMessage) {
        console.log(message);
        return;
    }

    toastMessage.textContent = message;

    if (toastIcon) {

        toastIcon.textContent =
            type === "error"
                ? "!"
                : type === "warning"
                    ? "!"
                    : "✓";

    }

    toast.classList.remove(
        "show",
        "error",
        "warning"
    );

    if (type === "error") {
        toast.classList.add("error");
    }

    if (type === "warning") {
        toast.classList.add("warning");
    }

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);
}


function showError(message) {

    console.error(message);

    showToast(
        message || "Ha ocurrido un error.",
        "error"
    );
}


// ============================================================
// MODAL DE AUTENTICACIÓN
// ============================================================

const authModal = $("authModal");
const closeModal = $("closeModal");
const modalBackdrop = $("modalBackdrop");

const authTitle = $("authTitle");
const authDescription = $("authDescription");

const authForm = $("authForm");
const authMessage = $("authMessage");

const authSubmit = $("authSubmit");
const authSubmitText = $("authSubmitText");

const authSwitch = $("authSwitch");
const authSwitchText = $("authSwitchText");

const nameField = $("nameField");
const roleField = $("roleField");
const inviteField = $("inviteField");

const fullNameInput = $("fullName");
const emailInput = $("email");
const passwordInput = $("password");

const selectedRoleInput = $("selectedRole");
const inviteCodeInput = $("inviteCode");


// ============================================================
// ABRIR MODAL
// ============================================================

function openAuthModal(
    mode = "register"
) {

    currentAuthMode = mode;

    if (!authModal) return;

    authModal.classList.remove("hidden");

    authModal.style.display = "flex";

    authModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    clearAuthMessage();

    if (mode === "login") {

        authTitle.textContent =
            "Bienvenido de nuevo";

        authDescription.textContent =
            "Entra a tu espacio de EZNWORK.";

        authSubmitText.textContent =
            "Iniciar sesión";

        authSwitchText.textContent =
            "¿No tienes una cuenta?";

        authSwitch.textContent =
            "Registrarse";

        nameField.classList.add("hidden");
        roleField.classList.add("hidden");
        inviteField.classList.add("hidden");

        fullNameInput.required = false;

        passwordInput.autocomplete =
            "current-password";

    } else {

        authTitle.textContent =
            "Crear cuenta";

        authDescription.textContent =
            "Únete a EZNWORK y empieza a trabajar.";

        authSubmitText.textContent =
            "Crear cuenta";

        authSwitchText.textContent =
            "¿Ya tienes una cuenta?";

        authSwitch.textContent =
            "Iniciar sesión";

        nameField.classList.remove("hidden");
        roleField.classList.remove("hidden");

        fullNameInput.required = true;

        passwordInput.autocomplete =
            "new-password";

        updateRoleInterface();

    }

    setTimeout(() => {

        if (
            currentAuthMode === "login" &&
            emailInput
        ) {
            emailInput.focus();
        }

        if (
            currentAuthMode === "register" &&
            fullNameInput
        ) {
            fullNameInput.focus();
        }

    }, 100);
}


function closeAuthModal() {

    if (!authModal) return;

    authModal.classList.add("hidden");

    authModal.style.display = "none";

    authModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    clearAuthMessage();

    if (authForm) {
        authForm.reset();
    }

    selectedRole = "client";

    if (selectedRoleInput) {
        selectedRoleInput.value = "client";
    }

    document
        .querySelectorAll(".role-option")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.role === "client"
            );

        });

    updateRoleInterface();
}


function clearAuthMessage() {

    if (!authMessage) return;

    authMessage.textContent = "";
    authMessage.className =
        "auth-message";
}


function setAuthMessage(
    message,
    type = "error"
) {

    if (!authMessage) return;

    authMessage.textContent =
        message;

    authMessage.className =
        `auth-message ${type}`;
}


// ============================================================
// BOTONES DE AUTENTICACIÓN
// ============================================================

$("navLogin")?.addEventListener(
    "click",
    () => openAuthModal("login")
);

$("navRegister")?.addEventListener(
    "click",
    () => openAuthModal("register")
);

$("heroRegister")?.addEventListener(
    "click",
    () => openAuthModal("register")
);

$("ctaRegister")?.addEventListener(
    "click",
    () => openAuthModal("register")
);


closeModal?.addEventListener(
    "click",
    closeAuthModal
);


modalBackdrop?.addEventListener(
    "click",
    closeAuthModal
);


authSwitch?.addEventListener(
    "click",
    () => {

        openAuthModal(
            currentAuthMode === "login"
                ? "register"
                : "login"
        );

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            authModal &&
            !authModal.classList.contains("hidden")
        ) {
            closeAuthModal();
        }

    }
);


// ============================================================
// SELECCIÓN DE ROL
// ============================================================

document
    .querySelectorAll(".role-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedRole =
                    button.dataset.role ||
                    "client";

                if (selectedRoleInput) {
                    selectedRoleInput.value =
                        selectedRole;
                }

                document
                    .querySelectorAll(".role-option")
                    .forEach(option => {

                        option.classList.toggle(
                            "active",
                            option === button
                        );

                    });

                updateRoleInterface();

            }
        );

    });


function updateRoleInterface() {

    if (!inviteField) return;

    if (
        currentAuthMode === "register" &&
        selectedRole === "operator"
    ) {

        inviteField.classList.remove(
            "hidden"
        );

        if (inviteCodeInput) {
            inviteCodeInput.required = true;
        }

    } else {

        inviteField.classList.add(
            "hidden"
        );

        if (inviteCodeInput) {
            inviteCodeInput.required = false;
            inviteCodeInput.value = "";
        }

    }
}


// ============================================================
// FORMULARIO AUTH
// ============================================================

authForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (currentAuthMode === "login") {

            await loginUser();

        } else {

            await registerUser();

        }

    }
);


// ============================================================
// REGISTRO
// ============================================================

async function registerUser() {

    const name =
        fullNameInput?.value.trim();

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;

    const role =
        selectedRoleInput?.value ||
        selectedRole ||
        "client";

    const inviteCode =
        inviteCodeInput?.value.trim();


    if (!name) {

        setAuthMessage(
            "Escribe tu nombre."
        );

        return;

    }


    if (!email) {

        setAuthMessage(
            "Escribe tu correo."
        );

        return;

    }


    if (!password || password.length < 6) {

        setAuthMessage(
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;

    }


    if (
        role === "operator" &&
        !inviteCode
    ) {

        setAuthMessage(
            "Los operadores necesitan un código de invitación."
        );

        return;

    }


    setAuthLoading(true);


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email,

                password,

                options: {

                    data: {
                        full_name: name
                    }

                }

            });


        if (error) {
            throw error;
        }


        if (!data?.user) {

            throw new Error(
                "Supabase no devolvió el usuario creado."
            );

        }


        /*
         * El trigger de Supabase crea
         * automáticamente el perfil como client.
         *
         * Si el usuario eligió operador,
         * después intentamos canjear la invitación.
         */

        if (role === "operator") {

            /*
             * Esperamos brevemente a que el perfil
             * creado por el trigger esté disponible.
             */

            await wait(500);

            const {
                error: invitationError
            } =
                await supabaseClient.rpc(
                    "redeem_operator_invitation",
                    {
                        p_code: inviteCode
                    }
                );


            if (invitationError) {

                console.error(
                    "Error de invitación:",
                    invitationError
                );

                /*
                 * Si el correo requiere confirmación,
                 * dejamos el mensaje claro.
                 */

                throw new Error(
                    invitationError.message ||
                    "El código de operador no pudo utilizarse."
                );

            }

        }


        closeAuthModal();


        if (data.session) {

            showToast(
                "¡Cuenta creada correctamente!"
            );

            await loadCurrentUser();

        } else {

            showToast(
                "Cuenta creada. Revisa tu correo para confirmar la cuenta.",
                "warning"
            );

        }


    } catch (error) {

        console.error(
            "Error de registro:",
            error
        );

        setAuthMessage(
            error.message ||
            "No se pudo crear la cuenta."
        );

    } finally {

        setAuthLoading(false);

    }

}


// ============================================================
// LOGIN
// ============================================================

async function loginUser() {

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;


    if (!email || !password) {

        setAuthMessage(
            "Escribe tu correo y contraseña."
        );

        return;

    }


    setAuthLoading(true);


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email,
                    password

                });


        if (error) {
            throw error;
        }


        closeAuthModal();

        showToast(
            "¡Bienvenido a EZNWORK!"
        );

        await loadCurrentUser();


    } catch (error) {

        console.error(
            "Error de inicio de sesión:",
            error
        );

        setAuthMessage(
            error.message ||
            "Correo o contraseña incorrectos."
        );

    } finally {

        setAuthLoading(false);

    }

}


function setAuthLoading(loading) {

    if (!authSubmit) return;

    authSubmit.disabled =
        loading;

    if (authSubmitText) {

        authSubmitText.textContent =
            loading
                ? "Procesando..."
                : currentAuthMode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta";

    }

}


// ============================================================
// LOGOUT
// ============================================================

$("logoutBtn")?.addEventListener(
    "click",
    async () => {

        const button =
            $("logoutBtn");

        if (button) {
            button.disabled = true;
        }

        try {

            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            currentUser = null;
            currentProfile = null;

            resetInterface();

            window.location.hash =
                "#inicio";

            showToast(
                "Sesión cerrada correctamente."
            );

        } catch (error) {

            console.error(error);

            showError(
                error.message ||
                "No se pudo cerrar la sesión."
            );

        } finally {

            if (button) {
                button.disabled = false;
            }

        }

    }
);


// ============================================================
// USUARIO ACTUAL
// ============================================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Error obteniendo usuario:",
            error
        );

        return null;

    }


    return data?.user || null;

}


// ============================================================
// PERFIL
// ============================================================

async function getUserProfile(
    userId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, role, full_name, contact"
            )
            .eq(
                "id",
                userId
            )
            .single();


    if (error) {

        console.error(
            "Error obteniendo perfil:",
            error
        );

        return null;

    }


    return data;

}


// ============================================================
// RESET INTERFAZ
// ============================================================

function resetInterface() {

    currentUser = null;
    currentProfile = null;


    // NAV AUTH

    showElement(
        $("navLogin")
    );

    showElement(
        $("navRegister")
    );


    // DASHBOARD

    hideElement(
        $("dashboard")
    );


    // PANELES

    hideElement(
        $("clientPanel")
    );

    hideElement(
        $("operatorPanel")
    );

    hideElement(
        $("adminPanel")
    );


    // MENU

    $("mainNav")?.classList.remove(
        "open"
    );

}


// ============================================================
// CARGAR USUARIO
// ============================================================

async function loadCurrentUser() {

    const user =
        await getCurrentUser();


    if (!user) {

        resetInterface();

        return;

    }


    currentUser = user;


    const profile =
        await getUserProfile(
            user.id
        );


    if (!profile) {

        showError(
            "Tu cuenta existe, pero no se encontró tu perfil."
        );

        return;

    }


    currentProfile =
        profile;


    console.log(
        "Perfil actual:",
        profile
    );


    // OCULTAR LOGIN/REGISTRO

    hideElement(
        $("navLogin")
    );

    hideElement(
        $("navRegister")
    );


    // MOSTRAR DASHBOARD

    showElement(
        $("dashboard")
    );


    updateDashboardHeader();


    // OCULTAR PANELES

    hideElement(
        $("clientPanel")
    );

    hideElement(
        $("operatorPanel")
    );

    hideElement(
        $("adminPanel")
    );


    // ========================================
    // CLIENTE
    // ========================================

    if (
        profile.role === "client"
    ) {

        showElement(
            $("clientPanel")
        );

        await loadClientRequests();

        return;

    }


    // ========================================
    // OPERADOR
    // ========================================

    if (
        profile.role === "operator"
    ) {

        showElement(
            $("operatorPanel")
        );

        await loadOperatorJobs();

        return;

    }


    // ========================================
    // ADMIN
    // ========================================

    if (
        profile.role === "admin"
    ) {

        showElement(
            $("adminPanel")
        );

        await loadAdminDashboard();

        return;

    }


    showError(
        `Rol desconocido: ${profile.role}`
    );

}


// ============================================================
// HEADER DEL DASHBOARD
// ============================================================

function updateDashboardHeader() {

    if (!currentUser || !currentProfile) {
        return;
    }


    const title =
        $("dashboardTitle");

    const subtitle =
        $("dashboardSubtitle");


    const name =
        currentProfile.full_name ||
        currentUser.email ||
        "Usuario";


    if (title) {

        title.textContent =
            `Hola, ${name}`;

    }


    if (subtitle) {

        subtitle.textContent =
            `${roleLabel(currentProfile.role)} · ${currentUser.email}`;

    }

}


// ============================================================
// SERVICIOS
// ============================================================

async function loadServices() {

    const grid =
        $("servicesGrid");

    if (!grid) return;


    grid.innerHTML = `
        <div class="services-loading">
            <div class="loading-spinner"></div>
            <span>Cargando servicios...</span>
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("services")
            .select("*")
            .eq(
                "active",
                true
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Error servicios:",
            error
        );

        grid.innerHTML = `
            <div class="services-loading">
                <span>No se pudieron cargar los servicios.</span>
            </div>
        `;

        return;

    }


    servicesCache =
        data || [];


    const count =
        $("categoryCount");

    if (count) {

        count.textContent =
            `${servicesCache.length}+`;

    }


    if (
        !servicesCache.length
    ) {

        grid.innerHTML = `
            <div class="services-loading">
                <span>Aún no hay servicios publicados.</span>
            </div>
        `;

        return;

    }


    grid.innerHTML = "";


    servicesCache.forEach(
        (service, index) => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "service-card reveal";

            card.style.setProperty(
                "--service-delay",
                `${index * 70}ms`
            );


            const icon =
                getServiceIcon(
                    service.name
                );


            card.innerHTML = `

                <div class="service-icon">
                    ${icon}
                </div>

                <div class="service-card-content">

                    <h3>
                        ${escapeHtml(
                            service.name
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            service.description ||
                            "Servicio profesional disponible en EZNWORK."
                        )}
                    </p>

                    <div class="service-meta">

                        <span>
                            ${service.pricing_type === "hourly"
                                ? "⏱️ Por hora"
                                : "💎 Precio fijo"}
                        </span>

                        ${
                            service.starting_price !== null &&
                            service.starting_price !== undefined
                                ? `
                                    <strong>
                                        Desde ${formatMoney(
                                            service.starting_price
                                        )}
                                    </strong>
                                  `
                                : ""
                        }

                    </div>

                    <button
                        class="service-action"
                        type="button"
                        data-service-id="${escapeHtml(service.id)}"
                    >
                        Solicitar servicio →
                    </button>

                </div>
            `;


            grid.appendChild(
                card
            );

        }
    );


    activateServiceButtons();

    observeReveals();

}


function getServiceIcon(
    name = ""
) {

    const text =
        name.toLowerCase();


    if (
        text.includes("diseño")
    ) return "🎨";

    if (
        text.includes("desarrollo") ||
        text.includes("program")
    ) return "💻";

    if (
        text.includes("video") ||
        text.includes("multimedia")
    ) return "🎬";

    if (
        text.includes("ia") ||
        text.includes("inteligencia")
    ) return "🤖";

    if (
        text.includes("marketing")
    ) return "📈";

    if (
        text.includes("escrit") ||
        text.includes("redac")
    ) return "✍️";

    if (
        text.includes("datos")
    ) return "📊";

    if (
        text.includes("audio") ||
        text.includes("música")
    ) return "🎧";

    return "⚡";
}


// ============================================================
// SOLICITAR SERVICIO
// ============================================================

function activateServiceButtons() {

    document
        .querySelectorAll(
            ".service-action"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const serviceId =
                        button.dataset.serviceId;

                    await startServiceRequest(
                        serviceId
                    );

                }
            );

        });

}


async function startServiceRequest(
    serviceId
) {

    const service =
        servicesCache.find(
            item =>
                item.id === serviceId
        );


    if (!service) {

        showError(
            "No se encontró el servicio."
        );

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {

        showToast(
            "Inicia sesión para solicitar este servicio.",
            "warning"
        );

        openAuthModal(
            "register"
        );

        return;

    }


    if (
        !currentProfile
    ) {

        currentProfile =
            await getUserProfile(
                user.id
            );

    }


    if (
        currentProfile?.role !== "client"
    ) {

        showToast(
            "Solo los clientes pueden crear solicitudes.",
            "warning"
        );

        return;

    }


    openRequestForm(
        service
    );

}


// ============================================================
// FORMULARIO DINÁMICO DE SOLICITUD
// ============================================================

function openRequestForm(
    service
) {

    const existing =
        document.getElementById(
            "requestModal"
        );

    if (existing) {
        existing.remove();
    }


    const isHourly =
        service.pricing_type === "hourly";


    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "requestModal";

    modal.className =
        "modal request-modal";


    modal.innerHTML = `

        <div class="modal-backdrop request-close"></div>

        <div class="auth-box request-box">

            <button
                class="close-modal request-close"
                type="button"
                aria-label="Cerrar"
            >
                ×
            </button>

            <div class="auth-logo">
                ${getServiceIcon(service.name)}
            </div>

            <h2>
                Solicitar servicio
            </h2>

            <p>
                ${escapeHtml(service.name)}
            </p>

            <form id="requestForm">

                <div class="form-field">

                    <label for="requestDescription">
                        ¿Qué necesitas?
                    </label>

                    <textarea
                        id="requestDescription"
                        rows="5"
                        required
                        placeholder="Explica brevemente lo que necesitas..."
                    ></textarea>

                </div>

                ${
                    isHourly
                        ? `
                            <div class="form-field">

                                <label for="requestedHours">
                                    Horas estimadas
                                </label>

                                <input
                                    id="requestedHours"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    required
                                    placeholder="Ej. 2"
                                >

                            </div>
                          `
                        : ""
                }

                <div class="form-field">

                    <label>
                        Prioridad
                    </label>

                    <select id="requestPriority">

                        <option value="false">
                            Normal
                        </option>

                        <option value="true">
                            Prioritaria
                        </option>

                    </select>

                </div>

                <button
                    class="auth-submit"
                    type="submit"
                    id="sendRequestBtn"
                >
                    <span>
                        Enviar solicitud
                    </span>
                    <span>→</span>
                </button>

            </form>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal.style.display =
        "flex";


    requestAnimationFrame(() => {

        modal.classList.add(
            "visible"
        );

    });


    modal
        .querySelectorAll(
            ".request-close"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    modal.remove();

                }
            );

        });


    $("requestForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await submitRequest(
                    service,
                    modal
                );

            }
        );

}


// ============================================================
// CREAR SOLICITUD
// ============================================================

async function submitRequest(
    service,
    modal
) {

    const description =
        $("requestDescription")
            ?.value.trim();


    const priority =
        $("requestPriority")
            ?.value === "true";


    const requestedHours =
        $("requestedHours")
            ?.value;


    if (!description) {

        showError(
            "Describe lo que necesitas."
        );

        return;

    }


    const button =
        $("sendRequestBtn");


    if (button) {
        button.disabled = true;
    }


    try {

        const user =
            await getCurrentUser();


        if (!user) {

            throw new Error(
                "Debes iniciar sesión."
            );

        }


        const payload = {

            client_id:
                user.id,

            service_id:
                service.id,

            service_name:
                service.name,

            pricing_type:
                service.pricing_type,

            description:
                description,

            status:
                "pending",

            priority:
                priority,

            priority_fee:
                priority
                    ? Number(
                        service.priority_fee || 0
                    )
                    : 0

        };


        if (
            service.pricing_type === "hourly"
        ) {

            const hours =
                Number(
                    requestedHours
                );


            if (
                !Number.isFinite(hours) ||
                hours <= 0
            ) {

                throw new Error(
                    "Indica una cantidad válida de horas."
                );

            }


            payload.requested_hours =
                hours;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("requests")
                .insert(
                    payload
                )
                .select()
                .single();


        if (error) {
            throw error;
        }


        console.log(
            "Solicitud creada:",
            data
        );


        modal.remove();


        showToast(
            "¡Solicitud enviada correctamente!"
        );


        await loadClientRequests();


    } catch (error) {

        console.error(
            "Error creando solicitud:",
            error
        );

        showError(
            error.message ||
            "No se pudo crear la solicitud."
        );

    } finally {

        if (button) {
            button.disabled = false;
        }

    }

}


// ============================================================
// CLIENTE
// ============================================================

$("refreshRequestsBtn")?.addEventListener(
    "click",
    loadClientRequests
);


async function loadClientRequests() {

    const container =
        $("clientRequests");

    if (!container) return;


    container.innerHTML = `
        <div class="dashboard-loading">
            <div class="loading-spinner"></div>
            <span>Cargando solicitudes...</span>
        </div>
    `;


    const user =
        await getCurrentUser();


    if (!user) {

        container.innerHTML =
            "<p>Debes iniciar sesión.</p>";

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("requests")
            .select("*")
            .eq(
                "client_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Solicitudes:",
            error
        );

        container.innerHTML =
            "<p>No se pudieron cargar las solicitudes.</p>";

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <span>📭</span>

                <strong>
                    Todavía no tienes solicitudes
                </strong>

                <small>
                    Explora los servicios y crea tu primera solicitud.
                </small>

            </div>
        `;

        return;

    }


    container.innerHTML = "";


    data.forEach(
        request => {

            container.appendChild(
                createRequestCard(
                    request,
                    "client"
                )
            );

        }
    );

}


function createRequestCard(
    request,
    mode
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "dashboard-item animated-card";


    const status =
        request.status ||
        "pending";


    item.innerHTML = `

        <div class="dashboard-item-top">

            <div>

                <span class="item-kicker">
                    SOLICITUD
                </span>

                <h3>
                    ${escapeHtml(
                        request.service_name ||
                        "Servicio"
                    )}
                </h3>

            </div>

            <span
                class="status-badge ${statusClass(status)}"
            >
                ${escapeHtml(
                    statusLabel(status)
                )}
            </span>

        </div>

        ${
            request.description
                ? `
                    <p>
                        ${escapeHtml(
                            request.description
                        )}
                    </p>
                  `
                : ""
        }

        <div class="item-details">

            <span>
                📅 ${formatDate(
                    request.created_at
                )}
            </span>

            ${
                request.pricing_type
                    ? `
                        <span>
                            ${
                                request.pricing_type === "hourly"
                                    ? "⏱️ Por hora"
                                    : "💎 Precio fijo"
                            }
                        </span>
                      `
                    : ""
            }

            ${
                request.requested_hours
                    ? `
                        <span>
                            ⏱️ ${escapeHtml(
                                request.requested_hours
                            )} h
                        </span>
                      `
                    : ""
            }

            ${
                request.quoted_price !== null &&
                request.quoted_price !== undefined
                    ? `
                        <strong>
                            ${formatMoney(
                                request.quoted_price
                            )}
                        </strong>
                      `
                    : ""
            }

        </div>

    `;


    return item;

}


// ============================================================
// OPERADOR
// ============================================================

$("refreshJobsBtn")?.addEventListener(
    "click",
    loadOperatorJobs
);


async function loadOperatorJobs() {

    const container =
        $("operatorJobs");

    if (!container) return;


    container.innerHTML = `
        <div class="dashboard-loading">
            <div class="loading-spinner"></div>
            <span>Buscando oportunidades...</span>
        </div>
    `;


    const user =
        await getCurrentUser();


    if (!user) {

        container.innerHTML =
            "<p>Debes iniciar sesión.</p>";

        return;

    }


    // ========================================
    // DISPONIBLES
    // ========================================

    const {
        data: availableJobs,
        error: availableError
    } =
        await supabaseClient
            .from("jobs")
            .select("*")
            .eq(
                "status",
                "available"
            )
            .is(
                "operator_id",
                null
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (availableError) {

        console.error(
            "Trabajos disponibles:",
            availableError
        );

        container.innerHTML =
            "<p>No se pudieron cargar los trabajos.</p>";

        return;

    }


    // ========================================
    // MIS TRABAJOS
    // ========================================

    const {
        data: myJobs,
        error: myJobsError
    } =
        await supabaseClient
            .from("jobs")
            .select("*")
            .eq(
                "operator_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (myJobsError) {

        console.error(
            "Mis trabajos:",
            myJobsError
        );

        container.innerHTML =
            "<p>No se pudieron cargar tus trabajos.</p>";

        return;

    }


    container.innerHTML = "";


    // ========================================
    // TÍTULO DISPONIBLES
    // ========================================

    container.innerHTML += `

        <div class="jobs-heading">

            <span class="eyebrow">
                OPORTUNIDADES
            </span>

            <h3>
                Trabajos disponibles
            </h3>

        </div>
    `;


    if (
        !availableJobs ||
        availableJobs.length === 0
    ) {

        container.innerHTML += `

            <div class="empty-state">

                <span>🌌</span>

                <strong>
                    No hay trabajos disponibles
                </strong>

                <small>
                    Las nuevas oportunidades aparecerán aquí.
                </small>

            </div>
        `;

    } else {

        availableJobs.forEach(
            job => {

                container.appendChild(
                    createJobCard(
                        job,
                        true
                    )
                );

            }
        );

    }


    // ========================================
    // MIS TRABAJOS
    // ========================================

    const separator =
        document.createElement(
            "div"
        );

    separator.className =
        "jobs-heading my-jobs-heading";


    separator.innerHTML = `

        <span class="eyebrow">
            MI ACTIVIDAD
        </span>

        <h3>
            Mis trabajos
        </h3>
    `;


    container.appendChild(
        separator
    );


    if (
        !myJobs ||
        myJobs.length === 0
    ) {

        container.innerHTML += `

            <div class="empty-state">

                <span>🛠️</span>

                <strong>
                    Todavía no has tomado trabajos
                </strong>

                <small>
                    Elige una oportunidad para comenzar.
                </small>

            </div>
        `;

    } else {

        myJobs.forEach(
            job => {

                container.appendChild(
                    createJobCard(
                        job,
                        false
                    )
                );

            }
        );

    }


    // ========================================
    // BOTONES CLAIM
    // ========================================

    container
        .querySelectorAll(
            ".claim-job-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await claimJob(
                            button.dataset.jobId,
                            button
                        );

                    }
                );

            }
        );

}


function createJobCard(
    job,
    available
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "dashboard-item animated-card job-card";


    const status =
        job.status ||
        "available";


    item.innerHTML = `

        <div class="dashboard-item-top">

            <div>

                <span class="item-kicker">
                    ${available
                        ? "NUEVA OPORTUNIDAD"
                        : "MI TRABAJO"}
                </span>

                <h3>
                    ${
                        available
                            ? "Trabajo disponible"
                            : "Trabajo en curso"
                    }
                </h3>

            </div>

            <span
                class="status-badge ${statusClass(status)}"
            >
                ${escapeHtml(
                    statusLabel(status)
                )}
            </span>

        </div>

        ${
            job.request_id
                ? `
                    <p>
                        Solicitud:
                        ${escapeHtml(
                            job.request_id
                        )}
                    </p>
                  `
                : ""
        }

        <div class="item-details">

            <span>
                📅 ${formatDate(
                    job.created_at
                )}
            </span>

            ${
                job.operator_id
                    ? `
                        <span>
                            🛠️ Operador asignado
                        </span>
                      `
                    : ""
            }

        </div>

        ${
            available
                ? `
                    <button
                        class="claim-button claim-job-btn"
                        type="button"
                        data-job-id="${escapeHtml(job.id)}"
                    >
                        <span>⚡</span>
                        Tomar trabajo
                    </button>
                  `
                : ""
        }

    `;


    return item;

}


// ============================================================
// TOMAR TRABAJO
// ============================================================

async function claimJob(
    jobId,
    button
) {

    if (!jobId) {

        showError(
            "No se encontró el trabajo."
        );

        return;

    }


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "⚡ Tomando...";

    }


    try {

        /*
         * IMPORTANTE:
         *
         * El frontend NO modifica directamente
         * operator_id ni status.
         *
         * La operación debe pasar por el RPC
         * seguro de Supabase.
         */

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "claim_job",
                {
                    p_job_id: jobId
                }
            );


        if (error) {
            throw error;
        }


        console.log(
            "claim_job:",
            data
        );


        showToast(
            "¡Trabajo tomado correctamente! 🚀"
        );


        await loadOperatorJobs();


    } catch (error) {

        console.error(
            "Error tomando trabajo:",
            error
        );


        if (button) {

            button.disabled = false;

            button.innerHTML =
                "<span>⚡</span> Tomar trabajo";

        }


        showError(
            error.message ||
            "No se pudo tomar el trabajo."
        );

    }

}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

$("refreshAdminRequestsBtn")
    ?.addEventListener(
        "click",
        loadAdminRequests
    );


$("refreshAdminJobsBtn")
    ?.addEventListener(
        "click",
        loadAdminJobs
    );


async function loadAdminDashboard() {

    await Promise.all([
        loadAdminStats(),
        loadAdminRequests(),
        loadAdminJobs()
    ]);

}


async function loadAdminStats() {

    if (
        !currentProfile ||
        currentProfile.role !== "admin"
    ) {
        return;
    }


    try {

        const [
            profilesResult,
            requestsResult,
            jobsResult
        ] =
            await Promise.all([

                supabaseClient
                    .from("profiles")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabaseClient
                    .from("requests")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    ),

                supabaseClient
                    .from("jobs")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )

            ]);


        if (profilesResult.error) {
            throw profilesResult.error;
        }

        if (requestsResult.error) {
            throw requestsResult.error;
        }

        if (jobsResult.error) {
            throw jobsResult.error;
        }


        if ($("adminUsers")) {

            $("adminUsers").textContent =
                profilesResult.count ?? 0;

        }


        if ($("adminRequests")) {

            $("adminRequests").textContent =
                requestsResult.count ?? 0;

        }


        if ($("adminJobs")) {

            $("adminJobs").textContent =
                jobsResult.count ?? 0;

        }


    } catch (error) {

        console.error(
            "Admin stats:",
            error
        );

    }

}


// ============================================================
// ADMIN SOLICITUDES
// ============================================================

async function loadAdminRequests() {

    const container =
        $("adminRequestsList");

    if (!container) return;


    container.innerHTML = `
        <div class="dashboard-loading">
            <div class="loading-spinner"></div>
            <span>Cargando solicitudes...</span>
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("requests")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Admin requests:",
            error
        );

        container.innerHTML =
            "<p>No se pudieron cargar las solicitudes.</p>";

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <span>📭</span>

                <strong>
                    No hay solicitudes
                </strong>

                <small>
                    Cuando un cliente cree una solicitud aparecerá aquí.
                </small>

            </div>
        `;

        return;

    }


    container.innerHTML = "";


    data.forEach(
        request => {

            const card =
                createAdminRequestCard(
                    request
                );

            container.appendChild(
                card
            );

        }
    );

}


function createAdminRequestCard(
    request
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "dashboard-item animated-card";


    const status =
        request.status ||
        "pending";


    item.innerHTML = `

        <div class="dashboard-item-top">

            <div>

                <span class="item-kicker">
                    SOLICITUD
                </span>

                <h3>
                    ${escapeHtml(
                        request.service_name ||
                        "Servicio"
                    )}
                </h3>

            </div>

            <span
                class="status-badge ${statusClass(status)}"
            >
                ${escapeHtml(
                    statusLabel(status)
                )}
            </span>

        </div>

        <p>
            <strong>Cliente:</strong>
            ${escapeHtml(
                request.client_id
            )}
        </p>

        ${
            request.description
                ? `
                    <p>
                        ${escapeHtml(
                            request.description
                        )}
                    </p>
                  `
                : ""
        }

        <div class="item-details">

            <span>
                📅 ${formatDate(
                    request.created_at
                )}
            </span>

            ${
                request.priority
                    ? `
                        <span>
                            🔥 Prioritaria
                        </span>
                      `
                    : ""
            }

            ${
                request.quoted_price !== null &&
                request.quoted_price !== undefined
                    ? `
                        <strong>
                            ${formatMoney(
                                request.quoted_price
                            )}
                        </strong>
                      `
                    : ""
            }

        </div>

        <div class="admin-actions">

            ${
                status === "pending"
                    ? `
                        <button
                            class="small-button admin-review-btn"
                            data-id="${escapeHtml(request.id)}"
                        >
                            Revisar
                        </button>
                      `
                    : ""
            }

            ${
                (
                    status === "accepted" ||
                    status === "paid"
                )
                    ? `
                        <button
                            class="small-button admin-job-btn"
                            data-id="${escapeHtml(request.id)}"
                        >
                            Crear trabajo
                        </button>
                      `
                    : ""
            }

        </div>
    `;


    item
        .querySelector(
            ".admin-review-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                updateRequestStatus(
                    request,
                    "reviewing"
                );

            }
        );


    item
        .querySelector(
            ".admin-job-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                createJobFromRequest(
                    request
                );

            }
        );


    return item;

}


// ============================================================
// ADMIN: CAMBIAR ESTADO DE SOLICITUD
// ============================================================

async function updateRequestStatus(
    request,
    newStatus
) {

    if (
        !currentProfile ||
        currentProfile.role !== "admin"
    ) {

        showError(
            "No tienes permisos de administrador."
        );

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("requests")
                .update({
                    status: newStatus
                })
                .eq(
                    "id",
                    request.id
                );


        if (error) {
            throw error;
        }


        showToast(
            `Solicitud marcada como ${statusLabel(newStatus)}.`
        );


        await loadAdminDashboard();


    } catch (error) {

        console.error(
            "Actualizar solicitud:",
            error
        );

        showError(
            error.message ||
            "No se pudo actualizar la solicitud."
        );

    }

}


// ============================================================
// ADMIN: CREAR JOB
// ============================================================

async function createJobFromRequest(
    request
) {

    if (
        !currentProfile ||
        currentProfile.role !== "admin"
    ) {

        showError(
            "No tienes permisos."
        );

        return;

    }


    if (
        request.status !== "accepted" &&
        request.status !== "paid"
    ) {

        showError(
            "Esta solicitud todavía no puede convertirse en trabajo."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("jobs")
                .insert({

                    request_id:
                        request.id,

                    status:
                        "available"

                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        console.log(
            "Trabajo creado:",
            data
        );


        showToast(
            "🚀 Trabajo creado y disponible para operadores."
        );


        await loadAdminDashboard();


    } catch (error) {

        console.error(
            "Crear trabajo:",
            error
        );

        showError(
            error.message ||
            "No se pudo crear el trabajo."
        );

    }

}


// ============================================================
// ADMIN JOBS
// ============================================================

async function loadAdminJobs() {

    const container =
        $("adminJobsList");

    if (!container) return;


    container.innerHTML = `
        <div class="dashboard-loading">
            <div class="loading-spinner"></div>
            <span>Cargando trabajos...</span>
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("jobs")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Admin jobs:",
            error
        );

        container.innerHTML =
            "<p>No se pudieron cargar los trabajos.</p>";

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <span>🛠️</span>

                <strong>
                    No hay trabajos
                </strong>

                <small>
                    Los trabajos creados desde solicitudes aparecerán aquí.
                </small>

            </div>
        `;

        return;

    }


    container.innerHTML = "";


    data.forEach(
        job => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "dashboard-item animated-card";


            const status =
                job.status ||
                "available";


            item.innerHTML = `

                <div class="dashboard-item-top">

                    <div>

                        <span class="item-kicker">
                            TRABAJO
                        </span>

                        <h3>
                            Oportunidad EZNWORK
                        </h3>

                    </div>

                    <span
                        class="status-badge ${statusClass(status)}"
                    >
                        ${escapeHtml(
                            statusLabel(status)
                        )}
                    </span>

                </div>

                <p>
                    <strong>Solicitud:</strong>
                    ${escapeHtml(
                        job.request_id
                    )}
                </p>

                <div class="item-details">

                    <span>
                        📅 ${formatDate(
                            job.created_at
                        )}
                    </span>

                    <span>
                        ${
                            job.operator_id
                                ? "🛠️ Operador asignado"
                                : "👤 Sin operador"
                        }
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ============================================================
// NAVEGACIÓN MÓVIL
// ============================================================

const menuBtn =
    $("menuBtn");

const mainNav =
    $("mainNav");


menuBtn?.addEventListener(
    "click",
    () => {

        const open =
            mainNav.classList.toggle(
                "open"
            );


        menuBtn.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuBtn.setAttribute(
            "aria-label",
            open
                ? "Cerrar menú"
                : "Abrir menú"
        );

    }
);


mainNav
    ?.querySelectorAll("a")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mainNav.classList.remove(
                        "open"
                    );

                    menuBtn?.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );


// ============================================================
// ANIMACIONES
// ============================================================

function initParticles() {

    const container =
        document.querySelector(
            ".particles"
        );


    if (!container) return;


    /*
     * Si ya existen partículas,
     * no las duplicamos.
     */

    if (
        container.children.length > 0
    ) {
        return;
    }


    const count =
        window.innerWidth < 700
            ? 18
            : 35;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "particle";


        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.animationDelay =
            `${Math.random() * 8}s`;

        particle.style.animationDuration =
            `${6 + Math.random() * 8}s`;

        particle.style.opacity =
            `${0.15 + Math.random() * 0.5}`;


        container.appendChild(
            particle
        );

    }

}


let revealObserver = null;


function observeReveals() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "revealed"
                );

            }
        );

        return;

    }


    if (!revealObserver) {

        revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "revealed"
                                );

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );

    }


    elements.forEach(
        element => {

            if (
                !element.classList.contains(
                    "revealed"
                )
            ) {

                revealObserver.observe(
                    element
                );

            }

        }
    );

}


// ============================================================
// EFECTO PARALLAX SUAVE
// ============================================================

function initParallax() {

    const visual =
        document.querySelector(
            ".hero-visual"
        );


    if (!visual) return;


    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }


    window.addEventListener(
        "mousemove",
        event => {

            const x =
                (
                    event.clientX /
                    window.innerWidth
                ) - 0.5;


            const y =
                (
                    event.clientY /
                    window.innerHeight
                ) - 0.5;


            visual.style.transform =
                `
                perspective(900px)
                rotateY(${x * 5}deg)
                rotateX(${-y * 5}deg)
                translateZ(0)
                `;

        },
        {
            passive: true
        }
    );


    window.addEventListener(
        "mouseleave",
        () => {

            visual.style.transform =
                "";

        }
    );

}


// ============================================================
// EFECTO RIPPLE
// ============================================================

function initRipple() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) return;


            const rect =
                button.getBoundingClientRect();


            const ripple =
                document.createElement(
                    "span"
                );


            ripple.className =
                "click-ripple";


            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;


            button.appendChild(
                ripple
            );


            setTimeout(
                () => ripple.remove(),
                650
            );

        }
    );

}


// ============================================================
// MINIJUEGO
// ============================================================

let gameRunning = false;
let gameScore = 0;
let gameTime = 30;
let gameTimer = null;
let targetTimer = null;


$("startGame")?.addEventListener(
    "click",
    startGame
);


function startGame() {

    if (gameRunning) {
        return;
    }


    const board =
        $("gameBoard");


    if (!board) return;


    gameRunning = true;
    gameScore = 0;
    gameTime = 30;


    updateGameScore();


    board.innerHTML = "";


    if ($("startGame")) {

        $("startGame").textContent =
            "⚡ Jugando...";

        $("startGame").disabled = true;

    }


    createGameTarget();


    gameTimer =
        setInterval(
            () => {

                gameTime--;

                updateGameScore();


                if (
                    gameTime <= 0
                ) {

                    endGame();

                }

            },
            1000
        );

}


function createGameTarget() {

    if (!gameRunning) {
        return;
    }


    const board =
        $("gameBoard");


    if (!board) return;


    board
        .querySelectorAll(
            ".game-target"
        )
        .forEach(
            element => element.remove()
        );


    const target =
        document.createElement(
            "button"
        );


    target.type =
        "button";

    target.className =
        "game-target";

    target.textContent =
        "✦";


    const maxX =
        Math.max(
            10,
            board.clientWidth - 65
        );


    const maxY =
        Math.max(
            10,
            board.clientHeight - 65
        );


    target.style.left =
        `${Math.random() * maxX}px`;

    target.style.top =
        `${Math.random() * maxY}px`;


    target.addEventListener(
        "click",
        () => {

            if (!gameRunning) {
                return;
            }


            gameScore++;

            updateGameScore();

            target.remove();

            createGameTarget();

        }
    );


    board.appendChild(
        target
    );


    clearTimeout(
        targetTimer
    );


    targetTimer =
        setTimeout(
            () => {

                if (
                    target.isConnected
                ) {

                    target.remove();

                }


                createGameTarget();

            },
            1100
        );

}


function updateGameScore() {

    if ($("score")) {

        $("score").textContent =
            gameScore;

    }


    if ($("gameTime")) {

        $("gameTime").textContent =
            gameTime;

    }


    const saved =
        Number(
            localStorage.getItem(
                "eznwork_high_score"
            ) || 0
        );


    if ($("highScore")) {

        $("highScore").textContent =
            Math.max(
                saved,
                gameScore
            );

    }

}


function endGame() {

    gameRunning = false;


    clearInterval(
        gameTimer
    );

    clearTimeout(
        targetTimer
    );


    const board =
        $("gameBoard");


    board
        ?.querySelectorAll(
            ".game-target"
        )
        .forEach(
            target => target.remove()
        );


    const oldHighScore =
        Number(
            localStorage.getItem(
                "eznwork_high_score"
            ) || 0
        );


    if (
        gameScore > oldHighScore
    ) {

        localStorage.setItem(
            "eznwork_high_score",
            String(gameScore)
        );

    }


    if ($("startGame")) {

        $("startGame").disabled = false;

        $("startGame").textContent =
            "🎮 Jugar otra vez";

    }


    if (board) {

        board.innerHTML = `

            <div class="game-message">

                <span>🏆</span>

                <strong>
                    ${gameScore} puntos
                </strong>

                <small>
                    ${
                        gameScore > oldHighScore
                            ? "¡Nuevo récord!"
                            : "¡Buen trabajo!"
                    }
                </small>

            </div>
        `;

    }


    updateGameScore();

}


// ============================================================
// SCROLL SUAVE
// ============================================================

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const id =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !id ||
                        id === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            id
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );


// ============================================================
// AUTH STATE
// ============================================================

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        console.log(
            "Supabase Auth:",
            event
        );


        if (
            session?.user
        ) {

            /*
             * Esperamos al siguiente ciclo para
             * evitar conflictos de Supabase Auth
             * con consultas adicionales.
             */

            setTimeout(
                () => {
                    loadCurrentUser();
                },
                0
            );

        } else {

            resetInterface();

        }

    }
);


// ============================================================
// HELPERS
// ============================================================

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


// ============================================================
// INICIALIZACIÓN
// ============================================================

async function init() {

    console.log(
        "🚀 EZNWORK iniciando..."
    );


    resetInterface();


    initParticles();

    observeReveals();

    initParallax();

    initRipple();

    updateGameScore();

    await loadServices();


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

    }


    if (
        data?.session?.user
    ) {

        await loadCurrentUser();

    }


    console.log(
        "✨ EZNWORK listo."
    );

}


// ============================================================
// ARRANCAR
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    init
);
