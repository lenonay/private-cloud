let ruta = "";
let file_name = "";

export class FileManager {

    static async Load(event, route) {
        // Asignamos la ruta en el contexto global
        ruta = route;

        // Asignamos el nombre del archivo
        file_name = event.target.textContent;

        // Enviamos la petición al servidor
        const res = await RequestImgData();
        
        // Devolvemos la respuesta
        return res;
    }
}

async function RequestImgData() {

    // Validamos si podemos enviar los datos
    if (ruta === "" || file_name === "") {
        return {
            status: "error",
            message: "Falta el archivo o la ruta"
        }
    }

    // Preparamos el body con los datos
    const form = new FormData;

    form.append("arg", "get_data");
    form.append("name", file_name);
    form.append("ruta", ruta);

    // Enviamos la request
    const response = await fetch("php/files.php", {
        method: "POST",
        body: form
    }).then(response => {
        if (response.ok) { 
            return response.json() 
        }
    });
    
    return {
        status: "OK",
        data: response
    }
}