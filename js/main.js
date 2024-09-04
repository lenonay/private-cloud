const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ELEMENTS
const input = document.querySelector("#archivos_inp");
const upload_btn = document.querySelector(".upload");
const viewer = document.querySelector(".viewer");
const gear = $(".gear");

// EVENTS
upload_btn.addEventListener("click", e => {
    input.click();
});

input.addEventListener("change", e => {
    e.preventDefault();
    const archivos = e.target.files;
    cargarArhivos(archivos);
});

viewer.addEventListener("dragover", e => {
    e.preventDefault();
    viewer.classList.add("drag");
});

viewer.addEventListener("dragleave", e => {
    e.preventDefault();
    viewer.classList.remove("drag");
});

viewer.addEventListener("drop", e => {
    e.preventDefault();
    viewer.classList.remove("drag");
    const archivos = e.dataTransfer.files;
    cargarArhivos(archivos);
});

gear.addEventListener("click", GetAllInfo);


// FUNCIONES
// Cargar por primera vez todas las fotos
GetAllInfo();


function cargarArhivos(files) {
    for (const file of files) {
        procesarArchivo(file);
    }
}

function procesarArchivo(file) {
    const name = file.name;
    const url = URL.createObjectURL(file);
    const id = Math.random().toString(32).replace(/0\./, "up-");

    const card = genCard(name, url, id);

    viewer.insertAdjacentHTML("afterbegin", card);

    URL.revokeObjectURL(url);

    // Mandarla al servidor
    UploadFile(file, id)

    // Obtenemos los botones de cada accion
    const article = document.querySelector(`#${id}`);
    const rename = article.querySelector(".rename");
    const share = article.querySelector(".share");
    const del = article.querySelector(".delete");

    // Preparamos los eventos
    rename.addEventListener("click", () => RenameFile(name));
    share.addEventListener("click", () => ShareFile(name));
    del.addEventListener("click", () => DeleteFile(name));
}

function UploadFile(file, id) {
    const form = new FormData;

    form.append("arg", "upload");

    form.append("archivo", file);
    form.append("id", id);

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        console.log(data);
    });
}

function GetAllInfo() {
    const form = new FormData;

    form.append("arg", "getAll");

    fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(data => {
        processData(data);
    });
}

function processData(names_array) {

    viewer.innerHTML = "";

    names_array.forEach(file => {

        const id = Math.random().toString(32).replace(/0\./, "f-");
        const card = genCard(file, "images/tmp.jpg", id);

        // Añadimos la card al html
        viewer.insertAdjacentHTML("afterbegin", card);

        const form = new FormData;
        
        form.append("arg", "getIMG");
        form.append("name", file);
        form.append("id", id);

        fetch("php/files.php",{
            method: "POST",
            body: form
        }).then(response =>{
            if(response.ok){
                return response.json();
            }
        }).then(data =>{
            assignIMG(data[0], data[1]);
        });
    });
}

function assignIMG(id, blob){
    const img = document.querySelector(`#${id} > img`);
    
    img.src= blob;
}

function RenameFile(nombre) { alert(`Rename ${nombre}`) }
function ShareFile(nombre) { alert(`Share ${nombre}`) }
function DeleteFile(nombre) { alert(`Delete ${nombre}`) }

