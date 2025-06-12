import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '@app/services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-plantilla',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-plantilla.component.html',
  styleUrls: ['./ver-plantilla.component.scss']
})
export class VerPlantillaComponent implements OnInit {
  titulo: string = '';
  contenidoSeguro: SafeHtml = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.apiService.getPlantillaPorId(id).subscribe({
      next: (data) => {
        this.titulo = data.title;
        // Reemplazar la ruta relativa (con o sin / inicial) de las imágenes por la ruta absoluta del backend
        const contenidoConRutasAbsolutas = data.description.replace(/src="(\/)?storage\//g, `src="${environment.apiUrl}/storage/`);
        this.contenidoSeguro = this.sanitizer.bypassSecurityTrustHtml(contenidoConRutasAbsolutas);
      },
      error: (err) => {
        console.error('[Error] al cargar plantilla:', err);
        this.router.navigate(['/plantillas']);
      }
    });
  }
}
