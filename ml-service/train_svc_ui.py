import os
import json
import joblib
import time
import threading
import tkinter.font as tkfont
import customtkinter as ctk

from classification.preprocess import load_and_prepare_data
from typing import Any, Dict, cast

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    GridSearchCV,
    cross_val_score,
)
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

BG_BASE = "#0A0A0A"
BG_PANEL = "#111111"
BG_CARD = "#161616"
BG_ROW = "#181818"
BG_INPUT = "#1C1C1C"

BORDER = "#242424"
BORDER_MD = "#2E2E2E"

ACCENT = "#2563EB"
ACCENT_HOVER = "#1D4ED8"
ACCENT_DIM = "#0F2340"
ACCENT_TEXT = "#93C5FD"

SUCCESS = "#22C55E"
SUCCESS_DIM = "#052E16"
SUCCESS_TEXT = "#86EFAC"

DANGER = "#EF4444"
DANGER_DIM = "#2A0808"
DANGER_TEXT = "#FCA5A5"

TEXT_PRIMARY = "#F5F5F5"
TEXT_SECONDARY = "#888888"
TEXT_MUTED = "#444444"
TEXT_FAINT = "#333333"


def _font(family, size, weight="normal"):
    available = tkfont.families()
    fallbacks = {
        "SF Pro Display": ["Helvetica Neue", "Helvetica", "Arial"],
        "SF Pro Text": ["Helvetica Neue", "Helvetica", "Arial"],
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


class TrainingDashboard(ctk.CTk):

    STEPS = [
        "Load dataset",
        "Dataset info",
        "Split train / test",
        "Build pipeline",
        "Cross-validation setup",
        "GridSearchCV tuning",
        "Train best model",
        "Predict test data",
        "Evaluate model",
        "Save model",
        "Save metrics",
    ]

    def __init__(self):
        super().__init__()

        self.title("SVC Training Dashboard")
        self.geometry("1120x700")
        self.minsize(980, 620)
        self.configure(fg_color=BG_BASE)

        self._step_widgets: dict = {}
        self._training_thread: threading.Thread | None = None

        self._r_time: ctk.CTkLabel
        self._r_model: ctk.CTkLabel
        self._r_metrics: ctk.CTkLabel
        self._r_kernel: ctk.CTkLabel
        self._r_C: ctk.CTkLabel
        self._r_gamma: ctk.CTkLabel
        self._r_test: ctk.CTkLabel
        self._r_cv: ctk.CTkLabel
        self._r_cvscore: ctk.CTkLabel
        self._r_rstate: ctk.CTkLabel

        self._build_ui()

    def _build_ui(self):
        self._build_topbar()

        body = ctk.CTkFrame(self, fg_color=BG_BASE)
        body.pack(fill="both", expand=True)

        body.grid_columnconfigure(0, weight=0, minsize=230)
        body.grid_columnconfigure(1, weight=1)
        body.grid_columnconfigure(2, weight=0, minsize=230)
        body.grid_rowconfigure(0, weight=1)

        left = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)
        center = ctk.CTkFrame(body, fg_color=BG_BASE, corner_radius=0)
        right = ctk.CTkFrame(body, fg_color=BG_PANEL, corner_radius=0)

        left.grid(row=0, column=0, sticky="nsew")
        center.grid(row=0, column=1, sticky="nsew", padx=(1, 1))
        right.grid(row=0, column=2, sticky="nsew")

        self._build_left(left)
        self._build_center(center)
        self._build_right(right)

    def _build_topbar(self):
        bar = ctk.CTkFrame(self, height=52, fg_color=BG_CARD, corner_radius=0)
        bar.pack(fill="x")
        bar.pack_propagate(False)

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
            text="  ·  StandardScaler · GridSearchCV · StratifiedKFold",
            font=_font("SF Pro Text", 12),
            text_color=TEXT_MUTED,
        ).pack(side="left")

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

        ctk.CTkFrame(self, height=1, fg_color=BORDER).pack(fill="x")

    def _build_left(self, parent):
        wrap = ctk.CTkScrollableFrame(
            parent,
            fg_color="transparent",
            scrollbar_button_color=BORDER_MD,
            scrollbar_button_hover_color="#3A3A3A",
        )
        wrap.pack(fill="both", expand=True)

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
        self._status_msg.pack(side="right")

        self._progress_bar = ctk.CTkProgressBar(
            prog,
            height=3,
            progress_color=ACCENT,
            fg_color=BG_INPUT,
            corner_radius=2,
        )
        self._progress_bar.pack(fill="x")
        self._progress_bar.set(0)

        ctk.CTkFrame(wrap, height=1, fg_color=BORDER).pack(
            fill="x", padx=0, pady=(12, 0)
        )

        ctk.CTkLabel(
            wrap,
            text="TRAINING STEPS",
            font=_font("SF Pro Text", 9, "bold"),
            text_color=TEXT_FAINT,
        ).pack(anchor="w", padx=12, pady=(8, 4))

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
                "row": row,
                "num": num,
                "label": lbl,
                "icon": icon,
            }

    def _build_center(self, parent):
        scroll = ctk.CTkScrollableFrame(
            parent,
            fg_color="transparent",
            scrollbar_button_color=BORDER_MD,
        )
        scroll.pack(fill="both", expand=True)

        metrics_row = ctk.CTkFrame(scroll, fg_color="transparent")
        metrics_row.pack(fill="x", padx=10, pady=(10, 0))
        metrics_row.grid_columnconfigure((0, 1, 2), weight=1)

        self._acc_val = self._metric_card(metrics_row, "Accuracy", 0)
        self._f1w_val = self._metric_card(metrics_row, "F1 weighted", 1)
        self._f1m_val = self._metric_card(metrics_row, "F1 macro", 2)

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

        cm_card = self._section_card(scroll, "Confusion matrix", pady_top=8, expand=True)

        self._matrix_box = ctk.CTkTextbox(
            cm_card,
            fg_color=BG_BASE,
            text_color=TEXT_SECONDARY,
            font=_font("JetBrains Mono", 10),
            corner_radius=4,
            border_width=0,
            height=170,
        )
        self._matrix_box.pack(fill="both", expand=True, padx=10, pady=(6, 10))
        self._matrix_box.insert("end", "Awaiting evaluation…")
        self._matrix_box.configure(state="disabled")

    def _build_right(self, parent):
        wrap = ctk.CTkFrame(parent, fg_color="transparent")
        wrap.pack(fill="both", expand=True, padx=12, pady=12)

        ctk.CTkLabel(
            wrap,
            text="RUN INFO",
            font=_font("SF Pro Text", 9, "bold"),
            text_color=TEXT_FAINT,
        ).pack(anchor="w", pady=(0, 6))

        info_card = ctk.CTkFrame(
            wrap,
            fg_color=BG_CARD,
            corner_radius=8,
            border_width=1,
            border_color=BORDER,
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
                width=92,
            ).pack(side="left", padx=10)

            val = ctk.CTkLabel(
                row,
                text=default,
                font=_font("JetBrains Mono" if mono else "SF Pro Text", 10),
                text_color=TEXT_PRIMARY,
                anchor="e",
                wraplength=118,
                justify="right",
            )
            val.pack(side="right", padx=10)
            setattr(self, attr, val)

            ctk.CTkFrame(info_card, height=1, fg_color=BORDER).pack(fill="x")

        info_row("Training time", "_r_time")
        info_row("Model path", "_r_model")
        info_row("Metrics path", "_r_metrics")
        info_row("Kernel", "_r_kernel", "—", mono=False)
        info_row("Best C", "_r_C", "—")
        info_row("Best gamma", "_r_gamma", "—", mono=False)
        info_row("Test size", "_r_test", "20%", mono=False)
        info_row("CV folds", "_r_cv", "5")
        info_row("Best CV", "_r_cvscore", "—")
        info_row("Random state", "_r_rstate", "42")

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

    def _section_card(self, parent, title, pady_top=8, expand=False):
        outer = ctk.CTkFrame(
            parent,
            fg_color=BG_CARD,
            corner_radius=8,
            border_width=1,
            border_color=BORDER,
        )

        if expand:
            outer.pack(fill="both", expand=True, padx=10, pady=pady_top)
        else:
            outer.pack(fill="x", padx=10, pady=pady_top)

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
            parent,
            fg_color=BG_CARD,
            corner_radius=8,
            border_width=1,
            border_color=BORDER,
        )
        card.grid(
            row=0,
            column=col,
            padx=(0 if col == 0 else 6, 0),
            sticky="nsew",
            pady=0,
        )

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

    def _set_step(self, step, state: str):
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

        else:
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
            "ready": ("● Ready", TEXT_MUTED, BG_INPUT),
            "running": ("● Training…", ACCENT, ACCENT_DIM),
            "done": ("✓ Done", SUCCESS, SUCCESS_DIM),
            "error": ("✕ Error", DANGER, DANGER_DIM),
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
        self._r_kernel.configure(text="—")
        self._r_C.configure(text="—")
        self._r_gamma.configure(text="—")
        self._r_cvscore.configure(text="—")

        self._write_textbox(self._matrix_box, "Awaiting evaluation…")
        self._write_textbox(self._report_box, "No report yet.")

    def _start_training(self):
        self._clear()
        self._start_btn.configure(state="disabled")
        self._set_badge("running")

        self._training_thread = threading.Thread(target=self._train, daemon=True)
        self._training_thread.start()

    def _train(self):
        try:
            self._set_step("Load dataset", "active")
            self._set_progress(5, "Loading and preprocessing dataset")

            X, y = load_and_prepare_data()

            time.sleep(0.3)
            self._set_step("Load dataset", "done")

            self._set_step("Dataset info", "active")
            self._set_progress(12, "Reading dataset information")

            ds_text = (
                f"Feature shape : {X.shape}\n"
                f"Target shape  : {y.shape}\n\n"
                f"Total records : {len(y):,}\n"
                f"Total features: {X.shape[1]}\n\n"
                f"Class distribution:\n"
                + y.value_counts().to_string()
            )

            self._dataset_label.configure(text=ds_text)

            time.sleep(0.3)
            self._set_step("Dataset info", "done")

            self._set_step("Split train / test", "active")
            self._set_progress(20, "Splitting dataset into train / test sets")

            X_train, X_test, y_train, y_test = train_test_split(
                X,
                y,
                test_size=0.2,
                random_state=42,
                stratify=y,
            )

            ds_text += (
                f"\n\nTrain / test split:\n"
                f"  X_train : {X_train.shape}\n"
                f"  X_test  : {X_test.shape}\n"
                f"  y_train : {y_train.shape}\n"
                f"  y_test  : {y_test.shape}"
            )

            self._dataset_label.configure(text=ds_text)

            time.sleep(0.3)
            self._set_step("Split train / test", "done")

            self._set_step("Build pipeline", "active")
            self._set_progress(30, "Building StandardScaler + SVC pipeline")

            pipeline = Pipeline([
                ("scaler", StandardScaler()),
                ("svc", SVC(random_state=42)),
            ])

            time.sleep(0.3)
            self._set_step("Build pipeline", "done")

            self._set_step("Cross-validation setup", "active")
            self._set_progress(38, "Preparing StratifiedKFold cross-validation")

            cv = StratifiedKFold(
                n_splits=5,
                shuffle=True,
                random_state=42,
            )

            time.sleep(0.3)
            self._set_step("Cross-validation setup", "done")

            self._set_step("GridSearchCV tuning", "active")
            self._set_progress(48, "Searching for best SVC parameters")

            param_grid = {
                "svc__kernel": ["rbf"],
                "svc__C": [0.1, 1, 10, 100],
                "svc__gamma": ["scale", "auto", 0.01, 0.1, 1],
            }

            grid_search = GridSearchCV(
                estimator=pipeline,
                param_grid=param_grid,
                scoring="f1_weighted",
                cv=cv,
                n_jobs=-1,
                verbose=2,
            )

            start_time = time.time()

            grid_search.fit(X_train, y_train)

            training_time = time.time() - start_time

            best_params = grid_search.best_params_
            best_cv_score = grid_search.best_score_

            self._r_time.configure(text=f"{training_time:.4f} s")
            self._r_kernel.configure(text=str(best_params.get("svc__kernel", "rbf")))
            self._r_C.configure(text=str(best_params.get("svc__C", "—")))
            self._r_gamma.configure(text=str(best_params.get("svc__gamma", "—")))
            self._r_cvscore.configure(text=f"{best_cv_score:.4f}")

            self._set_progress(62, "GridSearchCV tuning complete")
            self._set_step("GridSearchCV tuning", "done")

            self._set_step("Train best model", "active")
            self._set_progress(70, "Selecting best trained model")

            model = grid_search.best_estimator_

            cv_scores = cross_val_score(
                model,
                X_train,
                y_train,
                cv=cv,
                scoring="f1_weighted",
                n_jobs=-1,
            )

            time.sleep(0.3)
            self._set_step("Train best model", "done")

            self._set_step("Predict test data", "active")
            self._set_progress(78, "Generating predictions on test set")

            y_pred = model.predict(X_test)

            time.sleep(0.3)
            self._set_step("Predict test data", "done")

            self._set_step("Evaluate model", "active")
            self._set_progress(86, "Computing accuracy, F1, and confusion matrix")

            accuracy = accuracy_score(y_test, y_pred)
            f1_weighted = f1_score(y_test, y_pred, average="weighted")
            f1_macro = f1_score(y_test, y_pred, average="macro")
            cm = confusion_matrix(y_test, y_pred)

            report_dict = cast(
                Dict[str, Any],
                classification_report(
                    y_test,
                    y_pred,
                    output_dict=True,
                )
            )

            report_text = str(
                classification_report(
                    y_test,
                    y_pred,
                    output_dict=False,
                )
            )

            labels = sorted(y.unique())

            self._set_metric(self._acc_val, f"{accuracy:.2%}")
            self._set_metric(self._f1w_val, f"{f1_weighted:.2%}")
            self._set_metric(self._f1m_val, f"{f1_macro:.2%}")

            matrix_str = "Labels:  " + ", ".join(str(l) for l in labels)
            matrix_str += "\n\nMatrix:\n" + str(cm)
            matrix_str += "\n\nPer class:\n"

            for i, row in enumerate(cm):
                matrix_str += f"  {labels[i]}: {row}\n"

            matrix_str += "\nGridSearchCV:\n"
            matrix_str += f"  Best params   : {best_params}\n"
            matrix_str += f"  Best CV score : {best_cv_score:.4f}\n"

            matrix_str += "\nCross validation scores:\n"
            matrix_str += f"  Scores : {cv_scores}\n"
            matrix_str += f"  Mean   : {cv_scores.mean():.4f}\n"
            matrix_str += f"  Std    : {cv_scores.std():.4f}\n"

            self._write_textbox(self._matrix_box, matrix_str)
            self._write_textbox(self._report_box, report_text)

            time.sleep(0.3)
            self._set_step("Evaluate model", "done")

            self._set_step("Save model", "active")
            self._set_progress(93, "Saving trained model to disk")

            BASE_DIR = os.path.dirname(os.path.abspath(__file__))
            ROOT_DIR = os.path.dirname(BASE_DIR)
            MODEL_DIR = os.path.join(ROOT_DIR, "models")

            os.makedirs(MODEL_DIR, exist_ok=True)

            MODEL_PATH = os.path.join(MODEL_DIR, "svc_model.pkl")
            METRICS_JSON_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.json")

            joblib.dump(model, MODEL_PATH)

            self._r_model.configure(text=MODEL_PATH)

            time.sleep(0.3)
            self._set_step("Save model", "done")

            self._set_step("Save metrics", "active")
            self._set_progress(97, "Saving metrics JSON")

            metrics_payload = {
                "model_name": "SVC",

                "model_config": {
                    "scaler": "StandardScaler",
                    "classifier": "SVC",
                    "best_params": best_params,
                    "best_cv_score": float(best_cv_score),
                    "cv_folds": 5,
                    "scoring": "f1_weighted",
                    "random_state": 42,
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
                    "train_set": y_train.value_counts().to_dict(),
                    "test_set": y_test.value_counts().to_dict(),
                },

                "grid_search": {
                    "param_grid": param_grid,
                    "best_params": best_params,
                    "best_score": float(best_cv_score),
                    "cv_folds": 5,
                    "scoring": "f1_weighted",
                },

                "cross_validation": {
                    "cv_scores": cv_scores.tolist(),
                    "mean_cv_score": float(cv_scores.mean()),
                    "std_cv_score": float(cv_scores.std()),
                    "cv_folds": 5,
                    "scoring": "f1_weighted",
                },

                "test_metrics": {
                    "accuracy": float(accuracy),
                    "f1_weighted": float(f1_weighted),
                    "f1_macro": float(f1_macro),
                    "confusion_matrix": cm.tolist(),
                    "classification_report": report_dict,
                },

                "training_time_seconds": float(training_time),

                "feature_names": (
                    list(X.columns)
                    if hasattr(X, "columns")
                    else []
                ),
            }

            with open(METRICS_JSON_PATH, "w") as fh:
                json.dump(metrics_payload, fh, indent=2)

            self._r_metrics.configure(text=METRICS_JSON_PATH)

            time.sleep(0.3)
            self._set_step("Save metrics", "done")

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


if __name__ == "__main__":
    app = TrainingDashboard()
    app.mainloop()