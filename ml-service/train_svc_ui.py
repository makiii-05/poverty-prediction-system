import os
import json
import joblib
import time
import threading
import tkinter.font as tkfont
import customtkinter as ctk

from classification.preprocess import load_and_prepare_data
from typing import Any, Dict, cast

from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Palette ──────────────────────────────────────────────────────────────────
C = {
    "bg":        "#080808",
    "surface":   "#0E0E0E",
    "card":      "#131313",
    "input":     "#181818",
    "border":    "#1E1E1E",
    "border2":   "#2A2A2A",

    "accent":    "#3B82F6",
    "accent_h":  "#2563EB",
    "accent_bg": "#0C1929",
    "accent_t":  "#93C5FD",

    "ok":        "#34D399",
    "ok_bg":     "#041A10",
    "ok_t":      "#6EE7B7",

    "err":       "#F87171",
    "err_bg":    "#1E0808",
    "err_t":     "#FCA5A5",

    "t0":        "#EFEFEF",
    "t1":        "#666666",
    "t2":        "#333333",
    "t3":        "#1E1E1E",
}


def font(family, size, weight="normal"):
    available = tkfont.families()
    fallbacks = {
        "Geist":       ["SF Pro Display", "Helvetica Neue", "Helvetica", "Arial"],
        "Geist Mono":  ["JetBrains Mono", "Cascadia Code", "Consolas", "Courier New"],
    }
    resolved = family
    if family not in available:
        for alt in fallbacks.get(family, []):
            if alt in available:
                resolved = alt
                break
        else:
            resolved = "TkDefaultFont"
    return ctk.CTkFont(family=resolved, size=size, weight="bold" if weight == "bold" else "normal")


# ── Reusable widget helpers ───────────────────────────────────────────────────
def divider(parent, color=None, padx=0, pady=(0, 0)):
    ctk.CTkFrame(parent, height=1, fg_color=color or C["border"]).pack(
        fill="x", padx=padx, pady=pady
    )


def label(parent, text, size=11, color=None, weight="normal", anchor="w", **kw):
    return ctk.CTkLabel(
        parent,
        text=text,
        font=font("Geist", size, weight),
        text_color=color or C["t0"],
        anchor=anchor,
        **kw,
    )


