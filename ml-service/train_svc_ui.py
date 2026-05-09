import os
import json
import joblib
import time
import threading
import tkinter.font as tkfont
import customtkinter as ctk

from classification.preprocess import load_and_prepare_data

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Palette ────────────────────────────────────────────────────────────────────
BG_BASE    = "#0A0A0A"
BG_PANEL   = "#111111"
BG_CARD    = "#161616"
BG_ROW     = "#181818"
BG_INPUT   = "#1C1C1C"

BORDER     = "#242424"
BORDER_MD  = "#2E2E2E"

ACCENT        = "#2563EB"
ACCENT_HOVER  = "#1D4ED8"
ACCENT_DIM    = "#0F2340"
ACCENT_TEXT   = "#93C5FD"

SUCCESS       = "#22C55E"
SUCCESS_DIM   = "#052E16"
SUCCESS_TEXT  = "#86EFAC"

DANGER        = "#EF4444"
DANGER_DIM    = "#2A0808"
DANGER_TEXT   = "#FCA5A5"

TEXT_PRIMARY   = "#F5F5F5"
TEXT_SECONDARY = "#888888"
TEXT_MUTED     = "#444444"
TEXT_FAINT     = "#333333"


# ── Font helper ────────────────────────────────────────────────────────────────
def _font(family, size, weight="normal"):
    available = tkfont.families()
    fallbacks = {
        "SF Pro Display": ["Helvetica Neue", "Helvetica", "Arial"],
        "SF Pro Text":    ["Helvetica Neue", "Helvetica", "Arial"],
        "JetBrains Mono": ["Cascadia Code", "Consolas", "Courier New", "Courier"],
    }
    resolved = family
    if family not in available:
        for alt in fallbacks.get(family, []):
            if alt in available:
                resolved = alt
                break
        else:
            resolved = "TkDefaultFont"
    return ctk.CTkFont(family=resolved, size=size, weight="bold")


