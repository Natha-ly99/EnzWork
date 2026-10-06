// ======================================
// EZNWORK
// Frontend real conectado a Supabase
// ======================================

// IMPORTANTE:
// Esta es una clave pública.
// NUNCA pongas aquí service_role ni una clave secreta.

const SUPABASE_URL = "https://gjdzuhuhevyorupidyat.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_SLXF4C_-UviRH6iMNEBuRA_vKcXQ7Yo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================
// ELEMENTOS
// ======================================

// Autenticación
const authModal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");
const authTitle = document.getElementById("authTitle");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


// Usuario
const userArea = document.getElementById("userArea");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");


// Botones de registro
const heroRegisterBtn =
    document.getElementById("heroRegisterBtn");

const ctaRegisterBtn =
    document.getElementById("ctaRegisterBtn");


// Menú
const menuBtn =
    document.getElementById("menuBtn");

const mainNav =
    document.getElementById("mainNav");


// Navegación según rol
const navClient =
    document.getElementById("navClient");

const navOperator =
    document.getElementById("navOperator");

const navAdmin =
    document.getElementById("navAdmin");


// Paneles
const panelCliente =
    document.getElementById("panelCliente");

const panelOperador =
    document.getElementById("panelOperador");

const panelAdmin =
    document.getElementById("panelAdmin");


// Cliente
const clientWelcome =
    document.getElementById("clientWelcome");

const refreshRequestsBtn =
    document.getElementById("refreshRequestsBtn");

const clientRequests =
    document.getElementById("clientRequests");


// Operador
const operatorWelcome =
    document.getElementById("operatorWelcome");

const refreshJobsBtn =
    document.getElementById("refreshJobsBtn");

const operatorJobs =
    document.getElementById("operatorJobs");


// Administrador
const adminRequestsBtn =
    document.getElementById("adminRequestsBtn");

const adminJobsBtn =
    document.getElementById("adminJobsBtn");

const adminData =
    document.getElementById("adminData");


// ======================================
// UTILIDADES
// ======================================

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
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    } catch {

        return String(value);

    }
}


function showError(message) {

    console.error(message);

    alert(message);
}


// ======================================
// MODAL
// ======================================

function openLogin() {

    authTitle.textContent =
        "Iniciar sesión";

    loginForm.style.display = "block";
    registerForm.style.display = "none";

    authModal.style.display = "flex";
}


function openRegister() {

    authTitle.textContent =
        "Crear cuenta";

    loginForm.style.display = "none";
    registerForm.style.display = "block";

    authModal.style.display = "flex";
}


function closeAuthModal() {

    authModal.style.display = "none";

    loginForm.reset();
    registerForm.reset();
}


loginBtn.addEventListener(
    "click",
    openLogin
);


registerBtn.addEventListener(
    "click",
    openRegister
);


heroRegisterBtn.addEventListener(
    "click",
    openRegister
);


ctaRegisterBtn.addEventListener(
    "click",
    openRegister
);


closeModal.addEventListener(
    "click",
    closeAuthModal
);


showRegister.addEventListener(
    "click",
    event => {

        event.preventDefault();

        openRegister();

    }
);


showLogin.addEventListener(
    "click",
    event => {

        event.preventDefault();

        openLogin();

    }
);


// Cerrar modal haciendo clic fuera
authModal.addEventListener(
    "click",
    event => {

        if (event.target === authModal) {
            closeAuthModal();
        }

    }
);


// ======================================
// MENÚ
// ======================================

menuBtn.addEventListener(
    "click",
    () => {

        mainNav.classList.toggle("open");

    }
);


// Cerrar menú al seleccionar una opción
mainNav
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mainNav.classList.remove("open");

            }
        );

    });


// ======================================
// REGISTRO
// ======================================

registerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            registerName.value.trim();

        const email =
            registerEmail.value.trim();

        const password =
            registerPassword.value;


        if (!name || !email || !password) {

            showError(
                "Completa todos los campos."
            );

            return;

        }


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


            /*
             * El trigger:
             *
             * on_auth_user_created
             *
             * crea automáticamente
             * el perfil del usuario.
             */


            if (data.session) {

                closeAuthModal();

                await loadCurrentUser();

                alert(
                    "Cuenta creada correctamente."
                );

            } else {

                closeAuthModal();

                alert(
                    "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
                );

            }


        } catch (error) {

            console.error(
                "Error de registro:",
                error
            );

            showError(
                error.message ||
                "No se pudo crear la cuenta."
            );

        }

    }
);


// ======================================
// LOGIN
// ======================================

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        if (!email || !password) {

            showError(
                "Escribe tu correo y contraseña."
            );

            return;

        }


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

            await loadCurrentUser();


        } catch (error) {

            console.error(
                "Error de inicio de sesión:",
                error
            );

            showError(
                error.message ||
                "No se pudo iniciar sesión."
            );

        }

    }
);


// ======================================
// CERRAR SESIÓN
// ======================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {
                throw error;
            }


            resetInterface();

            window.location.hash =
                "#inicio";


        } catch (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

            showError(
                error.message ||
                "No se pudo cerrar sesión."
            );

        }

    }
);


// ======================================
// OBTENER USUARIO ACTUAL
// ======================================

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


    return data.user;

}


// ======================================
// OBTENER PERFIL
// ======================================

async function getUserProfile(userId) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, role, full_name"
            )
            .eq("id", userId)
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


// ======================================
// MOSTRAR / OCULTAR INTERFAZ
// ======================================

function resetInterface() {

    // Botones públicos
    loginBtn.style.display = "";
    registerBtn.style.display = "";

    // Usuario
    userArea.style.display = "none";
    userEmail.textContent = "";


    // Navegación
    navClient.style.display = "none";
    navOperator.style.display = "none";
    navAdmin.style.display = "none";


    // Paneles
    panelCliente.style.display = "none";
    panelOperador.style.display = "none";
    panelAdmin.style.display = "none";


    // Menú
    mainNav.classList.remove("open");

}


// ======================================
// CARGAR USUARIO
// ======================================

async function loadCurrentUser() {

    const user =
        await getCurrentUser();


    if (!user) {

        resetInterface();

        return;

    }


    // Mostrar usuario
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";

    userArea.style.display = "flex";

    userEmail.textContent =
        user.email || "";


    // Obtener perfil
    const profile =
        await getUserProfile(user.id);


    if (!profile) {

        showError(
            "Tu cuenta existe, pero no se encontró tu perfil."
        );

        return;

    }


    console.log(
        "Perfil actual:",
        profile
    );


    // Ocultar todo primero
    navClient.style.display = "none";
    navOperator.style.display = "none";
    navAdmin.style.display = "none";

    panelCliente.style.display = "none";
    panelOperador.style.display = "none";
    panelAdmin.style.display = "none";


    // ==================================
    // CLIENTE
    // ==================================

    if (profile.role === "client") {

        navClient.style.display = "";

        panelCliente.style.display =
            "block";

        clientWelcome.textContent =
            `Bienvenido, ${
                profile.full_name ||
                user.email
            }.`;

        return;

    }


    // ==================================
    // OPERADOR
    // ==================================

    if (profile.role === "operator") {

        navOperator.style.display = "";

        panelOperador.style.display =
            "block";

        operatorWelcome.textContent =
            `Bienvenido, ${
                profile.full_name ||
                user.email
            }.`;

        return;

    }


    // ==================================
    // ADMINISTRADOR
    // ==================================

    if (profile.role === "admin") {

        navAdmin.style.display = "";

        panelAdmin.style.display =
            "block";

        return;

    }


    // ==================================
    // ROL DESCONOCIDO
    // ==================================

    console.warn(
        "Rol desconocido:",
        profile.role
    );

}


// ======================================
// CLIENTE
// VER SOLICITUDES
// ======================================

refreshRequestsBtn.addEventListener(
    "click",
    loadClientRequests
);


