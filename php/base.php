<?php
// Ruta donde se guardan los archivoss importante que
// el user www-data tenga permisos para llegar hasta
// ese directorio y pueda escribir en él.
$root = "/home/priv";

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
            return ["Error al subir"];
        }
    }

    public function GetAll($ruta)
    {
        global $root;
        $names = [];
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $dh = opendir($n_ruta);

        if($dh == false){
            return ["error", "Error al leer la carpeta"];
        }

        while (($file = readdir($dh))) {
            if ($file != "." && $file != "..") {
                $tipo = (is_dir("$n_ruta/$file")) ? "folder" : ($this->get_type(mime_content_type("$n_ruta/$file")));

                array_push($names, [$tipo, $file]);
            }
        }
        closedir($dh);

        return $names;
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

    public function rename($new_name, $old_name , $ruta)
    {
        global $root;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $old_path = "$n_ruta/$old_name";
        $new_path = "$n_ruta/$new_name";

        if(rename($old_path, $new_path)){
            return "OK";
        }else{
            return "Error al renombrar";
        }
    }

    public function getIMG($name, $id, $ruta)
    {
        global $root;
        $n_ruta = ($ruta == "/") ? $root : "$root/$ruta";

        $path = "$n_ruta/$name";

        $blob = getBlob($path);

        return [$id, $blob];
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