# ══════════════════════════════════════════════════════════════════════════════
class TrainingDashboard(ctk.CTk):

    STEPS = [
        "Load dataset",
        "Dataset info",
        "Split train / test",
        "Build pipeline",
        "Train SVC model",
        "Predict test data",
        "Evaluate model",
        "Save model",
        "Save metrics",
    ]

    def __init__(self):
        super().__init__()
        self.title("SVC Training Dashboard")
        self.geometry("1100x680")
        self.minsize(960, 600)
        self.configure(fg_color=BG_BASE)

        self._step_widgets: dict = {}
        self._training_thread: threading.Thread | None = None

        # Typed placeholders to silence linters
        self._r_time:    ctk.CTkLabel
        self._r_model:   ctk.CTkLabel
        self._r_metrics: ctk.CTkLabel
        self._r_kernel:  ctk.CTkLabel
        self._r_C:       ctk.CTkLabel
        self._r_gamma:   ctk.CTkLabel
        self._r_test:    ctk.CTkLabel

        self._build_ui()

    # ──────────────────────────────────────────────────────────────────────────
    # UI construction
    # ──────────────────────────────────────────────────────────────────────────

    def _build_ui(self):
        self._build_topbar()

        body = ctk.CTkFrame(self, fg_color=BG_BASE)
        body.pack(fill="both", expand=True)
        body.grid_columnconfigure(0, weight=0, minsize=210)
        body.grid_columnconfigure(1, weight=1)
        body.grid_columnconfigure(2, weight=0, minsize=210)
        body.grid_rowconfigure(0, weight=1)

        left   = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)
        center = ctk.CTkFrame(body, fg_color=BG_BASE,  corner_radius=0)
        right  = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)

        left.grid  (row=0, column=0, sticky="nsew")
        center.grid(row=0, column=1, sticky="nsew", padx=(1, 1))
        right.grid (row=0, column=2, sticky="nsew")

        self._build_left(left)
        self._build_center(center)
        self._build_right(right)

    # ── Topbar ─────────────────────────────────────────────────────────────────
    def _build_topbar(self):
        bar = ctk.CTkFrame(self, height=52, fg_color=BG_CARD, corner_radius=0)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        # Left
        left_wrap = ctk.CTkFrame(bar, fg_color="transparent")
        left_wrap.place(x=16, rely=0.5, anchor="w")

        ctk.CTkLabel(
            left_wrap,
            text="SVC Training Dashboard",
            font=_font("SF Pro Display", 14, "bold"),
            text_color=TEXT_PRIMARY,
        ).pack(side="left")

        ctk.CTkLabel(
            left_wrap,
            text="  ·  StandardScaler · rbf kernel",
            font=_font("SF Pro Text", 12),
            text_color=TEXT_MUTED,
        ).pack(side="left")

        # Right
        right_wrap = ctk.CTkFrame(bar, fg_color="transparent")
        right_wrap.place(relx=1.0, rely=0.5, anchor="e", x=-16)

        self._status_badge = ctk.CTkLabel(
            right_wrap,
            text="● Ready",
            font=_font("SF Pro Text", 11),
            text_color=TEXT_MUTED,
            fg_color=BG_INPUT,
            corner_radius=100,
            padx=10,
            pady=3,
        )
        self._status_badge.pack(side="left", padx=(0, 8))

        ctk.CTkButton(
            right_wrap,
            text="Clear",
            width=72,
            height=28,
            fg_color=BG_INPUT,
            hover_color=BORDER_MD,
            text_color=TEXT_PRIMARY,
            font=_font("SF Pro Text", 12),
            border_width=1,
            border_color=BORDER,
            corner_radius=6,
            command=self._clear,
        ).pack(side="left", padx=(0, 6))

        self._start_btn = ctk.CTkButton(
            right_wrap,
            text="Start training",
            width=110,
            height=28,
            fg_color=ACCENT,
            hover_color=ACCENT_HOVER,
            text_color="#FFFFFF",
            font=_font("SF Pro Text", 12, "bold"),
            corner_radius=6,
            command=self._start_training,
        )
        self._start_btn.pack(side="left")

        # Border
        ctk.CTkFrame(self, height=1, fg_color=BORDER).pack(fill="x")

    # ── Left panel ────────────────────────────────────────────────────────────
    def _build_left(self, parent):
        wrap = ctk.CTkScrollableFrame(
            parent, fg_color="transparent",
            scrollbar_button_color=BORDER_MD,
            scrollbar_button_hover_color="#3A3A3A",
        )
        wrap.pack(fill="both", expand=True)

        # Progress block
        prog = ctk.CTkFrame(wrap, fg_color="transparent")
        prog.pack(fill="x", padx=12, pady=(12, 0))

        top_row = ctk.CTkFrame(prog, fg_color="transparent")
        top_row.pack(fill="x", pady=(0, 4))

        self._pct_label = ctk.CTkLabel(
            top_row,
            text="0%",
            font=_font("SF Pro Display", 22, "bold"),
            text_color=TEXT_PRIMARY,
        )
        self._pct_label.pack(side="left")

        self._status_msg = ctk.CTkLabel(
            top_row,
            text="Waiting to start",
            font=_font("SF Pro Text", 10),
            text_color=TEXT_MUTED,
        )
        self._status_msg.pack(side="right", pady=0)

        self._progress_bar = ctk.CTkProgressBar(
            prog,
            height=3,
            progress_color=ACCENT,
            fg_color=BG_INPUT,
            corner_radius=2,
        )
        self._progress_bar.pack(fill="x")
        self._progress_bar.set(0)

        # Separator
        ctk.CTkFrame(wrap, height=1, fg_color=BORDER).pack(fill="x", padx=0, pady=(12, 0))

        # Steps label
        ctk.CTkLabel(
            wrap,
            text="TRAINING STEPS",
            font=_font("SF Pro Text", 9, "bold"),
            text_color=TEXT_FAINT,
        ).pack(anchor="w", padx=12, pady=(8, 4))

        # Step rows
        for i, step in enumerate(self.STEPS):
            row = ctk.CTkFrame(wrap, fg_color=BG_ROW, corner_radius=6, height=36)
            row.pack(fill="x", padx=8, pady=2)
            row.pack_propagate(False)

            num = ctk.CTkLabel(
                row,
                text=str(i + 1),
                width=20,
                height=20,
                font=_font("SF Pro Text", 10),
                text_color=TEXT_MUTED,
                fg_color=BG_INPUT,
                corner_radius=10,
            )
            num.pack(side="left", padx=(8, 6), pady=8)

            lbl = ctk.CTkLabel(
                row,
                text=step,
                font=_font("SF Pro Text", 12),
                text_color=TEXT_SECONDARY,
                anchor="w",
            )
            lbl.pack(side="left", pady=8, fill="x", expand=True)

            icon = ctk.CTkLabel(
                row,
                text="",
                font=_font("SF Pro Text", 11),
                text_color=TEXT_MUTED,
                width=24,
            )
            icon.pack(side="right", padx=6)

            self._step_widgets[step] = {
                "row": row, "num": num, "label": lbl, "icon": icon,
            }

    # ── Center panel ──────────────────────────────────────────────────────────
    def _build_center(self, parent):
        scroll = ctk.CTkScrollableFrame(
            parent, fg_color="transparent",
            scrollbar_button_color=BORDER_MD,
        )
        scroll.pack(fill="both", expand=True, padx=0, pady=0)

        # Metric cards
        metrics_row = ctk.CTkFrame(scroll, fg_color="transparent")
        metrics_row.pack(fill="x", padx=10, pady=(10, 0))
        metrics_row.grid_columnconfigure((0, 1, 2), weight=1)

        self._acc_val = self._metric_card(metrics_row, "Accuracy",    0)
        self._f1w_val = self._metric_card(metrics_row, "F1 weighted", 1)
        self._f1m_val = self._metric_card(metrics_row, "F1 macro",    2)

        # Dataset summary
        ds_card = self._section_card(scroll, "Dataset summary", pady_top=10)

        self._dataset_label = ctk.CTkLabel(
            ds_card,
            text="No dataset loaded yet.",
            font=_font("JetBrains Mono", 10),
            text_color=TEXT_SECONDARY,
            justify="left",
            anchor="w",
        )
        self._dataset_label.pack(anchor="w", padx=12, pady=(8, 10), fill="x")

        # Confusion matrix
        cm_card = self._section_card(scroll, "Confusion matrix", pady_top=8, expand=True)

        self._matrix_box = ctk.CTkTextbox(
            cm_card,
            fg_color=BG_BASE,
            text_color=TEXT_SECONDARY,
            font=_font("JetBrains Mono", 10),
            corner_radius=4,
            border_width=0,
            height=160,
        )
        self._matrix_box.pack(fill="both", expand=True, padx=10, pady=(6, 10))
        self._matrix_box.insert("end", "Awaiting evaluation…")
        self._matrix_box.configure(state="disabled")

    def _section_card(self, parent, title, pady_top: int = 8, expand: bool = False):
        """Create a labelled section card and return its body frame."""
        outer = ctk.CTkFrame(parent, fg_color=BG_CARD, corner_radius=8,
                             border_width=1, border_color=BORDER)
        if expand:
            outer.pack(fill="both", expand=True, padx=10, pady=pady_top)
        else:
            outer.pack(fill="x", padx=10, pady=pady_top)

        # Header
        hdr = ctk.CTkFrame(outer, fg_color="transparent", height=32)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        ctk.CTkLabel(
            hdr,
            text=title,
            font=_font("SF Pro Display", 12, "bold"),
            text_color=TEXT_PRIMARY,
        ).pack(side="left", padx=12, pady=6)

        ctk.CTkFrame(outer, height=1, fg_color=BORDER).pack(fill="x")
        return outer

    def _metric_card(self, parent, title, col):
        card = ctk.CTkFrame(
            parent, fg_color=BG_CARD, corner_radius=8,
            border_width=1, border_color=BORDER,
        )
        card.grid(row=0, column=col,
                  padx=(0 if col == 0 else 6, 0),
                  sticky="nsew", pady=0)

        ctk.CTkLabel(
            card,
            text=title,
            font=_font("SF Pro Text", 11),
            text_color=TEXT_SECONDARY,
        ).pack(anchor="w", padx=10, pady=(8, 2))

        val_lbl = ctk.CTkLabel(
            card,
            text="—",
            font=_font("SF Pro Display", 20, "bold"),
            text_color=TEXT_MUTED,
        )
        val_lbl.pack(anchor="w", padx=10, pady=(0, 8))
        return val_lbl

    # ── Right panel ───────────────────────────────────────────────────────────
    def _build_right(self, parent):
        wrap = ctk.CTkFrame(parent, fg_color="transparent")
        wrap.pack(fill="both", expand=True, padx=12, pady=12)

        # Run info label
        ctk.CTkLabel(
            wrap,
            text="RUN INFO",
            font=_font("SF Pro Text", 9, "bold"),
            text_color=TEXT_FAINT,
        ).pack(anchor="w", pady=(0, 6))

        info_card = ctk.CTkFrame(
            wrap, fg_color=BG_CARD, corner_radius=8,
            border_width=1, border_color=BORDER,
        )
        info_card.pack(fill="x")

        def info_row(label, attr, default="—", mono=True):
            row = ctk.CTkFrame(info_card, fg_color="transparent", height=30)
            row.pack(fill="x")
            row.pack_propagate(False)

            ctk.CTkLabel(
                row,
                text=label,
                font=_font("SF Pro Text", 11),
                text_color=TEXT_SECONDARY,
                anchor="w",
                width=90,
            ).pack(side="left", padx=10)

            val = ctk.CTkLabel(
                row,
                text=default,
                font=_font("JetBrains Mono" if mono else "SF Pro Text", 10),
                text_color=TEXT_PRIMARY,
                anchor="e",
                wraplength=108,
                justify="right",
            )
            val.pack(side="right", padx=10)
            setattr(self, attr, val)

            ctk.CTkFrame(info_card, height=1, fg_color=BORDER).pack(fill="x")

        info_row("Training time", "_r_time")
        info_row("Model path",    "_r_model")
        info_row("Metrics path",  "_r_metrics")
        info_row("Kernel",        "_r_kernel",  "rbf",   mono=False)
        info_row("C",             "_r_C",       "1.0")
        info_row("Gamma",         "_r_gamma",   "scale", mono=False)
        info_row("Test size",     "_r_test",    "20%",   mono=False)
        info_row("Random state",  "_r_rstate",  "42")

        # Classification report
        ctk.CTkLabel(
            wrap,
            text="CLASSIFICATION REPORT",
            font=_font("SF Pro Text", 9, "bold"),
            text_color=TEXT_FAINT,
        ).pack(anchor="w", pady=(12, 6))

        self._report_box = ctk.CTkTextbox(
            wrap,
            fg_color=BG_CARD,
            text_color=TEXT_SECONDARY,
            font=_font("JetBrains Mono", 10),
            corner_radius=8,
            border_width=1,
            border_color=BORDER,
        )
        self._report_box.pack(fill="both", expand=True)
        self._report_box.insert("end", "No report yet.")
        self._report_box.configure(state="disabled")

    # ──────────────────────────────────────────────────────────────────────────
    # State helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _set_step(self, step, state: str):
        """state: 'pending' | 'active' | 'done' | 'error'"""
        w = self._step_widgets[step]

        if state == "active":
            w["row"].configure(fg_color=ACCENT_DIM)
            w["num"].configure(text_color=ACCENT_TEXT, fg_color="#0D2A5A")
            w["label"].configure(text_color=ACCENT_TEXT)
            w["icon"].configure(text="●", text_color=ACCENT)

        elif state == "done":
            w["row"].configure(fg_color=SUCCESS_DIM)
            w["num"].configure(text_color=SUCCESS_TEXT, fg_color="#0A2010")
            w["label"].configure(text_color=SUCCESS_TEXT)
            w["icon"].configure(text="✓", text_color=SUCCESS)

        elif state == "error":
            w["row"].configure(fg_color=DANGER_DIM)
            w["num"].configure(text_color=DANGER_TEXT, fg_color="#2A0808")
            w["label"].configure(text_color=DANGER_TEXT)
            w["icon"].configure(text="✕", text_color=DANGER)

        else:  # pending
            w["row"].configure(fg_color=BG_ROW)
            w["num"].configure(text_color=TEXT_MUTED, fg_color=BG_INPUT)
            w["label"].configure(text_color=TEXT_SECONDARY)
            w["icon"].configure(text="", text_color=TEXT_MUTED)

        self.update_idletasks()

    def _set_progress(self, pct: int, msg: str):
        self._progress_bar.set(pct / 100)
        self._pct_label.configure(text=f"{pct}%")
        self._status_msg.configure(text=msg)
        self.update_idletasks()

    def _set_badge(self, state: str):
        configs = {
            "ready":   ("● Ready",     TEXT_MUTED, BG_INPUT),
            "running": ("● Training…", ACCENT,     ACCENT_DIM),
            "done":    ("✓ Done",      SUCCESS,    SUCCESS_DIM),
            "error":   ("✕ Error",     DANGER,     DANGER_DIM),
        }
        text, fg, bg = configs[state]
        self._status_badge.configure(text=text, text_color=fg, fg_color=bg)
        self.update_idletasks()

    def _write_textbox(self, tb: ctk.CTkTextbox, text: str):
        tb.configure(state="normal")
        tb.delete("1.0", "end")
        tb.insert("end", text)
        tb.configure(state="disabled")

    def _set_metric(self, widget: ctk.CTkLabel, value: str):
        widget.configure(text=value, text_color=TEXT_PRIMARY)

    # ──────────────────────────────────────────────────────────────────────────
    # Clear
    # ──────────────────────────────────────────────────────────────────────────

    def _clear(self):
        self._set_progress(0, "Waiting to start")
        self._set_badge("ready")

        for step in self.STEPS:
            self._set_step(step, "pending")

        for w in (self._acc_val, self._f1w_val, self._f1m_val):
            w.configure(text="—", text_color=TEXT_MUTED)

        self._dataset_label.configure(text="No dataset loaded yet.")
        self._r_time.configure(text="—")
        self._r_model.configure(text="—")
        self._r_metrics.configure(text="—")

        self._write_textbox(self._matrix_box, "Awaiting evaluation…")
        self._write_textbox(self._report_box, "No report yet.")

    # ──────────────────────────────────────────────────────────────────────────
    # Training
    # ──────────────────────────────────────────────────────────────────────────

    def _start_training(self):
        self._clear()
        self._start_btn.configure(state="disabled")
        self._set_badge("running")
        self._training_thread = threading.Thread(target=self._train, daemon=True)
        self._training_thread.start()

    def _train(self):
        try:
            # ── 1. Load dataset ──────────────────────────────────────────────
            self._set_step("Load dataset", "active")
            self._set_progress(5, "Loading and preprocessing dataset")

            X, y = load_and_prepare_data()

            time.sleep(0.4)
            self._set_step("Load dataset", "done")

            # ── 2. Dataset info ──────────────────────────────────────────────
            self._set_step("Dataset info", "active")
            self._set_progress(14, "Reading dataset information")

            ds_text = (
                f"Feature shape : {X.shape}\n"
                f"Target shape  : {y.shape}\n\n"
                f"Total records : {len(y):,}\n"
                f"Total features: {X.shape[1]}\n\n"
                f"Class distribution:\n"
                + y.value_counts().to_string()
            )
            self._dataset_label.configure(text=ds_text)

            time.sleep(0.4)
            self._set_step("Dataset info", "done")

            # ── 3. Train / test split ────────────────────────────────────────
            self._set_step("Split train / test", "active")
            self._set_progress(24, "Splitting dataset into train / test sets")

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            ds_text += (
                f"\n\nTrain / test split:\n"
                f"  X_train : {X_train.shape}\n"
                f"  X_test  : {X_test.shape}\n"
                f"  y_train : {y_train.shape}\n"
                f"  y_test  : {y_test.shape}"
            )
            self._dataset_label.configure(text=ds_text)

            time.sleep(0.4)
            self._set_step("Split train / test", "done")

            # ── 4. Build pipeline ────────────────────────────────────────────
            self._set_step("Build pipeline", "active")
            self._set_progress(34, "Building StandardScaler + SVC pipeline")

            model = Pipeline([
                ("scaler", StandardScaler()),
                ("svc",    SVC(kernel="rbf", C=1.0, gamma="scale")),
            ])

            time.sleep(0.4)
            self._set_step("Build pipeline", "done")

            # ── 5. Train ─────────────────────────────────────────────────────
            self._set_step("Train SVC model", "active")
            start_time = time.time()

            for v in range(35, 68):
                self._set_progress(v, "Training SVC model…")
                time.sleep(0.03)

            model.fit(X_train, y_train)
            training_time = time.time() - start_time

            self._r_time.configure(text=f"{training_time:.4f} s")
            self._set_progress(68, "Training complete")
            self._set_step("Train SVC model", "done")

            # ── 6. Predict ───────────────────────────────────────────────────
            self._set_step("Predict test data", "active")
            self._set_progress(76, "Generating predictions on test set")

            y_pred = model.predict(X_test)

            time.sleep(0.4)
            self._set_step("Predict test data", "done")

            # ── 7. Evaluate ──────────────────────────────────────────────────
            self._set_step("Evaluate model", "active")
            self._set_progress(85, "Computing accuracy, F1, confusion matrix")

            accuracy    = accuracy_score(y_test, y_pred)
            f1_weighted = f1_score(y_test, y_pred, average="weighted")
            f1_macro    = f1_score(y_test, y_pred, average="macro")
            cm          = confusion_matrix(y_test, y_pred)
            report_dict = classification_report(y_test, y_pred, output_dict=True)
            report_text: str = str(classification_report(y_test, y_pred))
            labels      = sorted(y.unique())

            self._set_metric(self._acc_val, f"{accuracy:.2%}")
            self._set_metric(self._f1w_val, f"{f1_weighted:.2%}")
            self._set_metric(self._f1m_val, f"{f1_macro:.2%}")

            matrix_str = "Labels:  " + ", ".join(str(l) for l in labels)
            matrix_str += "\n\nMatrix:\n" + str(cm) + "\n\nPer class:\n"
            for i, row in enumerate(cm):
                matrix_str += f"  {labels[i]}: {row}\n"

            self._write_textbox(self._matrix_box, matrix_str)
            self._write_textbox(self._report_box, report_text)

            time.sleep(0.4)
            self._set_step("Evaluate model", "done")

            # ── 8. Save model ────────────────────────────────────────────────
            self._set_step("Save model", "active")
            self._set_progress(92, "Saving trained model to disk")

            BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
            ROOT_DIR  = os.path.dirname(BASE_DIR)
            MODEL_DIR = os.path.join(ROOT_DIR, "models")
            os.makedirs(MODEL_DIR, exist_ok=True)

            MODEL_PATH        = os.path.join(MODEL_DIR, "svc_model.pkl")
            METRICS_JSON_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.json")

            joblib.dump(model, MODEL_PATH)
            self._r_model.configure(text=MODEL_PATH)

            time.sleep(0.4)
            self._set_step("Save model", "done")

            # ── 9. Save metrics ──────────────────────────────────────────────
            self._set_step("Save metrics", "active")
            self._set_progress(97, "Saving metrics JSON")

            metrics_payload = {
                "model_name": "SVC",
                "model_config": {
                    "scaler":     "StandardScaler",
                    "classifier": "SVC",
                    "kernel":     "rbf",
                    "C":          1.0,
                    "gamma":      "scale",
                },
                "dataset_info": {
                    "feature_shape": list(X.shape),
                    "target_shape":  int(y.shape[0]),
                    "train_shape":   list(X_train.shape),
                    "test_shape":    list(X_test.shape),
                    "test_size":     0.2,
                    "random_state":  42,
                    "stratify":      True,
                },
                "class_labels": labels,
                "class_distribution": {
                    "full_dataset": y.value_counts().to_dict(),
                    "train_set":    y_train.value_counts().to_dict(),
                    "test_set":     y_test.value_counts().to_dict(),
                },
                "accuracy":              float(accuracy),
                "f1_weighted":           float(f1_weighted),
                "f1_macro":              float(f1_macro),
                "confusion_matrix":      cm.tolist(),
                "classification_report": report_dict,
                "training_time_seconds": float(training_time),
                "feature_names": list(X.columns) if hasattr(X, "columns") else [],
            }

            with open(METRICS_JSON_PATH, "w") as fh:
                json.dump(metrics_payload, fh, indent=2)

            self._r_metrics.configure(text=METRICS_JSON_PATH)

            time.sleep(0.4)
            self._set_step("Save metrics", "done")

            # ── Done ─────────────────────────────────────────────────────────
            self._set_progress(100, "Completed successfully")
            self._set_badge("done")

        except Exception as exc:
            self._set_badge("error")
            self._set_progress(
                int(self._progress_bar.get() * 100),
                "Error — see report panel",
            )
            for step in self.STEPS:
                w = self._step_widgets[step]
                if w["icon"].cget("text") == "●":
                    self._set_step(step, "error")

            self._write_textbox(
                self._report_box,
                f"ERROR\n{'─' * 36}\n{type(exc).__name__}: {exc}",
            )

        finally:
            self._start_btn.configure(state="normal")


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app = TrainingDashboard()
    app.mainloop()