async function loadClientRequests() {

    clientRequests.innerHTML =
        "<p>Cargando solicitudes...</p>";


    const user =
        await getCurrentUser();


    if (!user) {

        clientRequests.innerHTML =
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
            .eq("client_id", user.id)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        clientRequests.innerHTML =
            "<p>No se pudieron cargar las solicitudes.</p>";

        return;

    }


    if (!data || data.length === 0) {

        clientRequests.innerHTML =
            "<p>Aún no tienes solicitudes.</p>";

        return;

    }


    clientRequests.innerHTML = "";


    data.forEach(request => {

        const item =
            document.createElement("div");

        item.className =
            "dashboard-item";


        item.innerHTML = `

            <h3>
                ${escapeHtml(
                    request.service_name ||
                    "Solicitud"
                )}
            </h3>

            <p>
                Estado:
                <strong>
                    ${escapeHtml(
                        request.status ||
                        "desconocido"
                    )}
                </strong>
            </p>

            <p>
                Creada:
                ${formatDate(
                    request.created_at
                )}
            </p>

        `;


        clientRequests.appendChild(item);

    });

}


// ======================================
// OPERADOR
// TRABAJOS
// ======================================

refreshJobsBtn.addEventListener(
    "click",
    loadOperatorJobs
);


async function loadOperatorJobs() {

    operatorJobs.innerHTML =
        "<p>Cargando trabajos...</p>";


    const user =
        await getCurrentUser();


    if (!user) {

        operatorJobs.innerHTML =
            "<p>Debes iniciar sesión.</p>";

        return;

    }


    // ==================================
    // TRABAJOS DISPONIBLES
    // ==================================

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
            availableError
        );

        operatorJobs.innerHTML =
            "<p>No se pudieron cargar los trabajos.</p>";

        return;

    }


    // ==================================
    // MIS TRABAJOS
    // ==================================

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
            myJobsError
        );

        operatorJobs.innerHTML =
            "<p>No se pudieron cargar tus trabajos.</p>";

        return;

    }


    operatorJobs.innerHTML = "";


    // ==================================
    // DISPONIBLES
    // ==================================

    const availableTitle =
        document.createElement("h3");

    availableTitle.textContent =
        "Trabajos disponibles";

    operatorJobs.appendChild(
        availableTitle
    );


    if (
        !availableJobs ||
        availableJobs.length === 0
    ) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "No hay trabajos disponibles en este momento.";

        operatorJobs.appendChild(
            empty
        );

    } else {

        availableJobs.forEach(job => {

            const item =
                document.createElement("div");

            item.className =
                "dashboard-item";


            item.innerHTML = `

                <h3>
                    Trabajo disponible
                </h3>

                <p>
                    Estado:
                    <strong>
                        Disponible
                    </strong>
                </p>

                <p>
                    Fecha:
                    ${formatDate(
                        job.created_at
                    )}
                </p>

                <button
                    class="btn btn-red claim-job-btn"
                    data-job-id="${escapeHtml(job.id)}"
                >
                    Tomar trabajo
                </button>

            `;


            operatorJobs.appendChild(
                item
            );

        });

    }


    // ==================================
    // MIS TRABAJOS
    // ==================================

    const myJobsTitle =
        document.createElement("h3");

    myJobsTitle.style.marginTop =
        "30px";

    myJobsTitle.textContent =
        "Mis trabajos";

    operatorJobs.appendChild(
        myJobsTitle
    );


    if (
        !myJobs ||
        myJobs.length === 0
    ) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "Todavía no has tomado ningún trabajo.";

        operatorJobs.appendChild(
            empty
        );

    } else {

        myJobs.forEach(job => {

            const item =
                document.createElement("div");

            item.className =
                "dashboard-item";


            item.innerHTML = `

                <h3>
                    Mi trabajo
                </h3>

                <p>
                    Estado:
                    <strong>
                        ${escapeHtml(
                            job.status ||
                            "desconocido"
                        )}
                    </strong>
                </p>

                <p>
                    Actualizado:
                    ${formatDate(
                        job.updated_at
                    )}
                </p>

            `;


            operatorJobs.appendChild(
                item
            );

        });

    }


    // ==================================
    // BOTONES TOMAR TRABAJO
    // ==================================

    document
        .querySelectorAll(
            ".claim-job-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const jobId =
                        button.dataset.jobId;

                    await claimJob(
                        jobId,
                        button
                    );

                }
            );

        });

}


