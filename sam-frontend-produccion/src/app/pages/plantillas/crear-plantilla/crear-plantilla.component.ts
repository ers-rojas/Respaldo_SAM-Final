import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crear-plantilla',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EditorModule],
  templateUrl: './crear-plantilla.component.html',
  styleUrls: ['./crear-plantilla.component.scss']
})
export class CrearPlantillaComponent implements OnInit {
  titulo: string = '';
  contenido: string = '';

  editorInit = {
    base_url: '/tinymce',
    suffix: '.min',
    height: 400,
    menubar: true,
    branding: false,
    license_key: 'gpl', // ✅ Elimina advertencia y botón "Get all features"
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
             'bold italic backcolor | alignleft aligncenter ' +
             'alignright alignjustify | bullist numlist outdent indent | ' +
             'removeformat | help | image',
    automatic_uploads: true,
    image_title: true,
    file_picker_types: 'image',
    images_upload_url: `${environment.apiUrl}/api/upload-imagen`,
    images_upload_credentials: true,
    image_uploadtab: false,
    document_base_url: environment.apiUrl,
    relative_urls: false,
    convert_urls: false,
    file_picker_callback: (cb: any) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);

          fetch(`${environment.apiUrl}/api/upload-imagen`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          })
            .then(async response => {
              if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
              }
              const result = await response.json();
              cb(result.location, { title: file.name });
            })
            .catch(err => {
              console.error('❌ Error al subir imagen:', err);
              Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
            });
        }
      };
      input.click();
    }
  };

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  crearPlantilla(): void {
    if (!this.titulo.trim() || !this.contenido.trim()) {
      Swal.fire('Campos incompletos', 'Debes completar todos los campos.', 'warning');
      return;
    }

    const usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual') || '{}');
    const payload = {
      titulo: this.titulo,
      contenido: this.contenido,
      usuario: usuarioActual.email
    };

    this.api.guardarPlantilla(payload).subscribe({
      next: () => {
        Swal.fire('Plantilla creada', 'Se guardó correctamente.', 'success');
        this.router.navigate(['/plantillas']);
      },
      error: (err) => {
        console.error('Error al guardar plantilla:', err);
        Swal.fire('Error', 'No se pudo guardar la plantilla.', 'error');
      }
    });
  }
}
