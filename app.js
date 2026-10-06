// ======================================
// EZNWORK
// Frontend
// ======================================

// IMPORTANTE:
// NO pongas aquí el service_role key.
// Solamente utilizaremos la clave pública de Supabase.

const SUPABASE_URL = "https://gjdzuhuhevyorupidyat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SLXF4C_-UviRH6iMNEBuRA_vKcXQ7Yo";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ======================================
// ELEMENTOS
// ======================================

const modal = document.getElementById("authModal");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const heroRegister = document.getElementById("heroRegister");
const ctaRegister = document.getElementById("ctaRegister");

const closeModal = document.getElementById("closeModal");

const authForm = document.getElementById("authForm");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const switchAuth = document.getElementById("switchAuth");
const authMessage = document.getElementById("authMessage");

let registerMode = false;


// ======================================
// MODAL
// ======================================

function openLogin() {

    registerMode = false;

    authTitle.textContent = "Iniciar sesión";
    authSubtitle.textContent =
        "Entra a tu cuenta de EZNWORK.";

    nameInput.classList.add("hidden");
    nameInput.required = false;

    switchAuth.textContent =
        "¿No tienes cuenta? Registrarse";

    authMessage.textContent = "";

    modal.classList.add("active");
}


function openRegister() {

    registerMode = true;

    authTitle.textContent = "Crear cuenta";
    authSubtitle.textContent =
        "Únete a EZNWORK.";

    nameInput.classList.remove("hidden");
    nameInput.required = true;

    switchAuth.textContent =
        "¿Ya tienes cuenta? Iniciar sesión";

    authMessage.textContent = "";

    modal.classList.add("active");
}


function closeAuthModal() {

    modal.classList.remove("active");

    authForm.reset();

    authMessage.textContent = "";
}


loginBtn.addEventListener("click", openLogin);

registerBtn.addEventListener("click", openRegister);

heroRegister.addEventListener("click", openRegister);

ctaRegister.addEventListener("click", openRegister);

closeModal.addEventListener("click", closeAuthModal);

switchAuth.addEventListener("click", () => {

    if (registerMode) {
        openLogin();
    } else {
        openRegister();
    }

});


modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        closeAuthModal();
    }

});


// ======================================
// AUTENTICACIÓN SUPABASE
// ======================================

authForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const name = nameInput.value.trim();

    authMessage.textContent = "Procesando...";

    try {

        if (registerMode) {

            const { data, error } =
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

            authMessage.textContent =
                "Cuenta creada. Revisa tu correo si Supabase solicita confirmación.";

        } else {

            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                throw error;
            }

            authMessage.textContent =
                "Sesión iniciada.";

            await loadUserPanel();

        }

    } catch (error) {

        console.error(error);

        authMessage.textContent =
            error.message || "Ocurrió un error.";

    }

});


// ======================================
// USUARIO ACTUAL
// ======================================

async function getCurrentUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}


// ======================================
// CARGAR ROL
// ======================================

async function loadUserPanel() {

    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("id, role, full_name")
            .eq("id", user.id)
            .single();

    if (error) {

        console.error(error);

        authMessage.textContent =
            "No se pudo cargar tu perfil.";

        return;
    }

    console.log("Usuario:", profile);

    closeAuthModal();

    showRoleWelcome(profile);

}


// ======================================
// BIENVENIDA SEGÚN ROL
// ======================================

function showRoleWelcome(profile) {

    let message = "";

    if (profile.role === "admin") {

        message =
            "🛡️ Bienvenido al panel de administración.";

    } else if (profile.role === "operator") {

        message =
            "👷 Bienvenido, operador. Hay trabajos esperándote.";

    } else {

        message =
            "👤 Bienvenido a EZNWORK.";

    }

    console.log(message);

}


// ======================================
// DETECTAR SESIÓN AL ABRIR LA PÁGINA
// ======================================

async function checkSession() {

    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    console.log(
        "Sesión activa:",
        user.email
    );

    await loadUserPanel();

}


checkSession();
