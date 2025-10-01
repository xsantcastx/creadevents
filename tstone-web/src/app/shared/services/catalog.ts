import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Calibre,
  CartItem,
  GalleryItem,
  Product,
  ProductLine,
  TechnicalSheet
} from '../../shared/models/catalog';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly productLines: ProductLine[] = [
    {
      slug: 'onyx-mediterraneo',
      nombre: '?nix Mediterr?neo',
      calibre: '10',
      descripcion: 'Transparencias c?lidas con vetas doradas para espacios luminosos.',
      foto: 'assets/images/lineas/onyx-mediterraneo.jpg'
    },
    {
      slug: 'Marmol-alba',
      nombre: 'M?rmol Alba',
      calibre: '10',
      descripcion: 'Base marfil con vetas gris perla que aportan serenidad a cada ambiente.',
      foto: 'assets/images/lineas/Marmol-alba.jpg'
    },
    {
      slug: 'travertino-costa',
      nombre: 'Travertino Costa',
      calibre: '10',
      descripcion: 'Textura porosa suavizada para paredes con efecto artesanal.',
      foto: 'assets/images/lineas/travertino-costa.jpg'
    },
    {
      slug: 'basalto-brisa',
      nombre: 'Basalto Brisa',
      calibre: '10',
      descripcion: 'Tonalidades ceniza con acabado satinado en piezas ultrarresistentes.',
      foto: 'assets/images/lineas/basalto-brisa.jpg'
    },
    {
      slug: 'cuarzo-luz',
      nombre: 'Cuarzo Luz',
      calibre: '10',
      descripcion: 'Cristalizaciones suaves que reflejan la luz natural.',
      foto: 'assets/images/lineas/cuarzo-luz.jpg'
    },
    {
      slug: 'caliza-arenal',
      nombre: 'Caliza Arenal',
      calibre: '10',
      descripcion: 'Grano fino y tonos arena para combinaciones mediterr?neas.',
      foto: 'assets/images/lineas/caliza-arenal.jpg'
    },
    {
      slug: 'pizarra-aurora',
      nombre: 'Pizarra Aurora',
      calibre: '10',
      descripcion: 'L?minas oscuras con reflejos cobrizos para contrastes de lujo.',
      foto: 'assets/images/lineas/pizarra-aurora.jpg'
    },
    {
      slug: 'jaspe-ivory',
      nombre: 'Jaspe Ivory',
      calibre: '10',
      descripcion: 'Ondulaciones beige con vetas suaves para ambientes relajados.',
      foto: 'assets/images/lineas/jaspe-ivory.jpg'
    },
    {
      slug: 'terra-rossa',
      nombre: 'Terra Rossa',
      calibre: '10',
      descripcion: 'Arcilla rojiza con matices oxidados inspirados en la cer?mica cl?sica.',
      foto: 'assets/images/lineas/terra-rossa.jpg'
    },
    {
      slug: 'perla-selva',
      nombre: 'Perla Selva',
      calibre: '10',
      descripcion: 'Verde gris?ceo con vetas org?nicas y suaves destellos nacarados.',
      foto: 'assets/images/lineas/perla-selva.jpg'
    },
    {
      slug: 'lasa-nevado',
      nombre: 'Lasa Nevado',
      calibre: '10',
      descripcion: 'Blanco puro con vetas delicadas para espacios minimalistas.',
      foto: 'assets/images/lineas/lasa-nevado.jpg'
    },
    {
      slug: 'ardesia-dune',
      nombre: 'Ardesia Dune',
      calibre: '10',
      descripcion: 'Superficie ligeramente ondulada con acabado satinado.',
      foto: 'assets/images/lineas/ardesia-dune.jpg'
    },
    {
      slug: 'granito-castello',
      nombre: 'Granito Castell?',
      calibre: '12',
      descripcion: 'Granulometr?a fina y matices grises para proyectos de alto tr?nsito.',
      foto: 'assets/images/lineas/granito-castello.jpg'
    },
    {
      slug: 'basalto-nocturno',
      nombre: 'Basalto Nocturno',
      calibre: '12',
      descripcion: 'Acabado mate en negro profundo con vetas grafito.',
      foto: 'assets/images/lineas/basalto-nocturno.jpg'
    },
    {
      slug: 'dolomita-sahara',
      nombre: 'Dolomita Sahara',
      calibre: '12',
      descripcion: 'Tonaltidades arena con delicados reflejos dorados.',
      foto: 'assets/images/lineas/dolomita-sahara.jpg'
    },
    {
      slug: 'Marmol-aurum',
      nombre: 'M?rmol Aurum',
      calibre: '12',
      descripcion: 'Vetas doradas sobre fondo crema para proyectos premium.',
      foto: 'assets/images/lineas/Marmol-aurum.jpg'
    },
    {
      slug: 'onyx-iberico',
      nombre: '?nix Ib?rico',
      calibre: '12',
      descripcion: 'Capas trasl?cidas que potencian la iluminaci?n indirecta.',
      foto: 'assets/images/lineas/onyx-iberico.jpg'
    },
    {
      slug: 'cuarcita-alba',
      nombre: 'Cuarcita Alba',
      calibre: '12',
      descripcion: 'Alta resistencia con textura satinada y vetas blancas.',
      foto: 'assets/images/lineas/cuarcita-alba.jpg'
    },
    {
      slug: 'ardesia-graphite',
      nombre: 'Ardesia Graphite',
      calibre: '12',
      descripcion: 'Tonos grafito con sutiles destellos met?licos.',
      foto: 'assets/images/lineas/ardesia-graphite.jpg'
    },
    {
      slug: 'cemento-luna',
      nombre: 'Cemento Luna',
      calibre: '12',
      descripcion: 'Est?tica contempor?nea con matices c?lidos.',
      foto: 'assets/images/lineas/cemento-luna.jpg'
    },
    {
      slug: 'gneis-roca',
      nombre: 'Gneis Roca',
      calibre: '12',
      descripcion: 'Vetas diagonales en grises intensos para fachadas y suelos.',
      foto: 'assets/images/lineas/gneis-roca.jpg'
    }
  ];

  private readonly products: Product[] = [
    {
      id: 'onyx-mediterraneo-01',
      nombre: '?nix Mediterr?neo Pulido',
      linea: 'onyx-mediterraneo',
      calibre: '10',
      material: '?nix',
      descripcion: 'Pieza pulida con velo transl?cido ideal para paneles retroiluminados.',
      acabados: ['Pulido espejo', 'Mate suave'],
      formatos: ['60x120 cm', '30x90 cm'],
      colorPrincipal: '#e9d9c6',
      imagen: 'assets/images/productos/onyx-mediterraneo-pulido.jpg',
      fichaTecnica: 'assets/fichas/onyx-mediterraneo.pdf',
      destacado: true
    },
    {
      id: 'onyx-mediterraneo-02',
      nombre: '?nix Mediterr?neo Satinado',
      linea: 'onyx-mediterraneo',
      calibre: '10',
      material: '?nix',
      descripcion: 'Acabado satinado para paredes principales y cabeceros.',
      acabados: ['Satinado'],
      formatos: ['45x90 cm'],
      colorPrincipal: '#e2c8a8',
      imagen: 'assets/images/productos/onyx-mediterraneo-satinado.jpg',
      fichaTecnica: 'assets/fichas/onyx-mediterraneo.pdf'
    },
    {
      id: 'Marmol-alba-01',
      nombre: 'M?rmol Alba Cl?sico',
      linea: 'Marmol-alba',
      calibre: '10',
      material: 'M?rmol',
      descripcion: 'Superficie cremosa con vetas perladas para ba?os y spas.',
      acabados: ['Pulido', 'Antideslizante'],
      formatos: ['60x60 cm', '30x60 cm'],
      colorPrincipal: '#f3ece4',
      imagen: 'assets/images/productos/Marmol-alba-clasico.jpg',
      fichaTecnica: 'assets/fichas/Marmol-alba.pdf'
    },
    {
      id: 'granito-castello-01',
      nombre: 'Granito Castell? Flameado',
      linea: 'granito-castello',
      calibre: '12',
      material: 'Granito',
      descripcion: 'Tratamiento flameado para ?reas exteriores con alto tr?nsito.',
      acabados: ['Flameado', 'Cepillado'],
      formatos: ['80x80 cm', '40x80 cm'],
      colorPrincipal: '#8f8c87',
      imagen: 'assets/images/productos/granito-castello-flameado.jpg',
      fichaTecnica: 'assets/fichas/granito-castello.pdf'
    },
    {
      id: 'basalto-nocturno-01',
      nombre: 'Basalto Nocturno Microtexturizado',
      linea: 'basalto-nocturno',
      calibre: '12',
      material: 'Basalto',
      descripcion: 'Superficie antideslizante para zonas h?medas contempor?neas.',
      acabados: ['Microtexturizado'],
      formatos: ['60x120 cm'],
      colorPrincipal: '#2d2b2a',
      imagen: 'assets/images/productos/basalto-nocturno.jpg',
      fichaTecnica: 'assets/fichas/basalto-nocturno.pdf'
    }
  ];

  private readonly technicalSheets: TechnicalSheet[] = [
    {
      linea: 'onyx-mediterraneo',
      calibre: '10',
      titulo: '?nix Mediterr?neo - Calibre 10 mm',
      descripcion: 'Ideal para revestimientos interiores con iluminaci?n focal.',
      propiedades: [
        { etiqueta: 'Absorci?n de agua', valor: '0.2 %' },
        { etiqueta: 'Resistencia a la flexi?n', valor: '40 MPa' },
        { etiqueta: 'Acabados', valor: 'Pulido, satinado' }
      ],
      enlaceDescarga: 'assets/fichas/onyx-mediterraneo.pdf'
    },
    {
      linea: 'granito-castello',
      calibre: '12',
      titulo: 'Granito Castell? - Calibre 12 mm',
      descripcion: 'Desarrollado para pavimentos p?blicos y fachadas ventiladas.',
      propiedades: [
        { etiqueta: 'Resistencia a la abrasi?n', valor: 'Clase 5' },
        { etiqueta: 'Carga de rotura', valor: '55 kN' },
        { etiqueta: 'Coeficiente de fricci?n', valor: 'R11' }
      ],
      enlaceDescarga: 'assets/fichas/granito-castello.pdf'
    }
  ];

  private readonly gallery: GalleryItem[] = [
    {
      id: 'galeria-01',
      titulo: 'Residencia Litoral',
      ubicacion: 'Benic?ssim, Castell?n',
      descripcion: 'Revestimiento integral de sal?n y terraza con ?nix Mediterr?neo.',
      materiales: ['?nix Mediterr?neo Pulido', 'M?rmol Alba'],
      imagen: 'assets/images/galeria/residencia-litoral.jpg'
    },
    {
      id: 'galeria-02',
      titulo: 'Hotel Mirador',
      ubicacion: 'Castell?n de la Plana',
      descripcion: 'Lobby con piezas de Granito Castell? y detalles en Basalto Nocturno.',
      materiales: ['Granito Castell?', 'Basalto Nocturno'],
      imagen: 'assets/images/galeria/hotel-mirador.jpg'
    },
    {
      id: 'galeria-03',
      titulo: 'Oficinas Horizonte',
      ubicacion: 'Valencia',
      descripcion: 'Suelos corporativos con Cemento Luna y paneles de Cuarzo Luz.',
      materiales: ['Cemento Luna', 'Cuarzo Luz'],
      imagen: 'assets/images/galeria/oficinas-horizonte.jpg'
    }
  ];

  getProductLines(calibre: Calibre): Observable<ProductLine[]> {
    return of(this.productLines.filter((line) => line.calibre === calibre));
  }

  getProductsByLine(slug: string): Observable<Product[]> {
    return of(this.products.filter((product) => product.linea === slug));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return of(this.products.filter((product) => product.destacado));
  }

  getTechnicalSheets(): Observable<TechnicalSheet[]> {
    return of(this.technicalSheets);
  }

  getGallery(): Observable<GalleryItem[]> {
    return of(this.gallery);
  }
}