// ======================================
// OPERADOR
// TOMAR TRABAJO
// ======================================

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


    button.disabled = true;

    button.textContent =
        "Tomando...";


    try {

        /*
         * El frontend NO modifica directamente
         * operator_id ni status.
         *
         * Llama al RPC público:
         *
         * public.claim_job(uuid)
         *
         * que internamente ejecuta:
         *
         * private.claim_job(uuid)
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

            console.error(
                "claim_job:",
                error
            );

            throw error;

        }


        console.log(
            "Trabajo tomado:",
            data
        );


        alert(
            "¡Trabajo tomado correctamente!"
        );


        await loadOperatorJobs();


    } catch (error) {

        console.error(
            "Error tomando trabajo:",
            error
        );


        button.disabled = false;

        button.textContent =
            "Tomar trabajo";


        showError(
            error.message ||
            "No se pudo tomar el trabajo."
        );

    }

}


// ======================================
// ADMIN
// SOLICITUDES
// ======================================

adminRequestsBtn.addEventListener(
    "click",
    loadAdminRequests
);


async function loadAdminRequests() {

    adminData.innerHTML =
        "<p>Cargando solicitudes...</p>";


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

        console.error(error);

        adminData.innerHTML =
            "<p>No se pudieron cargar las solicitudes.</p>";

        return;

    }


    adminData.innerHTML = "";


    if (!data || data.length === 0) {

        adminData.innerHTML =
            "<p>No hay solicitudes.</p>";

        return;

    }


    data.forEach(request => {

        const item =
            document.createElement("div");

        item.className =
            "dashboard-item";


        item.innerHTML = `

            <h3>
                ${escapeHtml(
                    request.service_name ||
                    "Solicitud"
                )}
            </h3>

            <p>
                Cliente:
                ${escapeHtml(
                    request.client_id
                )}
            </p>

            <p>
                Estado:
                <strong>
                    ${escapeHtml(
                        request.status
                    )}
                </strong>
            </p>

            <p>
                Fecha:
                ${formatDate(
                    request.created_at
                )}
            </p>

        `;


        adminData.appendChild(item);

    });

}


// ======================================
// ADMIN
// TRABAJOS
// ======================================

adminJobsBtn.addEventListener(
    "click",
    loadAdminJobs
);


async function loadAdminJobs() {

    adminData.innerHTML =
        "<p>Cargando trabajos...</p>";


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

        console.error(error);

        adminData.innerHTML =
            "<p>No se pudieron cargar los trabajos.</p>";

        return;

    }


    adminData.innerHTML = "";


    if (!data || data.length === 0) {

        adminData.innerHTML =
            "<p>No hay trabajos.</p>";

        return;

    }


    data.forEach(job => {

        const item =
            document.createElement("div");

        item.className =
            "dashboard-item";


        item.innerHTML = `

            <h3>
                Trabajo
            </h3>

            <p>
                ID:
                ${escapeHtml(
                    job.id
                )}
            </p>

            <p>
                Estado:
                <strong>
                    ${escapeHtml(
                        job.status
                    )}
                </strong>
            </p>

            <p>
                Operador:
                ${escapeHtml(
                    job.operator_id ||
                    "Sin operador"
                )}
            </p>

            <p>
                Fecha:
                ${formatDate(
                    job.created_at
                )}
            </p>

        `;


        adminData.appendChild(item);

    });

}


// ======================================
// CAMBIO DE SESIÓN
// ======================================

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "Auth:",
            event
        );


        if (session?.user) {

            await loadCurrentUser();

        } else {

            resetInterface();

        }

    }
);


// ======================================
// INICIO
// ======================================

async function init() {

    console.log(
        "EZNWORK iniciando..."
    );


    resetInterface();


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

        return;

    }


    if (data.session?.user) {

        await loadCurrentUser();

    }


    console.log(
        "EZNWORK listo."
    );

}


init();