function genCard(nombre, image_url, id) {
    const card = `
        <article class="card" id="${id}">
            <img src="${image_url}">
            <h2>${nombre}</h2>
            <div class="botones">
                <button type="button" class="rename">
                    <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#90f6d7"
                            stroke-width="1.2"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                                stroke="#35bcbf" stroke-width="1.5"></path>
                            <path opacity="0.5"
                                d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                                stroke="#35bcbf" stroke-width="1.5"></path>
                        </g>
                    </svg>
                </button>
                <button type="button" class="share">
                    <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M9 11.5C9 12.8807 7.88071 14 6.5 14C5.11929 14 4 12.8807 4 11.5C4 10.1193 5.11929 9 6.5 9C7.88071 9 9 10.1193 9 11.5Z"
                                stroke="#35bcbf" stroke-width="1.5"></path>
                            <path opacity="0.5" d="M14.3206 16.8017L9 13.29" stroke="#35bcbf" stroke-width="1.5"
                                stroke-linecap="round"></path>
                            <path opacity="0.5" d="M14.4207 6.83984L9.1001 10.3515" stroke="#35bcbf" stroke-width="1.5"
                                stroke-linecap="round"></path>
                            <path
                                d="M19 18.5C19 19.8807 17.8807 21 16.5 21C15.1193 21 14 19.8807 14 18.5C14 17.1193 15.1193 16 16.5 16C17.8807 16 19 17.1193 19 18.5Z"
                                stroke="#35bcbf" stroke-width="1.5"></path>
                            <path
                                d="M19 5.5C19 6.88071 17.8807 8 16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5Z"
                                stroke="#35bcbf" stroke-width="1.5"></path>
                        </g>
                    </svg>
                </button>
                <button type="button" class="delete">
                    <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M5.50506 11.4096L6.03539 11.9399L5.50506 11.4096ZM3 14.9522H2.25H3ZM9.04776 21V21.75V21ZM11.4096 5.50506L10.8792 4.97473L11.4096 5.50506ZM17.9646 12.0601L12.0601 17.9646L13.1208 19.0253L19.0253 13.1208L17.9646 12.0601ZM6.03539 11.9399L11.9399 6.03539L10.8792 4.97473L4.97473 10.8792L6.03539 11.9399ZM6.03539 17.9646C5.18538 17.1146 4.60235 16.5293 4.22253 16.0315C3.85592 15.551 3.75 15.2411 3.75 14.9522H2.25C2.25 15.701 2.56159 16.3274 3.03 16.9414C3.48521 17.538 4.1547 18.2052 4.97473 19.0253L6.03539 17.9646ZM4.97473 10.8792C4.1547 11.6993 3.48521 12.3665 3.03 12.9631C2.56159 13.577 2.25 14.2035 2.25 14.9522H3.75C3.75 14.6633 3.85592 14.3535 4.22253 13.873C4.60235 13.3752 5.18538 12.7899 6.03539 11.9399L4.97473 10.8792ZM12.0601 17.9646C11.2101 18.8146 10.6248 19.3977 10.127 19.7775C9.64651 20.1441 9.33665 20.25 9.04776 20.25V21.75C9.79649 21.75 10.423 21.4384 11.0369 20.97C11.6335 20.5148 12.3008 19.8453 13.1208 19.0253L12.0601 17.9646ZM4.97473 19.0253C5.79476 19.8453 6.46201 20.5148 7.05863 20.97C7.67256 21.4384 8.29902 21.75 9.04776 21.75V20.25C8.75886 20.25 8.449 20.1441 7.9685 19.7775C7.47069 19.3977 6.88541 18.8146 6.03539 17.9646L4.97473 19.0253ZM17.9646 6.03539C18.8146 6.88541 19.3977 7.47069 19.7775 7.9685C20.1441 8.449 20.25 8.75886 20.25 9.04776H21.75C21.75 8.29902 21.4384 7.67256 20.97 7.05863C20.5148 6.46201 19.8453 5.79476 19.0253 4.97473L17.9646 6.03539ZM19.0253 13.1208C19.8453 12.3008 20.5148 11.6335 20.97 11.0369C21.4384 10.423 21.75 9.79649 21.75 9.04776H20.25C20.25 9.33665 20.1441 9.64651 19.7775 10.127C19.3977 10.6248 18.8146 11.2101 17.9646 12.0601L19.0253 13.1208ZM19.0253 4.97473C18.2052 4.1547 17.538 3.48521 16.9414 3.03C16.3274 2.56159 15.701 2.25 14.9522 2.25V3.75C15.2411 3.75 15.551 3.85592 16.0315 4.22253C16.5293 4.60235 17.1146 5.18538 17.9646 6.03539L19.0253 4.97473ZM11.9399 6.03539C12.7899 5.18538 13.3752 4.60235 13.873 4.22253C14.3535 3.85592 14.6633 3.75 14.9522 3.75V2.25C14.2035 2.25 13.577 2.56159 12.9631 3.03C12.3665 3.48521 11.6993 4.1547 10.8792 4.97473L11.9399 6.03539Z"
                                fill="#35bcbf"></path>
                            <path opacity="0.5"
                                d="M13.2411 17.8444C13.534 18.1372 14.0089 18.1372 14.3018 17.8444C14.5946 17.5515 14.5946 17.0766 14.3018 16.7837L13.2411 17.8444ZM7.21637 9.69831C6.92347 9.40541 6.4486 9.40541 6.15571 9.69831C5.86281 9.9912 5.86281 10.4661 6.15571 10.759L7.21637 9.69831ZM14.3018 16.7837L7.21637 9.69831L6.15571 10.759L13.2411 17.8444L14.3018 16.7837Z"
                                fill="#35bcbf"></path>
                            <path opacity="0.5" d="M9 21H21" stroke="#35bcbf" stroke-width="1.5" stroke-linecap="round">
                            </path>
                        </g>
                    </svg>
                </button>
            </div>
        </article>    
    `;

    return card;
}