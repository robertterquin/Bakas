import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw exact total page numbers
    and professional running headers and footers matching the Hapag design.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Footer & Header on all pages except Page 1 (Cover)
        if self._pageNumber > 1:
            # Running Top Header
            self.drawString(54, 750, "BAKÁS / URBAN ROAD HAZARD RADAR PRODUCT PLAN")
            page_str = f"{self._pageNumber:02d} / {page_count:02d}"
            self.drawRightString(612 - 54, 750, page_str)
            
            # Subtle Header Line
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

        self.restoreState()

def create_bakas_pdf(filename="bakas-project-flow.pdf"):
    # Page setup: Letter size is 612 x 792 points. Margins: 54pt (0.75 in) left/right, top 56pt, bottom 44pt.
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=56,
        bottomMargin=44
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_SLATE_950 = colors.HexColor("#020617")
    C_SLATE_900 = colors.HexColor("#0f172a")
    C_SLATE_800 = colors.HexColor("#1e293b")
    C_SLATE_700 = colors.HexColor("#334155")
    C_SLATE_500 = colors.HexColor("#64748b")
    C_SLATE_400 = colors.HexColor("#94a3b8")
    C_SLATE_100 = colors.HexColor("#f1f5f9")
    C_SLATE_50  = colors.HexColor("#f8fafc")
    C_BORDER    = colors.HexColor("#cbd5e1")
    C_WHITE     = colors.HexColor("#ffffff")
    C_ACCENT    = colors.HexColor("#0284c7")

    # Typography Styles
    title_category = ParagraphStyle(
        'CoverCategory',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        textTransform='uppercase',
        spaceAfter=14
    )

    cover_title = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=38,
        leading=42,
        textColor=C_SLATE_950,
        spaceAfter=8
    )

    cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=C_SLATE_900,
        spaceAfter=18
    )

    cover_desc = ParagraphStyle(
        'CoverDesc',
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=C_SLATE_700,
        spaceAfter=28
    )

    sec_tag = ParagraphStyle(
        'SectionTag',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=C_SLATE_500,
        textTransform='uppercase',
        spaceAfter=4
    )

    sec_title = ParagraphStyle(
        'SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=C_SLATE_950,
        spaceAfter=6
    )

    sec_subtitle = ParagraphStyle(
        'SectionSubtitle',
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=C_SLATE_700,
        spaceAfter=12
    )

    h3_style = ParagraphStyle(
        'H3Style',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=C_SLATE_900,
        textTransform='uppercase',
        spaceBefore=10,
        spaceAfter=4
    )

    body_text = ParagraphStyle(
        'BodyText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=C_SLATE_800,
        spaceAfter=6
    )

    bullet_text = ParagraphStyle(
        'BulletText',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        textColor=C_SLATE_800,
        leftIndent=10,
        spaceAfter=3
    )

    table_th = ParagraphStyle(
        'TableTH',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=9.5,
        textColor=C_WHITE
    )

    table_td = ParagraphStyle(
        'TableTD',
        fontName='Helvetica',
        fontSize=7.6,
        leading=9.5,
        textColor=C_SLATE_900
    )

    table_td_bold = ParagraphStyle(
        'TableTDBold',
        fontName='Helvetica-Bold',
        fontSize=7.6,
        leading=9.5,
        textColor=C_SLATE_950
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        fontName='Helvetica-Oblique',
        fontSize=8.2,
        leading=11,
        textColor=C_SLATE_800
    )

    story = []

    def make_table(data, col_widths, is_header_dark=True):
        t = Table(data, colWidths=col_widths)
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), C_SLATE_900 if is_header_dark else C_SLATE_800),
            ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, C_BORDER),
            ('BOX', (0, 0), (-1, -1), 0.8, C_SLATE_700),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]
        for i in range(1, len(data)):
            if i % 2 == 0:
                t_style.append(('BACKGROUND', (0, i), (-1, i), C_SLATE_50))
            else:
                t_style.append(('BACKGROUND', (0, i), (-1, i), C_WHITE))
        t.setStyle(TableStyle(t_style))
        return t

    # ==========================================
    # PAGE 1: COVER PAGE
    # ==========================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("URBAN ROAD HAZARD RADAR / PRODUCT PLAN", title_category))
    story.append(Paragraph("Bakás", cover_title))
    story.append(Paragraph("Leaving digital traces to navigate urban road hazards.", cover_subtitle))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_SLATE_950, spaceAfter=20))
    
    story.append(Paragraph(
        "A lightweight, mobile-first Progressive Web App (PWA) that allows commuters, motorists, cyclists, and "
        "pedestrians to anonymously report and view urban road hazards in real-time. By utilizing crowdsourced civic traces, "
        "users map dangerous road traps such as potholes, open manholes, clogged drainages, and unlit streets with zero login barrier, "
        "resilient offline-first synchronization, and 5km PostGIS spatial filtering.",
        cover_desc
    ))
    story.append(Spacer(1, 40))

    meta_table_data = [
        [
            Paragraph("Target user", table_th),
            Paragraph("Main action", table_th),
            Paragraph("Stack", table_th),
            Paragraph("Design", table_th)
        ],
        [
            Paragraph("Commuters, motorists, cyclists, and urban pedestrians", table_td),
            Paragraph("Zero-login 1-tap hazard reporting & 5km radar map inspection", table_td),
            Paragraph("React (TypeScript, Vite) / Leaflet.js / PostGIS / Supabase", table_td),
            Paragraph("Tactical Dark Slate Monochrome (#020617) Command Center", table_td)
        ]
    ]
    story.append(make_table(meta_table_data, [126, 126, 126, 126]))
    story.append(PageBreak())

    # ==========================================
    # PAGE 2: SECTION 00 - EXECUTIVE BRIEF
    # ==========================================
    story.append(Paragraph("SECTION 00", sec_tag))
    story.append(Paragraph("Executive brief", sec_title))
    story.append(Paragraph("A quality-first plan for a civic road hazard radar, not a bloated navigation app.", sec_subtitle))
    
    story.append(Paragraph("PRODUCT IN ONE SENTENCE", h3_style))
    story.append(Paragraph(
        "Bakás turns crowdsourced civic awareness into real-time, offline-resilient road hazard intelligence to protect urban commuters.",
        body_text
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("DECISIONS LOCKED FOR MVP", h3_style))
    story.append(Paragraph("• <b>Frictionless Crowdsourcing (Zero-Login):</b> 1-tap anonymous reporting using browser GPS with under 5-second submission time.", bullet_text))
    story.append(Paragraph("• <b>Offline-First Resilience:</b> Local hazard reports saved in IndexedDB during cellular dead zones; synced automatically on reconnect.", bullet_text))
    story.append(Paragraph("• <b>Spatial Proximity Filter:</b> Strict 5-kilometer PostGIS radius filter ensures instant viewport loading and zero data bloat.", bullet_text))
    story.append(Paragraph("• <b>Automated Data Decay:</b> Time-decay TTL (24h temporary obstacles, 7d physical road defects) with community validation upvotes.", bullet_text))
    story.append(Paragraph("• <b>Dark Slate Monochrome System:</b> #020617 canvas with CartoDB Dark Matter tiles and severity radar pulses.", bullet_text))
    story.append(Spacer(1, 6))

    story.append(Paragraph("CONTENTS", h3_style))
    toc_table = Table([
        [Paragraph("01", table_th), Paragraph("02", table_th), Paragraph("03", table_th), Paragraph("04", table_th)],
        [
            Paragraph("<b>Product and users</b>", table_td),
            Paragraph("<b>Product workflow</b>", table_td),
            Paragraph("<b>Spatial & offline architecture</b>", table_td),
            Paragraph("<b>Scope and boundaries</b>", table_td)
        ],
        [Paragraph("05", table_th), Paragraph("06", table_th), Paragraph("07", table_th), Paragraph("08", table_th)],
        [
            Paragraph("<b>Visual direction</b>", table_td),
            Paragraph("<b>Risks and validation</b>", table_td),
            Paragraph("<b>Build phases (1-16)</b>", table_td),
            Paragraph("<b>Demo and decisions</b>", table_td)
        ]
    ], colWidths=[126, 126, 126, 126])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_SLATE_900),
        ('BACKGROUND', (0, 2), (-1, 2), C_SLATE_900),
        ('BACKGROUND', (0, 1), (-1, 1), C_SLATE_50),
        ('BACKGROUND', (0, 3), (-1, 3), C_SLATE_50),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('TEXTCOLOR', (0, 2), (-1, 2), C_WHITE),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('BOX', (0, 0), (-1, -1), 0.8, C_SLATE_700),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # ==========================================
    # PAGE 3: SECTION 01 - PRODUCT DEFINITION & REAL PROBLEM
    # ==========================================
    story.append(Paragraph("SECTION 01", sec_tag))
    story.append(Paragraph("Product definition and real problem", sec_title))
    story.append(Paragraph("Bakás is a real-time safety layer for the moment a commuter or motorist navigates urban streets.", sec_subtitle))

    story.append(Paragraph("THE SHARP PROBLEM STATEMENT", h3_style))
    story.append(Paragraph(
        "Urban commuters face dangerous, invisible road hazards (potholes, open manholes, flash floods, unlit streets) "
        "with no fast, lightweight way to report or avoid them in real-time.",
        body_text
    ))
    story.append(Spacer(1, 4))

    prob_data = [
        [Paragraph("Observed problem", table_th), Paragraph("Why it matters", table_th), Paragraph("Bakás response", table_th)],
        [
            Paragraph("Reporting apps require login, long forms, or deep menus.", table_td),
            Paragraph("Motorists and pedestrians abandon reporting while in transit.", table_td),
            Paragraph("Zero-login, 1-tap category + severity submission in under 5 seconds.", table_td)
        ],
        [
            Paragraph("Cellular dead zones and weak signal in urban canyons cause data loss.", table_td),
            Paragraph("Hazards in dead zones (underpasses, rural corridors) go unrecorded.", table_td),
            Paragraph("IndexedDB offline-first queue with automatic background sync.", table_td)
        ],
        [
            Paragraph("Outdated hazard pins remain indefinitely on civic maps.", table_td),
            Paragraph("Users lose trust in false alarms or resolved obstacles.", table_td),
            Paragraph("Automated TTL decay (24h/7d) extended only by live community validation.", table_td)
        ],
        [
            Paragraph("Map rendering becomes slow and cluttered across entire cities.", table_td),
            Paragraph("High bandwidth consumption and slow mobile device rendering.", table_td),
            Paragraph("PostGIS 5km bounding circle strictly limits viewport rendering.", table_td)
        ]
    ]
    story.append(make_table(prob_data, [140, 164, 200]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("PRIMARY USER", h3_style))
    story.append(Paragraph(
        "A daily commuter, motorcyclist, delivery rider, cyclist, or pedestrian who needs immediate, glanceable road hazard awareness without friction.",
        body_text
    ))

    story.append(Paragraph("POSITIONING", h3_style))
    pos_data = [
        [Paragraph("Bakás is", table_th), Paragraph("Bakás is not", table_th)],
        [
            Paragraph("A lightweight, anonymous urban road hazard radar", table_td),
            Paragraph("A turn-by-turn routing navigation app (like Waze/Google Maps)", table_td)
        ],
        [
            Paragraph("An offline-first rapid civic reporting tool", table_td),
            Paragraph("An official government public works dispatch system", table_td)
        ],
        [
            Paragraph("A glanceable dark slate command center", table_td),
            Paragraph("A social networking platform with profiles, feeds, or chat", table_td)
        ],
        [
            Paragraph("A community-validated temporary trace network", table_td),
            Paragraph("A permanent static infrastructure database", table_td)
        ]
    ]
    story.append(make_table(pos_data, [252, 252]))
    story.append(PageBreak())

    # ==========================================
    # PAGE 4: SECTION 02 - USERS, NEEDS, AND PRODUCT MODES
    # ==========================================
    story.append(Paragraph("SECTION 02", sec_tag))
    story.append(Paragraph("Users, needs, and product modes", sec_title))
    story.append(Paragraph("Serve one clear core job while making room for different transit modalities.", sec_subtitle))

    user_data = [
        [Paragraph("User context", table_th), Paragraph("Need", table_th), Paragraph("Primary Bakás mode", table_th)],
        [
            Paragraph("“Napakadilim ng kalsada dito at may lubak.”", table_td),
            Paragraph("Report an unlit road or deep pothole in 3 seconds before moving on.", table_td),
            Paragraph("Quick 1-Tap Trace Drop", table_td)
        ],
        [
            Paragraph("“Bumabaha ba sa Dadaanan ko?”", table_td),
            Paragraph("Check for clogged drainage or flooded spots within 5km before leaving.", table_td),
            Paragraph("5km Proximity Radar View", table_td)
        ],
        [
            Paragraph("“Nawalan ako ng signal sa ilalim ng tulay.”", table_td),
            Paragraph("Record a road obstacle offline and have it sync automatically later.", table_td),
            Paragraph("Offline Dead-Zone Logging", table_td)
        ],
        [
            Paragraph("“Naayos na ba yung bukas na manhole?”", table_td),
            Paragraph("Validate if a reported hazard is still present or mark it cleared.", table_td),
            Paragraph("Community Validation (Upvote / Clear)", table_td)
        ]
    ]
    story.append(make_table(user_data, [150, 194, 160]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("CORE VALUE LOOP", h3_style))
    story.append(Paragraph(
        "<b>Spotted Hazard ➔ 1-Tap Anonymous Drop ➔ Live 5km Radar Broadcast ➔ Community Validation ➔ Safer Commute.</b>",
        body_text
    ))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PERSONALIZATION THAT BELONGS IN THE MVP", h3_style))
    story.append(Paragraph("• <b>Proximity Radius Presets:</b> Instant toggle between 1km (hyperlocal walking), 3km (cycling), and 5km (motorcycle/driving).", bullet_text))
    story.append(Paragraph("• <b>Category Quick Filters:</b> 1-tap filtering for Potholes, Drainage/Flooding, Obstructions, and Dark Streets.", bullet_text))
    story.append(Paragraph("• <b>GPS Accuracy Ring:</b> Visual precision indicator showing device GPS accuracy radius.", bullet_text))
    story.append(Paragraph("• <b>Recentered Camera Lock:</b> Auto-tracking mode keeping user centered during transit.", bullet_text))
    story.append(Paragraph("• <b>Anti-Spam Fingerprint:</b> Client-side localStorage token preventing duplicate upvotes per device.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 5: SECTION 03 - END-TO-END PRODUCT WORKFLOW
    # ==========================================
    story.append(Paragraph("SECTION 03", sec_tag))
    story.append(Paragraph("End-to-end product workflow", sec_title))
    story.append(Paragraph("A fast, frictionless sequence: locate, scan, pin, validate, and decay.", sec_subtitle))

    flow_data = [
        [Paragraph("Stage", table_th), Paragraph("User action", table_th), Paragraph("Bakás response", table_th)],
        [
            Paragraph("01 / Locate", table_td_bold),
            Paragraph("Opens PWA or desktop link.", table_td),
            Paragraph("Locks browser GPS in <1s and renders CartoDB Dark Matter map.", table_td)
        ],
        [
            Paragraph("02 / Scan", table_td_bold),
            Paragraph("Inspects 5km radar or applies filter.", table_td),
            Paragraph("Fetches and displays active hazards within 5km via PostGIS.", table_td)
        ],
        [
            Paragraph("03 / Pin", table_td_bold),
            Paragraph("Taps '+ Report Hazard' FAB button.", table_td),
            Paragraph("Opens tactile bottom sheet with 4 categories and severity picker.", table_td)
        ],
        [
            Paragraph("04 / Submit", table_td_bold),
            Paragraph("Selects category & severity, taps 'Submit'.", table_td),
            Paragraph("Optimistically drops pulsing pin; writes IndexedDB & syncs API.", table_td)
        ],
        [
            Paragraph("05 / Validate", table_td_bold),
            Paragraph("Nearby commuter taps pin on map.", table_td),
            Paragraph("Displays detail sheet; user can tap 'Still Here (+1)' or 'Cleared'.", table_td)
        ],
        [
            Paragraph("06 / Decay", table_td_bold),
            Paragraph("No action required (automated).", table_td),
            Paragraph("Expired pins automatically disappear from map after TTL ends.", table_td)
        ]
    ]
    story.append(make_table(flow_data, [80, 180, 244]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("DETAILED WORKFLOW CONTRACT", h3_style))
    contract_data = [
        [Paragraph("Input", table_th), Paragraph("Output", table_th), Paragraph("Exit gate", table_th)],
        [
            Paragraph("Device Geolocation coords", table_td),
            Paragraph("Validated lat/lng + accuracy radius", table_td),
            Paragraph("Coordinates within valid terrestrial bounds.", table_td)
        ],
        [
            Paragraph("1-tap Category + Severity", table_td),
            Paragraph("Validated HazardPayload object", table_td),
            Paragraph("Non-null enum values with timestamp.", table_td)
        ],
        [
            Paragraph("Local IndexedDB Write", table_td),
            Paragraph("Optimistic Radar DivIcon on map", table_td),
            Paragraph("UI updates in under 20ms without network wait.", table_td)
        ],
        [
            Paragraph("Supabase PostGIS Sync", table_td),
            Paragraph("GEOGRAPHY Point (SRID 4326)", table_td),
            Paragraph("Record inserted with automated TTL calculation.", table_td)
        ]
    ]
    story.append(make_table(contract_data, [140, 180, 184]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("CORE UX RULE", h3_style))
    story.append(Paragraph(
        "Never block a user behind login screens, forms, or network timeouts when reporting a road hazard. Speed and safety are paramount.",
        callout_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 6: SECTION 04 - WHAT BAKÁS PRODUCES
    # ==========================================
    story.append(Paragraph("SECTION 04", sec_tag))
    story.append(Paragraph("What Bakás produces", sec_title))
    story.append(Paragraph("The value is real-time, actionable road intelligence, not static clutter.", sec_subtitle))

    story.append(Paragraph("HAZARD RECORD DATA CONTRACT", h3_style))
    schema_data = [
        [Paragraph("Field", table_th), Paragraph("Type", table_th), Paragraph("Purpose", table_th)],
        [Paragraph("id", table_td_bold), Paragraph("UUID (v4)", table_td), Paragraph("Unique hazard identifier generated locally or by DB.", table_td)],
        [Paragraph("category", table_td_bold), Paragraph("Enum", table_td), Paragraph("'pothole' | 'clogged_drainage' | 'road_obstruction' | 'dark_street'", table_td)],
        [Paragraph("severity", table_td_bold), Paragraph("Enum", table_td), Paragraph("'low' (caution) | 'medium' (warning) | 'high' (danger)", table_td)],
        [Paragraph("location", table_td_bold), Paragraph("GEOGRAPHY(Point, 4326)", table_td), Paragraph("High-precision spatial coordinate point for PostGIS queries.", table_td)],
        [Paragraph("upvotes", table_td_bold), Paragraph("Integer", table_td), Paragraph("Community validation counter extending pin TTL.", table_td)],
        [Paragraph("expires_at", table_td_bold), Paragraph("Timestamp with TZ", table_td), Paragraph("Automated decay cutoff time (24h temporary, 7d physical).", table_td)],
        [Paragraph("sync_status", table_td_bold), Paragraph("Local State", table_td), Paragraph("'synced' | 'pending_sync' | 'failed' (IndexedDB state).", table_td)]
    ]
    story.append(make_table(schema_data, [100, 140, 264]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("RADAR RESULT EXPERIENCE", h3_style))
    story.append(Paragraph("• <b>Glanceable Radar Markers:</b> Custom Leaflet DivIcons styled with SVG radar rings and pulsing animations for high severity.", bullet_text))
    story.append(Paragraph("• <b>Proximity Awareness:</b> Displays exact distance from user's current GPS location (e.g., '180m away').", bullet_text))
    story.append(Paragraph("• <b>Live TTL Countdown:</b> Dynamic time-to-decay display (e.g., 'Expires in 18 hrs' or 'Expires in 5 days').", bullet_text))
    story.append(Paragraph("• <b>Community Validation Feedback:</b> Real-time upvote count with optimistic instant incrementing.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("RADAR HUD MODE", h3_style))
    story.append(Paragraph(
        "Full-screen 100dvh map with non-blocking floating controls, high-contrast dark theme (#020617), and screen wake-lock support for bike/car mounts.",
        body_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 7: SECTION 05 - SPATIAL & OFFLINE ARCHITECTURE
    # ==========================================
    story.append(Paragraph("SECTION 05", sec_tag))
    story.append(Paragraph("Spatial & offline architecture", sec_title))
    story.append(Paragraph("Combine local IndexedDB storage, PostGIS spatial queries, and Service Worker caching.", sec_subtitle))

    arch_data = [
        [Paragraph("Stage", table_th), Paragraph("Responsibility", table_th), Paragraph("Structured result", table_th)],
        [
            Paragraph("Geolocation Watcher", table_td_bold),
            Paragraph("Tracks device position with high accuracy and error fallback.", table_td),
            Paragraph("UserLocation { lat, lng, accuracy }", table_td)
        ],
        [
            Paragraph("IndexedDB Engine", table_td_bold),
            Paragraph("Stores offline reports and cached 5km hazards locally in browser.", table_td),
            Paragraph("LocalHazardQueue[]", table_td)
        ],
        [
            Paragraph("PostGIS Radius Query", table_td_bold),
            Paragraph("Executes ST_DWithin spatial query on PostgreSQL via Supabase RPC.", table_td),
            Paragraph("ActiveHazardsWithin5km[]", table_td)
        ],
        [
            Paragraph("Tile Caching Service Worker", table_td_bold),
            Paragraph("Caches CartoDB Dark Matter map tiles for offline visual rendering.", table_td),
            Paragraph("CachedTileResponse", table_td)
        ],
        [
            Paragraph("Sync Queue Manager", table_td_bold),
            Paragraph("Listens for online event and flushes pending reports to database.", table_td),
            Paragraph("SyncResult { pushed, failed }", table_td)
        ]
    ]
    story.append(make_table(arch_data, [130, 214, 160]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("REQUEST SEQUENCE", h3_style))
    story.append(Paragraph("1. App initializes ➔ Service worker serves cached app shell & map assets.", bullet_text))
    story.append(Paragraph("2. Browser GPS acquires user location ➔ queries PostGIS via `get_hazards_in_radius(lat, lng, 5000)`.", bullet_text))
    story.append(Paragraph("3. When user reports hazard ➔ written immediately to IndexedDB `pending_reports` table.", bullet_text))
    story.append(Paragraph("4. If online ➔ background fetch dispatches payload to Supabase; on success, mark as synced.", bullet_text))
    story.append(Paragraph("5. If offline ➔ UI shows amber sync badge; Service worker retries upon reconnect.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("ARCHITECTURAL BOUNDARY", h3_style))
    story.append(Paragraph(
        "Client handles fast UI rendering, GPS tracking, and IndexedDB persistence. Supabase handles PostGIS spatial indexing, "
        "anonymous RLS security policies, and automated TTL decay expiration.",
        body_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 8: SECTION 06 - SUPABASE DATA & SECURITY PLAN
    # ==========================================
    story.append(Paragraph("SECTION 06", sec_tag))
    story.append(Paragraph("Supabase data and security plan", sec_title))
    story.append(Paragraph("Strict spatial indexing and anonymous civic privacy without storing personal tracking data.", sec_subtitle))

    entity_data = [
        [Paragraph("Entity", table_th), Paragraph("Important fields", table_th), Paragraph("Purpose", table_th)],
        [
            Paragraph("hazards", table_td_bold),
            Paragraph("id, category, severity, location, upvotes, expires_at, created_at", table_td),
            Paragraph("Core PostGIS spatial table holding active road hazards.", table_td)
        ],
        [
            Paragraph("hazard_validations", table_td_bold),
            Paragraph("id, hazard_id, action_type ('upvote' | 'resolve'), device_hash, created_at", table_td),
            Paragraph("Audit trail preventing duplicate upvotes per device.", table_td)
        ],
        [
            Paragraph("spatial_index", table_td_bold),
            Paragraph("GIST(location)", table_td),
            Paragraph("PostGIS GIST spatial index for sub-10ms 5km radius queries.", table_td)
        ]
    ]
    story.append(make_table(entity_data, [110, 204, 190]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("SECURITY & PRIVACY REQUIREMENTS", h3_style))
    story.append(Paragraph("• <b>Zero-Login Row Level Security (RLS):</b> Anonymous public `SELECT` on non-expired hazards (`expires_at > NOW()`).", bullet_text))
    story.append(Paragraph("• <b>Rate-Limited Anonymous Inserts:</b> Public `INSERT` allowed with spatial deduplication and rate-limiting triggers.", bullet_text))
    story.append(Paragraph("• <b>Zero User Tracking / PII:</b> Bakás never stores user identity, email, IP addresses, or historical GPS breadcrumbs.", bullet_text))
    story.append(Paragraph("• <b>Anti-Tampering Constraints:</b> Check constraints enforce valid enum values (`category`, `severity`) and coordinate bounds.", bullet_text))
    story.append(Paragraph("• <b>Automated Decay Stored Procedure:</b> Scheduled cron job or RPC function to purge stale expired hazards automatically.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 9: SECTION 07 - MVP BOUNDARIES
    # ==========================================
    story.append(Paragraph("SECTION 07", sec_tag))
    story.append(Paragraph("MVP boundaries", sec_title))
    story.append(Paragraph("One sharp civic workflow: locate, report a hazard in 5s, view 5km radar, and sync offline.", sec_subtitle))

    scope_data = [
        [Paragraph("Build now", table_th), Paragraph("After the core flow", table_th), Paragraph("Explicitly out of scope", table_th)],
        [
            Paragraph("• Zero-login 1-tap hazard reporting", table_td),
            Paragraph("• Photo attachment for hazards", table_td),
            Paragraph("• Full turn-by-turn route navigation", table_td)
        ],
        [
            Paragraph("• 5km PostGIS radius radar map", table_td),
            Paragraph("• Push notifications for nearby hazards", table_td),
            Paragraph("• User profiles, social feeds, and chats", table_td)
        ],
        [
            Paragraph("• CartoDB Dark Matter Leaflet canvas", table_td),
            Paragraph("• Voice-activated hazard reporting", table_td),
            Paragraph("• Government agency dispatch CRM", table_td)
        ],
        [
            Paragraph("• IndexedDB offline-first sync queue", table_td),
            Paragraph("• Heatmap density visualizations", table_td),
            Paragraph("• Commercial ad banners / monetization", table_td)
        ],
        [
            Paragraph("• Community upvotes & auto-decay TTL", table_td),
            Paragraph("• PWA desktop dock integration", table_td),
            Paragraph("• Complex polygon hazard geofences", table_td)
        ]
    ]
    story.append(make_table(scope_data, [168, 168, 168]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("MVP ACCEPTANCE CHECKLIST", h3_style))
    story.append(Paragraph("• First-time user can open the app and see active hazards within 5km in under 2 seconds.", bullet_text))
    story.append(Paragraph("• Reporting a hazard takes under 5 seconds with zero text input required.", bullet_text))
    story.append(Paragraph("• Offline report creation stores correctly in IndexedDB and syncs to Supabase upon reconnecting.", bullet_text))
    story.append(Paragraph("• Map panning triggers debounced PostGIS queries without UI stutter (60fps).", bullet_text))
    story.append(Paragraph("• Tapping 'Still Here (+1)' increments the counter and extends the pin's TTL.", bullet_text))
    story.append(Paragraph("• Mobile viewport layout operates cleanly with 1-handed thumb reachability.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("SCOPE TEST", h3_style))
    story.append(Paragraph(
        "If a feature does not directly help a commuter report a road hazard in 5 seconds or view nearby hazards within 5km, "
        "it does not belong in the MVP.",
        callout_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 10: SECTION 08 - UI AND VISUAL DIRECTION
    # ==========================================
    story.append(Paragraph("SECTION 08", sec_tag))
    story.append(Paragraph("UI and visual direction", sec_title))
    story.append(Paragraph("A tactical dark slate command center that delivers instant glanceability without night-blindness.", sec_subtitle))

    ui_data = [
        [Paragraph("Element", table_th), Paragraph("Direction", table_th), Paragraph("Guardrail", table_th)],
        [
            Paragraph("Palette", table_td_bold),
            Paragraph("Deep midnight slate (#020617), dark surface cards (#0f172a), high-contrast text (#f8fafc).", table_td),
            Paragraph("Never use saturated rainbow pins; use opacity and radar pulse frequency for severity.", table_td)
        ],
        [
            Paragraph("Map Canvas", table_td_bold),
            Paragraph("Leaflet.js styled with CartoDB Dark Matter tiles.", table_td),
            Paragraph("Tiles must blend seamlessly with background to make radar pins pop.", table_td)
        ],
        [
            Paragraph("Typography", table_td_bold),
            Paragraph("Modern geometric sans-serif (Inter) with crisp tracking for metrics.", table_td),
            Paragraph("Keep labels ultra-short and scannable.", table_td)
        ],
        [
            Paragraph("Shape", table_td_bold),
            Paragraph("Rounded-2xl bottom sheets, pill chips, tactical 1px slate-700 borders.", table_td),
            Paragraph("Avoid heavy shadows; rely on luminous borders and backdrop blur.", table_td)
        ],
        [
            Paragraph("Motion", table_td_bold),
            Paragraph("Radar pulse loops (1.8s) for high severity, smooth spring bottom sheets.", table_td),
            Paragraph("Respect prefers-reduced-motion with instant static states.", table_td)
        ]
    ]
    story.append(make_table(ui_data, [80, 230, 194]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("FIRST-VIEWPORT CONTENT", h3_style))
    story.append(Paragraph("• <b>Top HUD:</b> Brand logo 'Bakás', Proximity Counter ('12 hazards in 5.0 km'), Sync Pill ('Online').", bullet_text))
    story.append(Paragraph("• <b>Radar Canvas:</b> Fullscreen interactive map with pulsing user GPS dot and nearby hazard pins.", bullet_text))
    story.append(Paragraph("• <b>Filter Chips:</b> Floating horizontal pills [ All ] [ ⚠️ Potholes ] [ 💧 Drainage ] [ 🌑 Dark Streets ].", bullet_text))
    story.append(Paragraph("• <b>Bottom Action HUD:</b> Recenter GPS Target + Elevated '+ Report Hazard' Action Pill.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("CORE STATES", h3_style))
    story.append(Paragraph(
        "<b>Empty:</b> 'All clear within 5km radar.' | <b>Loading:</b> Radar sweep indicator | <b>Success:</b> Glowing hazard pins | "
        "<b>Offline:</b> Amber status badge with local queue | <b>Error:</b> GPS permission fallback guidance.",
        body_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 11: SECTION 09 - RISKS AND MITIGATIONS
    # ==========================================
    story.append(Paragraph("SECTION 09", sec_tag))
    story.append(Paragraph("Risks and mitigations", sec_title))
    story.append(Paragraph("Anticipate spam, GPS inaccuracies, and offline edge cases before they affect users.", sec_subtitle))

    risk_data = [
        [Paragraph("Risk or hard question", table_th), Paragraph("Honest answer", table_th), Paragraph("MVP mitigation", table_th)],
        [
            Paragraph("Will anonymous zero-login lead to spam pins?", table_td),
            Paragraph("Trolls or accidental clicks can create false pins.", table_td),
            Paragraph("15m deduplication rule, rate limits, and 3-vote community resolution decay.", table_td)
        ],
        [
            Paragraph("Can urban GPS drift misplace pins?", table_td),
            Paragraph("Tall buildings and overpasses degrade GPS accuracy.", table_td),
            Paragraph("Display GPS accuracy circle and provide 1-tap drag-to-adjust pin mode.", table_td)
        ],
        [
            Paragraph("Will offline sync create duplicate records?", table_td),
            Paragraph("Device might retry submissions multiple times.", table_td),
            Paragraph("Client-generated UUID v4 guarantees idempotency during batch sync.", table_td)
        ],
        [
            Paragraph("What if obsolete pins stay on the map forever?", table_td),
            Paragraph("Resolved hazards ruin map credibility.", table_td),
            Paragraph("Strict automated TTL (24h/7d) removes inactive pins automatically.", table_td)
        ],
        [
            Paragraph("Is reporting while driving dangerous?", table_td),
            Paragraph("Drivers looking at phones cause accidents.", table_td),
            Paragraph("1-tap big button UI; safety disclaimer advising passenger use only.", table_td)
        ]
    ]
    story.append(make_table(risk_data, [130, 160, 214]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("NON-NEGOTIABLE BOUNDARIES", h3_style))
    story.append(Paragraph("• <b>Zero Account Friction:</b> Never introduce mandatory sign-up for viewing or reporting hazards.", bullet_text))
    story.append(Paragraph("• <b>Zero User Tracking:</b> Never log user movement routes or create location tracking histories.", bullet_text))
    story.append(Paragraph("• <b>Deterministic Decay:</b> All pins must have a finite `expires_at` timestamp; no permanent pins.", bullet_text))
    story.append(Paragraph("• <b>Strict 5km Bound:</b> Queries must never fetch whole-country datasets into client memory.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 12: SECTION 10 - VALIDATION AND SUCCESS CRITERIA
    # ==========================================
    story.append(Paragraph("SECTION 10", sec_tag))
    story.append(Paragraph("Validation and success criteria", sec_title))
    story.append(Paragraph("Measure whether commuters navigate safely and report quickly, not vanity metrics.", sec_subtitle))

    val_data = [
        [Paragraph("Layer", table_th), Paragraph("Method", table_th), Paragraph("Minimum evidence", table_th)],
        [
            Paragraph("Problem Validation", table_td_bold),
            Paragraph("Interview 5-8 daily motorcycle riders & commuters.", table_td),
            Paragraph("At least 4 report encountering unmapped potholes/floods weekly.", table_td)
        ],
        [
            Paragraph("Workflow Speed", table_td_bold),
            Paragraph("Time user from opening app to successful hazard drop.", table_td),
            Paragraph("Median report completion time is under 5 seconds.", table_td)
        ],
        [
            Paragraph("Offline Resilience", table_td_bold),
            Paragraph("Simulate airplane mode, drop 3 pins, restore network.", table_td),
            Paragraph("100% of offline reports sync to PostGIS without loss.", table_td)
        ],
        [
            Paragraph("Spatial Accuracy", table_td_bold),
            Paragraph("Test PostGIS radius query with 500 mock pins.", table_td),
            Paragraph("Query execution time <50ms with 0 false positives outside 5km.", table_td)
        ],
        [
            Paragraph("Performance", table_td_bold),
            Paragraph("Lighthouse mobile audit & 60fps pan benchmark.", table_td),
            Paragraph("Performance score >90; smooth 60fps tile and marker rendering.", table_td)
        ]
    ]
    story.append(make_table(val_data, [110, 194, 200]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("CORE SUCCESS METRICS", h3_style))
    story.append(Paragraph("• <b>Report Velocity:</b> Time to submit hazard trace < 5.0 seconds.", bullet_text))
    story.append(Paragraph("• <b>Offline Sync Rate:</b> 100% successful ingestion of queued IndexedDB reports upon reconnect.", bullet_text))
    story.append(Paragraph("• <b>Spatial Query Latency:</b> PostGIS 5km bounding box query < 100ms on 4G connections.", bullet_text))
    story.append(Paragraph("• <b>Decay Accuracy:</b> 0 stale pins remaining past their designated TTL window.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("TEST INTEGRITY FIXTURES", h3_style))
    story.append(Paragraph(
        "Freeze golden test fixtures for 4 core urban scenarios: (1) EDSA deep pothole, (2) España Blvd clogged drainage flood, "
        "(3) Katipunan unlit street section, and (4) C-5 road debris obstruction.",
        body_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 13: SECTION 11 - BUILD PHASE MAP: FOUNDATION (PHASES 1-8)
    # ==========================================
    story.append(Paragraph("SECTION 11", sec_tag))
    story.append(Paragraph("Build phase map: foundation", sec_title))
    story.append(Paragraph("The first eight phases establish clarity, tactical visual identity, and a robust static frontend.", sec_subtitle))

    p1_8_data = [
        [Paragraph("Phase", table_th), Paragraph("Outcome", table_th), Paragraph("Key deliverables", table_th), Paragraph("Exit gate", table_th)],
        [
            Paragraph("1. Product Definition", table_td_bold),
            Paragraph("Stable civic promise & trust boundary.", table_td),
            Paragraph("Brief, non-goals, trust copy, golden fixtures.", table_td),
            Paragraph("MVP fits in one sentence.", table_td)
        ],
        [
            Paragraph("2. Scope & Success", table_td_bold),
            Paragraph("Realistic 5km offline-first MVP.", table_td),
            Paragraph("MVP contract, criteria, deferred features.", table_td),
            Paragraph("Every feature is now, next, or out.", table_td)
        ],
        [
            Paragraph("3. Hazard Domain Research", table_td_bold),
            Paragraph("Taxonomy of road hazards & decay rules.", table_td),
            Paragraph("Hazard categories, TTL matrix, risk log.", table_td),
            Paragraph("Each category has positive/negative rules.", table_td)
        ],
        [
            Paragraph("4. Information Architecture", table_td_bold),
            Paragraph("Complete product map & state matrix.", table_td),
            Paragraph("HUD shell map, bottom sheets, state inventory.", table_td),
            Paragraph("No undefined core state.", table_td)
        ],
        [
            Paragraph("5. UX Wireframes", table_td_bold),
            Paragraph("Understandable 5s flow before polish.", table_td),
            Paragraph("Wireframes, copy deck, thumb-zone layout.", table_td),
            Paragraph("User identifies FAB, report, and pins.", table_td)
        ],
        [
            Paragraph("6. Tactical Visual System", table_td_bold),
            Paragraph("Dark slate monochrome command center.", table_td),
            Paragraph("Tokens (#020617), CartoDB theme, radar pulses.", table_td),
            Paragraph("Contrast and night-vision pass.", table_td)
        ],
        [
            Paragraph("7. Technical Foundation", table_td_bold),
            Paragraph("Maintainable React + TypeScript + Vite base.", table_td),
            Paragraph("App shell, Leaflet setup, types, scripts.", table_td),
            Paragraph("Install, build, lint, typecheck pass.", table_td)
        ],
        [
            Paragraph("8. Static Radar UI", table_td_bold),
            Paragraph("Full journey works with controlled mock data.", table_td),
            Paragraph("Interactive map, mock pins, bottom sheets.", table_td),
            Paragraph("Demo works without backend.", table_td)
        ]
    ]
    story.append(make_table(p1_8_data, [95, 125, 144, 140]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("WORKING RULE", h3_style))
    story.append(Paragraph(
        "Do not connect Supabase or complex PostGIS queries to a map UI that is still shifting at the component and state level. "
        "Static UI is the first proof that the product is glanceable and intuitive.",
        callout_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 14: SECTION 12 - BUILD PHASE MAP: PRODUCT DEPTH & RELEASE (PHASES 9-16)
    # ==========================================
    story.append(Paragraph("SECTION 12", sec_tag))
    story.append(Paragraph("Build phase map: product depth and release", sec_title))
    story.append(Paragraph("Add spatial queries, offline sync, community validation, and PWA capabilities in careful sequence.", sec_subtitle))

    p9_16_data = [
        [Paragraph("Phase", table_th), Paragraph("Outcome", table_th), Paragraph("Key deliverables", table_th), Paragraph("Exit gate", table_th)],
        [
            Paragraph("9. Hazard Data Contract", table_td_bold),
            Paragraph("Stable schema for hazard records & TTL.", table_td),
            Paragraph("TypeScript schemas, validators, mock fixtures.", table_td),
            Paragraph("Fixtures render without runtime hacks.", table_td)
        ],
        [
            Paragraph("10. PostGIS Viewport Engine", table_td_bold),
            Paragraph("5km proximity spatial query handler.", table_td),
            Paragraph("Leaflet bounds listener, debounced fetcher.", table_td),
            Paragraph("Pan & zoom queries render smoothly.", table_td)
        ],
        [
            Paragraph("11. Offline IndexedDB Sync", table_td_bold),
            Paragraph("Zero data loss in cellular dead zones.", table_td),
            Paragraph("IndexedDB queue, sync manager, offline toast.", table_td),
            Paragraph("Offline reports sync on reconnect.", table_td)
        ],
        [
            Paragraph("12. Supabase PostGIS API", table_td_bold),
            Paragraph("PostgreSQL spatial backend & RLS.", table_td),
            Paragraph("Migrations, ST_DWithin RPC, anonymous RLS.", table_td),
            Paragraph("Spatial RPC responds in <100ms.", table_td)
        ],
        [
            Paragraph("13. Validation & Decay", table_td_bold),
            Paragraph("Community upvoting & automated TTL decay.", table_td),
            Paragraph("Upvote RPC, anti-spam hash, decay cron.", table_td),
            Paragraph("Upvotes extend TTL; expired pins decay.", table_td)
        ],
        [
            Paragraph("14. PWA Native Hardening", table_td_bold),
            Paragraph("Installable app with offline tile caching.", table_td),
            Paragraph("Manifest, Service Worker, GPS wake-lock.", table_td),
            Paragraph("PWA installs and opens offline.", table_td)
        ],
        [
            Paragraph("15. Safety & Performance", table_td_bold),
            Paragraph("Hardened, accessible, 60fps product.", table_td),
            Paragraph("WCAG 2.1 AA audit, rate limits, 60fps pass.", table_td),
            Paragraph("No critical safety/a11y defects.", table_td)
        ],
        [
            Paragraph("16. Production Release", table_td_bold),
            Paragraph("Live, documented, portfolio-ready release.", table_td),
            Paragraph("Vercel deployment, README, demo script.", table_td),
            Paragraph("Fresh reviewer tests in 5 mins.", table_td)
        ]
    ]
    story.append(make_table(p9_16_data, [95, 125, 144, 140]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("DEPENDENCY RULE", h3_style))
    story.append(Paragraph(
        "Offline sync, PostGIS spatial queries, and community upvoting are valuable only after the basic map canvas, "
        "tactical dark UI, and local reporting flows are rock solid.",
        callout_text
    ))
    story.append(PageBreak())

    # ==========================================
    # PAGE 15: SECTION 13 - DETAILED PHASES 1-6
    # ==========================================
    story.append(Paragraph("SECTION 13", sec_tag))
    story.append(Paragraph("Detailed phases 1-6", sec_title))
    story.append(Paragraph("Define product boundaries, hazard taxonomy, and visual design before writing code.", sec_subtitle))

    story.append(Paragraph("PHASE 1: PRODUCT DEFINITION AND TRUST BOUNDARY", h3_style))
    story.append(Paragraph("<b>Outcome:</b> One stable civic promise, target user profile, and honest zero-login boundary.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Define commuter & motorcyclist use cases; establish anonymous privacy rules; create golden fixtures.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Product brief, non-goals, trust copy, initial hazard fixture set.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> A first-time user understands Bakás in 30 seconds.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 2: SCOPE AND SUCCESS CRITERIA", h3_style))
    story.append(Paragraph("<b>Outcome:</b> A tightly scoped, testable MVP contract.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Prioritize 5km radar, 1-tap reporting, IndexedDB offline sync; defer photo uploads and routing.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> MVP feature contract, acceptance checklist, deferred feature roadmap.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Every feature is classified as Now, Next, or Out.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 3: ROAD HAZARD DOMAIN RESEARCH", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Grounded taxonomy for urban road hazards, PostGIS coordinate systems, and decay logic.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Define 4 core categories (Pothole, Drainage, Obstruction, Dark Street); establish 24h/7d TTL rules.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Category schema, TTL decay matrix, spatial accuracy notes, safety risk log.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Each hazard category has clear TTL, severity rules, and deduplication thresholds.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 4: INFORMATION ARCHITECTURE AND USER FLOW", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Complete application shell map from GPS lock to hazard submission.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Map HUD shell, Report bottom sheet, Hazard detail modal, Filter drawer, and Offline Sync manager.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Information architecture blueprint, screen inventory, complete state matrix.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> No screen depends on an undefined loading or error state.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 5: UX WIREFRAMES AND INTERACTION CONTRACT", h3_style))
    story.append(Paragraph("<b>Outcome:</b> An intuitive 1-handed mobile flow designed for rapid thumb reachability.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Wireframe bottom action HUD, category 2x2 grid, severity selector, and validation buttons.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Low-fidelity wireframes, copy deck, touch target ergonomic notes.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> User can identify the Report button and submit a test pin in under 5 seconds.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 6: TACTICAL VISUAL DESIGN SYSTEM", h3_style))
    story.append(Paragraph("<b>Outcome:</b> A distinct Dark Slate Monochrome command center aesthetic (#020617) with radar luminescence.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Finalize slate color tokens, CartoDB Dark Matter tile theme, radar pulse keyframes, and typography.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Tailwind design tokens, custom SVG marker DivIcons, typography scale, component specs.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Contrast ratios pass WCAG AAA; radar pins are distinct without rainbow clutter.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 16: SECTION 14 - DETAILED PHASES 7-11
    # ==========================================
    story.append(Paragraph("SECTION 14", sec_tag))
    story.append(Paragraph("Detailed phases 7-11", sec_title))
    story.append(Paragraph("Build the frontend base, static radar map, data schemas, PostGIS queries, and offline engine.", sec_subtitle))

    story.append(Paragraph("PHASE 7: TECHNICAL FOUNDATION AND TOOLING", h3_style))
    story.append(Paragraph("<b>Outcome:</b> A clean, type-safe React 19 + TypeScript + Vite workspace.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Configure Vite, Tailwind CSS, Leaflet.js, Lucide icons; set up linting, formatting, and build scripts.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Clean repository scaffold, tsconfig, package scripts, Leaflet CSS integration.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> `npm run build` and `npm run lint` execute cleanly with zero errors.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 8: STATIC RADAR UI AND STATE COVERAGE", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Complete clickable map interface operating on mock fixture data.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Build `MapRadarCanvas`, `TopHUD`, `CategoryFilterBar`, `ReportBottomSheet`, `DetailBottomSheet`.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Interactive dark map, custom pulsing DivIcons, bottom sheet gestures, state mocks.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Full user journey demos cleanly without external backend dependencies.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 9: HAZARD DATA CONTRACT AND FIXTURE ENGINE", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Strict TypeScript data schemas and adapters preventing malformed data.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Define `Hazard`, `HazardPayload`, and `ValidationAction` types; build TTL decay calculation helpers.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Data schema module, validation functions, golden fixtures for Manila urban road tests.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Runtime validator safely rejects malformed coordinates or invalid enum values.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 10: POSTGIS SPATIAL VIEWPORT ENGINE", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Dynamic 5km proximity query engine with smooth Leaflet bounds handling.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Implement debounced map moveend listener; calculate bounding boxes; render clustered pins.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> `useHazardViewport` hook, spatial distance calculators, marker cluster optimization.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Panning and zooming triggers smooth fetches with zero frame drops (60fps).", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 11: OFFLINE-FIRST ENGINE AND INDEXEDDB SYNC", h3_style))
    story.append(Paragraph("<b>Outcome:</b> 100% offline resilience for reports created in cellular dead zones.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Integrate `idb` IndexedDB wrapper; build offline queue; implement auto-sync manager on `window.online`.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> `offlineStorage` service, `useSyncManager` hook, offline status UI badge.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Offline submissions persist in IndexedDB and flush to API upon reconnect.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 17: SECTION 15 - DETAILED PHASES 12-16
    # ==========================================
    story.append(Paragraph("SECTION 15", sec_tag))
    story.append(Paragraph("Detailed phases 12-16", sec_title))
    story.append(Paragraph("Connect Supabase PostGIS, automate decay, harden PWA capabilities, and execute release verification.", sec_subtitle))

    story.append(Paragraph("PHASE 12: SUPABASE POSTGIS BACKEND AND SPATIAL API", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Production PostgreSQL database with PostGIS spatial indexing and anonymous RLS.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Write SQL migrations for `hazards` table (GEOGRAPHY Point); create `get_hazards_in_radius` RPC; set RLS.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Database migration scripts, PostGIS RPC functions, Supabase client integration.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Spatial radius RPC responds in under 50ms for 5km bounding queries.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 13: COMMUNITY VALIDATION AND DECAY AUTOMATION", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Live community upvoting ('Still Here') and automated TTL data decay.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Implement `upvote_hazard` RPC; calculate TTL extension (+12h/+48h); set client fingerprinting to prevent vote spam.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Validation services, decay worker function, client anti-spam fingerprinting module.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Upvoting extends `expires_at`; 3 'Resolved' flags fade and decay the pin.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 14: PWA NATIVE HARDENING AND TILE CACHING", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Installable Progressive Web App with offline tile caching and wake-lock.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Configure Web App Manifest, Service Worker Workbox caching for CartoDB tiles, screen wake-lock API.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> `manifest.webmanifest`, `sw.js` tile caching strategy, PWA install prompt banner.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> App installs cleanly on Android/iOS and opens reliably with zero internet connection.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 15: SAFETY, ACCESSIBILITY, AND PERFORMANCE REVIEW", h3_style))
    story.append(Paragraph("<b>Outcome:</b> A resilient, accessible, and high-performance civic utility.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Run Lighthouse audit; verify outdoor sunlight contrast; test keyboard & screen reader navigation.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> QA test report, accessibility remediation notes, rate-limiting security check.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> Lighthouse score >90; zero critical accessibility or safety blockers.", bullet_text))
    story.append(Spacer(1, 4))

    story.append(Paragraph("PHASE 16: PRODUCTION DEPLOYMENT AND PORTFOLIO PROOF", h3_style))
    story.append(Paragraph("<b>Outcome:</b> Live Vercel deployment, comprehensive documentation, and structured demo flow.", bullet_text))
    story.append(Paragraph("<b>Workstreams:</b> Deploy to Vercel with HTTPS; configure Supabase environment secrets; write comprehensive README.", bullet_text))
    story.append(Paragraph("<b>Deliverables:</b> Live production URL, documentation suite, walkthrough guide, portfolio demo rehearsal.", bullet_text))
    story.append(Paragraph("<b>Exit Gate:</b> A fresh reviewer can test the live app and report a hazard in under 5 minutes.", bullet_text))
    story.append(PageBreak())

    # ==========================================
    # PAGE 18: SECTION 16 - DEMO STORY AND DECISION LOG
    # ==========================================
    story.append(Paragraph("SECTION 16", sec_tag))
    story.append(Paragraph("Demo story and decision log", sec_title))
    story.append(Paragraph("The strongest portfolio story proves that Bakás delivers instant civic safety without friction.", sec_subtitle))

    demo_data = [
        [Paragraph("Time", table_th), Paragraph("Action", table_th), Paragraph("What the audience learns", table_th)],
        [
            Paragraph("0:00 - 0:20", table_td_bold),
            Paragraph("Open Bakás ➔ instant GPS lock on dark radar map.", table_td),
            Paragraph("Zero-login entry; tactical dark command center aesthetic.", table_td)
        ],
        [
            Paragraph("0:20 - 0:45", table_td_bold),
            Paragraph("Inspect 5km proximity hazards and toggle category chips.", table_td),
            Paragraph("PostGIS 5km spatial filtering loads only relevant nearby hazards.", table_td)
        ],
        [
            Paragraph("0:45 - 1:15", table_td_bold),
            Paragraph("Tap '+ Report Hazard' ➔ select 'Pothole' ➔ tap 'Submit'.", table_td),
            Paragraph("1-tap reporting takes under 5 seconds with zero typing.", table_td)
        ],
        [
            Paragraph("1:15 - 1:45", table_td_bold),
            Paragraph("Toggle Airplane Mode ➔ drop 'Clogged Drainage' pin.", table_td),
            Paragraph("IndexedDB saves report offline; UI shows amber sync queue badge.", table_td)
        ],
        [
            Paragraph("1:45 - 2:15", table_td_bold),
            Paragraph("Re-enable network ➔ watch automatic background sync.", table_td),
            Paragraph("Offline report syncs to Supabase; pin updates to verified status.", table_td)
        ],
        [
            Paragraph("2:15 - 2:40", table_td_bold),
            Paragraph("Tap existing hazard ➔ tap 'Still Here (+1)'.", table_td),
            Paragraph("Community validation extends TTL and increases marker pulse.", table_td)
        ],
        [
            Paragraph("2:40 - 3:00", table_td_bold),
            Paragraph("Showcase PostGIS architecture and automated data decay.", table_td),
            Paragraph("Product is built with extreme engineering rigor and civic safety focus.", table_td)
        ]
    ]
    story.append(make_table(demo_data, [70, 214, 220]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("DECISION LOG", h3_style))
    dec_data = [
        [Paragraph("Decision", table_th), Paragraph("Reason", table_th)],
        [
            Paragraph("React + TypeScript + Vite", table_td_bold),
            Paragraph("Lightning-fast load times, strict type safety, and clean component modularity.", table_td)
        ],
        [
            Paragraph("Leaflet + CartoDB Dark Matter", table_td_bold),
            Paragraph("Lightweight tile rendering with perfect tactical dark aesthetic and low memory footprint.", table_td)
        ],
        [
            Paragraph("Supabase PostgreSQL + PostGIS", table_td_bold),
            Paragraph("Native spatial geometry types (`ST_DWithin`) enabling ultra-fast proximity queries.", table_td)
        ],
        [
            Paragraph("IndexedDB Offline Queue", table_td_bold),
            Paragraph("Guarantees zero data loss when users report hazards in cellular dead zones or tunnels.", table_td)
        ],
        [
            Paragraph("Zero-Login Architecture", table_td_bold),
            Paragraph("Eliminates all barrier to entry; road safety reporting must be instantaneous for everyone.", table_td)
        ],
        [
            Paragraph("Automated Data Decay (24h/7d)", table_td_bold),
            Paragraph("Prevents stale 'ghost hazards' and maintains high community trust in active map pins.", table_td)
        ]
    ]
    story.append(make_table(dec_data, [160, 344]))
    story.append(Spacer(1, 4))

    story.append(Paragraph("FINAL SCOPE TEST", h3_style))
    story.append(Paragraph(
        "If a feature does not directly empower an urban commuter to report a hazard in 5 seconds or view nearby hazards within 5km, "
        "it should not be part of the first Bakás release.",
        callout_text
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    create_bakas_pdf()
