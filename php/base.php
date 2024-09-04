<?php
// Ruta donde se guardan los archivoss importante que
// el user www-data tenga permisos para llegar hasta
// ese directorio y pueda escribir en él.
$ruta = "/home/priv";

class File {
    public function Upload($archivo, $id){
        global $ruta;

        $tmp_dir = $archivo["tmp_name"];
        $nombre = $archivo["name"];

        $nueva_ruta = "$ruta/$nombre";

        if(move_uploaded_file($tmp_dir, $nueva_ruta)){
            return ["OK",$id];
        }else{
            return ["Error al subir"];
        }
    }

    public function GetAll(){
        global $ruta;
        $names = [];

        $dh = opendir($ruta);

        while(($file = readdir($dh))){
            if($file != "." && $file != ".."){
                array_push($names, $file);
            }
        }

        closedir($dh);

        return $names;
    }

    public function getIMG($name, $id){
        global $ruta;
        $path = "$ruta/$name";

        $blob = getBlob($path);

        return [$id,$blob];
    }

}

function getBlob($file_path){
    $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

    if(!in_array($extension, ["jpg", "jpeg", "png"])){
        // Devolver imagenes por defecto con iconos para docs, JS, etc
        return;
    }

    $img_data = file_get_contents($file_path);
    $base64 = base64_encode($img_data);
    $mime = mime_content_type($file_path);

    return "data:$mime;base64,$base64";
}