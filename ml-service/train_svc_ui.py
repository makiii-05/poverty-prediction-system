import os
import json
import joblib
import time
import threading
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
    f1_score
)


ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Palette ────────────────────────────────────────────────────────────────────
BG_BASE      = "#0D0D0D"   # window / outermost
BG_PANEL     = "#141414"   # left / right panels
BG_CARD      = "#1A1A1A"   # cards inside center
BG_ROW       = "#1E1E1E"   # step rows, table rows
BG_ACTIVE    = "#0F2340"   # active step highlight
BG_DONE      = "#0D2318"   # done step highlight
BG_ERROR     = "#2A0D0D"   # error step highlight

ACCENT       = "#2563EB"   # primary blue
ACCENT_HOVER = "#1D4ED8"
SUCCESS      = "#22C55E"
DANGER       = "#EF4444"
WARNING      = "#F59E0B"

TEXT_PRIMARY   = "#F0F0F0"
TEXT_SECONDARY = "#9A9A9A"
TEXT_MUTED     = "#555555"

FONT_TITLE    = ("SF Pro Display", 26, "bold")
FONT_HEADING  = ("SF Pro Display", 15, "bold")
FONT_SUBHEAD  = ("SF Pro Text",    13, "bold")
FONT_BODY     = ("SF Pro Text",    13)
FONT_SMALL    = ("SF Pro Text",    11)
FONT_MONO     = ("JetBrains Mono", 12)
FONT_METRIC   = ("SF Pro Display", 26, "bold")
FONT_PCT      = ("SF Pro Display", 32, "bold")

# Fall back to system fonts if SF Pro / JetBrains Mono unavailable
import tkinter.font as tkfont


def _safe_font(preferred_family, size, *styles):
    """Return a CTkFont using preferred_family or fall back to system fonts."""
    available = tkfont.families()
    fallbacks = {
        "SF Pro Display": ["Helvetica Neue", "Helvetica", "Arial"],
        "SF Pro Text":    ["Helvetica Neue", "Helvetica", "Arial"],
        "JetBrains Mono": ["Cascadia Code", "Consolas", "Courier New", "Courier"],
    }
    family = preferred_family
    if preferred_family not in available:
        for alt in fallbacks.get(preferred_family, []):
            if alt in available:
                family = alt
                break
        else:
            family = "TkDefaultFont"
    return ctk.CTkFont(family=family, size=size, weight=styles[0] if styles else "normal")


