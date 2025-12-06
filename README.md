# Auditoria IA - Sistema de Evaluación de Seguridad

**Auditoria IA** es una plataforma web inteligente diseñada para analizar, auditar y puntuar Planes de Seguridad Informática automáticamente. Utilizando **Inteligencia Artificial Generativa (Google Gemini)** y almacenamiento en la nube (**Supabase**), el sistema simula el juicio de un experto en ciberseguridad bajo normativas ISO 27001 y NIST.

---

## 1. Definición y Objetivos

*   **Objetivo Principal:** Automatizar la revisión de documentos técnicos de seguridad, reduciendo el tiempo de auditoría de horas a segundos.
*   **Innovación:** Implementación de un modelo de lenguaje (LLM) con capacidad de razonamiento contextual (Modo Universitario vs. Modo Empresarial).
*   **Relevancia:** Democratiza el acceso a consultoría de seguridad de alto nivel para estudiantes y pequeñas empresas.

---

## 2. Materiales y Stack Tecnológico

El proyecto se construye sobre una arquitectura 100% Serverless y en la nube.

| Componente | Tecnología | Función | Coste |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Interfaz de usuario interactiva | Open Source |
| **Build Tool** | Vite | Empaquetado y servidor de desarrollo | Open Source |
| **Estilos** | Tailwind CSS | Diseño responsivo y moderno | Open Source |
| **Modelo ML/IA** | Google Gemini 2.5 Flash | Motor de análisis (Transformer Architecture) | Free Tier |
| **Base de Datos** | Supabase (PostgreSQL) | Almacenamiento persistente de historiales | Free Tier |
| **Visualización** | Recharts | Gráficos estadísticos de cumplimiento | Open Source |

---

## 3. Desarrollo del Modelo de IA (Machine Learning)

Este proyecto utiliza el estado del arte en Procesamiento de Lenguaje Natural (NLP). A continuación se detalla el cumplimiento técnico:

### A. Preparación de Datos (Data Preprocessing)
*   **Limpieza:** Los archivos PDF crudos son convertidos a cadenas Base64 y el texto manual es sanitizado.
*   **Estructuración:** Los datos no estructurados (texto del plan) se inyectan en una estructura JSON estricta para que el modelo pueda procesarlos.

### B. Selección del Modelo
Se ha seleccionado **Gemini 2.5 Flash** sobre otras arquitecturas (como Random Forest o RNNs) por las siguientes razones técnicas:
*   **Arquitectura:** Transformer Multimodal (capaz de entender texto e imágenes/PDFs).
*   **Ventana de Contexto:** 1 Millón de tokens, lo que permite analizar documentos de seguridad extensos (50+ páginas) sin perder información, algo imposible para modelos predictivos tradicionales.
*   **Capacidad de Razonamiento:** El modelo no solo predice palabras, sino que infiere riesgos basándose en lógica deductiva.

### C. Entrenamiento y Ajuste (In-Context Learning)
En lugar de un entrenamiento tradicional (backpropagation), se utiliza **Few-Shot Prompting** y **Context Injection**:
*   **Datos Históricos/Entrenamiento:** El conocimiento "histórico" proviene de las normativas **ISO 27001** y **NIST** inyectadas en el *System Prompt*.
*   **Ajuste de Hiperparámetros:**
    *   `Temperature = 0.2`: Se ajustó este valor para reducir la "creatividad" del modelo y forzar respuestas deterministas y rigurosas, esenciales en una auditoría.
    *   `ResponseSchema`: Se fuerza una topología de salida JSON para asegurar consistencia en los datos.

---

## 4. Base de Datos (Estructura)

El sistema cumple con el almacenamiento estructurado utilizando una tabla relacional en PostgreSQL (Supabase):

**Tabla:** `audits`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único de la auditoría |
| `created_at` | Timestamp | Fecha y hora exacta del análisis |
| `file_name` | Text | Nombre del archivo analizado |
| `context` | Text | Tipo de auditoría (university/enterprise) |
| `report` | JSONB | El informe completo generado por la IA |

---

## 5. Guía de Instalación y Uso

### Requisitos Previos
*   Node.js v18+ instalado.
*   Cuenta en Google Cloud (para API Key).
*   Cuenta en Supabase (para Base de Datos).

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/auditoria-ia.git
    cd auditoria-ia
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz con tus credenciales:
    ```env
    API_KEY=tu_api_key_de_gemini
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_KEY=tu_anon_key_de_supabase
    ```

4.  **Ejecutar:**
    ```bash
    npm run dev
    ```

### Manual de Usuario Rápido
1.  **Seleccionar Contexto:** Elige entre "Proyecto Universitario" o "Auditoría Empresarial" en la pantalla de inicio.
2.  **Subir Archivo:** Arrastra tu PDF al área central o escribe el plan manualmente.
3.  **Analizar:** Haz clic en "Auditar". Espera unos segundos mientras la IA procesa.
4.  **Ver Resultados:** Revisa el puntaje, gráficos y vectores de ataque detectados.
5.  **Historial:** Accede al menú "Historial" en la barra superior para ver análisis pasados guardados en la nube.

---

## 6. Pruebas y Validación

*   **Validación de Entrada:** El sistema bloquea archivos que no sean PDF y textos demasiado cortos.
*   **Manejo de Errores:** Se capturan errores de API (403, 429) y se muestran mensajes amigables al usuario.
*   **Persistencia:** Se ha verificado que los datos persisten en Supabase tras recargar la página.

---

**Desarrollado para la evaluación de proyectos IoT e IA.**