class TrainingDashboard(ctk.CTk):

    STEPS = [
        ("Load dataset",         "ti-database"),
        ("Dataset info",         "ti-table"),
        ("Split train / test",   "ti-scissors"),
        ("Build pipeline",       "ti-git-merge"),
        ("Cross-val setup",      "ti-rotate"),
        ("GridSearchCV tuning",  "ti-adjustments"),
        ("Train best model",     "ti-cpu"),
        ("Predict test data",    "ti-bolt"),
        ("Evaluate model",       "ti-chart-bar"),
        ("Save model",           "ti-device-floppy"),
        ("Save metrics",         "ti-file-description"),
    ]

    # ── Init ──────────────────────────────────────────────────────────────────
    def __init__(self):
        super().__init__()
        self.title("SVC · Training Dashboard")
        self.geometry("1060x660")
        self.minsize(920, 580)
        self.configure(fg_color=C["bg"])

        self._step_w: dict = {}
        self._thread: threading.Thread | None = None

        # Declared here so Pylance can resolve them; assigned in _right()
        self._ri_time:    ctk.CTkLabel
        self._ri_model:   ctk.CTkLabel
        self._ri_metrics: ctk.CTkLabel
        self._ri_kernel:  ctk.CTkLabel
        self._ri_C:       ctk.CTkLabel
        self._ri_gamma:   ctk.CTkLabel
        self._ri_test:    ctk.CTkLabel
        self._ri_cv:      ctk.CTkLabel
        self._ri_cv_sc:   ctk.CTkLabel
        self._ri_seed:    ctk.CTkLabel

        self._build()

    # ── Build ─────────────────────────────────────────────────────────────────
    def _build(self):
        self._topbar()

        body = ctk.CTkFrame(self, fg_color=C["bg"])
        body.pack(fill="both", expand=True)
        body.grid_columnconfigure(0, weight=0, minsize=240)
        body.grid_columnconfigure(1, weight=0, minsize=800)
        body.grid_columnconfigure(2, weight=1, minsize=260)
        body.grid_rowconfigure(0, weight=1)

        L = ctk.CTkFrame(body, fg_color=C["surface"], corner_radius=0)
        M = ctk.CTkFrame(body, fg_color=C["bg"],      corner_radius=0)
        R = ctk.CTkFrame(body, fg_color=C["surface"], corner_radius=0)
        L.grid(row=0, column=0, sticky="nsew")
        M.grid(row=0, column=1, sticky="nsew", padx=1)
        R.grid(row=0, column=2, sticky="nsew")

        self._left(L)
        self._center(M)
        self._right(R)

    # ── Top bar ───────────────────────────────────────────────────────────────
    def _topbar(self):
        bar = ctk.CTkFrame(self, height=46, fg_color=C["card"], corner_radius=0)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        lw = ctk.CTkFrame(bar, fg_color="transparent")
        lw.place(x=14, rely=0.5, anchor="w")
        label(lw, "SVC Training", 13, C["t0"], "bold").pack(side="left")
        label(lw, "  ·  StandardScaler · GridSearchCV · StratifiedKFold", 11, C["t2"]).pack(side="left")

        rw = ctk.CTkFrame(bar, fg_color="transparent")
        rw.place(relx=1, rely=0.5, anchor="e", x=-14)

        self._badge = ctk.CTkLabel(
            rw, text="● Ready",
            font=font("Geist", 10),
            text_color=C["t2"], fg_color=C["input"],
            corner_radius=100, padx=9, pady=2,
        )
        self._badge.pack(side="left", padx=(0, 7))

        ctk.CTkButton(
            rw, text="Clear", width=60, height=26,
            fg_color=C["input"], hover_color=C["border2"],
            text_color=C["t0"], font=font("Geist", 11),
            border_width=1, border_color=C["border"], corner_radius=5,
            command=self._clear,
        ).pack(side="left", padx=(0, 5))

        self._run_btn = ctk.CTkButton(
            rw, text="▶  Start", width=88, height=26,
            fg_color=C["accent"], hover_color=C["accent_h"],
            text_color="#fff", font=font("Geist", 11, "bold"),
            corner_radius=5, command=self._start,
        )
        self._run_btn.pack(side="left")

        divider(self)

    # ── Left panel – steps ────────────────────────────────────────────────────
    def _left(self, p):
        sc = ctk.CTkScrollableFrame(p, fg_color="transparent",
                                    scrollbar_button_color=C["border2"])
        sc.pack(fill="both", expand=True)

        hdr = ctk.CTkFrame(sc, fg_color="transparent")
        hdr.pack(fill="x", padx=12, pady=(10, 0))

        top = ctk.CTkFrame(hdr, fg_color="transparent")
        top.pack(fill="x", pady=(0, 3))
        self._pct = label(top, "0%", 20, C["t0"], "bold")
        self._pct.pack(side="left")
        self._msg = label(top, "Ready", 10, C["t2"])
        self._msg.pack(side="right")

        self._bar = ctk.CTkProgressBar(hdr, height=2, progress_color=C["accent"],
                                       fg_color=C["input"], corner_radius=1)
        self._bar.pack(fill="x")
        self._bar.set(0)

        divider(sc, pady=(8, 4))
        label(sc, "STEPS", 9, C["t3"], "bold").pack(anchor="w", padx=12, pady=(0, 3))

        for step, _ in self.STEPS:
            row = ctk.CTkFrame(sc, fg_color=C["input"], corner_radius=5, height=30)
            row.pack(fill="x", padx=8, pady=1)
            row.pack_propagate(False)

            num = ctk.CTkLabel(row, text=str(len(self._step_w) + 1),
                               width=18, height=18,
                               font=font("Geist Mono", 9),
                               text_color=C["t1"], fg_color=C["border"],
                               corner_radius=9)
            num.pack(side="left", padx=(7, 5), pady=6)

            lbl = ctk.CTkLabel(row, text=step,
                               font=font("Geist", 11),
                               text_color=C["t1"], anchor="w")
            lbl.pack(side="left", fill="x", expand=True)

            ico = ctk.CTkLabel(row, text="", font=font("Geist", 11),
                               text_color=C["t2"], width=20)
            ico.pack(side="right", padx=5)

            self._step_w[step] = {"row": row, "num": num, "lbl": lbl, "ico": ico}

    # ── Center panel ─────────────────────────────────────────────────────────
    def _center(self, p):
        sc = ctk.CTkScrollableFrame(p, fg_color="transparent",
                                    scrollbar_button_color=C["border2"])
        sc.pack(fill="both", expand=True)

        # Metric cards row
        mr = ctk.CTkFrame(sc, fg_color="transparent")
        mr.pack(fill="x", padx=10, pady=(10, 0))
        mr.grid_columnconfigure((0, 1, 2), weight=1)
        self._acc = self._mcard(mr, "Accuracy",    0)
        self._f1w = self._mcard(mr, "F1 weighted", 1)
        self._f1m = self._mcard(mr, "F1 macro",    2)

        # Dataset summary
        dc = self._card(sc, "Dataset", pady=8)
        self._ds_lbl = label(dc, "No dataset loaded.", 10, C["t1"],
                             justify="left", wraplength=400)
        self._ds_lbl.configure(font=font("Geist Mono", 10))
        self._ds_lbl.pack(anchor="w", padx=10, pady=(6, 8), fill="x")

        # Confusion matrix
        cc = self._card(sc, "Confusion matrix", pady=6, expand=True)
        self._cm_box = ctk.CTkTextbox(
            cc, fg_color=C["bg"], text_color=C["t1"],
            font=font("Geist Mono", 10), corner_radius=3,
            border_width=0, height=155,
        )
        self._cm_box.pack(fill="both", expand=True, padx=8, pady=(4, 8))
        self._cm_box.insert("end", "Awaiting evaluation…")
        self._cm_box.configure(state="disabled")

    # ── Right panel ───────────────────────────────────────────────────────────
    def _right(self, p):
        wr = ctk.CTkFrame(p, fg_color="transparent")
        wr.pack(fill="both", expand=True, padx=10, pady=10)

        label(wr, "RUN INFO", 9, C["t3"], "bold").pack(anchor="w", pady=(0, 5))

        ic = ctk.CTkFrame(wr, fg_color=C["card"], corner_radius=7,
                          border_width=1, border_color=C["border"])
        ic.pack(fill="x")

        rows = [
            ("Time",    "_ri_time",    "—",   True),
            ("Model",   "_ri_model",  "—",   True),
            ("Metrics", "_ri_metrics","—",   True),
            ("Kernel",  "_ri_kernel", "—",   False),
            ("Best C",  "_ri_C",      "—",   True),
            ("γ",       "_ri_gamma",  "—",   False),
            ("Test sz", "_ri_test",   "20%", False),
            ("CV folds","_ri_cv",     "5",   True),
            ("Best CV", "_ri_cv_sc",  "—",   True),
            ("Seed",    "_ri_seed",   "42",  True),
        ]
        for lbl_txt, attr, default, mono in rows:
            r = ctk.CTkFrame(ic, fg_color="transparent", height=26)
            r.pack(fill="x")
            r.pack_propagate(False)
            ctk.CTkLabel(r, text=lbl_txt, font=font("Geist", 10),
                         text_color=C["t1"], anchor="w", width=72).pack(side="left", padx=8)
            v = ctk.CTkLabel(r, text=default,
                             font=font("Geist Mono" if mono else "Geist", 10),
                             text_color=C["t0"], anchor="e",
                             wraplength=120, justify="right")
            v.pack(side="right", padx=8)
            setattr(self, attr, v)
            divider(ic)

        label(wr, "CLASSIFICATION REPORT", 9, C["t3"], "bold").pack(
            anchor="w", pady=(10, 5))

        self._rep_box = ctk.CTkTextbox(
            wr, fg_color=C["card"], text_color=C["t1"],
            font=font("Geist Mono", 10), corner_radius=7,
            border_width=1, border_color=C["border"],
        )
        self._rep_box.pack(fill="both", expand=True)
        self._rep_box.insert("end", "No report yet.")
        self._rep_box.configure(state="disabled")

    # ── Widget factory helpers ────────────────────────────────────────────────
    def _card(self, parent, title, pady=8, expand=False):
        outer = ctk.CTkFrame(parent, fg_color=C["card"], corner_radius=7,
                             border_width=1, border_color=C["border"])
        pack_kw = dict(fill="both" if expand else "x", expand=expand,
                       padx=10, pady=pady)
        outer.pack(**pack_kw)

        hdr = ctk.CTkFrame(outer, fg_color="transparent", height=28)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        ctk.CTkLabel(hdr, text=title, font=font("Geist", 11, "bold"),
                     text_color=C["t0"]).pack(side="left", padx=10)
        divider(outer)
        return outer

    def _mcard(self, parent, title, col):
        card = ctk.CTkFrame(parent, fg_color=C["card"], corner_radius=7,
                            border_width=1, border_color=C["border"])
        card.grid(row=0, column=col, padx=(0 if col == 0 else 5, 0), sticky="nsew")
        label(card, title, 10, C["t1"]).pack(anchor="w", padx=8, pady=(6, 1))
        val = ctk.CTkLabel(card, text="—", font=font("Geist", 18, "bold"),
                           text_color=C["t2"])
        val.pack(anchor="w", padx=8, pady=(0, 6))
        return val

    # ── Step state ───────────────────────────────────────────────────────────
    def _step(self, step, state):
        w = self._step_w[step]
        if state == "active":
            w["row"].configure(fg_color=C["accent_bg"])
            w["num"].configure(text_color=C["accent_t"], fg_color="#0A2040")
            w["lbl"].configure(text_color=C["accent_t"])
            w["ico"].configure(text="●", text_color=C["accent"])
        elif state == "done":
            w["row"].configure(fg_color=C["ok_bg"])
            w["num"].configure(text_color=C["ok_t"], fg_color="#051A0C")
            w["lbl"].configure(text_color=C["ok_t"])
            w["ico"].configure(text="✓", text_color=C["ok"])
        elif state == "error":
            w["row"].configure(fg_color=C["err_bg"])
            w["num"].configure(text_color=C["err_t"], fg_color="#200808")
            w["lbl"].configure(text_color=C["err_t"])
            w["ico"].configure(text="✕", text_color=C["err"])
        else:
            w["row"].configure(fg_color=C["input"])
            w["num"].configure(text_color=C["t1"], fg_color=C["border"])
            w["lbl"].configure(text_color=C["t1"])
            w["ico"].configure(text="", text_color=C["t2"])
        self.update_idletasks()

    def _prog(self, pct, msg):
        self._bar.set(pct / 100)
        self._pct.configure(text=f"{pct}%")
        self._msg.configure(text=msg)
        self.update_idletasks()

    def _set_badge(self, state):
        cfg = {
            "ready":   ("● Ready",    C["t2"],     C["input"]),
            "running": ("● Running",  C["accent"],  C["accent_bg"]),
            "done":    ("✓ Done",     C["ok"],      C["ok_bg"]),
            "error":   ("✕ Error",    C["err"],     C["err_bg"]),
        }
        t, fg, bg = cfg[state]
        self._badge.configure(text=t, text_color=fg, fg_color=bg)
        self.update_idletasks()

    def _write(self, tb, text):
        tb.configure(state="normal")
        tb.delete("1.0", "end")
        tb.insert("end", text)
        tb.configure(state="disabled")

    # ── Actions ───────────────────────────────────────────────────────────────
    def _clear(self):
        self._prog(0, "Ready")
        self._set_badge("ready")
        for step, _ in self.STEPS:
            self._step(step, "pending")
        for w in (self._acc, self._f1w, self._f1m):
            w.configure(text="—", text_color=C["t2"])
        self._ds_lbl.configure(text="No dataset loaded.")
        for attr in ("_ri_time","_ri_model","_ri_metrics","_ri_kernel",
                     "_ri_C","_ri_gamma","_ri_cv_sc"):
            getattr(self, attr).configure(text="—")
        self._write(self._cm_box, "Awaiting evaluation…")
        self._write(self._rep_box, "No report yet.")

    def _start(self):
        self._clear()
        self._run_btn.configure(state="disabled")
        self._set_badge("running")
        self._thread = threading.Thread(target=self._train, daemon=True)
        self._thread.start()

    # ── Training thread ───────────────────────────────────────────────────────
    def _train(self):
        step_names = [s for s, _ in self.STEPS]
        try:
            # 1 · Load
            self._step(step_names[0], "active"); self._prog(5, "Loading dataset")
            X, y = load_and_prepare_data()
            time.sleep(0.2); self._step(step_names[0], "done")

            # 2 · Info
            self._step(step_names[1], "active"); self._prog(12, "Dataset info")
            ds = (f"Shape  : {X.shape}  |  records: {len(y):,}\n"
                  f"Classes:\n{y.value_counts().to_string()}")
            self._ds_lbl.configure(text=ds)
            time.sleep(0.2); self._step(step_names[1], "done")

            # 3 · Split
            self._step(step_names[2], "active"); self._prog(20, "Train / test split")
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y)
            ds += (f"\n\nTrain: {X_train.shape}  Test: {X_test.shape}")
            self._ds_lbl.configure(text=ds)
            time.sleep(0.2); self._step(step_names[2], "done")

            # 4 · Pipeline
            self._step(step_names[3], "active"); self._prog(28, "Building pipeline")
            pipeline = Pipeline([("scaler", StandardScaler()), ("svc", SVC(random_state=42))])
            time.sleep(0.2); self._step(step_names[3], "done")

            # 5 · CV setup
            self._step(step_names[4], "active"); self._prog(36, "Cross-val setup")
            cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            time.sleep(0.2); self._step(step_names[4], "done")

            # 6 · GridSearch
            self._step(step_names[5], "active"); self._prog(46, "GridSearchCV…")
            param_grid = {
                "svc__kernel": ["rbf"],
                "svc__C":      [0.1, 1, 10, 100],
                "svc__gamma":  ["scale", "auto", 0.01, 0.1, 1],
            }
            gs = GridSearchCV(pipeline, param_grid, scoring="f1_weighted",
                              cv=cv, n_jobs=-1, verbose=0)
            t0 = time.time()
            gs.fit(X_train, y_train)
            elapsed = time.time() - t0

            bp = gs.best_params_
            bscore = gs.best_score_
            self._ri_time.configure(text=f"{elapsed:.2f}s")
            self._ri_kernel.configure(text=str(bp.get("svc__kernel", "rbf")))
            self._ri_C.configure(text=str(bp.get("svc__C", "—")))
            self._ri_gamma.configure(text=str(bp.get("svc__gamma", "—")))
            self._ri_cv_sc.configure(text=f"{bscore:.4f}")
            self._prog(62, "GridSearch done"); self._step(step_names[5], "done")

            # 7 · Best model
            self._step(step_names[6], "active"); self._prog(70, "Best model")
            model = gs.best_estimator_
            cv_scores = cross_val_score(model, X_train, y_train,
                                        cv=cv, scoring="f1_weighted", n_jobs=-1)
            time.sleep(0.2); self._step(step_names[6], "done")

            # 8 · Predict
            self._step(step_names[7], "active"); self._prog(78, "Predicting…")
            y_pred = model.predict(X_test)
            time.sleep(0.2); self._step(step_names[7], "done")

            # 9 · Evaluate
            self._step(step_names[8], "active"); self._prog(86, "Evaluating…")
            acc   = accuracy_score(y_test, y_pred)
            f1w   = f1_score(y_test, y_pred, average="weighted")
            f1m   = f1_score(y_test, y_pred, average="macro")
            cm    = confusion_matrix(y_test, y_pred)
            rdict = cast(Dict[str, Any], classification_report(y_test, y_pred, output_dict=True))
            rtxt  = str(classification_report(y_test, y_pred, output_dict=False))
            labels = sorted(y.unique())

            self._acc.configure(text=f"{acc:.1%}", text_color=C["t0"])
            self._f1w.configure(text=f"{f1w:.1%}", text_color=C["t0"])
            self._f1m.configure(text=f"{f1m:.1%}", text_color=C["t0"])

            cm_str  = "Labels: " + ", ".join(str(l) for l in labels)
            cm_str += "\n\n" + str(cm)
            cm_str += "\n\nCV scores : " + str(cv_scores.round(4))
            cm_str += f"\nCV mean   : {cv_scores.mean():.4f}  std: {cv_scores.std():.4f}"
            cm_str += f"\n\nBest params: {bp}"

            self._write(self._cm_box, cm_str)
            self._write(self._rep_box, rtxt)
            time.sleep(0.2); self._step(step_names[8], "done")

            # 10 · Save model
            self._step(step_names[9], "active"); self._prog(93, "Saving model…")
            ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            MODEL_DIR = os.path.join(ROOT, "models")
            os.makedirs(MODEL_DIR, exist_ok=True)
            MODEL_PATH   = os.path.join(MODEL_DIR, "svc_model.pkl")
            METRICS_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.json")
            joblib.dump(model, MODEL_PATH)
            self._ri_model.configure(text=os.path.basename(MODEL_PATH))
            time.sleep(0.2); self._step(step_names[9], "done")

            # 11 · Save metrics
            self._step(step_names[10], "active"); self._prog(97, "Saving metrics…")
            payload = {
                "model_name": "SVC",
                "model_config": {"scaler": "StandardScaler", "classifier": "SVC",
                                 "best_params": bp, "best_cv_score": float(bscore),
                                 "cv_folds": 5, "scoring": "f1_weighted", "random_state": 42},
                "dataset_info": {"feature_shape": list(X.shape), "target_shape": int(y.shape[0]),
                                 "train_shape": list(X_train.shape), "test_shape": list(X_test.shape),
                                 "test_size": 0.2, "random_state": 42, "stratify": True},
                "class_labels": labels,
                "class_distribution": {"full": y.value_counts().to_dict(),
                                       "train": y_train.value_counts().to_dict(),
                                       "test": y_test.value_counts().to_dict()},
                "grid_search": {"param_grid": param_grid, "best_params": bp,
                                "best_score": float(bscore), "cv_folds": 5, "scoring": "f1_weighted"},
                "cross_validation": {"cv_scores": cv_scores.tolist(),
                                     "mean": float(cv_scores.mean()), "std": float(cv_scores.std()),
                                     "cv_folds": 5, "scoring": "f1_weighted"},
                "test_metrics": {"accuracy": float(acc), "f1_weighted": float(f1w),
                                 "f1_macro": float(f1m), "confusion_matrix": cm.tolist(),
                                 "classification_report": rdict},
                "training_time_seconds": float(elapsed),
                "feature_names": list(X.columns) if hasattr(X, "columns") else [],
            }
            with open(METRICS_PATH, "w") as fh:
                json.dump(payload, fh, indent=2)
            self._ri_metrics.configure(text=os.path.basename(METRICS_PATH))
            time.sleep(0.2); self._step(step_names[10], "done")

            self._prog(100, "Complete"); self._set_badge("done")

        except Exception as exc:
            self._set_badge("error")
            for step, _ in self.STEPS:
                if self._step_w[step]["ico"].cget("text") == "●":
                    self._step(step, "error")
            self._write(self._rep_box,
                        f"ERROR\n{'─' * 34}\n{type(exc).__name__}: {exc}")

        finally:
            self._run_btn.configure(state="normal")


if __name__ == "__main__":
    TrainingDashboard().mainloop()