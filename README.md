# Portafolio Cinemático — Luis Vidal

Portafolio profesional de Luis Vidal (producción de TV, marketing digital y
periodismo). Sitio estático en HTML + CSS + JavaScript vanilla, con GSAP 3
(ScrollTrigger, Flip, ScrollToPlugin) y Howler.js para el sonido.
**Sin build step y sin frameworks**: los archivos se sirven tal cual.

## Estructura del proyecto

```
/
├── index.html        # Estructura y contenido base (respaldo estático)
├── styles.css        # Estilos (paleta, tokens, responsive, accesibilidad)
├── main.js           # Animaciones GSAP, sonido y carga de contenido
├── data/site.json    # ← CONTENIDO EDITABLE (textos, galería, redes)
├── README.md         # Este archivo
├── .gitignore
└── .nojekyll
```

## Cómo editar el contenido

Todo el texto editable vive en **`data/site.json`**. El sitio lo carga al abrir
y reemplaza el contenido. Si el JSON tiene un error, el sitio muestra el
contenido base de `index.html` (nunca queda en blanco).

1. En GitHub, abre `data/site.json`.
2. Pulsa el lápiz ✏️ (Edit).
3. Cambia **solo el texto entre comillas**. No borres llaves `{ }`, corchetes
   `[ ]`, comas ni los nombres de los campos.
4. Valida antes de guardar (ver más abajo).
5. Pulsa **Commit changes**.

### Ejemplo: cambiar el nombre y el subtítulo

Antes:

```json
"hero": {
  "name": "LUIS VIDAL",
  "subtitle": "Productor de TV",
  ...
}
```

Después:

```json
"hero": {
  "name": "Luis Vidal García",
  "subtitle": "Productor y Creador de Contenido",
  ...
}
```

### Ejemplo: cambiar un proyecto de la galería

Cada obra es un objeto dentro de `"gallery"`. Para editar la primera:

```json
{
  "title": "Serie Documental — \"Raíces Digitales\"",
  "description": "Documental interactivo que exploró la intersección entre cultura y tecnología",
  "image": "",
  "alt": ""
}
```

- `title` y `description`: los textos que se ven.
- `image`: ruta de una imagen (p. ej. `"assets/raices.jpg"`); déjalo `""` si no hay.
- `alt`: texto alternativo (accesibilidad); si lo dejas vacío, se usa el `title`.

## Validar el JSON antes de guardar

Un JSON mal formado (una coma de más, una comilla sin cerrar) no se cargará.
Copia todo el contenido y pégalo en **https://jsonlint.com**: si responde
*Valid JSON*, guarda; si marca error, corrígelo antes.

## Ver el cambio

GitHub Pages reconstruye el sitio en **~1 minuto**. Recarga la página con
**Ctrl + F5** (recarga sin caché).

## Revertir un cambio

En GitHub, abre `data/site.json` → **History** → elige la versión anterior →
copia el contenido correcto, o usa **Revert** en el commit que rompió algo.

## Probar en local (desarrollo)

El `fetch` de `data/site.json` **no** funciona abriendo `index.html` con doble
clic (restricción CORS de `file://`). Usa un servidor estático local:

```bash
python -m http.server 8000
# o: npx http-server -p 8000
```

Luego abre `http://localhost:8000`.

## Publicar en GitHub Pages

*Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` →
Save*. La URL pública aparece en esa misma pantalla.

## Notas técnicas

- La paleta y los tokens de color están en `styles.css` (no cambiar salvo rediseño).
- `data/site.json` es la **fuente** del contenido; `index.html` es el respaldo.
- El contenido dinámico requiere JavaScript (decisión del proyecto).