# ── Helper: thin separator ─────────────────────────────────────────────────────
def HSep(parent, color="#2A2A2A", pady=(0, 0)):
    f = ctk.CTkFrame(parent, height=1, fg_color=color)
    f.pack(fill="x", padx=0, pady=pady)
    return f


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
        self.geometry("1260x780")
        self.minsize(1100, 680)
        self.configure(fg_color=BG_BASE)

        self._step_widgets = {}   # step_name → {"row", "icon", "label"}
        self._training_thread = None

        self._build_ui()

    # ──────────────────────────────────────────────────────────────────────────
    # UI construction
    # ──────────────────────────────────────────────────────────────────────────

    def _build_ui(self):
        self._build_topbar()

        # Three-column body
        body = ctk.CTkFrame(self, fg_color=BG_BASE)
        body.pack(fill="both", expand=True)
        body.grid_columnconfigure(0, weight=0, minsize=270)
        body.grid_columnconfigure(1, weight=1)
        body.grid_columnconfigure(2, weight=0, minsize=300)
        body.grid_rowconfigure(0, weight=1)

        left   = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)
        center = ctk.CTkFrame(body, fg_color=BG_BASE,  corner_radius=0)
        right  = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)

        left.grid  (row=0, column=0, sticky="nsew")
        center.grid(row=0, column=1, sticky="nsew", padx=1)
        right.grid (row=0, column=2, sticky="nsew")

        self._build_left(left)
        self._build_center(center)
        self._build_right(right)

    # ── Topbar ─────────────────────────────────────────────────────────────────
    def _build_topbar(self):
        bar = ctk.CTkFrame(self, height=68, fg_color="#111111", corner_radius=0)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        # Left: title + subtitle
        title_wrap = ctk.CTkFrame(bar, fg_color="transparent")
        title_wrap.place(x=28, y=10)

        ctk.CTkLabel(
            title_wrap,
            text="SVC Training Dashboard",
            font=_safe_font("SF Pro Display", 20, "bold"),
            text_color=TEXT_PRIMARY,
        ).pack(anchor="w")

        ctk.CTkLabel(
            title_wrap,
            text="Support vector classifier  ·  StandardScaler pipeline",
            font=_safe_font("SF Pro Text", 12),
            text_color=TEXT_SECONDARY,
        ).pack(anchor="w")

        # Right: status badge + buttons
        right_wrap = ctk.CTkFrame(bar, fg_color="transparent")
        right_wrap.place(relx=1.0, rely=0.5, anchor="e", x=-24)

        self._status_badge = ctk.CTkLabel(
            right_wrap,
            text="● Ready",
            font=_safe_font("SF Pro Text", 12),
            text_color=TEXT_MUTED,
            fg_color="#252525",
            corner_radius=100,
            padx=12,
            pady=4,
        )
        self._status_badge.pack(side="left", padx=(0, 10))

        ctk.CTkButton(
            right_wrap,
            text="Clear",
            width=90,
            height=34,
            fg_color="#252525",
            hover_color="#303030",
            text_color=TEXT_PRIMARY,
            font=_safe_font("SF Pro Text", 13),
            corner_radius=8,
            command=self._clear,
        ).pack(side="left", padx=(0, 8))

        self._start_btn = ctk.CTkButton(
            right_wrap,
            text="Start training",
            width=130,
            height=34,
            fg_color=ACCENT,
            hover_color=ACCENT_HOVER,
            text_color="#FFFFFF",
            font=_safe_font("SF Pro Text", 13, "bold"),
            corner_radius=8,
            command=self._start_training,
        )
        self._start_btn.pack(side="left")

        # Bottom border on topbar
        ctk.CTkFrame(self, height=1, fg_color="#222222").pack(fill="x")

    # ── Left panel: progress + steps ──────────────────────────────────────────
    def _build_left(self, parent):
        wrap = ctk.CTkScrollableFrame(parent, fg_color="transparent", scrollbar_button_color="#2A2A2A")
        wrap.pack(fill="both", expand=True, padx=0, pady=0)

        # Progress block
        prog_card = ctk.CTkFrame(wrap, fg_color=BG_CARD, corner_radius=12)
        prog_card.pack(fill="x", padx=18, pady=(18, 0))

        top_row = ctk.CTkFrame(prog_card, fg_color="transparent")
        top_row.pack(fill="x", padx=16, pady=(14, 4))

        self._pct_label = ctk.CTkLabel(
            top_row,
            text="0%",
            font=_safe_font("SF Pro Display", 28, "bold"),
            text_color=TEXT_PRIMARY,
        )
        self._pct_label.pack(side="left")

        self._status_msg = ctk.CTkLabel(
            top_row,
            text="Waiting to start",
            font=_safe_font("SF Pro Text", 11),
            text_color=TEXT_MUTED,
        )
        self._status_msg.pack(side="right", pady=(8, 0))

        self._progress_bar = ctk.CTkProgressBar(
            prog_card,
            height=5,
            progress_color=ACCENT,
            fg_color="#252525",
            corner_radius=3,
        )
        self._progress_bar.pack(fill="x", padx=16, pady=(0, 16))
        self._progress_bar.set(0)

        # Section label
        lbl_row = ctk.CTkFrame(wrap, fg_color="transparent")
        lbl_row.pack(fill="x", padx=18, pady=(16, 6))
        ctk.CTkLabel(
            lbl_row,
            text="TRAINING STEPS",
            font=_safe_font("SF Pro Text", 10, "bold"),
            text_color=TEXT_MUTED,
        ).pack(anchor="w")

        # Step rows
        for i, step in enumerate(self.STEPS):
            row = ctk.CTkFrame(wrap, fg_color=BG_ROW, corner_radius=8)
            row.pack(fill="x", padx=18, pady=2)

            # Number badge
            num = ctk.CTkLabel(
                row,
                text=str(i + 1),
                width=26,
                height=26,
                font=_safe_font("SF Pro Text", 11),
                text_color=TEXT_MUTED,
                fg_color="#2A2A2A",
                corner_radius=13,
            )
            num.pack(side="left", padx=(10, 8), pady=10)

            lbl = ctk.CTkLabel(
                row,
                text=step,
                font=_safe_font("SF Pro Text", 13),
                text_color=TEXT_SECONDARY,
            )
            lbl.pack(side="left", pady=10)

            # State icon (right side)
            icon = ctk.CTkLabel(
                row,
                text="",
                font=_safe_font("SF Pro Text", 13),
                text_color=TEXT_MUTED,
                width=30,
            )
            icon.pack(side="right", padx=10)

            self._step_widgets[step] = {"row": row, "num": num, "label": lbl, "icon": icon}

    # ── Center panel ──────────────────────────────────────────────────────────
    def _build_center(self, parent):
        scroll = ctk.CTkScrollableFrame(parent, fg_color="transparent", scrollbar_button_color="#2A2A2A")
        scroll.pack(fill="both", expand=True, padx=0, pady=0)

        # Metric cards
        metrics_row = ctk.CTkFrame(scroll, fg_color="transparent")
        metrics_row.pack(fill="x", padx=20, pady=(18, 0))
        metrics_row.grid_columnconfigure((0, 1, 2), weight=1)

        self._acc_val = self._metric_card(metrics_row, "Accuracy",    "--", 0)
        self._f1w_val = self._metric_card(metrics_row, "F1 weighted", "--", 1)
        self._f1m_val = self._metric_card(metrics_row, "F1 macro",    "--", 2)

        # Dataset summary
        ds_card = ctk.CTkFrame(scroll, fg_color=BG_CARD, corner_radius=12)
        ds_card.pack(fill="x", padx=20, pady=(14, 0))
        ctk.CTkLabel(
            ds_card,
            text="Dataset summary",
            font=_safe_font("SF Pro Display", 14, "bold"),
            text_color=TEXT_PRIMARY,
        ).pack(anchor="w", padx=16, pady=(14, 6))

        ctk.CTkFrame(ds_card, height=1, fg_color="#252525").pack(fill="x", padx=16)

        self._dataset_label = ctk.CTkLabel(
            ds_card,
            text="No dataset loaded yet.",
            font=_safe_font("JetBrains Mono", 12),
            text_color=TEXT_SECONDARY,
            justify="left",
        )
        self._dataset_label.pack(anchor="w", padx=16, pady=(10, 14))

        # Confusion matrix
        cm_card = ctk.CTkFrame(scroll, fg_color=BG_CARD, corner_radius=12)
        cm_card.pack(fill="both", expand=True, padx=20, pady=(14, 18))
        ctk.CTkLabel(
            cm_card,
            text="Confusion matrix",
            font=_safe_font("SF Pro Display", 14, "bold"),
            text_color=TEXT_PRIMARY,
        ).pack(anchor="w", padx=16, pady=(14, 6))

        ctk.CTkFrame(cm_card, height=1, fg_color="#252525").pack(fill="x", padx=16)

        self._matrix_box = ctk.CTkTextbox(
            cm_card,
            fg_color="#111111",
            text_color=TEXT_SECONDARY,
            font=_safe_font("JetBrains Mono", 12),
            corner_radius=8,
            border_width=0,
            height=200,
        )
        self._matrix_box.pack(fill="both", expand=True, padx=16, pady=(10, 16))
        self._matrix_box.insert("end", "Awaiting evaluation…")
        self._matrix_box.configure(state="disabled")

    def _metric_card(self, parent, title, value, col):
        card = ctk.CTkFrame(parent, fg_color=BG_CARD, corner_radius=12)
        card.grid(row=0, column=col, padx=(0 if col == 0 else 6, 0), sticky="nsew")

        ctk.CTkLabel(
            card,
            text=title,
            font=_safe_font("SF Pro Text", 12),
            text_color=TEXT_SECONDARY,
        ).pack(anchor="w", padx=16, pady=(14, 2))

        val_lbl = ctk.CTkLabel(
            card,
            text=value,
            font=_safe_font("SF Pro Display", 24, "bold"),
            text_color=TEXT_MUTED,
        )
        val_lbl.pack(anchor="w", padx=16, pady=(0, 14))
        return val_lbl

    # ── Right panel ───────────────────────────────────────────────────────────
    def _build_right(self, parent):
        wrap = ctk.CTkFrame(parent, fg_color="transparent")
        wrap.pack(fill="both", expand=True, padx=18, pady=18)

        # Run info
        ctk.CTkLabel(
            wrap,
            text="RUN INFO",
            font=_safe_font("SF Pro Text", 10, "bold"),
            text_color=TEXT_MUTED,
        ).pack(anchor="w", pady=(0, 8))

        info_card = ctk.CTkFrame(wrap, fg_color=BG_CARD, corner_radius=12)
        info_card.pack(fill="x")

        def info_row(label, value_attr, default="--", mono=True):
            row = ctk.CTkFrame(info_card, fg_color="transparent")
            row.pack(fill="x", padx=14, pady=0)
            ctk.CTkLabel(
                row,
                text=label,
                font=_safe_font("SF Pro Text", 12),
                text_color=TEXT_SECONDARY,
                width=100,
                anchor="w",
            ).pack(side="left", pady=8)
            val = ctk.CTkLabel(
                row,
                text=default,
                font=_safe_font("JetBrains Mono" if mono else "SF Pro Text", 11),
                text_color=TEXT_PRIMARY,
                anchor="e",
                wraplength=150,
                justify="right",
            )
            val.pack(side="right", pady=8)
            setattr(self, value_attr, val)
            ctk.CTkFrame(info_card, height=1, fg_color="#222222").pack(fill="x")

        info_row("Training time",  "_r_time")
        info_row("Model path",     "_r_model")
        info_row("Metrics path",   "_r_metrics")
        info_row("Kernel",         "_r_kernel",  "rbf",   mono=False)
        info_row("C",              "_r_C",       "1.0")
        info_row("Gamma",          "_r_gamma",   "scale", mono=False)
        info_row("Test size",      "_r_test",    "20%",   mono=False)

        # Remove last separator
        for w in info_card.winfo_children():
            if isinstance(w, ctk.CTkFrame) and w.cget("height") == 1:
                pass  # kept for spacing

        # Classification report
        ctk.CTkLabel(
            wrap,
            text="CLASSIFICATION REPORT",
            font=_safe_font("SF Pro Text", 10, "bold"),
            text_color=TEXT_MUTED,
        ).pack(anchor="w", pady=(16, 8))

        self._report_box = ctk.CTkTextbox(
            wrap,
            fg_color=BG_CARD,
            text_color=TEXT_SECONDARY,
            font=_safe_font("JetBrains Mono", 11),
            corner_radius=12,
            border_width=0,
        )
        self._report_box.pack(fill="both", expand=True)
        self._report_box.insert("end", "No report yet.")
        self._report_box.configure(state="disabled")

    # ──────────────────────────────────────────────────────────────────────────
    # State helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _set_step(self, step, state):
        """state: 'pending' | 'active' | 'done' | 'error'"""
        w = self._step_widgets[step]

        if state == "active":
            w["row"].configure(fg_color=BG_ACTIVE)
            w["num"].configure(text_color=ACCENT, fg_color="#0D2A5A")
            w["label"].configure(text_color="#DBEAFE")
            w["icon"].configure(text="●", text_color=ACCENT)

        elif state == "done":
            w["row"].configure(fg_color=BG_DONE)
            w["num"].configure(text_color=SUCCESS, fg_color="#0D2A18")
            w["label"].configure(text_color="#DCFCE7")
            w["icon"].configure(text="✓", text_color=SUCCESS)

        elif state == "error":
            w["row"].configure(fg_color=BG_ERROR)
            w["num"].configure(text_color=DANGER, fg_color="#3A1010")
            w["label"].configure(text_color="#FECACA")
            w["icon"].configure(text="✕", text_color=DANGER)

        else:  # pending
            w["row"].configure(fg_color=BG_ROW)
            w["num"].configure(text_color=TEXT_MUTED, fg_color="#2A2A2A")
            w["label"].configure(text_color=TEXT_SECONDARY)
            w["icon"].configure(text="", text_color=TEXT_MUTED)

        self.update_idletasks()

    def _set_progress(self, pct, msg):
        self._progress_bar.set(pct / 100)
        self._pct_label.configure(text=f"{pct}%")
        self._status_msg.configure(text=msg)
        self.update_idletasks()

    def _set_badge(self, state):
        """state: 'ready' | 'running' | 'done' | 'error'"""
        configs = {
            "ready":   ("● Ready",    TEXT_MUTED,    "#252525"),
            "running": ("● Training…", ACCENT,        "#0F2340"),
            "done":    ("✓ Done",     SUCCESS,        "#0D2318"),
            "error":   ("✕ Error",    DANGER,         "#2A0D0D"),
        }
        text, fg, bg = configs[state]
        self._status_badge.configure(text=text, text_color=fg, fg_color=bg)
        self.update_idletasks()

    def _write_textbox(self, tb, text):
        tb.configure(state="normal")
        tb.delete("1.0", "end")
        tb.insert("end", text)
        tb.configure(state="disabled")

    def _set_metric(self, label_widget, value):
        label_widget.configure(text=value, text_color=TEXT_PRIMARY)

    # ──────────────────────────────────────────────────────────────────────────
    # Clear
    # ──────────────────────────────────────────────────────────────────────────

    def _clear(self):
        self._set_progress(0, "Waiting to start")
        self._set_badge("ready")

        for step in self.STEPS:
            self._set_step(step, "pending")

        for w in (self._acc_val, self._f1w_val, self._f1m_val):
            w.configure(text="--", text_color=TEXT_MUTED)

        self._dataset_label.configure(text="No dataset loaded yet.")
        self._r_time.configure(text="--")
        self._r_model.configure(text="--")
        self._r_metrics.configure(text="--")

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
                ("svc", SVC(kernel="rbf", C=1.0, gamma="scale")),
            ])

            time.sleep(0.4)
            self._set_step("Build pipeline", "done")

            # ── 5. Train ─────────────────────────────────────────────────────
            self._set_step("Train SVC model", "active")

            start_time = time.time()

            # Animate the bar while fitting
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
            report_text = classification_report(y_test, y_pred)
            labels      = sorted(y.unique())

            self._set_metric(self._acc_val, f"{accuracy:.2%}")
            self._set_metric(self._f1w_val, f"{f1_weighted:.2%}")
            self._set_metric(self._f1m_val, f"{f1_macro:.2%}")

            # Matrix display
            matrix_str = "Labels:\n  " + ", ".join(str(l) for l in labels)
            matrix_str += "\n\nMatrix:\n" + str(cm) + "\n\nPer-class:\n"
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

            MODEL_PATH       = os.path.join(MODEL_DIR, "svc_model.pkl")
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
                    "scaler": "StandardScaler",
                    "classifier": "SVC",
                    "kernel": "rbf",
                    "C": 1.0,
                    "gamma": "scale",
                },
                "dataset_info": {
                    "feature_shape": list(X.shape),
                    "target_shape": int(y.shape[0]),
                    "train_shape": list(X_train.shape),
                    "test_shape": list(X_test.shape),
                    "test_size": 0.2,
                    "random_state": 42,
                    "stratify": True,
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
                "feature_names":         list(X.columns) if hasattr(X, "columns") else [],
            }

            with open(METRICS_JSON_PATH, "w") as fh:
                json.dump(metrics_payload, fh, indent=2)

            self._r_metrics.configure(text=METRICS_JSON_PATH)

            time.sleep(0.4)
            self._set_step("Save metrics", "done")

            # ── Done ─────────────────────────────────────────────────────────
            self._set_progress(100, "Training completed successfully")
            self._set_badge("done")

        except Exception as exc:
            self._set_badge("error")
            self._set_progress(
                int(self._progress_bar.get() * 100),
                "Error — see report panel"
            )
            # Mark the currently-active step as errored
            for step in self.STEPS:
                if self._step_widgets[step]["icon"].cget("text") == "●":
                    self._set_step(step, "error")

            self._write_textbox(
                self._report_box,
                f"ERROR\n{'─' * 40}\n{type(exc).__name__}: {exc}"
            )

        finally:
            self._start_btn.configure(state="normal")


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app = TrainingDashboard()
    app.mainloop()