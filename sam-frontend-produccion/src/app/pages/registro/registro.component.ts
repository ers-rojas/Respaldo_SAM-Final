import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  registroForm: FormGroup;  // ← Renombrado aquí

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({  // ← También renombrado aquí
      name: ['', Validators.required],
      institucion: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos requeridos correctamente.',
      });
      return;
    }
  
    const data = this.registroForm.value;
  
    if (data.password !== data.password_confirmation) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }
  
    this.authService.register(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada con éxito!',
          text: 'Ahora puedes iniciar sesión.',
          confirmButtonText: 'Continuar'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        // Con el backend modificado, el mensaje de error vendrá directamente en err.error.message
        const message = err.error?.message || 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.';
        Swal.fire({
          icon: 'error',
          title: 'Error de registro',
          text: message,
        });
      }
    });
  }
  

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
