<?php
// Ruta donde se guardan los archivoss importante que
// el user www-data tenga permisos para llegar hasta
// ese directorio y pueda escribir en él.
$root = "/home/priv";
$recycle = "/home/priv/.recycle_bin";

class File
{
    public function Upload($archivo, $id, $ruta)
    {
        global $root;

        $n_ruta = ($ruta == "/") ? $root : "$root$ruta";  // Cambiado quitado el / 

        $tmp_dir = $archivo["tmp_name"];
        $nombre = $archivo["name"];

        $nueva_ruta = "$n_ruta/$nombre";

        if (move_uploaded_file($tmp_dir, $nueva_ruta)) {
            $type = $this->get_type(mime_content_type($nueva_ruta));
            return ["OK", $id, $type];
        } else {
            return ["Error al subir", $id];
        }
    }
    public function GetAll($ruta)
    {
        global $root;
        $names = [];
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $dh = opendir($n_ruta);

        if ($dh == false) {
            return ["error", "Error al leer la carpeta"];
        }

        while (($file = readdir($dh))) {
            $oculto = str_starts_with($file, ".");
            if ($file != "." && $file != ".." && $oculto === false) {
                $tipo = (is_dir("$n_ruta/$file")) ? "folder" : ($this->get_type(mime_content_type("$n_ruta/$file")));

                array_push($names, [$tipo, $file]);
            }
        }
        closedir($dh);

        return $names;
    }
    public function rename($new_name, $old_name, $ruta)
    {
        global $root;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $old_path = "$n_ruta/$old_name";
        $new_path = "$n_ruta/$new_name";

        if (rename($old_path, $new_path)) {
            return "OK";
        } else {
            return "Error al renombrar";
        }
    }
    public function Delete($name, $ruta)
    {
        global $root, $recycle;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";
        $path = "$n_ruta/$name";

        // Crear la carpeta recycle_bin si no esta
        if (!is_dir($recycle)) {
            // Cambiamos el umask
            umask(0002);
            // Creamos la carpeta
            mkdir($recycle, 0770);
            // Devolvemos el umask
            umask(0);
        }

        if (rename($path, "$recycle/$name")) {
            return "OK";
        } else {
            return "Error deleting";
        }
    }
    public function delete_def($name, $ruta)
    {
        global $recycle;
        $path = "$recycle/$name";

        return $this->delTreeDir($path);

    }
    public function get_data($name, $ruta)
    {
        global $root;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $path = "$n_ruta/$name";

        // Obtener el blob
        $blob = getBlob($path);

        // Obtenemos los datos
        if (str_contains(mime_content_type($path), "image")) {
            $img_data = getimagesize($path);

            return [
                "src" => $blob,
                "width" => $img_data[0],
                "height" => $img_data[1]
            ];
        } else {
            return [
                "src" => $blob
            ];
        }
    }
    public function create_folder($folder_name, $ruta)
    {
        // Creamos el path
        global $root;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";
        $path = "$n_ruta/$folder_name";

        // Cambiamos el umask
        umask(0002);

        // Creamos la carpeta
        if (mkdir($path, 0770)) {
            umask(0);
            return "OK";
        } else {
            umask(0);
            return "Error al crear el directorio";
        }
    }
    private function delTreeDir($path)
    {
        if (!is_dir($path)) {
            if (unlink($path)) {
                return "OK";
            } else {
                return "Error al borrar archivo único";
            }
        }

        $items = scandir($path);
        foreach ($items as $file) {
            if ($file == "." || $file == "..") {
                continue; // Ignorar los directorios actuales y padres
            }
            $n_path = "$path/$file";

            if (is_dir($n_path)) {
                // Llamar recursivamente si es un subdirectorio
                $this->delTreeDir($n_path);
            } else {
                unlink($n_path);
            }
        }

        // Finalmente, eliminar el directorio vacío
        if (rmdir($path)) {
            return "OK";
        } else {
            return "Error al eliminar el directorio:";
        }
    }
    private function get_type($mime)
    {
        $type = "";
        switch (true) {
            case (str_contains($mime, "image")):
                $type = "image";
                break;
            case (str_contains($mime, "pdf")):
                $type = "pdf";
                break;
            case (str_contains($mime, "doc")):
                $type = "doc";
                break;
            case $mime == "text/plain":
                $type = "txt";
                break;
            default:
                $type = "default";
                break;
        }
        return $type;
    }
}

function getBlob($file_path)
{
    $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

    if (!in_array($extension, ["jpg", "jpeg", "png"])) {
        // Devolver imagenes por defecto con iconos para docs, JS, etc
        return;
    }

    $img_data = file_get_contents($file_path);
    $base64 = base64_encode($img_data);
    $mime = mime_content_type($file_path);

    return "data:$mime;base64,$base64";
}