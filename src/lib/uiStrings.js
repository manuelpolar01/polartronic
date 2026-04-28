/**
 * uiStrings.js — v3 (drawer + shell strings añadidos)
 * ─────────────────────────────────────────────────────────────────────────
 * CAMBIOS v3 (quirúrgicos — sin romper nada):
 *   ecosystems.drawerSubtitle  → "Cómo trabajamos este sector" / "How we work this sector"
 *   ecosystems.successCases    → "Casos de éxito" / "Success stories"
 *   ecosystems.typicalResults  → "Resultados típicos" / "Typical results"
 *   ecosystems.ctaContact      → "Hablemos" / "Let's talk"
 *   ecosystems.ctaProjects     → "Ver proyectos" / "See projects"
 *   projects.contractThis      → "Contratar esto" / "Hire this"
 *   projects.backBtn           → "Volver" / "Back"
 *   projects.openApp           → "Abrir demo" / "Open demo"
 *   projects.visitSite         → "Ver sitio" / "Visit site"
 *
 * Todo lo demás idéntico a v2.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
]

export const DEFAULT_LANGUAGE = 'it'

// ─────────────────────────────────────────────────────────────────────
// STRING DICTIONARY
// ─────────────────────────────────────────────────────────────────────
const strings = {

  // ── NAVIGATION ─────────────────────────────────────────────────────────
  nav: {
    home:         { it: 'Home',         en: 'Home',         es: 'Inicio',       fr: 'Accueil',      de: 'Startseite',       pt: 'Início'        },
    services:     { it: 'Servizi',      en: 'Services',     es: 'Servicios',    fr: 'Services',     de: 'Leistungen',       pt: 'Serviços'      },
    memberships:  { it: 'Memberships',  en: 'Memberships',  es: 'Membresías',   fr: 'Abonnements',  de: 'Mitgliedschaften', pt: 'Membros'       },
    projects:     { it: 'Progetti',     en: 'Projects',     es: 'Proyectos',    fr: 'Projets',      de: 'Projekte',         pt: 'Projetos'      },
    clients:      { it: 'Clienti',      en: 'Clients',      es: 'Clientes',     fr: 'Clients',      de: 'Kunden',           pt: 'Clientes'      },
    contact:      { it: 'Contatto',     en: 'Contact',      es: 'Contacto',     fr: 'Contact',      de: 'Kontakt',          pt: 'Contato'       },
    booking:      { it: 'Prenota',      en: 'Book Now',     es: 'Reservar',     fr: 'Réserver',     de: 'Buchen',           pt: 'Reservar'      },
  },

  // ── HERO SECTION ───────────────────────────────────────────────────────
  hero: {
    badge:      { it: 'Studio Digitale Creativo',  en: 'Digital Creative Studio', es: 'Estudio Digital Creativo', fr: 'Studio Créatif Digital', de: 'Digitales Kreativstudio', pt: 'Estúdio Digital Criativo' },
    exploreCta: { it: 'ESPLORA LE AREE',           en: 'EXPLORE AREAS',           es: 'EXPLORAR ÁREAS',           fr: 'EXPLORER LES ZONES',     de: 'BEREICHE ENTDECKEN',       pt: 'EXPLORAR ÁREAS'           },
  },

  // ── SERVICES SECTION ───────────────────────────────────────────────────
  services: {
    eyebrow:       { it: 'Cosa facciamo',   en: 'What we do',      es: 'Lo que hacemos',  fr: 'Ce que nous faisons', de: 'Was wir machen',    pt: 'O que fazemos'     },
    heading:       { it: 'I nostri',        en: 'Our',             es: 'Nuestros',        fr: 'Nos',                  de: 'Unsere',            pt: 'Nossos'            },
    headingAccent: { it: 'Servizi',         en: 'Services',        es: 'Servicios',       fr: 'Services',             de: 'Leistungen',        pt: 'Serviços'          },
  },

  // ── ECOSYSTEMS / MEMBERSHIPS SECTION ──────────────────────────────────
  ecosystems: {
    // Eyebrow — texto pequeño encima del título (etiqueta de sección)
    eyebrow:        { it: 'Gruppi Partner',      en: 'Partner Groups',     es: 'Grupos Partners',    fr: 'Groupes Partenaires',  de: 'Partner-Gruppen',     pt: 'Grupos Parceiros'     },

    // Prefijo del h2 (texto normal antes del acento)
    headingPrefix:  { it: 'Le nostre',            en: 'Our',                es: 'Nuestras',           fr: 'Nos',                   de: 'Unsere',              pt: 'Nossas'               },

    // Parte en color primario del h2
    heading:        { it: 'Membresie',            en: 'Memberships',        es: 'Membresías',         fr: 'Memberships',           de: 'Mitgliedschaften',    pt: 'Memberships'          },

    // Badge "Featured"
    featured:       { it: '★ In Evidenza',        en: '★ Featured',         es: '★ Destacado',        fr: '★ À la une',            de: '★ Empfohlen',         pt: '★ Destaque'           },

    // Label de lista de beneficios en drawer/modal
    benefits:       { it: 'Vantaggi inclusi',     en: 'Included benefits',  es: 'Beneficios incluidos', fr: 'Avantages inclus',   de: 'Enthaltene Vorteile', pt: 'Benefícios incluídos' },

    // Botón cerrar (fallback)
    close:          { it: 'Chiudi',               en: 'Close',              es: 'Cerrar',             fr: 'Fermer',                de: 'Schließen',           pt: 'Fechar'               },

    // Enlace "ver detalle" en la tarjeta
    viewDetail:     { it: 'Vedi dettaglio',        en: 'See details',        es: 'Ver detalle',        fr: 'Voir le détail',        de: 'Details ansehen',     pt: 'Ver detalhe'          },

    // ── NUEVOS v3 — Drawer ─────────────────────────────────────────────
    // Subtítulo del header del drawer
    drawerSubtitle: { it: 'Come lavoriamo in questo settore', en: 'How we work this sector', es: 'Cómo trabajamos este sector', fr: 'Comment nous travaillons ce secteur', de: 'Wie wir in diesem Bereich arbeiten', pt: 'Como trabalhamos este setor' },

    // Sección casos de éxito dentro del drawer
    successCases:   { it: 'Casi di successo',     en: 'Success stories',    es: 'Casos de éxito',     fr: 'Cas de succès',         de: 'Erfolgsgeschichten',  pt: 'Casos de sucesso'     },

    // Sección resultados típicos del sector
    typicalResults: { it: 'Risultati tipici',      en: 'Typical results',    es: 'Resultados típicos', fr: 'Résultats typiques',    de: 'Typische Ergebnisse', pt: 'Resultados típicos'   },

    // CTA "Hablemos" → contacto
    ctaContact:     { it: 'Parliamo',              en: "Let's talk",         es: 'Hablemos',           fr: 'Parlons',               de: 'Sprechen wir',        pt: 'Vamos falar'          },

    // CTA "Ver proyectos"
    ctaProjects:    { it: 'Vedi i progetti',       en: 'See projects',       es: 'Ver proyectos',      fr: 'Voir les projets',      de: 'Projekte ansehen',    pt: 'Ver projetos'         },
  },

  // ── PROJECTS SECTION ───────────────────────────────────────────────────
  projects: {
    eyebrow:       { it: 'Casi di successo',     en: 'Success stories',   es: 'Casos de éxito',     fr: 'Cas de succès',         de: 'Erfolgsgeschichten',  pt: 'Casos de sucesso'   },
    heading:       { it: 'Il nostro',            en: 'Our',               es: 'Nuestro',            fr: 'Notre',                  de: 'Unser',               pt: 'Nosso'              },
    headingAccent: { it: 'Portfolio',            en: 'Portfolio',         es: 'Portafolio',         fr: 'Portfolio',              de: 'Portfolio',           pt: 'Portfólio'          },
    sub:           { it: 'Risultati reali per clienti reali.', en: 'Real results for real clients.', es: 'Resultados reales para clientes reales.', fr: 'De vrais résultats pour de vrais clients.', de: 'Echte Ergebnisse für echte Kunden.', pt: 'Resultados reais para clientes reais.' },
    results:       { it: 'Risultati',            en: 'Results',           es: 'Resultados',         fr: 'Résultats',              de: 'Ergebnisse',          pt: 'Resultados'         },

    // ── NUEVOS v3 — Shell Polartronic ─────────────────────────────────────
    // Botón principal del shell
    contractThis:  { it: 'Voglio questo',        en: 'Hire this',         es: 'Contratar esto',     fr: 'Je veux ça',             de: 'Das beauftragen',     pt: 'Contratar isso'     },

    // Botón volver del shell
    backBtn:       { it: '← Torna',             en: '← Back',            es: '← Volver',           fr: '← Retour',               de: '← Zurück',            pt: '← Voltar'           },

    // CTA hover de card con landing
    openApp:       { it: 'Apri la demo',         en: 'Open demo',         es: 'Abrir demo',         fr: 'Ouvrir la démo',         de: 'Demo öffnen',         pt: 'Abrir demo'         },

    // CTA hover de card con URL externa
    visitSite:     { it: 'Visita il sito',       en: 'Visit site',        es: 'Ver sitio',          fr: 'Visiter le site',        de: 'Website besuchen',    pt: 'Visitar site'       },
  },

  // ── TESTIMONIALS SECTION ───────────────────────────────────────────────
  testimonials: {
    eyebrow:       { it: 'Social Proof',         en: 'Social Proof',      es: 'Social Proof',       fr: 'Témoignages',            de: 'Kundenstimmen',       pt: 'Prova Social'       },
    heading:       { it: 'Cosa dicono i nostri', en: 'What our',          es: 'Lo que dicen',       fr: 'Ce que disent nos',      de: 'Was unsere',          pt: 'O que dizem nossos' },
    headingAccent: { it: 'clienti',              en: 'clients say',       es: 'nuestros clientes',  fr: 'clients',                de: 'Kunden sagen',        pt: 'clientes'           },
  },

  // ── CONTACT SECTION ────────────────────────────────────────────────────
  contact: {
    eyebrow:      { it: 'Parliamo',              en: "Let's Talk",        es: 'Hablemos',           fr: 'Parlons',                de: 'Sprechen wir',        pt: 'Vamos Falar'        },
    sendBtn:      { it: 'INVIA MESSAGGIO',        en: 'SEND MESSAGE',      es: 'ENVIAR MENSAJE',     fr: 'ENVOYER',                de: 'SENDEN',              pt: 'ENVIAR MENSAGEM'    },
    whatsappBtn:  { it: 'WhatsApp',              en: 'WhatsApp',          es: 'WhatsApp',           fr: 'WhatsApp',               de: 'WhatsApp',            pt: 'WhatsApp'           },
    privacy:      { it: 'Le tue informazioni sono private e non verranno condivise con terzi.', en: 'Your information is private and will never be shared with third parties.', es: 'Tu información es privada y nunca será compartida con terceros.', fr: 'Vos informations sont privées et ne seront jamais partagées.', de: 'Ihre Daten sind privat und werden nicht weitergegeben.', pt: 'Suas informações são privadas e nunca serão compartilhadas.' },
    orEmail:      { it: 'oppure scrivici a',      en: 'or write to us at', es: 'o escríbenos a',     fr: 'ou écrivez-nous à',      de: 'oder schreiben Sie uns an', pt: 'ou escreva para' },
    sendAnother:  { it: 'Invia un altro messaggio', en: 'Send another message', es: 'Enviar otro mensaje', fr: 'Envoyer un autre message', de: 'Weitere Nachricht senden', pt: 'Enviar outra mensagem' },
    required:     { it: 'obbligatorio',           en: 'required',          es: 'obligatorio',        fr: 'obligatoire',            de: 'Pflichtfeld',         pt: 'obrigatório'        },
    selectOpt:    { it: 'Seleziona…',             en: 'Select…',           es: 'Seleccionar…',       fr: 'Sélectionner…',          de: 'Auswählen…',          pt: 'Selecionar…'        },
    sending:      { it: 'Invio in corso…',         en: 'Sending…',          es: 'Enviando…',          fr: 'Envoi en cours…',        de: 'Wird gesendet…',      pt: 'Enviando…'          },
    errorRetry:   { it: "Errore durante l'invio. Riprova o contattaci via WhatsApp.", en: 'There was an error sending. Please try again or contact us via WhatsApp.', es: 'Hubo un error al enviar. Intenta de nuevo o contáctanos por WhatsApp.', fr: "Erreur lors de l'envoi. Réessayez ou contactez-nous via WhatsApp.", de: 'Fehler beim Senden. Bitte erneut versuchen oder per WhatsApp kontaktieren.', pt: 'Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.' },
    emailInvalid: { it: 'Email non valida',        en: 'Invalid email',     es: 'Email inválido',     fr: 'Email invalide',         de: 'Ungültige E-Mail',    pt: 'E-mail inválido'    },
    fieldRequired:{ it: 'Campo obbligatorio',      en: 'This field is required', es: 'Campo obligatorio', fr: 'Champ obligatoire', de: 'Pflichtfeld',          pt: 'Campo obrigatório'  },
  },

  // ── FOOTER ─────────────────────────────────────────────────────────────
  footer: {
    navigation:   { it: 'Navigazione',           en: 'Navigation',        es: 'Navegación',         fr: 'Navigation',             de: 'Navigation',          pt: 'Navegação'          },
    services:     { it: 'Servizi',               en: 'Services',          es: 'Servicios',          fr: 'Services',               de: 'Leistungen',          pt: 'Serviços'           },
    contact:      { it: 'Contatti',              en: 'Contact',           es: 'Contacto',           fr: 'Contact',                de: 'Kontakt',             pt: 'Contato'            },
    whatsapp:     { it: 'WhatsApp Business',     en: 'WhatsApp Business', es: 'WhatsApp Business',  fr: 'WhatsApp Business',      de: 'WhatsApp Business',   pt: 'WhatsApp Business'  },
    instagram:    { it: 'Instagram Studio',      en: 'Instagram Studio',  es: 'Instagram Studio',   fr: 'Instagram Studio',       de: 'Instagram Studio',    pt: 'Instagram Studio'   },
  },

  // ── BOOKING FLOW ───────────────────────────────────────────────────────
  booking: {
    title:         { it: 'Prenota il tuo appuntamento',  en: 'Book your appointment',       es: 'Reserva tu cita',             fr: 'Réservez votre rendez-vous',  de: 'Termin buchen',               pt: 'Agendar seu compromisso'      },
    selectService: { it: 'Scegli il servizio',           en: 'Choose a service',            es: 'Elige el servicio',           fr: 'Choisissez un service',       de: 'Leistung wählen',             pt: 'Escolha o serviço'            },
    selectDate:    { it: 'Scegli la data',               en: 'Choose a date',               es: 'Elige la fecha',              fr: 'Choisissez une date',         de: 'Datum wählen',                pt: 'Escolha a data'               },
    selectTime:    { it: "Scegli l'orario",              en: 'Choose a time slot',          es: 'Elige el horario',            fr: 'Choisissez un créneau',       de: 'Uhrzeit wählen',              pt: 'Escolha o horário'            },
    yourDetails:   { it: 'I tuoi dati',                  en: 'Your details',                es: 'Tus datos',                   fr: 'Vos coordonnées',             de: 'Ihre Daten',                  pt: 'Seus dados'                   },
    confirm:       { it: 'Conferma prenotazione',        en: 'Confirm booking',             es: 'Confirmar reserva',           fr: 'Confirmer la réservation',    de: 'Buchung bestätigen',          pt: 'Confirmar reserva'            },
    confirmed:     { it: 'Prenotazione confermata!',     en: 'Booking confirmed!',          es: '¡Reserva confirmada!',        fr: 'Réservation confirmée !',     de: 'Buchung bestätigt!',          pt: 'Reserva confirmada!'          },
    name:          { it: 'Nome',                         en: 'Name',                        es: 'Nombre',                      fr: 'Nom',                         de: 'Name',                        pt: 'Nome'                         },
    phone:         { it: 'Telefono',                     en: 'Phone',                       es: 'Teléfono',                    fr: 'Téléphone',                   de: 'Telefon',                     pt: 'Telefone'                     },
    email:         { it: 'Email',                        en: 'Email',                       es: 'Email',                       fr: 'E-mail',                      de: 'E-Mail',                      pt: 'E-mail'                       },
    notes:         { it: 'Note (facoltativo)',            en: 'Notes (optional)',            es: 'Notas (opcional)',            fr: 'Notes (facultatif)',           de: 'Hinweise (optional)',         pt: 'Notas (opcional)'             },
    back:          { it: 'Indietro',                     en: 'Back',                        es: 'Atrás',                       fr: 'Retour',                      de: 'Zurück',                      pt: 'Voltar'                       },
    next:          { it: 'Avanti',                       en: 'Next',                        es: 'Siguiente',                   fr: 'Suivant',                     de: 'Weiter',                      pt: 'Próximo'                      },
    duration:      { it: 'min',                          en: 'min',                         es: 'min',                         fr: 'min',                         de: 'Min.',                        pt: 'min'                          },
    price:         { it: 'Prezzo',                       en: 'Price',                       es: 'Precio',                      fr: 'Prix',                        de: 'Preis',                       pt: 'Preço'                        },
    noSlots:       { it: 'Nessun orario disponibile',    en: 'No time slots available',     es: 'Sin horarios disponibles',    fr: 'Aucun créneau disponible',    de: 'Keine Zeiten verfügbar',      pt: 'Sem horários disponíveis'     },
    loading:       { it: 'Caricamento…',                 en: 'Loading…',                    es: 'Cargando…',                   fr: 'Chargement…',                 de: 'Wird geladen…',               pt: 'Carregando…'                  },
    step:          { it: 'Passo',                        en: 'Step',                        es: 'Paso',                        fr: 'Étape',                       de: 'Schritt',                     pt: 'Passo'                        },
    of:            { it: 'di',                           en: 'of',                          es: 'de',                          fr: 'sur',                         de: 'von',                         pt: 'de'                           },
    summary:       { it: 'Riepilogo',                    en: 'Summary',                     es: 'Resumen',                     fr: 'Récapitulatif',               de: 'Zusammenfassung',             pt: 'Resumo'                       },
    months: {
      it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
      fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
      pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    },
    weekdays: {
      it: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
      en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      es: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
      fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
      de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
      pt: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    },
  },

  // ── ADMIN PANEL ────────────────────────────────────────────────────────
  admin: {
    language: { it: 'Lingua del Sito',      en: 'Site Language',    es: 'Idioma del Sitio', fr: 'Langue du Site',       de: 'Website-Sprache',    pt: 'Idioma do Site'     },
    saved:    { it: 'Salvato ✓',            en: 'Saved ✓',          es: 'Guardado ✓',       fr: 'Enregistré ✓',         de: 'Gespeichert ✓',      pt: 'Salvo ✓'            },
    saving:   { it: 'Salvataggio…',         en: 'Saving…',          es: 'Guardando…',       fr: 'Enregistrement…',      de: 'Wird gespeichert…',  pt: 'Salvando…'          },
    error:    { it: 'Errore durante il salvataggio', en: 'Error saving', es: 'Error al guardar', fr: "Erreur d'enregistrement", de: 'Speicherfehler', pt: 'Erro ao salvar' },
  },

  // ── GENERIC / SHARED ───────────────────────────────────────────────────
  common: {
    save:     { it: 'Salva',               en: 'Save',             es: 'Guardar',          fr: 'Enregistrer',          de: 'Speichern',          pt: 'Salvar'             },
    cancel:   { it: 'Annulla',             en: 'Cancel',           es: 'Cancelar',         fr: 'Annuler',              de: 'Abbrechen',          pt: 'Cancelar'           },
    delete:   { it: 'Elimina',             en: 'Delete',           es: 'Eliminar',         fr: 'Supprimer',            de: 'Löschen',            pt: 'Excluir'            },
    edit:     { it: 'Modifica',            en: 'Edit',             es: 'Editar',           fr: 'Modifier',             de: 'Bearbeiten',         pt: 'Editar'             },
    addNew:   { it: 'Aggiungi',            en: 'Add New',          es: 'Agregar',          fr: 'Ajouter',              de: 'Hinzufügen',         pt: 'Adicionar'          },
    viewSite: { it: 'Vedi il sito',        en: 'View site',        es: 'Ver sitio',        fr: 'Voir le site',         de: 'Seite anzeigen',     pt: 'Ver site'           },
    logout:   { it: 'Esci',               en: 'Logout',           es: 'Salir',            fr: 'Déconnexion',          de: 'Abmelden',           pt: 'Sair'               },
  },
}

// ─────────────────────────────────────────────────────────────────────
// RESOLVER
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns a resolved flat-ish object for the given language.
 * Leaf values that are plain strings (like months/weekdays arrays)
 * are returned as-is for that language.
 *
 * @param {string} lang  ISO 639-1 code e.g. 'it', 'en', 'es'
 * @returns {object}     Nested object of translated strings
 */
export function getStrings(lang = DEFAULT_LANGUAGE) {
  const l = SUPPORTED_LANGUAGES.find(x => x.code === lang)?.code ?? DEFAULT_LANGUAGE

  function resolve(node) {
    if (node === null || node === undefined) return ''

    // Leaf: plain string values at language keys → translate
    if (typeof node === 'object' && typeof node[l] !== 'undefined') {
      // Arrays (months, weekdays) — return the array for that language
      if (Array.isArray(node[l])) return node[l]
      return node[l]
    }

    // Intermediate node → recurse
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      out[k] = resolve(v)
    }
    return out
  }

  return resolve(strings)
}