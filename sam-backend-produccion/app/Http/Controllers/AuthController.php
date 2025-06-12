<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException; 

class AuthController extends Controller
{
    public function home()
    {
        return view('auth/home');
    }

    public function acceso()
    {
        return view("auth/login");
    }

    public function registro()
    {
        return view("auth/registro");
    }

    // Registro para web tradicional (con vistas) - SIN CAMBIOS
    public function registrar(Request $request)
    {
        $validacion = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'institucion' => 'max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password'
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El formato del correo electrónico es inválido.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos :min caracteres.',
            'password_confirmation.required' => 'La confirmación de contraseña es obligatoria.',
            'password_confirmation.same' => 'Las contraseñas deben coincidir.',
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser texto.',
            'name.max' => 'El nombre no debe contener más de :max caracteres.',
        ]);

        if ($validacion->fails()) {
            return redirect('registro')
                ->withErrors($validacion)
                ->withInput();
        }

        try {
            $item = new User();
            $item->name = $request->name;
            $item->institucion = $request->institucion;
            $item->email = $request->email;
            $item->password = Hash::make($request->password);
            $item->save();

            return to_route('login');
        } catch (\Exception $e) {
            return redirect('registro')->with('error', 'Ocurrió un error al registrar el usuario');
        }
    }

    
    // ===================================================================
    // FUNCIÓN MODIFICADA PARA LA API (USADO POR ANGULAR)
    // ===================================================================
    public function register(Request $request)
    {
        try {
            \Log::info('👉 Iniciando validación de datos para API');

            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'institucion' => 'nullable|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
            ], [
                // MENSAJES DE ERROR PERSONALIZADOS PARA LA API
                'email.unique' => 'El correo electrónico ya está registrado en el sistema.',
                'email.required' => 'El correo electrónico es obligatorio.',
                'email.email' => 'El formato del correo electrónico no es válido.',
                'password.required' => 'La contraseña es obligatoria.',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
                'name.required' => 'El nombre es obligatorio.',
            ]);

            \Log::info('✅ Validación completada para API');

            $user = User::create([
                'name' => $validatedData['name'],
                'institucion' => $validatedData['institucion'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
            ]);

            \Log::info('✅ Usuario creado con éxito desde API', ['id' => $user->id]);

            return response()->json([
                'message' => 'Usuario registrado correctamente',
                'user' => $user
            ], 201);

        } catch (ValidationException $e) {
            \Log::warning('❌ Error de validación al registrar usuario desde API.', ['errors' => $e->errors()]);
            
            // Obtenemos el PRIMER error de la lista para mostrarlo.
            $firstError = collect($e->errors())->first()[0];

            // Devolvemos el mensaje de error específico directamente.
            return response()->json([
                'message' => $firstError
            ], 422);

        } catch (\Exception $e) {
            \Log::error('❌ Error inesperado al registrar usuario desde API: ' . $e->getMessage());

            return response()->json([
                'message' => 'Ocurrió un error inesperado al registrar el usuario.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Login para interfaz web tradicional - SIN CAMBIOS
    public function acceder(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return redirect()->route('login')->with('error', 'Credenciales incorrectas');
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        session(['token' => $token]);

        Auth::login($user);

        return redirect()->route('gestionBd')->with('success', '¡Bienvenido ' . $user->name . '!');
    }

    // Login desde Angular (API con Sanctum) - SIN CAMBIOS
    public function login(Request $request)
    {
        \Log::info('👉 Intentando login vía API', $request->all());

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        \Log::info('✅ Validación completada');

        if (!Auth::attempt($request->only('email', 'password'))) {
            \Log::warning('❌ Falló Auth::attempt', [
                'email' => $request->email,
                'password' => $request->password
            ]);

            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 422);
        }

        $user = Auth::user();

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        \Log::info('🎉 Login exitoso para usuario: ' . $user->email);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // Logout - SIN CAMBIOS
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Token eliminado. Sesión cerrada correctamente.']);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Sesión cerrada correctamente');
    }
}