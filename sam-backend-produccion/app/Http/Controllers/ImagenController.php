<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ImagenController extends Controller
{
    public function subir(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No se subió ninguna imagen.'], 400);
        }

        // Validar imagen
        $request->validate([
            'file' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        // ➜ Guarda en storage/app/public/imagenes
        $path = $request->file('file')->store('imagenes', 'public');

        // ➜ URL absoluta basada en APP_URL
        $base = rtrim(config('app.url'), '/');          
        $url  = $base.'/storage/'.$path;

        return response()->json(['location' => $url]);
    }
}